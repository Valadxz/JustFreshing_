import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';

import { io } from 'socket.io-client';
import { Router } from '@angular/router';

declare var iziToast: any;
declare var Cleave: any;
declare var StickySidebar: any;
declare var paypal: any;



interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
} 

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  
  @ViewChild('paypalButton', { static: true })
  paypalElement!: ElementRef;


  public url: any;
  public token: any;
  public idCliente: any;

  public carrito_arr: Array<any> = [];

  public subtotal = 0;
  public total_pagar: any = 0;

  public socket = io('http://localhost:4201');

  public direccion_principal: any = {};
  public envios: Array<any> = [];

  public precio_envio = '0';

  public venta: any = {};
  public dventa: Array<any> = []; 
  public carrito_load = false;

  public error_cupon = '';
  public descuento = 0;

  public descuento_activo: any = undefined;

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _router: Router
  ) {
    this.url = GLOBAL.url;
    this.idCliente = localStorage.getItem('_id');
    this.venta.cliente = this.idCliente;
    this.token = localStorage.getItem('token');

    this._guestService.get_Envios().subscribe((response) => {
      this.envios = response;
    });
  }

  ngOnInit(): void {
    
    this._guestService.obtener_descuento_activo().subscribe(
      response => {
        if(response.data != undefined){
          this.descuento_activo = response.data[0];
        } else {
          this.descuento_activo = undefined;
        }
        
      }
    )

    this.init_data();
    setTimeout(() => {
      var sidebar = new StickySidebar('.sidebar-sticky', { topSpacing: 20 });
    });

    

    this.get_direccion_principal();
    paypal.Buttons({
      style: {
          layout: 'horizontal',
          message: 'Inicia sesión en paypal para pagar'
      },
      createOrder: (data, actions)=>{
  
          return actions.order.create({
            purchase_units : [{
              description : 'Pago de productos',
              amount : {
                currency_code: 'MXN',
                value: this.subtotal
              },
            }]
          });
        
      },
      
      onApprove : async (data,actions)=>{
        const order = await actions.order.capture();
        console.log(order);
        
        this.venta.transaccion = order.purchase_units[0].payments.captures[0].id;
        console.log(this.dventa);
        
        this.venta.detalles = this.dventa;
        
        this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
          response => {

            this._clienteService.enviar_corrreo_compra_cliente(response.venta._id, this.token).subscribe(
              response => {
                this._router.navigate(['/']);
              }
            )

          }
        )
      },
      onError : err =>{
       
      },
      onCancel: function (data, actions) {
        
      }
    }).render(this.paypalElement.nativeElement);


    
  }

  init_data(){
    this._clienteService
      .obtener_carrito_cliente(this.idCliente, this.token)
      .subscribe((response) => {
        this.carrito_arr = response.data;

        this.carrito_arr.forEach(element => {
          this.dventa.push({
            producto: element.producto._id,
            subtotal: element.producto.precio,
            variedad: element.variedad,
            cantidad: element.cantidad,
            cliente: localStorage.getItem('_id')
          })
        })
        this.carrito_load = false;

        this.subtotal = 0;
        this.calcular_carrito();
        this.calcular_total('Envio gratis');
      });
  }
  get_direccion_principal() {
    this._clienteService
      .obtener_direccion_principal_cliente(
        localStorage.getItem('_id'),
        this.token
      )
      .subscribe((response) => {
        if (response.data == undefined) {
          this.direccion_principal = undefined;
        } else {
          this.direccion_principal = response.data;
          this.venta.direccion = this.direccion_principal._id;
        }
      });
  }

  calcular_carrito() {
    this.subtotal = 0;
    if(this.descuento_activo == undefined){
      this.carrito_arr.forEach((element) => {
        this.subtotal = this.subtotal + parseInt(element.producto.precio);
      });
    } else if(this.descuento_activo != undefined){
        this.carrito_arr.forEach((element) => {
        let new_precio =  parseInt(element.producto.precio) - (parseInt(element.producto.precio) * this.descuento_activo.descuento) / 100;
        this.subtotal = this.subtotal + new_precio;
      });
    }
  }

  obtener_carrito() {
    this._clienteService
      .obtener_carrito_cliente(this.idCliente, this.token)
      .subscribe((response) => {
        this.carrito_arr = response.data;
        this.subtotal = 0;
        this.calcular_carrito();
      });
  }

  eliminar_item(id: any) {
    this._clienteService
      .eliminar_carrito_cliente(id, this.token)
      .subscribe((response) => {
        iziToast.show({
          title: 'SUCCESS',
          titleColor: '#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position: 'topRight',
          message: 'Se eliminó correctamente el producto.',
        });
        this.socket.emit('delete-carrito', { data: response.data });
        this.subtotal = 0;
        this.obtener_carrito();
      });
  }


  calcular_total(envio_titulo: any){
    this.total_pagar = parseInt(this.subtotal.toString()) + parseInt(this.precio_envio);
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;

    console.log(this.venta);
    
  }

  validar_cupon(){
   if(this.venta.cupon){
    if(this.venta.cupon.toString().length <= 25){
      // El cupón es válido
      this._clienteService.validar_cupon_cliente(this.venta.cupon, this.token).subscribe(
        response => {
          if(response.data != undefined){
            this.error_cupon = '';

            if(response.data.tipo == 'Valor fijo'){
              this.descuento = response.data.valor;
              this.total_pagar = this.total_pagar - this.descuento;
            } else if(response.data.tipo = 'Porcentaje'){
              this.descuento = (this.total_pagar * response.data.valor)/100;
              this.total_pagar = this.total_pagar - this.descuento;
            }

          } else {
            this.error_cupon = 'El cupón no existe.'
          }
        }
      )
    } else {
      // El cupón no es válido
      this.error_cupon = 'El cupón no puede exceder los 25 caracteres.'
    }
  
   } else {
    this.error_cupon = 'El cupón no es válido.'
   }
  }
}
