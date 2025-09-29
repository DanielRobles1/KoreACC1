import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 

export type PeriodoTipo =
  | 'SEMANAL'
  | 'QUINCENAL'
  | 'MENSUAL'
  | 'BIMESTRAL'
  | 'TRIMESTRAL'
  | 'SEMESTRAL'
  | 'ANUAL'
  | 'PERSONALIZADO';

export interface UiPeriodo {
  id: number;
  anio: number;
  etiqueta: string;
  tipo_periodo: PeriodoTipo;
  fecha_inicio: string;
  fecha_fin: string;
  estado?: string;
  activo?: boolean;
}


type ApiPeriodo = UiPeriodo;

interface GenerarResponse {
  created: number;
  total: number;
  periodos: ApiPeriodo[];
}

@Injectable({ providedIn: 'root' })
export class EmpresaServiceTsService {
  private apiUrl = 'http://localhost:3000/api/v1/empresas';

  constructor(private http: HttpClient) {}

  //empresa CRUD
  getEmpresa(): Observable<any> {
    return this.http.get<any>(this.apiUrl); 
  }

  updateEmpresa(id: number, empresa: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, empresa);
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  //periodo
  getPeriodos(
    empresaId: number,
    anio?: number,
    tipo?: PeriodoTipo
  ): Observable<ApiPeriodo[]> {
    let params = new HttpParams();
    if (anio !== undefined) params = params.set('anio', anio);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<ApiPeriodo[]>(`${this.apiUrl}/${empresaId}/periodos`, { params });
  }

  
  generarPeriodos(
    empresaId: number,
    anio: number,
    tipo: Exclude<PeriodoTipo, 'PERSONALIZADO'>
  ): Observable<ApiPeriodo[]> {
    return this.http
      .post<GenerarResponse | ApiPeriodo[]>(
        `${this.apiUrl}/${empresaId}/periodos/generar`,
        { anio, tipo }
      )
      .pipe(
        map((res) => Array.isArray(res) ? res : res.periodos)
      );
  }

  /** Activar un período */
  activarPeriodo(empresaId: number, periodoId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${empresaId}/periodos/${periodoId}/activar`, {});
  }

  /**  Eliminar período */
  deletePeriodo(empresaId: number, periodoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${empresaId}/periodos/${periodoId}`);
  }
}
