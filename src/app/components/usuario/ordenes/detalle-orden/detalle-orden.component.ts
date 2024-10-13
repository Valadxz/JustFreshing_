import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StarRatingComponent } from 'ng-starrating';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';

declare var iziToast: any;
declare var $: any;

@Component({
  selector: 'app-detalle-orden',
  templateUrl: './detalle-orden.component.html',
  styleUrls: ['./detalle-orden.component.css']
})

export class DetalleOrdenComponent implements OnInit {
  
  public url: any;
  public token: any;
  public orden: any = {};
  public detalles: Array<any> = [];
  public loadData = true;
  public id: any;

  public totalstar = 5;

  public review: any = {};
  
  constructor(private _clienteService: ClienteService, private _route: ActivatedRoute){
    this.token = localStorage.getItem('token');
    this.url = GLOBAL.url;
    this._route.params.subscribe(
      params => {
        this.id = params['id'];

        this.initData();

    });
  }

  ngOnInit(): void {
    this.initData();
  }

  initData(){
    this._clienteService.obtener_detalles_ordenes_cliente(this.id, this.token).subscribe(
      response => {
        if(response.data != undefined){
          this.orden = response.data;

          response.detalles.forEach(element => {
            this._clienteService.obtener_review_producto_cliente(element.producto._id).subscribe(
              response => {

                let emitido = false;
                response.data.forEach(element_ => {
                  if(element_.cliente == localStorage.getItem('_id')){
                    emitido = true;
                  }
                });
                element.estado = emitido;
              }
            )
          });
          this.detalles = response.detalles;
          this.loadData = false;
        } else {
          this.orden = undefined;
        }
        this.totalstar= 5;
      }
    );
  }
  openModal(item: any){
    this.review = {};
    this.review.producto = item.producto._id;
    this.review.cliente = item.cliente;
    this.review.venta = this.id;
    
  }

  onRate($event: {oldValue: number, newValue: number, starRating: StarRatingComponent}){
    this.totalstar = $event.newValue;    
  }

  emitir(id: any){
    if(this.review.review){
      if(this.totalstar && this.totalstar >= 0){
        this.review.estrellas = this.totalstar;

       this._clienteService.emitir_review_producto_cliente(this.review, this.token).subscribe(
        response => {
          iziToast.show({
            title:'SUCCESS',
            titleColor:'#1DC74C',
            color: '#FFF',
            class: 'text-success',
            position:'topRight',
            message:'Se emitió la reseña correctamente.'
          });
          
          $('#review-'+id).modal('hide');
          $('.modal-backdrop').removeClass('show');
          
          this.initData();
        }
       )
        
      } else {
        iziToast.show({
          title:'Error',
          titleColor:'#FF0000',
          color: '#FFF',
          class: 'text-danger',
          position:'topRight',
          message:'Selecciona el número de estrellas.'
        })
      }
    } else {
      iziToast.show({
        title:'Error',
        titleColor:'#FF0000',
        color: '#FFF',
        class: 'text-danger',
        position:'topRight',
        message:'Ingresa un mensaje en la reseña.'
      })
    }
  }
}
