import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesLayoutComponent } from '@app/components/reportes-layout/reportes-layout.component';
import { PolizasService } from '@app/services/polizas.service';
import { PeriodoContableService, PeriodoContableDto } from '@app/services/periodo-contable.service';
import { EjercicioContableDto } from '@app/services/ejercicio-contable.service';
import { ReportesService } from '@app/services/reportes.service';
import { EstadoResultadosData, EstadoResultadosResponse } from '@app/models/estado-resultado';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { finalize, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
    private reportesService: ReportesService
  ) { }

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

  onGenerarEstadoResultados() {
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({
        type: 'warning',
        title: 'Fallo',
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
            type: 'error',
            title: 'Error',
            message: 'No se pudo generar el estado de resultados.'
          });
        },
      });
  }

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
      error: (err) => this.showToast({ type: 'warning', title: 'Fallo', message: 'No se pudieron recuperar los periodos' }),
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
    const fi = p?.fecha_inicio ? new Date(p.fecha_inicio + 'T00:00:00') : null;
    const ff = p?.fecha_fin ? new Date(p.fecha_fin + 'T00:00:00') : null;


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

  private fmtDateISO(d = new Date()): string {
  return d.toISOString().split('T')[0];
}

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

exportToExcel(includeSplitSheets = true): void {
  const er = this.estadoResultados;
  if (!er) {
    this.showToast({ type: 'warning', title: 'Sin datos', message: 'Genera primero el estado de resultados.' });
    return;
  }

  // --- 1) Hoja RESUMEN
  const resumenRows = [
    ['Concepto', 'Importe'],
    ['Ingresos', this.toNum(er.resumen.ingresos)],
    ['Costos', this.toNum(er.resumen.costos)],
    ['Utilidad bruta', this.toNum(er.resumen.utilidad_bruta)],      // puedes dejar valores del backend
    ['Gastos de operación', this.toNum(er.resumen.gastos_operacion)],
    ['Utilidad neta', this.toNum(er.resumen.utilidad_neta)],        // o usar fórmulas si prefieres
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  // Filtros, freeze y formatos
  wsResumen['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: resumenRows.length - 1, c: 1 } }) };
  (wsResumen as any)['!freeze'] = { xSplit: 0, ySplit: 1 };
  this.numFmtCell(wsResumen, 1, 1, 1, resumenRows.length - 1); // col B
  this.autosize(wsResumen);

  // --- 2) Hoja DETALLE (todas las líneas)
  const HEAD = ['Código', 'Nombre', 'Tipo', 'Naturaleza', 'Cargos (per.)', 'Abonos (per.)', 'Importe'];
  const body = (er.detalle ?? []).map(d => ([
    d.codigo ?? '',
    d.nombre ?? '',
    d.tipo_er ?? '',
    d.naturaleza ?? '',
    this.toNum(d.cargos_per),
    this.toNum(d.abonos_per),
    this.toNum(d.importe),
  ]));

  const firstDataRow = 2;                     // fila 2 (1 es encabezado)
  const lastDataRow  = body.length ? firstDataRow + body.length - 1 : firstDataRow - 1;

  const totalsRow = body.length ? [
    'Totales', '', '', '',
    { f: `SUM(E${firstDataRow}:E${lastDataRow})` },
    { f: `SUM(F${firstDataRow}:F${lastDataRow})` },
    { f: `SUM(G${firstDataRow}:G${lastDataRow})` },
  ] : ['Totales', '', '', '', 0, 0, 0];

  const wsDetalle = XLSX.utils.aoa_to_sheet([HEAD, ...body, totalsRow]);

  // Filtros y freeze
  const refDetalle = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: (body.length ? body.length + 1 : 1), c: HEAD.length - 1 } });
  wsDetalle['!autofilter'] = { ref: refDetalle };
  (wsDetalle as any)['!freeze'] = { xSplit: 0, ySplit: 1 };

  // Formato numérico a columnas E..G (índices 4..6), de fila 2 a totales
  const lastRowIdx = body.length ? (body.length + 1) : 1; // +1 por encabezado
  this.numFmtCell(wsDetalle, 4, 6, 1, lastRowIdx); // aplica a datos y a totales
  this.autosize(wsDetalle);

  // --- 3) (Opcional) Hojas por categoría
  const mkSheetBy = (tipo: 'INGRESO'|'COSTO'|'GASTO', nombreHoja: string) => {
    const rows = (er.detalle ?? []).filter(d => d.tipo_er === tipo).map(d => ([
      d.codigo ?? '',
      d.nombre ?? '',
      d.tipo_er ?? '',
      d.naturaleza ?? '',
      this.toNum(d.cargos_per),
      this.toNum(d.abonos_per),
      this.toNum(d.importe),
    ]));
    const tot = rows.length ? [
      'Totales', '', '', '',
      { f: `SUM(E2:E${rows.length + 1})` },
      { f: `SUM(F2:F${rows.length + 1})` },
      { f: `SUM(G2:G${rows.length + 1})` },
    ] : ['Totales', '', '', '', 0, 0, 0];
    const ws = XLSX.utils.aoa_to_sheet([HEAD, ...rows, tot]);
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(1, rows.length + 1), c: HEAD.length - 1 } }) };
    (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1 };
    this.numFmtCell(ws, 4, 6, 1, Math.max(1, rows.length + 1));
    this.autosize(ws);
    return { ws, nombreHoja };
  };

  // --- 4) Construir libro
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

  if (includeSplitSheets) {
    const sIngr = mkSheetBy('INGRESO', 'Ingresos');
    const sCost = mkSheetBy('COSTO', 'Costos');
    const sGast = mkSheetBy('GASTO', 'Gastos');
    XLSX.utils.book_append_sheet(wb, sIngr.ws, sIngr.nombreHoja);
    XLSX.utils.book_append_sheet(wb, sCost.ws, sCost.nombreHoja);
    XLSX.utils.book_append_sheet(wb, sGast.ws, sGast.nombreHoja);
  }

  // --- 5) Guardar
  const rango = (this.periodoIniId && this.periodoFinId) ? `_p${this.periodoIniId}-p${this.periodoFinId}` : '';
  const fecha = this.fmtDateISO();
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  saveAs(blob, `estadoResultados${rango}_${fecha}.xlsx`);

  this.showToast({ type: 'success', title: 'Excel generado', message: 'Se exportó el Estado de Resultados.' });
}

}
