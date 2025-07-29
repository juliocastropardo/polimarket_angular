import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsumoGenericoService {
  private apiUrl = environment.apiUrl;
  private httoptions: any;
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('id_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  constructor(private http: HttpClient) {}

  consultarGenerico(
    page: string,
    nombremetodo: string,
    params?: { [key: string]: any }
  ): Observable<any> {
    let queryParams = new HttpParams().set('page', page);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams = queryParams.set(key, params[key]);
        }
      });
    }

    return this.http
      .get<any>(`${this.apiUrl}${nombremetodo}`, {
        headers: this.getHeaders()
      })
      .pipe(
        timeout(30000) // Timeout de 30 segundos
      );
  }

  insertarGenerico(valueData: any, nombremetodo: string): Observable<any> {
    return this.http.post(this.apiUrl + nombremetodo, valueData, {
      headers: this.getHeaders(),
    });
  }

  eliminarGenerico(nombremetodo: string): Observable<any> {
    return this.http.delete(this.apiUrl + nombremetodo, {
      headers: this.getHeaders(),
    });
  }

  actualizarGenerico(
    valueData: any,
    transactionId: string,
    nombremetodo: string
  ): Observable<any> {
    // Ahora hacemos la actualización en el servicio correspondiente
    if (nombremetodo.includes('?')) {
      return this.http.put(
        `${this.apiUrl}${nombremetodo}&_id=${transactionId}`,
        valueData,
        { headers: this.getHeaders() }
      );
    }

    return this.http.put(
      `${this.apiUrl}${nombremetodo}?_id=${transactionId}`,
      valueData,
      { headers: this.getHeaders() }
    );
  }

}
