// src/app/services/polizas.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movimiento {
  id_cuenta: number | null;
  ref_serie_venta?: string;
  operacion?: number | string; // 0 cargo, 1 abono
  monto?: null | number;
  cliente?: string;
  fecha?: string;               // 'YYYY-MM-DD'
  cc?: number | null;
  uuid?: null | string;
    id_poliza?: number;   
        includeMovimientos?: boolean;

}

export interface Poliza {
  id_tipopoliza: number;
  id_periodo: number;
  id_usuario: number;
  id_centro: number;
  folio: string;
  concepto: string;
  movimientos: Movimiento[];
}

export interface CfdiRow {
  uuid: string;
  folio?: string | null;
  fecha?: string | null;
  total?: number | string | null;
  
}

@Injectable({ providedIn: 'root' })
export class PolizasService {
  private http = inject(HttpClient);
  
  private api = 'http://localhost:3000/api/v1';
  private cfdiImportUrl = `${this.api}/cfdi/import`;

  /** GET /api/v1/tipo-poliza */
  getTiposPoliza(): Observable<any> {
    return this.http.get<any>(`${this.api}/tipo-poliza`);
  }

  /** GET /api/v1/periodos */
  getPeriodos(): Observable<any> {
    return this.http.get<any>(`${this.api}/periodos`);
  }

  /** GET /api/v1/centros */
  getCentros(): Observable<any> {
    return this.http.get<any>(`${this.api}/centros`);
  }

  // Pólizas 
  /** GET /api/v1/poliza */
  getPolizas(params?: {
    id_tipopoliza?: number;
    id_periodo?: number;
    id_centro?: number;
  }): Observable<any> {
    let p = new HttpParams();
    if (params?.id_tipopoliza != null) p = p.set('id_tipopoliza', String(params.id_tipopoliza));
    if (params?.id_periodo    != null) p = p.set('id_periodo',    String(params.id_periodo));
    if (params?.id_centro     != null) p = p.set('id_centro',     String(params.id_centro));
   
    return this.http.get<any>(`${this.api}/poliza`, { params: p });
  }

  /** POST /api/v1/poliza */
  createPoliza(body: any): Observable<any> {
    return this.http.post<any>(`${this.api}/poliza`, body);
  }

  /** GET /api/v1/poliza/:id/movimientos */
  getPolizaConMovimientos(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/poliza/${id}/movimientos`);
  }

  /** PUT /api/v1/poliza/:id */
  updatePoliza(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/poliza/${id}`, body);
  }

  /** POST /api/v1/movimiento-poliza */
  createMovPoliza(body: any): Observable<any> {
    return this.http.post<any>(`${this.api}/movimiento-poliza`, body);
  }

  /** PUT /api/v1/movimiento-poliza/:id */
  updateMovPoliza(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/movimiento-poliza/${id}`, body);
  }

  /** DELETE /api/v1/movimiento-poliza/:id */
  deleteMovPoliza(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/movimiento-poliza/${id}`);
  }

  /** DELETE /api/v1/poliza/:ID */
 deletePoliza(id: number): Observable<any> {
  return this.http.delete<any>(`${this.api}/poliza/${id}`);
}
getCuentas() {
    return this.http.get<any>(`${this.api}/cuentas`);
  }

  //  Cargar centros de costo
  getCentrosCosto() {
return this.http.get<any>(`${this.api}/centros`);  }

  // CFDI 
  /** POST /api/v1/cfdi/import (subir XML) */
  uploadCfdiXml(
    file: File,
    ctx?: { folio?: string; id_periodo?: number; id_centro?: number; id_tipopoliza?: number }
  ): Observable<any> {
    const form = new FormData();
    // nombre del campo que espera multer 
    form.append('file', file);

    if (ctx?.folio)                  form.append('folio', ctx.folio);
    if (ctx?.id_periodo != null)     form.append('id_periodo', String(ctx.id_periodo));
    if (ctx?.id_centro  != null)     form.append('id_centro',  String(ctx.id_centro));
    if (ctx?.id_tipopoliza != null)  form.append('id_tipopoliza', String(ctx.id_tipopoliza));

    // Angular setea el boundary automáticamente con FormData
    return this.http.post<any>(this.cfdiImportUrl, form);
  }

  /** Vincular UUID a movimientos */
  linkUuidToMovimientos(polizaId: number, uuid: string, movimientoIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.api}/cfdi/polizas/${polizaId}/movimientos/link-uuid`, {
      uuid,
      movimiento_ids: movimientoIds,
    });
  }

  /** GET /api/v1/cfdi */
  listCfdi(params?: { limit?: number; q?: string }): Observable<CfdiRow[] | any> {
    let httpParams = new HttpParams();
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.q)             httpParams = httpParams.set('q', params.q);
    return this.http.get<any>(`${this.api}/cfdi`, { params: httpParams });
  }
  // en polizas.service.ts 
getMe() {
  return this.http.get<any>('/api/me'); 
}
// polizas.service.ts
changeEstadoPoliza(id_poliza: number, estado: 'Por revisar' | 'Revisada' | 'Contabilizada') {
  return this.http.patch<any>(`${this.api}/poliza/${id_poliza}`, { estado });
}

}
