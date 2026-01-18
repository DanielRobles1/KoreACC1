import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Cuenta } from '@app/models/cuentas';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private apiURL = `${environment.urlBase}/api/v1/cuentas`;
  
  constructor( private http: HttpClient) { }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(this.apiURL);
  }
}
