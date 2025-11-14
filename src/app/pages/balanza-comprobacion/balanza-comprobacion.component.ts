import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

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
    private reportesService: ReportesService
  ) { }

  // --- UI/Toast
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
  balanza: BalanzaRow[] = [];
  totalFilas = 0;

  totCargos = 0;
  totAbonos = 0;
  totDeudor = 0;
  totAcreedor = 0;

  onGenerarBalanza() {
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({ type: 'warning', title: 'Fallo', message: 'Seleccione un rango de periodos.' });
      return;
    }
    this.loading = true;
    this.resetBalanzaView();

    this.reportesService
      .balanzaComprobacion(this.periodoIniId, this.periodoFinId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: BalanzaResp) => {
          if (resp?.ok) {
            this.balanza = resp.data ?? [];
            this.totalFilas = resp.count ?? this.balanza.length;
            this.computeTotals();
            this.showToast({ type: 'success', title: 'Balanza generada', message: `(${this.totalFilas} cuentas).` });
          } else {
            this.showToast({ type: 'warning', title: 'Fallo', message: 'No se pudo generar la balanza' });
          }
        },
        error: (err) => this.showToast({ type: 'warning', title: 'Fallo', message: 'No se pudo generar la balanza' }),
      });
  }

  trackCodigo = (_: number, r: BalanzaRow) => r.codigo;


  onEjercicioChange(value: string) {
    const id = value ? Number(value) : null;
    this.ejercicioId = Number.isFinite(id) ? id : null;
    this.resetBalanzaView();

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
      this.resetBalanzaView();
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

  get cuadraMov(): boolean { return this.eq2(this.totCargos, this.totAbonos); }
  get cuadraSaldos(): boolean { return this.eq2(this.totDeudor, this.totAcreedor); }
  get diffMovAbs(): number { return Math.abs(this.totCargos - this.totAbonos); }
  get diffSaldosAbs(): number { return Math.abs(this.totDeudor - this.totAcreedor); }

  private computeTotals() {
    let cargos = 0, abonos = 0, deudor = 0, acreedor = 0;
    for (const r of this.balanza) {
      cargos += Number(r.cargos ?? 0);
      abonos += Number(r.abonos ?? 0);
      deudor += Number(r.saldo_final_deudor ?? 0);
      acreedor += Number(r.saldo_final_acreedor ?? 0);
    }
    this.totCargos = this.round2(cargos);
    this.totAbonos = this.round2(abonos);
    this.totDeudor = this.round2(deudor);
    this.totAcreedor = this.round2(acreedor);
  }
  private resetBalanzaView(): void {
    this.balanza = [];
    this.totalFilas = 0;
    this.totCargos = this.totAbonos = this.totDeudor = this.totAcreedor = 0;
  }
  private round2(n: number): number { return Math.round((n + Number.EPSILON) * 100) / 100; }
  private eq2(a: number, b: number): boolean { return Math.abs(a - b) < 0.005; }
  private toNum(v: any): number {
    const n = Number((v ?? '').toString().replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
  }

  private fmtDateISO(d = new Date()): string {
    return d.toISOString().split('T')[0];
  }


  searchTerm = '';
  get filteredRows() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.balanza;
    return this.balanza.filter((r) => {
      const codigo = (r?.codigo ?? '').toLowerCase();
      const nombre = (r?.nombre ?? '').toLowerCase();
      return codigo.includes(term) || nombre.includes(term);
    });
  }

  exportToExcel(allRows = false): void {
    const rows = (allRows ? this.balanza : this.filteredRows) ?? [];

    const HEAD = [
      'Código',
      'Nombre',
      'Cargos',
      'Abonos',
      'Saldo final Deudor',
      'Saldo final Acreedor',
    ];

    const BODY = rows.map(r => ([
      r.codigo ?? '',
      r.nombre ?? '',
      this.toNum(r.cargos),
      this.toNum(r.abonos),
      this.toNum(r.saldo_final_deudor),
      this.toNum(r.saldo_final_acreedor),
    ]));

    const firstDataRow = 2;
    const lastDataRow = firstDataRow + BODY.length - 1;

    const totalLabel = 'Totales';
    const TOTALS = BODY.length > 0 ? [
      totalLabel,
      '',
      { f: `SUM(C${firstDataRow}:C${lastDataRow})` }, 
      { f: `SUM(D${firstDataRow}:D${lastDataRow})` },
      { f: `SUM(E${firstDataRow}:E${lastDataRow})` }, 
      { f: `SUM(F${firstDataRow}:F${lastDataRow})` },
    ] : [totalLabel, '', 0, 0, 0, 0];

    const ws = XLSX.utils.aoa_to_sheet([HEAD, ...BODY, TOTALS]);

    const numberFmt = '#,##0.00';
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let R = firstDataRow - 1; R <= range.e.r; R++) {
      for (let C = 2; C <= 5; C++) { 
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[addr];
        if (!cell) continue;
        if (typeof cell.v === 'number' || cell.f) {
          (cell as any).z = numberFmt;
        }
      }
    }

    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(0, range.e.r), c: range.e.c } }) };
    (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1 };

    const allRowsForWidth = [HEAD, ...BODY.map(r => r.map(v => (v ?? '').toString())), TOTALS.map(v => (typeof v === 'object' && 'f' in v) ? totalLabel : (v ?? '').toString())];
    const colWidths = HEAD.map((_, colIdx) => {
      const maxLen = allRowsForWidth.reduce((m, row) => Math.max(m, (row[colIdx] ?? '').toString().length), 0);
      return { wch: Math.min(Math.max(10, maxLen + 2), 50) };
    });
    (ws as any)['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balanza');

    const rango =
      (this.periodoIniId && this.periodoFinId)
        ? `_p${this.periodoIniId}-p${this.periodoFinId}`
        : '';
    const fecha = this.fmtDateISO();
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `balanzaComprobacion${rango}_${fecha}.xlsx`);

    this.showToast({
      type: 'success',
      title: 'Excel generado',
      message: `Se exportaron ${rows.length} filas ${allRows ? '(todas)' : '(filtradas)'}`
    });
  }

}
