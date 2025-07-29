import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableDinamicoService {
  
  private datosSubject = new Subject<any>();

  setDatos(datos: any) {
    this.datosSubject.next(datos);
  }

  getDatosObservable(): Observable<any> {
    return this.datosSubject.asObservable();
  }
}
