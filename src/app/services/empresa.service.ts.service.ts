import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaServiceTsService {
  private apiUrl = 'http://localhost:3000/api/v1/empresas';
  constructor(private http: HttpClient) { }

  // Obtener datos de la empresa (asumiendo que hay solo una empresa)
  getEmpresa(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Actualizar datos de la empresa
  updateEmpresa(id: number, empresa: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, empresa);
  }

  // Eliminar datos de la empresa
  deleteEmpresa(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
