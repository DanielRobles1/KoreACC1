import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 

type UiCentro = {
  id_centro?: number;
  serie_venta: string;
  nombre_centro: string;
  calle: string;
  num_ext: string;
  num_int: string;
  cp: string;
  region: string;
  telefono: string;
  correo: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CentrosCostosService {
  private apiURL = 'http://localhost:3000/api/v1/centros';
  constructor(private http: HttpClient) { }

  getCentros(): Observable<UiCentro[]> {
    return this.http.get<UiCentro[]>(this.apiURL);
  }

  createCentro(data: UiCentro): Observable<any> {
    return this.http.post<any>(this.apiURL, data);
  }

  actualizarCentro(id: number | string, data: Partial<UiCentro>): Observable<any>{
    return this.http.put<any>(`${this.apiURL}/${id}`, data);
  }

  deleteCentro(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
  bulkCreateCentros(data: UiCentro[]): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/bulk`, data);
  }

}
