import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { BalanzaResp, BalanzaRow } from '@app/models/balanza-row';
import { EstadoResultadosResponse } from '@app/models/estado-resultado';
import { BalanceResp } from '@app/models/balance-gral';
import { Empresa } from '@app/models/empresa';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  balanzaComprobacion(periodoIni: number, periodoFin: number): Observable<BalanzaResp> {
    const params = new HttpParams()
      .set('periodo_ini', String(periodoIni))
      .set('periodo_fin', String(periodoFin));
    return this.http.get<BalanzaResp>(`${this.baseUrl}/reports/balanza-comprobacion`, { params });
  }

  balanceGeneral(periodoIni: number, periodoFin: number): Observable<BalanceResp> {
    const params = new HttpParams()
      .set('periodo_ini', String(periodoIni))
      .set('periodo_fin', String(periodoFin));
    return this.http.get<BalanceResp>(`${this.baseUrl}/reports/balance-gral`, { params });
  }

  estadoresultados(periodoIni: number, periodoFin: number): Observable<EstadoResultadosResponse> {
    const params = new HttpParams()
      .set('periodo_ini', String(periodoIni))
      .set('periodo_fin', String(periodoFin));
    return this.http.get<EstadoResultadosResponse>(`${this.baseUrl}/reports/estado-resultados`, { params });
  }

  getEmpresaInfo(id_empresa: number): Observable<Empresa> {
    return this.http
      .get<Empresa>(`${this.baseUrl}/empresas/${id_empresa}`)
      .pipe(shareReplay(1));
  }
}
