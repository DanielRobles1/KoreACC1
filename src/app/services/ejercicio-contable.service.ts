// services/ejercicio-contable.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EjercicioContableDto {
  id_ejercicio?: number;
  id_empresa: number;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  esta_abierto: boolean;
}

@Injectable({ providedIn: 'root' })
export class EjercicioContableService {
  private baseUrl = 'http://localhost:3000/api/v1/ejercicios'; 

  constructor(private http: HttpClient) {}

  listByEmpresa(id_empresa: number): Observable<EjercicioContableDto[]> {
    return this.http.get<EjercicioContableDto[]>(`${this.baseUrl}?id_empresa=${id_empresa}`);
  }

  create(payload: EjercicioContableDto): Observable<EjercicioContableDto> {
    return this.http.post<EjercicioContableDto>(this.baseUrl, payload);
  }

  update(id: number, payload: EjercicioContableDto): Observable<EjercicioContableDto> {
    return this.http.put<EjercicioContableDto>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  abrir(id: number): Observable<EjercicioContableDto> {
    return this.http.post<EjercicioContableDto>(`${this.baseUrl}/${id}/abrir`, {});
  }

  cerrar(id: number): Observable<EjercicioContableDto> {
    return this.http.post<EjercicioContableDto>(`${this.baseUrl}/${id}/cerrar`, {});
  }
}
