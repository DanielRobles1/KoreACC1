import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
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
   id_poliza: number; 
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

/** ===== Tipos para Tipo de Póliza ===== */
export type NaturalezaTP = 'ingreso' | 'egreso' | 'diario' | 'apertura' | 'cierre';

export interface TipoPolizaCreate {
  naturaleza: NaturalezaTP;
  descripcion: string;
}

export interface TipoPoliza {
  id_tipopoliza: number;
  naturaleza: NaturalezaTP;
  descripcion: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class PolizasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.urlBase}/api/v1/usuarios`;

  private api =  `${environment.urlBase}/api/v1`;
  private basePoliza = `${this.api}/poliza`;
  private cfdiImportUrl = `${this.api}/cfdi/import`;

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      '';
    return new HttpHeaders(
      token ? { Authorization: `Bearer ${token}` } : {}
    );
  }

  /** ---------------- TIPOS DE PÓLIZA (CRUD) ---------------- */

  /** GET /api/v1/tipo-poliza */

  //Revisar
  getTiposPoliza(): Observable<TipoPoliza[]> {
    return this.http.get<any>(`${this.api}/tipo-poliza`, {
      headers: this.getAuthHeaders(),
    }).pipe(
      map((res): TipoPoliza[] => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.rows)) return res.rows;
        if (Array.isArray(res?.results)) return res.results;
        return [];
      })
    );
  }

  /** POST /api/v1/tipo-poliza */
  createTipoPoliza(payload: TipoPolizaCreate): Observable<TipoPoliza> {
    return this.http.post<TipoPoliza>(`${this.api}/tipo-poliza`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  /** PUT /api/v1/tipo-poliza/:id */
  updateTipoPoliza(id_tipopoliza: number, payload: Partial<TipoPolizaCreate>): Observable<TipoPoliza> {
    return this.http.put<TipoPoliza>(`${this.api}/tipo-poliza/${id_tipopoliza}`, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  /** DELETE /api/v1/tipo-poliza/:id */
  deleteTipoPoliza(id_tipopoliza: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.api}/tipo-poliza/${id_tipopoliza}`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** ---------------- PERÍODOS / CENTROS (catálogos) ---------------- */

  /** GET /api/v1/periodos */
  getPeriodos(): Observable<any> {
    return this.http.get<any>(`${this.api}/periodos`, {
      headers: this.getAuthHeaders(),
    });
  }

  /** GET /api/v1/centros */
  getCentros(): Observable<any> {
    return this.http.get<any>(`${this.api}/centros`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- PÓLIZAS ----------------

  /** GET /api/v1/poliza */
  getPolizas(params?: {
    id_tipopoliza?: number;
    id_periodo?: number;
    id_centro?: number;
  }): Observable<any> {
    let p = new HttpParams();
    if (params?.id_tipopoliza != null) p = p.set('id_tipopoliza', String(params.id_tipopoliza));
    if (params?.id_periodo != null) p = p.set('id_periodo', String(params.id_periodo));
    if (params?.id_centro != null) p = p.set('id_centro', String(params.id_centro));

    return this.http.get<any>(this.basePoliza, {
      params: p,
      headers: this.getAuthHeaders(),
    });
  }

  getPolizaByEjercicio(id_ejercicio: Number, options?: { page?: number, pageSize?: number }): Observable<any> {
    const params: any = {};
    if (options?.page) params.page = options.page;
    if (options?.pageSize) params.pageSize = options.pageSize;
    return this.http.get<any>(`${this.basePoliza}/por-ejercicio/${id_ejercicio}`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  /** POST /api/v1/poliza */
  createPoliza(body: any): Observable<any> {
    return this.http.post<any>(this.basePoliza, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** GET /api/v1/poliza/:id/movimientos */
  getPolizaConMovimientos(id: number, page: number = 1, pageSize: number = 10): Observable<{ data: Movimiento[]; total: number; page: number; pageSize: number }> {
    
    return this.http.get<any>(`${this.basePoliza}/${id}/movimientos`, {
      headers: this.getAuthHeaders(),
    });
  }

  listPolizaConMovimientos(id: number, page: number = 1, pageSize: number = 10): Observable<{ data: Movimiento[]; total: number; page: number; pageSize: number }> {
    const params: any = {
      page: String(page),
      pageSize: String(pageSize),
    };

    return this.http.get<any>(`${this.basePoliza}/${id}/listmovimientos`, {
      headers: this.getAuthHeaders(),
      params,
    });
  }

  /** PUT /api/v1/poliza/:id */
  updatePoliza(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.basePoliza}/${id}`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** GET /api/v1/poliza/folio-siguiente */
  getFolioSiguiente(params: { id_tipopoliza: number; id_periodo: number; id_centro?: number }) {
    let p = new HttpParams()
      .set('id_tipopoliza', String(params.id_tipopoliza))
      .set('id_periodo', String(params.id_periodo));
    if (params.id_centro != null) p = p.set('id_centro', String(params.id_centro));

    return this.http.get<any>(`${this.basePoliza}/folio-siguiente`, {
      params: p,
      headers: this.getAuthHeaders(),
    });
  }

  /** DELETE /api/v1/poliza/:id */
  deletePoliza(id: number): Observable<any> {
    return this.http.delete<any>(`${this.basePoliza}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- MOVIMIENTOS ----------------

  /** POST /api/v1/movimiento-poliza */
  createMovPoliza(body: any): Observable<any> {
    return this.http.post<any>(`${this.api}/movimiento-poliza`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** PUT /api/v1/movimiento-poliza/:id */
  updateMovPoliza(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/movimiento-poliza/${id}`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** DELETE /api/v1/movimiento-poliza/:id */
  deleteMovPoliza(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/movimiento-poliza/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- CATÁLOGOS ----------------

  getCuentas() {
    return this.http.get<any>(`${this.api}/cuentas`, {
      headers: this.getAuthHeaders(),
    });
  }

  getCentrosCosto() {
    return this.http.get<any>(`${this.api}/centros`, {
      headers: this.getAuthHeaders(),
    });
  }

  getEjercicios() {
    return this.http.get<any>(`${this.api}/ejercicios`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Revisar
  getNaturalezasPoliza() {
    return this.http.get<any>(`${this.api}/tipo-poliza/naturalezas`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- CFDI ----------------

  /** POST /api/v1/cfdi/import (subir XML) */
  uploadCfdiXml(
    file: File,
    ctx?: { folio?: string; id_periodo?: number; id_centro?: number; id_tipopoliza?: number }
  ): Observable<any> {
    const form = new FormData();
    form.append('file', file); // nombre del campo que espera multer

    if (ctx?.folio) form.append('folio', ctx.folio);
    if (ctx?.id_periodo != null) form.append('id_periodo', String(ctx.id_periodo));
    if (ctx?.id_centro != null) form.append('id_centro', String(ctx.id_centro));
    if (ctx?.id_tipopoliza != null) form.append('id_tipopoliza', String(ctx.id_tipopoliza));

    return this.http.post<any>(this.cfdiImportUrl, form, {
      headers: this.getAuthHeaders(),
    });
  }

  /** Vincular UUID a movimientos */
  linkUuidToMovimientos(polizaId: number, uuid: string, movimientoIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.api}/cfdi/polizas/${polizaId}/movimientos/link-uuid`, {
      uuid,
      movimiento_ids: movimientoIds,
    }, {
      headers: this.getAuthHeaders(),
    });
  }

  /** GET /api/v1/cfdi */
  listCfdi(params?: { limit?: number; q?: string }): Observable<CfdiRow[] | any> {
    let httpParams = new HttpParams();
    if (params?.limit != null) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.q) httpParams = httpParams.set('q', params.q);
    return this.http.get<any>(`${this.api}/cfdi`, {
      params: httpParams,
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- USUARIO ----------------
  getMeq() {
    return this.http.get<any>(`${this.api}/me`, {
      headers: this.getAuthHeaders(),
    });

  }
  getMe() {
    return this.http.get<any>(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders(),
    });

  }

  // ---------------- ESTADO PÓLIZA ----------------

  // Usa el endpoint correcto del router: PATCH /poliza/:id/estado
  changeEstadoPoliza(id_poliza: number, estado: 'Por revisar' | 'Aprobada' | 'Contabilizada') {
    return this.http.patch<any>(`${this.basePoliza}/${id_poliza}/estado`, { estado }, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- MOTOR (EVENTO → MOVIMIENTOS) ----------------

  /** POST /api/v1/poliza/from-evento  (crea póliza con el motor) */
  createPolizaFromEvento(body: {
    id_tipopoliza: number;
    id_periodo: number;
    id_usuario: number;
    id_centro: number;
    folio: string;
    concepto: string;
    // motor:
    tipo_operacion: 'ingreso' | 'egreso';
    monto_base: number;
    fecha_operacion: string;   // 'YYYY-MM-DD'
    id_empresa: number;
    medio_cobro_pago: 'bancos' | 'caja' | 'clientes' | 'proveedores';
    id_cuenta_contrapartida: number;
    // opcionales:
    cliente?: string | null;
    ref_serie_venta?: string | null;
    cc?: number | null;
  }): Observable<any> {
    return this.http.post<any>(`${this.basePoliza}/from-evento`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  /** POST /api/v1/poliza/:id/expand-evento  (agrega movimientos generados a una póliza existente) */
  expandEventoEnPoliza(polizaId: number, body: {
    tipo_operacion: 'ingreso' | 'egreso';
    monto_base: number;
    fecha_operacion: string;   // 'YYYY-MM-DD'
    id_empresa: number;
    medio_cobro_pago: 'bancos' | 'caja' | 'clientes' | 'proveedores';
    id_cuenta_contrapartida: number;
    // opcionales:
    cliente?: string | null;
    ref_serie_venta?: string | null;
    cc?: number | null;
  }): Observable<any> {
    return this.http.post<any>(`${this.basePoliza}/${polizaId}/expand-evento`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  // ---------------- EJERCICIO ----------------

  selectEjercicio(id_ejercicio: number) {
    return this.http.put(`${this.api}/ejercicios/${id_ejercicio}/select`, {}, {
      headers: this.getAuthHeaders(),
    });
  }

  createPolizaAjuste(payload: any): Observable<any> {
    return this.http.post<any>(`${this.basePoliza}/ajuste`, payload, {
      headers: this.getAuthHeaders(),
    });
  }
}
