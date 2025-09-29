// src/app/services/periodo-contable.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


export type PeriodoTipo = 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'PERSONALIZADO';

export interface PeriodoContableDto {
  id_periodo?: number;
  id_empresa: number;
  tipo_periodo: PeriodoTipo;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string;    // YYYY-MM-DD
  periodo_daterange?: any;
  esta_abierto?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PeriodoQuery {
  id_empresa?: number;
  tipo_periodo?: PeriodoTipo;
  esta_abierto?: boolean;
  desde?: string; // 'YYYY-MM-DD'
  hasta?: string; // 'YYYY-MM-DD'
}

@Injectable({ providedIn: 'root' })
export class PeriodoContableService {
  private baseUrl = ` http://localhost:3000/api/v1/periodos`; // e.g. http://localhost:3000/api/v1/periodos

  constructor(private http: HttpClient) {}

  list(query: PeriodoQuery = {}): Observable<PeriodoContableDto[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<PeriodoContableDto[]>(this.baseUrl, { params /*, withCredentials: true*/ });
  }

  listByEmpresa(idEmpresa: number): Observable<PeriodoContableDto[]> {
    return this.list({ id_empresa: idEmpresa });
  }

  get(id_periodo: number): Observable<PeriodoContableDto> {
    return this.http.get<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`);
  }

  create(payload: PeriodoContableDto): Observable<PeriodoContableDto> {
    return this.http.post<PeriodoContableDto>(this.baseUrl, payload);
  }

  update(id_periodo: number, payload: Partial<PeriodoContableDto>): Observable<PeriodoContableDto> {
    return this.http.put<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`, payload);
  }

  delete(id_periodo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id_periodo}`);
  }

  // Tu backend acepta cambiar solo 'esta_abierto' con PATCH (según lo que mostraste)
  setAbierto(id_periodo: number, esta_abierto: boolean): Observable<PeriodoContableDto> {
    return this.http.patch<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`, { esta_abierto });
  }
}
