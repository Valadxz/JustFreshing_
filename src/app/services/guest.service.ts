import { Injectable } from '@angular/core';
import { GLOBAL } from './GLOBAL';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GuestService {
  public url: any;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  obtener_productos_slug_publico(slug: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_productos_slug_publico/' + slug, { headers: headers, });
  }

  listar_productos_recomendados_publico(categoria: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get( this.url + 'listar_productos_recomendados_publico/' + categoria, { headers: headers } );
  }

  listar_productos_nuevos(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'listar_productos_nuevos', { headers: headers } );
  }

  obtener_descuento_activo(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get( this.url + 'obtener_descuento_activo', { headers: headers } );
  }
  
  listar_productos_mas_vendidos(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get( this.url + 'listar_productos_mas_vendidos', { headers: headers } );
  }

  enviar_mensaje_contacto(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post( this.url + 'enviar_mensaje_contacto', data, { headers: headers } );
  }

  obtener_reviews_producto_publico(id: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + 'obtener_reviews_producto_publico/' + id, { headers: headers });
  }

  get_Estados(): Observable<any> {
    return this._http.get('./assets/estados.json');
  }
  get_Municipios(): Observable<any> {
    return this._http.get('./assets/municipios.json');
  }

  get_Envios(): Observable<any> {
    return this._http.get('./assets/envios.json');
  }
}
