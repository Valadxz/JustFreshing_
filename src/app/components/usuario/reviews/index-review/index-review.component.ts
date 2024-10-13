import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente.service';

@Component({
  selector: 'app-index-review',
  templateUrl: './index-review.component.html',
  styleUrls: ['./index-review.component.css']
})
export class IndexReviewComponent implements OnInit {
  
  public token: any;

  public reviews: Array<any> = [];

  public loadData = true;

  public page = 1;
  public pageSize = 5;

  constructor(private _clienteService: ClienteService){
    this.token = localStorage.getItem('token');
  }

  ngOnInit(): void {
    this._clienteService.obtener_review_cliente(localStorage.getItem('_id'), this.token).subscribe(
      response => {
        console.log(response);
        
       this.reviews = response.data;
        this.loadData = false;
      }
    );
  }

}
