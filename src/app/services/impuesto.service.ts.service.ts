import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Impuestos } from '@app/components/impuesto-form/impuesto-form.component';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImpuestoServiceTsService {
  private apiUrl = `${environment.urlBase}/api/v1/impuestos`;

  constructor(private http: HttpClient) {}

  getImpuestos(): Observable<Impuestos[]> {
    return this.http.get<Impuestos[]>(this.apiUrl);
  }

  getImpuestoById(id: number | string): Observable<Impuestos> {
    return this.http.get<Impuestos>(`${this.apiUrl}/${id}`);
  }

  crearImpuesto(data: Impuestos): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  actualizarImpuesto(id: number | string, data: Partial<Impuestos>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  eliminarImpuesto(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
