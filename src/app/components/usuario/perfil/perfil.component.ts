import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClienteService } from 'src/app/services/cliente.service';
declare var iziToast: any;
declare var $: any;

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  public cliente: any = {};
  public id;
  public token;

  constructor(private _clienteService: ClienteService, private _router: Router){
    this.id = localStorage.getItem('_id');
    this.token = localStorage.getItem('token');
    if(this.id){
      this._clienteService.obtener_cliente_guest(this.id, this.token).subscribe(
        response => {
          this.cliente = response.data;
        }
      )
    }
  }
  ngOnInit(): void {
  }

  actualizar(actualizarForm: any){
    if(actualizarForm.valid){
      this.cliente.password = $('#input_password').val();

      this._clienteService.actualizar_perfil_cliente_guest(this.id, this.cliente, this.token).subscribe(
        response => {
          iziToast.show({
            title: 'SUCCESS',
            titleColor: '#008000',
            class: 'text-success',
            position: 'topRight',
            message: 'Se actualizaron correctamente tus datos.',
          });

          this.reloadCurrentRoute();
        }
      )
      
    } else {
      iziToast.show({
        title: 'Error',
        titleColor: '#FF0000',
        class: 'text-danger',
        position: 'topRight',
        message: 'Ingresa todos los campos.',
        icon: 'fa fa-warning',
      });
    }
  }

  
  reloadCurrentRoute() {
    const currentUrl = this._router.url;
    this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this._router.navigate([currentUrl]);
    });
  }
  
}
