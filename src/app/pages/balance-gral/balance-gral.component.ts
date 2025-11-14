import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReportesLayoutComponent } from '@app/components/reportes-layout/reportes-layout.component';
import { EjercicioContableDto } from '@app/services/ejercicio-contable.service';
import { ReportesService } from '@app/services/reportes.service';
import { PeriodoContableDto, PeriodoContableService } from '@app/services/periodo-contable.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { PolizasService } from '@app/services/polizas.service';
import { ToastType } from '@app/services/toast-service.service';
import { finalize, Observable } from 'rxjs';
import { BalanceResp, BalanceRow } from '@app/models/balance-gral';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type BalanceNivel = 'DETALLE' | 'SUBTOTAL' | 'TOTAL';
type TipoGrupo = 'ACTIVO' | 'PASIVO' | 'CAPITAL';

function inferTipoFromCodigo(codigo?: string | null): TipoGrupo | null {
  if (!codigo || codigo.length === 0) return null;
  const first = codigo.trim()[0];
  if (first === '1') return 'ACTIVO';
  if (first === '2') return 'PASIVO';
  if (first === '3') return 'CAPITAL';
  return null;
}

function isAlreadyBalanceGeneralRow(r: any): boolean {
  return 'nivel' in r && ('saldo_deudor' in r || 'saldo_acreedor' in r);
}

// === Tipo estrecho con id_periodo requerido
type PeriodoConId = PeriodoContableDto & { id_periodo: number };

// === Type-guard para estrechar PeriodoContableDto -> PeriodoConId
function hasPeriodoId(p: PeriodoContableDto): p is PeriodoConId {
  return typeof p.id_periodo === 'number';
}
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-balance-gral',
  standalone: true,
  imports: [CommonModule, ReportesLayoutComponent, ToastMessageComponent],
  templateUrl: './balance-gral.component.html',
  styleUrl: './balance-gral.component.scss'
})
export class BalanceGralComponent {
  constructor(
    private polizaService: PolizasService,
    private periodoService: PeriodoContableService,
    private reportesService: ReportesService
  ) { }

  loading = false;
  balance: BalanceRow[] = [];
  totalFilas = 0;

  ejercicioId: number | null = null;
  periodos: PeriodoConId[] = [];
  periodoIniId: number | null = null;
  periodoFinId: number | null = null;

  totDeudor = 0;
  totAcreedor = 0;

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
  ejercicios: Observable<EjercicioContableDto[]> = this.polizaService.getEjercicios();

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }
  private showToast(opts: { type?: ToastType; title?: string; message: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    this.toast.message = opts.message;
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }

  onGenerarBalance() {
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({ type: 'warning', title: 'Fallo', message: 'Seleccione un rango de periodos.' });
      return;
    }
    this.loading = true;
    this.resetBalanceView();

    this.reportesService
      .balanceGeneral(this.periodoIniId, this.periodoFinId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp: BalanceResp) => {
          if (resp?.ok) {
            const rows = resp.data ?? [];
            this.balance = this.adaptToBalanceGeneral(rows);
            this.totalFilas = this.balance.length;

            // Totales para el pie
            const total = this.balance.find(r => r.nivel === 'TOTAL');
            this.totDeudor = total ? this.toNum(total.saldo_deudor) :
              this.round2(this.balance.reduce((s, r) => s + this.toNum(r.saldo_deudor), 0));
            this.totAcreedor = total ? this.toNum(total.saldo_acreedor) :
              this.round2(this.balance.reduce((s, r) => s + this.toNum(r.saldo_acreedor), 0));

            this.showToast({ type: 'success', title: 'Balance general', message: `(${this.totalFilas} filas).` });
          } else {
            this.showToast({ type: 'warning', title: 'Fallo', message: 'No se pudo generar el balance general' });
          }
        }
        ,
        error: () => this.showToast({ type: 'warning', title: 'Fallo', message: 'No se pudo generar el balance general' }),
      });
  }

  trackFila = (_: number, r: BalanceRow) => r.codigo ?? `${r.nivel}-${r.tipo ?? 'TOTAL'}`;

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
      this.resetBalanceView();
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

  private computeTotals() {
    const total = this.balance.find(r => r.nivel === 'TOTAL');
    if (total) {
      this.totDeudor = this.toNum(total.saldo_deudor);
      this.totAcreedor = this.toNum(total.saldo_acreedor);
    } else {
      this.totDeudor = this.round2(this.balance.reduce((s, r) => s + this.toNum(r.saldo_deudor), 0));
      this.totAcreedor = this.round2(this.balance.reduce((s, r) => s + this.toNum(r.saldo_acreedor), 0));
    }
  }
  private resetBalanceView(): void {
    this.balance = [];
    this.totalFilas = 0;
    this.totDeudor = this.totAcreedor = 0;
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

  private adaptToBalanceGeneral(data: any[]): BalanceRow[] {
    if (!Array.isArray(data) || data.length === 0) return [];

    if (isAlreadyBalanceGeneralRow(data[0])) {
      return data.map(d => ({
        nivel: (d.nivel ?? 'DETALLE') as BalanceNivel,
        tipo: (d.tipo ?? null) as any,
        codigo: d.codigo ?? null,
        nombre: d.nombre ?? null,
        saldo_deudor: this.toNum(d.saldo_deudor),
        saldo_acreedor: this.toNum(d.saldo_acreedor),
      }));
    }

    const detalle: BalanceRow[] = data.map((d: any) => {
      const tipo = inferTipoFromCodigo(d.codigo);
      return {
        nivel: 'DETALLE',
        tipo,
        codigo: d.codigo ?? null,
        nombre: d.nombre ?? null,
        saldo_deudor: this.toNum(d.saldo_final_deudor),
        saldo_acreedor: this.toNum(d.saldo_final_acreedor),
      };
    });

    const grupos: Record<string, { deudor: number; acreedor: number }> = {};
    for (const r of detalle) {
      const k = r.tipo ?? 'OTRO';
      if (!grupos[k]) grupos[k] = { deudor: 0, acreedor: 0 };
      grupos[k].deudor += this.toNum(r.saldo_deudor);
      grupos[k].acreedor += this.toNum(r.saldo_acreedor);
    }

    const orden: TipoGrupo[] = ['ACTIVO', 'PASIVO', 'CAPITAL'];
    const subtotales: BalanceRow[] = orden
      .filter(t => grupos[t])
      .map(t => ({
        nivel: 'SUBTOTAL',
        tipo: t,
        codigo: null,
        nombre: null,
        saldo_deudor: this.round2(grupos[t].deudor),
        saldo_acreedor: this.round2(grupos[t].acreedor),
      }));

    const totDeu = this.round2(detalle.reduce((s, r) => s + this.toNum(r.saldo_deudor), 0));
    const totAcr = this.round2(detalle.reduce((s, r) => s + this.toNum(r.saldo_acreedor), 0));
    const total: BalanceRow = {
      nivel: 'TOTAL',
      tipo: null,
      codigo: null,
      nombre: null,
      saldo_deudor: totDeu,
      saldo_acreedor: totAcr,
    };

    const detalleOrdenado = [
      ...orden.flatMap(t => detalle.filter(r => r.tipo === t)),
      ...subtotales,
      total,
    ];

    return detalleOrdenado;
  }

  searchTerm = '';
  get filteredRows() {
    const term = (this.searchTerm ?? '').trim().toLowerCase();
    if (!term) return this.balance;
    return this.balance.filter(r => {
      const codigo = (r?.codigo ?? '').toLowerCase();
      const nombre = (r?.nombre ?? '').toLowerCase();
      const tipo = (r?.tipo ?? '').toString().toLowerCase();
      return codigo.includes(term) || nombre.includes(term) || tipo.includes(term);
    });
  }

  exportToExcel(allRows = false): void {
    const rows = (allRows ? this.balance : this.filteredRows) ?? [];

    const HEAD = ['Nivel', 'Tipo', 'Código', 'Nombre / Grupo', 'Deudor', 'Acreedor'];

    const BODY = rows.map(r => {
      const nivel = r.nivel ?? 'DETALLE';
      const tipo = r.tipo ?? '';
      const codigo = nivel === 'DETALLE' ? (r.codigo ?? '') : '';
      const nombre =
        nivel === 'SUBTOTAL' ? `Subtotal ${tipo}` :
          nivel === 'TOTAL' ? 'TOTAL' :
            (r.nombre ?? '');

      return [
        nivel,
        tipo,
        codigo,
        nombre,
        this.toNum(r.saldo_deudor),
        this.toNum(r.saldo_acreedor),
      ];
    });

    const firstDataRow = 2; 
    const lastDataRow = firstDataRow + BODY.length - 1;
    const totalsRow =
      BODY.length > 0
        ? [
          'Totales (DETALLE)',
          '',
          '',
          '',
          { f: `SUMIFS(E${firstDataRow}:E${lastDataRow},A${firstDataRow}:A${lastDataRow},"DETALLE")` },
          { f: `SUMIFS(F${firstDataRow}:F${lastDataRow},A${firstDataRow}:A${lastDataRow},"DETALLE")` },
        ]
        : ['Totales (DETALLE)', '', '', '', 0, 0];

    const ws = XLSX.utils.aoa_to_sheet([HEAD, ...BODY, totalsRow]);

    const numberFmt = '#,##0.00';
    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = firstDataRow - 1; R <= range.e.r; R++) {
        for (let C = 4; C <= 5; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[addr];
          if (!cell) continue;
          if (typeof cell.v === 'number' || (cell as any).f) {
            (cell as any).z = numberFmt;
          }
        }
      }

      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: Math.max(0, range.e.r), c: range.e.c } }),
      };
      (ws as any)['!freeze'] = { xSplit: 0, ySplit: 1 };

      const rowsForWidth = [HEAD, ...BODY.map(r => r.map(v => (v ?? '').toString())), totalsRow.map(v => {
        if (typeof v === 'object' && 'f' in v) return 'Σ';
        return (v ?? '').toString();
      })];
      const colWidths = HEAD.map((_, colIdx) => {
        const maxLen = rowsForWidth.reduce((m, row) => Math.max(m, (row[colIdx] ?? '').length), 0);
        return { wch: Math.min(Math.max(10, maxLen + 2), 50) };
      });
      (ws as any)['!cols'] = colWidths;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balance');

    const rango =
      (this.periodoIniId && this.periodoFinId) ? `_p${this.periodoIniId}-p${this.periodoFinId}` : '';
    const fecha = this.fmtDateISO();
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `balanceGeneral${rango}_${fecha}.xlsx`);

    this.showToast({
      type: 'success',
      title: 'Excel generado',
      message: `Se exportaron ${rows.length} filas ${allRows ? '(todas)' : '(filtradas)'}`
    });
  }
}
