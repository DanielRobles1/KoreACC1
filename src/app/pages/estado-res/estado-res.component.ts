import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesLayoutComponent } from '@app/components/reportes-layout/reportes-layout.component';
import { PolizasService } from '@app/services/polizas.service';
import { PeriodoContableService } from '@app/services/periodo-contable.service';
import { PeriodoContableDto } from '@app/models/periodo';
import { EjercicioContableDto } from '@app/models/ejercicio';
import { ReportesService } from '@app/services/reportes.service';
import { EstadoResultadosData, EstadoResultadosResponse } from '@app/models/estado-resultado';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { finalize, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Empresa } from '@app/models/empresa';
import { periodoEtiqueta, todayISO } from '@app/utils/fecha-utils';
import { AuthService } from '@app/services/auth.service';
import { WsService } from '@app/services/ws.service';
import { PermissionWatcher } from '@app/utils/permissions.util';

// === Tipo estrecho con id_periodo requerido
type PeriodoConId = PeriodoContableDto & { id_periodo: number };

// === Type-guard para estrechar PeriodoContableDto -> PeriodoConId
function hasPeriodoId(p: PeriodoContableDto): p is PeriodoConId {
  return typeof p.id_periodo === 'number';
}

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-estado-res',
  standalone: true,
  imports: [ReportesLayoutComponent, CommonModule, ToastMessageComponent,],
  templateUrl: './estado-res.component.html',
  styleUrl: './estado-res.component.scss'
})
export class EstadoResComponent {
  constructor(
    private polizaService: PolizasService,
    private periodoService: PeriodoContableService,
    private reportesService: ReportesService,
    private auth: AuthService,
    private ws: WsService
  ) {
    this.reportesService.getEmpresaInfo(this.miEmpresaId).subscribe({
      next: (emp) => this.empresaInfo = emp,
      error: () => { }
    });
  }

  empresaInfo?: Empresa;

  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };
  onToastClosed = () => { this.toast.open = false; };
  sidebarOpen = true;
  miEmpresaId = 1;
  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }
  private showToast(opts: { type?: ToastType; title?: string; message: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    this.toast.message = opts.message;
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }

  // --- Datos base
  ejercicios: Observable<EjercicioContableDto[]> = this.polizaService.getEjercicios();

  // --- Estado local
  ejercicioId: number | null = null;
  periodos: PeriodoConId[] = [];
  periodoIniId: number | null = null;
  periodoFinId: number | null = null;

  loading = false;
  estadoResultados: EstadoResultadosData | null = null;

  // Permisos
  canGenerateReport = false;
  private permWatcher?: PermissionWatcher;

  onGenerarEstadoResultados() {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({
        type: 'warning',
        title: 'Aviso',
        message: 'Seleccione un rango de periodos.'
      });
      return;
    }

    this.loading = true;

    this.reportesService
      .estadoresultados(this.periodoIniId, this.periodoFinId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: EstadoResultadosResponse) => {
          if (resp?.ok && resp.data) {
            this.estadoResultados = resp.data;
          } else {
            this.estadoResultados = null;
            this.showToast({
              type: 'warning',
              title: 'Sin datos',
              message: 'No se encontraron resultados para el rango seleccionado.'
            });
          }
        },
        error: () => {
          this.estadoResultados = null;
          this.showToast({
            type: 'warning',
            title: 'Aviso',
            message: 'No se pudo generar el estado de resultados.'
          });
        },
      });
  }

  onEjercicioChange(value: string) {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
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
      error: (err) => this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron recuperar los periodos' }),
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
    const lbl = periodoEtiqueta(p?.fecha_inicio, p?.fecha_fin);
    return (lbl === '—' && p?.id_periodo != null) ? `Periodo ${p.id_periodo}` : lbl;
  }

  private getRangoPeriodosLabel(): string {
    if (this.periodoIniId && this.periodoFinId) {
      const pIni = this.periodos.find(p => p.id_periodo === this.periodoIniId);
      const pFin = this.periodos.find(p => p.id_periodo === this.periodoFinId);

      if (pIni && pFin) {
        const iniLbl = this.getPeriodoLabel(pIni);
        const finLbl = this.getPeriodoLabel(pFin);
        return `Periodos: ${iniLbl} a ${finLbl}`;
      }
    }
    return 'Periodos: (no especificado)';
  }


  get detalleIngresos() {
    return this.estadoResultados?.detalle.filter(d => d.tipo_er === 'INGRESO') ?? [];
  }

  get detalleCostos() {
    return this.estadoResultados?.detalle.filter(d => d.tipo_er === 'COSTO') ?? [];
  }

  get detalleGastos() {
    return this.estadoResultados?.detalle.filter(d => d.tipo_er === 'GASTO') ?? [];
  }

  toNum(v: number | string | null | undefined): number {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private comparePeriodo = (a: PeriodoConId, b: PeriodoConId) => {
    return a.id_periodo - b.id_periodo;
  };

  private numFmtCell(ws: XLSX.WorkSheet, c0: number, c1: number, r0: number, r1: number, fmt = '#,##0.00') {
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr];
        if (!cell) continue;
        if (typeof cell.v === 'number' || (cell as any).f) (cell as any).z = fmt;
      }
    }
  }

  private autosize(ws: XLSX.WorkSheet) {
    const ref = ws['!ref']; if (!ref) return;
    const range = XLSX.utils.decode_range(ref);
    const cols = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      let max = 10;
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        const v = cell?.v ?? '';
        const len = v?.toString?.().length ?? 0;
        if (len > max) max = len;
      }
      cols.push({ wch: Math.min(max + 2, 60) });
    }
    (ws as any)['!cols'] = cols;
  }

  ngOnInit(): void {
    this.permWatcher = new PermissionWatcher(
      this.auth,
      this.ws,
      {
        toastOk: (m) => this.showToast({ type: 'success', message: m }),
        toastWarn: (m) => this.showToast({ type: 'warning', message: m }),
        toastError: (m) => this.showToast({ type: 'error', message: m }),
      },
      (flags) => {
        this.canGenerateReport = !!flags.canCreate;
      },
      {
        keys: { create: 'generar_reporte', edit: '', delete: '' },
        socketEvent: ['permissions:changed', 'role-permissions:changed'],
        contextLabel: 'Reportes',
      }
    );
    this.permWatcher.start();
  }

  ngOnDestroy(): void {
    this.permWatcher?.stop();
  }

  exportToExcel(): void {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({ type: 'warning', title: 'Fallo', message: 'Seleccione un rango de periodos.' });
      return;
    }

    this.reportesService.downloadEstadoRes(this.periodoIniId!, this.periodoFinId!)
      .subscribe({
        next: (resp) => {
          const blob = resp.body!;
          const cd = resp.headers.get('content-disposition') ?? '';
          const match = /filename="([^"]+)"/.exec(cd);
          const filename = match?.[1] ?? `EstadoResultados_${todayISO()}.xlsx`;
          saveAs(blob, filename);
        },
        error: () => this.showToast({ type: 'error', title: 'Error', message: 'No se pudo descargar el Excel.' })
      });

  }

}
