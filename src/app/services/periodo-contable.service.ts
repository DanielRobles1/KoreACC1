import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { PeriodoContableDto, PeriodoTipo, PeriodoQuery } from '@app/models/periodo';


export type FrecuenciaPeriodo = Exclude<PeriodoTipo, 'PERSONALIZADO'>;

@Injectable({ providedIn: 'root' })
export class PeriodoContableService {
  private baseUrl = `${environment.urlBase}/api/v1/periodos`;

  constructor(private http: HttpClient) { }

  list(query: PeriodoQuery = {}): Observable<PeriodoContableDto[]> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PeriodoContableDto[]>(this.baseUrl, { params });
  }

  // Ahora soporta opcionalmente id_ejercicio
  listByEmpresa(idEmpresa: number, idEjercicio?: number): Observable<PeriodoContableDto[]> {
    const q: PeriodoQuery = { id_empresa: idEmpresa };
    if (typeof idEjercicio === 'number') q.id_ejercicio = idEjercicio;
    return this.list(q);
  }

  get(id_periodo: number): Observable<PeriodoContableDto> {
    return this.http.get<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`);
  }

  getPeriodosByEjercicio(id_ejercicio: number): Observable<PeriodoContableDto[]> {
    return this.http.get<PeriodoContableDto[]>(`${this.baseUrl}/ejercicio/${id_ejercicio}`);
  }

  create(payload: PeriodoContableDto): Observable<PeriodoContableDto> {
    return this.http.post<PeriodoContableDto>(this.baseUrl, payload);
  }

  generate(id_ejercicio: number, frecuencia: FrecuenciaPeriodo, id_usuario: number, id_centro: number): Observable<any> {
    const url = `${this.baseUrl}/generar`;
    return this.http.post<any>(url, { id_ejercicio, frecuencia, id_usuario, id_centro });
  }


  update(id_periodo: number, payload: Partial<PeriodoContableDto>): Observable<PeriodoContableDto> {
    return this.http.put<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`, payload);
  }

  cerrar(id_periodo: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/${id_periodo}`, {});
  }

  delete(id_periodo: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/destroy/${id_periodo}`);
  }

  setAbierto(id_periodo: number, esta_abierto: boolean): Observable<PeriodoContableDto> {
    return this.http.patch<PeriodoContableDto>(`${this.baseUrl}/${id_periodo}`, { esta_abierto });
  }
}
