import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ResumenItem {
  tipo: 'ingreso' | 'egreso' | 'diario' | string;
  estado: string;
  total_polizas: number;
}

interface RawMovimientoMensual {
  mes: string;       // 'YYYY-MM-01'
  ganancias: number; 
  perdidas: number;  
}

export interface MovimientoMensual {
  mes: string;        // 'YYYY-MM'
  ganancias: number;
  perdidas: number;
}

export interface DashboardContableDTO {
  resumen: ResumenItem[];
  movimientos: MovimientoMensual[];
}

interface DashboardContableResponse {
  resumen: ResumenItem[];
  movimientos: RawMovimientoMensual[];
}

@Injectable({ providedIn: 'root' })
export class DashboardContableService {
  private base = `${environment.urlBase}/api/v1/dashboard-contable`;
  

  constructor(private http: HttpClient) {}

  getResumen(): Observable<DashboardContableDTO> {
    return this.http.get<DashboardContableResponse>(this.base).pipe(
      map(r => {
        console.log('API dashboard:', r); 
        return {
          resumen: r.resumen,
          movimientos: (r.movimientos ?? []).map(m => ({
            // normaliza el mes a YYYY-MM
            mes: (m.mes || '').slice(0, 7),
            ganancias: m.ganancias ?? 0,
            perdidas: m.perdidas ?? 0
          }))
        };
      })
    );
  }
}
