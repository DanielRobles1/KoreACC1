// services/ejercicio-contable.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EjercicioContableDto {
  id_ejercicio?: number;
  id_empresa: number;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  esta_abierto: boolean;
}

export interface EjercicioFilters {
  id_empresa?: number;
  anio?: number;
  esta_abierto?: boolean;
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class EjercicioContableService {
  private baseUrl = 'http://localhost:3000/api/v1/ejercicios';

  constructor(private http: HttpClient) { }

  listByEmpresa(id_empresa: number): Observable<EjercicioContableDto[]> {
    return this.http.get<EjercicioContableDto[]>(`${this.baseUrl}?id_empresa=${id_empresa}`);
  }

  listEjercicios(): Observable<EjercicioContableDto[]> {
    return this.http.get<EjercicioContableDto[]>(this.baseUrl);
  }

  listEjerciciosAbiertos(filters: EjercicioFilters = {}): Observable<EjercicioContableDto[]> {
  let params = new HttpParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params = params.set(key, String(value));
    }
  });

  return this.http.get<EjercicioContableDto[]>(this.baseUrl, { params });
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
    return this.http.patch<EjercicioContableDto>(`${this.baseUrl}/${id}/abrir`, {});
  }

  cerrar(id: number, payload: {cuentaResultadosId: number;traspasarACapital?: boolean; cuentaCapitalId?: number | null;id_usuario: number; id_centro: number;}): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}/cerrar`, payload);
  }
}
