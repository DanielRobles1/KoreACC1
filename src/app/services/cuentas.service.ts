import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
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

  downloadCuentasExcel(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiURL}/export.xlsx`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  importCuentasExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiURL}/import.xlsx`, formData);
  }
}
