import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Observable } from 'rxjs';

import { ReportesLayoutComponent } from '@app/components/reportes-layout/reportes-layout.component';
import { PolizasService } from '@app/services/polizas.service';
import { PeriodoContableService, PeriodoContableDto } from '@app/services/periodo-contable.service';
import { EjercicioContableDto } from '@app/services/ejercicio-contable.service';
import { ReportesService } from '@app/services/reportes.service';
import { BalanzaResp, BalanzaRow } from '@app/models/balanza-row';

import { ToastService, ToastState } from '@app/services/toast-service.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';

// === Tipo estrecho con id_periodo requerido
type PeriodoConId = PeriodoContableDto & { id_periodo: number };

// === Type-guard para estrechar PeriodoContableDto -> PeriodoConId
function hasPeriodoId(p: PeriodoContableDto): p is PeriodoConId {
  return typeof p.id_periodo === 'number';
}

@Component({
  selector: 'app-balanza-comprobacion',
  standalone: true,
  imports: [ReportesLayoutComponent, CommonModule, ToastMessageComponent, ModalComponent],
  templateUrl: './balanza-comprobacion.component.html',
  styleUrls: ['./balanza-comprobacion.component.scss']
})
export class BalanzaComprobacionComponent {
  constructor(
    private polizaService: PolizasService,
    private periodoService: PeriodoContableService,
    public toast: ToastService,
    private reportesService: ReportesService
  ) { }

  // --- UI/Toast
  vm!: ToastState;
  sidebarOpen = true;
  miEmpresaId = 1;
  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }
  openSuccess(message: string) { this.toast.success(message, 'Éxito', 3000); }
  openError(message: string, err?: unknown) { if (err) console.error('Error:', err); this.toast.error(message, 'Error', 0); }

  // --- Datos base
  ejercicios: Observable<EjercicioContableDto[]> = this.polizaService.getEjercicios();

  // --- Estado local
  ejercicioId: number | null = null;
  periodos: PeriodoConId[] = [];
  periodoIniId: number | null = null;
  periodoFinId: number | null = null;

  loading = false;
  balanza: BalanzaRow[] = [];
  totalFilas = 0;

  onGenerarBalanza() {
    if (!this.periodoIniId || !this.periodoFinId) {
      this.openError('Selecciona periodo inicial y final.');
      return;
    }
    this.loading = true;
    this.balanza = [];
    this.totalFilas = 0;

    this.reportesService
      .balanzaComprobacion(this.periodoIniId, this.periodoFinId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: BalanzaResp) => {
          if (resp?.ok) {
            this.balanza = resp.data ?? [];
            this.totalFilas = resp.count ?? this.balanza.length;
            this.openSuccess(`Balanza generada (${this.totalFilas} cuentas).`);
          } else {
            this.openError('No se pudo generar la balanza (ok=false).');
          }
        },
        error: (err) => this.openError('Error al generar la balanza.', err),
      });
  }

  trackCodigo = (_: number, r: BalanzaRow) => r.codigo;


  onEjercicioChange(value: string) {
    const id = value ? Number(value) : null;
    this.ejercicioId = Number.isFinite(id) ? id : null;

    this.periodoIniId = null;
    this.periodoFinId = null;
    this.periodos = [];

    if (!this.ejercicioId) return;

    this.periodoService.getPeriodosByEjercicio(this.ejercicioId).subscribe({
      next: (items) => {
        this.periodos = (items ?? [])
          .filter(hasPeriodoId)
          .sort(this.comparePeriodo);
      },
      error: (err) => this.openError('Fallo al cargar los periodos', err),
    });
  }

  onPeriodoIniChange(value: string) {
    const id = value ? Number(value) : null;
    this.periodoIniId = Number.isFinite(id) ? id : null;
    if (this.periodoFinId && this.periodoIniId && this.periodoFinId < this.periodoIniId) {
      this.periodoFinId = null;
    }
  }

  onPeriodoFinChange(value: string) {
    const id = value ? Number(value) : null;
    this.periodoFinId = Number.isFinite(id) ? id : null;
  }

  // --- Helpers de UI
  periodosFiltradosFin(): PeriodoConId[] {
    if (!this.periodoIniId) return this.periodos;
    return this.periodos.filter(p => p.id_periodo >= this.periodoIniId!);
  }

  trackPeriodo = (_: number, p: PeriodoConId) => p.id_periodo;

  getPeriodoLabel(p: PeriodoContableDto | PeriodoConId): string {
    const fi = p?.fecha_inicio ? new Date(p.fecha_inicio) : null;
    const ff = p?.fecha_fin ? new Date(p.fecha_fin) : null;

    const isValidFi = !!fi && !isNaN(fi.getTime());
    const isValidFf = !!ff && !isNaN(ff.getTime());

    try {
      const locale = 'es-MX';
      if (
        isValidFi &&
        isValidFf &&
        fi!.getMonth() === ff!.getMonth() &&
        fi!.getFullYear() === ff!.getFullYear()
      ) {
        return fi!.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      }

      if (isValidFi && isValidFf) {
        const ini = fi!.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
        const fin = ff!.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
        return `${ini} - ${fin}`;
      }

      if (isValidFi) {
        return fi!.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      }
    } catch {
    }

    if (p.id_periodo != null) return `Periodo ${p.id_periodo}`;
    return 'Periodo';
  }


  private comparePeriodo = (a: PeriodoConId, b: PeriodoConId) => {
    return a.id_periodo - b.id_periodo;
  };
}
