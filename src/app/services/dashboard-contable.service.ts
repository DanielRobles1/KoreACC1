import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ResumenItem {
  tipo: string; 
  estado: string;
  total_polizas: number;
}

interface RawMovimientoMensualBackend {
  mes: string | Date;
  ingresos: number | string | null;
  egresos: number | string | null;
  resultado?: number | string | null;
}

export interface MovimientoMensual {
  mes: string; 
  ganancias: number;
  perdidas: number;
}

export interface DashboardContableDTO {
  resumen: ResumenItem[];
  movimientos: MovimientoMensual[];
}

interface DashboardContableResponseBackend {
  resumen: ResumenItem[];
  movimientos: RawMovimientoMensualBackend[];
}

@Injectable({ providedIn: 'root' })
export class DashboardContableService {
  private base = `${environment.urlBase}/api/v1/dashboard-contable`;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<DashboardContableDTO> {
    return this.http.get<DashboardContableResponseBackend>(this.base).pipe(
      map((r) => {
        console.log('API dashboard:', r);

        const movimientos: MovimientoMensual[] = (r.movimientos ?? []).map((m) => {
          const mesISO =
            m.mes instanceof Date
              ? m.mes.toISOString().slice(0, 10)
              : String(m.mes ?? '');

          return {
            mes: mesISO.slice(0, 7),
            ganancias: Number(m.ingresos ?? 0),
            perdidas: Number(m.egresos ?? 0),
          };
        });

        return {
          resumen: r.resumen ?? [],
          movimientos,
        };
      })
    );
  }
}
