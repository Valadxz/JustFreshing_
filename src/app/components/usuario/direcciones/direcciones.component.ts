import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';
import { GuestService } from 'src/app/services/guest.service';
declare var $:any;
declare var iziToast: any;

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit {

  public direccion : any = {
    pais:'',
    estado:'',
    municipio:'',
    principal: false
  };
  public token;

  public direcciones : Array<any> = [];

  public estados : Array<any> = [];
  public municipios : Array<any> = [];

  public estados_arr : Array<any> = [];
  public municipios_arr : Array<any> = [];

  public load_data = true;

  constructor(
    private _guestService: GuestService,
    private _cienteService: ClienteService
  ) {
    this.token = localStorage.getItem('token'); 
    
    this._guestService.get_Estados().subscribe(
      response=>{
        this.estados_arr = response;
        
      }
    )

    this._guestService.get_Municipios().subscribe(
      response=>{
        this.municipios_arr = response;
        
      }
    )
    

   }

  ngOnInit(): void {
    this.obtener_direccion();
  }

 
  obtener_direccion(){
    this._cienteService.obtener_direccion_todos_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        //console.log(response);
        this.direcciones = response.data;
        this.load_data = false;
      }
    )
  }

  select_pais(){
    if(this.direccion.pais == 'México'){
      $('#sl-estado').prop('disabled', false);
      this._guestService.get_Estados().subscribe(
        response=>{
          response.forEach(element => {
            this.estados.push({
              clave: element.clave,
              nombre: element.nombre
            })
          });
          
        }
      )
    } else {
      $('#sl-estado').prop('disabled', true);
      this.estados = [];

      this.direccion.estado = '';
      this.direccion.municipio = '';
    }
  }

  select_Estado(){
    this.municipios = [];
    
    $('#sl-municipio').prop('disabled', false);
    this._guestService.get_Municipios().subscribe(
      response=>{
        response.forEach(element => {
          if(element.clave == this.direccion.estado){
            this.municipios.push(
              element
            )
           
          } 
         this.direccion.municipio = '';
        });
        
      }
    )
  }

  registrar(registroForm: any){
    if(registroForm.valid){

      this.municipios_arr.forEach(element => {
        if(element.clave == this.direccion.estado){
          this.direccion.estado = element.clave
        }
      });

      let data = {
        destinatario: this.direccion.destinatario,
        dni: this.direccion.dni,
        zip: this.direccion.zip,
        direccion: this.direccion.direccion,
        telefono: this.direccion.telefono,
        pais: this.direccion.pais,
        estado: this.direccion.estado,
        municipio: this.direccion.municipio,
        principal: this.direccion.principal,
        cliente: localStorage.getItem('_id'),
      }

      this._cienteService.registro_direccion_cliente(data, this.token).subscribe(
        response => {
          this.direccion = {
            pais:'',
            estado:'',
            municipio:'',
            principal: false
          };

          $("sl-estado").attr('disabled', true);
          $("sl-municipio").attr('disabled', true);
          iziToast.show({
            title:'SUCCESS',
            titleColor:'#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position:'topRight',
            message:'Se agregó la nueva dirección correctamente.'
          })
        }
      )

      
    } else {
      iziToast.show({
        title:'Error',
        titleColor:'#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position:'topRight',
        message:'Los datos del formulario no son validos.'
      })
    }
  }

  establecer_principal(id: any){
    this._cienteService.cambiar_direccion_principal_cliente(id, localStorage.getItem('_id'), this.token).subscribe(
      response=>{
        iziToast.show({
          title:'SUCCESS',
          titleColor:'#1DC74C',
          color: '#FFF',
          class: 'text-success',
          position:'topRight',
          message:'Se actualizó la dirección principal.'
        })
        this.obtener_direccion();
      }
    )
  }
}
 