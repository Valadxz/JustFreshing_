import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';

import { io } from 'socket.io-client';

declare var tns;
declare var lightGallery;
declare var iziToast: any;

@Component({
  selector: 'app-show-producto',
  templateUrl: './show-producto.component.html',
  styleUrls: ['./show-producto.component.css'],
})
export class ShowProductoComponent implements OnInit {
  public token: any;
  public slug:any;
  public producto : any ={};
  public url: any;
  public productos_rec: Array<any> = [];
  public reviews: Array<any> = [];

  public carrito_data: any = {
    variedad: '',
    cantidad: 1
  };
  public btn_cart = false;

  public socket = io('http://localhost:4201');
  
  public descuento_activo: any = undefined;

  public page = 1;
  public pageSize = 5;

  public count_five_star = 0;
  public count_four_star = 0;
  public count_three_star = 0;
  public count_two_star = 0;
  public count_one_star = 0;

  public total_puntos = 0;
  public max_puntos = 0;

  public porcent_rating = 0;
  public puntos_rating = 0;

  public cinco_porcent = 0;
  public cuatro_porcent = 0;
  public tres_porcent = 0;
  public dos_porcent = 0;
  public uno_porcent = 0;

  constructor(
    private _route: ActivatedRoute,
    private _guestService: GuestService,
    private _clienteService: ClienteService,
  ) {
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._route.params.subscribe((params) => {
      this.slug = params['slug'];

      this._guestService
        .obtener_productos_slug_publico(this.slug)
        .subscribe((response) => {
          this.producto = response.data;

          this._guestService.obtener_reviews_producto_publico(this.producto._id).subscribe(
            response => {
              response.data.forEach(element => {
                if(element.estrellas == 5){
                  this.count_five_star = this.count_five_star + 1;
                } else if(element.estrellas == 4){
                  this.count_four_star = this.count_four_star + 1;
                }  else if(element.estrellas == 3){
                  this.count_three_star = this.count_three_star + 1;
                } else if(element.estrellas == 2){
                  this.count_two_star = this.count_two_star + 1;
                } else if(element.estrellas == 1){
                  this.count_one_star = this.count_one_star + 1;
                }

                this.cinco_porcent = (this.count_five_star*100) / response.data.length;
                this.cuatro_porcent = (this.count_four_star*100) / response.data.length;
                this.tres_porcent = (this.count_three_star*100) / response.data.length;
                this.dos_porcent = (this.count_two_star*100) / response.data.length;
                this.uno_porcent = (this.count_one_star*100) / response.data.length;

                let puntos_cinco = 0;
                let puntos_cuatro = 0;
                let puntos_tres = 0;
                let puntos_dos = 0;
                let puntos_uno = 0;

                puntos_cinco = this.count_five_star * 5;
                puntos_cuatro = this.count_four_star * 4;
                puntos_tres = this.count_three_star * 3;
                puntos_dos = this.count_two_star * 2;
                puntos_uno = this.count_one_star * 1;

                this.total_puntos = puntos_cinco + puntos_cuatro + puntos_tres + puntos_dos + puntos_uno;
                this.max_puntos = response.data.length * 5;
                
                this.porcent_rating = (this.total_puntos*100) / this.max_puntos;
                this.puntos_rating = (this.porcent_rating*5) / 100;

                console.log(this.puntos_rating);
                

              });
              this.reviews = response.data;
            }
          )

          this._guestService.listar_productos_recomendados_publico(this.producto.categoria).subscribe(
            response => {
              this.productos_rec = response.data;
            }
          )
        });
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      tns({
        container: '.cs-carousel-inner',
        controlsText: ['<i class="cxi-arrow-left"></i>', '<i class="cxi-arrow-right"></i>'], 
        navPosition: "top",
        controlsPosition: "top",
        mouseDrag: !0,
        speed: 600,
        autoplayHoverPause: !0,
        autoplayButtonOutput: !1,
        navContainer: "#cs-thumbnails",
        navAsThumbnails: true,
        gutter: 15,
      });

      var e = document.querySelectorAll(".cs-gallery");
    if (e.length){
      for (var t = 0; t < e.length; t++){
        lightGallery(e[t], { selector: ".cs-gallery-item", download: !1, videojs: !0, youtubePlayerParams: { modestbranding: 1, showinfo: 0, rel: 0 }, vimeoPlayerParams: { byline: 0, portrait: 0 } });
      }


    }
  
    tns({
      container: '.cs-carousel-inner-two',
      controlsText: ['<i class="cxi-arrow-left"></i>', '<i class="cxi-arrow-right"></i>'],
      navPosition: "top",
      controlsPosition: "top",
      mouseDrag: !0,
      speed: 600,
      autoplayHoverPause: !0,
      autoplayButtonOutput: !1,
      nav: false,
      controlsContainer: "#custom-controls-related", 
      responsive: {
        0: {
          items: 1,
          gutter: 20
        },
        480: {
          items: 2,
          gutter: 24
        },
        700: {
          items: 3,
          gutter: 24
        },
        1100: {
          items: 4,
          gutter: 30
        }
      }
    });

    },500);
    this._guestService.obtener_descuento_activo().subscribe(
      response => {
        if(response.data != undefined){
          this.descuento_activo = response.data[0];
        } else {
          this.descuento_activo = undefined;
        }
        
      }
    )
  }


  agregar_producto(){
    if(this.carrito_data.variedad) {
      if(this.carrito_data.cantidad <= this.producto.stock) {
        let data = {
          producto:this.producto._id,
          cliente: localStorage.getItem('_id'),
          cantidad:this.carrito_data.cantidad,
          variedad:this.carrito_data.variedad,
        }
        this.btn_cart = true;
        this._clienteService.agregar_carrito_cliente(data,this.token).subscribe(
          response => {
            if(response.data == undefined){
              iziToast.show({
                title:'Error',
                titleColor:'#FF0000',
                color: '#FFF',
                class: 'text-danger',
                position:'topRight',
                message:'El producto ya está agregado al carrito.'
              })
              this.btn_cart = false;
            } else {
            iziToast.show({
              title:'SUCCESS',
              titleColor:'#1DC74C',
              color: '#FFF',
              class: 'text-success',
              position:'topRight',
              message:'Se agregó correctamente al carrito.'
            });
            
            this.socket.emit('add-carrito-add', { data:true });   

            this.btn_cart = false;
            }
          }
        )
        
      } else {
        iziToast.show({
          title:'Error',
          titleColor:'#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position:'topRight',
          message: 'No es posible comprar más de: ' + this.producto.stock
        })
      }
    } else {
      iziToast.show({
        title:'Error',
        titleColor:'#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position:'topRight',
        message:'Seleccione una variedad de producto.'
      })
    }
  }

}
