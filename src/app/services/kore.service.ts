import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KoreService {
  private baseUrl = 'https://test.reportes.koreingenieria.com/reportes/polizas/generar';

  constructor(private http: HttpClient) {}

  getMovimientos(paramsIn: {
    folio: string | number;
    fecha_poliza: string;
    fecha_anterior: string;
    almacenes_multiple: string | number; 
  }, opts: {
    naturaleza: 'INGRESO' | 'EGRESO';
    token: string;
  }): Observable<any[]> {
    const endpoint = opts.naturaleza === 'INGRESO'
      ? `${this.baseUrl}/ventas`
      : `${this.baseUrl}/compras`;

    const headers = new HttpHeaders({ 'x-app-token': opts.token });

    const params = new HttpParams({ fromObject: {
      folio: String(paramsIn.folio ?? ''),
      fecha_poliza: String(paramsIn.fecha_poliza ?? ''),
      fecha_anterior: String(paramsIn.fecha_anterior ?? ''),
      almacenes_multiple: String(paramsIn.almacenes_multiple ?? ''),
    }});
    const urlConQuery = `${endpoint}?${params.toString()}`;
    console.log('[KORE][GET] →', urlConQuery);
    console.log('[KORE][HEADERS] →', Object.fromEntries(headers.keys().map(k => [k, headers.get(k)])));

    return this.http.get(endpoint, {
      headers,
      params,
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        console.log('[KORE][STATUS] ←', res.status, res.statusText);
        console.log('[KORE][RESP HEADERS] ←', Object.fromEntries(res.headers.keys().map(k => [k, res.headers.get(k)])));
        console.log('[KORE][BODY RAW] ←', res.body);
      }),
      map((res: HttpResponse<any>) => {
        const r = res.body;
        const candidatos: any[] = [
          r?.Data?.Datos?.MovimientosPoliza,
          r?.Data?.MovimientosPoliza,
          r?.Datos?.MovimientosPoliza,
          r?.MovimientosPoliza,
          r?.data?.items,
          r?.items,
          r?.rows,
          r?.movimientos,
          Array.isArray(r) ? r : null
        ].filter(Boolean);
        const arr = Array.isArray(candidatos[0]) ? candidatos[0] : [];
        console.log('[KORE][BODY PARSED] ←', arr);
        return arr;
      })
    );
  }
}