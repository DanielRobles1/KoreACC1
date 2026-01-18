import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { ReportesLayoutComponent } from '@app/components/reportes-layout/reportes-layout.component';
import { PolizasService } from '@app/services/polizas.service';
import { PeriodoContableService, } from '@app/services/periodo-contable.service';
import { PeriodoContableDto } from '@app/models/periodo';
import { EjercicioContableDto } from '@app/models/ejercicio';
import { ReportesService } from '@app/services/reportes.service';
import { BalanzaResp, BalanzaRow } from '@app/models/balanza-row';
import { Empresa } from '@app/models/empresa';

import { ToastService, ToastState } from '@app/services/toast-service.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
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

  canGenerateReport = false;
  private permWatcher?: PermissionWatcher;

  onGenerarBalanza() {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
    if (!this.periodoIniId || !this.periodoFinId) {
      this.showToast({ type: 'warning', title: 'Aviso', message: 'Seleccione un rango de periodos.' });
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
            this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo generar la balanza' });
          }
        },
        error: (err) => this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo generar la balanza' }),
      });
  }

  trackCodigo = (_: number, r: BalanzaRow) => r.codigo;


  onEjercicioChange(value: string) {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
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
      error: (err) => this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron recuperar los periodos' }),
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

  exportToExcel(allRows = false): void {
    if (!this.canGenerateReport) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
      return;
    }
    const rows = (allRows ? this.balanza : this.filteredRows) ?? [];

    const headerRows: any[][] = [];

    if (this.empresaInfo) {
      headerRows.push([this.empresaInfo.razon_social ?? '']);
      headerRows.push([`RFC: ${this.empresaInfo.rfc ?? ''}`]);

      if (this.empresaInfo.domicilio_fiscal) {
        headerRows.push([`Domicilio: ${this.empresaInfo.domicilio_fiscal}`]);
      }

      const contactoParts: string[] = [];
      if (this.empresaInfo.telefono) contactoParts.push(`Tel: ${this.empresaInfo.telefono}`);
      if (this.empresaInfo.correo_contacto) contactoParts.push(`Correo: ${this.empresaInfo.correo_contacto}`);
      if (contactoParts.length > 0) {
        headerRows.push([contactoParts.join('   ')]);
      }
    }

    if (headerRows.length > 0) {
      headerRows.push([]);
    }

    const rangoLabel = this.getRangoPeriodosLabel();
    const fechaLabel = `Fecha de generación: ${todayISO()}`;

    headerRows.push(['Balanza de comprobación']);
    headerRows.push([rangoLabel]);
    headerRows.push([fechaLabel]);
    headerRows.push([]);

    const headerLines = headerRows.length;
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

    const firstDataRow = headerLines + 2;
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

    const aoa = [
      ...headerRows,
      HEAD,
      ...BODY,
      TOTALS,
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const numberFmt = '#,##0.00';

    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);

      for (let R = firstDataRow - 1; R <= range.e.r; R++) {
        for (let C = 2; C <= 5; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[addr];
          if (!cell) continue;
          if (typeof cell.v === 'number' || (cell as any).f) {
            (cell as any).z = numberFmt;
          }
        }
      }

      ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
          s: { r: headerLines, c: 0 },
          e: { r: Math.max(headerLines, range.e.r), c: 5 },
        }),
      };

      (ws as any)['!freeze'] = { xSplit: 0, ySplit: headerLines + 1 };

      // Ancho de columnas
      const rowsForWidth = aoa.map(row =>
        row.map(v => {
          if (typeof v === 'object' && v && 'f' in v) return 'Σ';
          return (v ?? '').toString();
        })
      );

      const colCount = HEAD.length;
      const colWidths = Array.from({ length: colCount }).map((_, colIdx) => {
        const maxLen = rowsForWidth.reduce(
          (m, row) => Math.max(m, (row[colIdx] ?? '').length),
          0
        );
        return { wch: Math.min(Math.max(10, maxLen + 2), 50) };
      });

      (ws as any)['!cols'] = colWidths;

      const titleRow = headerRows.findIndex(r => r[0] === 'Balanza de comprobación');
      if (titleRow >= 0) {
        const addr = XLSX.utils.encode_cell({ r: titleRow, c: 0 });
        if (!ws[addr]) ws[addr] = { t: 's', v: 'Balanza de comprobación' };
        (ws[addr] as any).s = {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'left' },
        };
      }
      const headRowIdx = headerLines;
      for (let c = 0; c < HEAD.length; c++) {
        const addr = XLSX.utils.encode_cell({ r: headRowIdx, c });
        const cell = ws[addr];
        if (!cell) continue;
        (cell as any).s = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: 'D9E1F2' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'AAAAAA' } },
            bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
            left: { style: 'thin', color: { rgb: 'AAAAAA' } },
            right: { style: 'thin', color: { rgb: 'AAAAAA' } },
          },
        };
      }

      const totalRowIdx = headerLines + 1 + BODY.length;
      for (let c = 0; c < HEAD.length; c++) {
        const addr = XLSX.utils.encode_cell({ r: totalRowIdx, c });
        const cell = ws[addr];
        if (!cell) continue;
        (cell as any).s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'F2F2F2' } },
          alignment: { horizontal: c >= 2 ? 'right' : 'left' },
        };
      }

      for (let R = firstDataRow - 1; R <= range.e.r; R++) {
        for (let C = 2; C <= 5; C++) {
          const addr = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[addr];
          if (!cell) continue;
          (cell as any).s = {
            ...(cell as any).s,
            alignment: { horizontal: 'right' },
          };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Balanza');

    const rangoSlug =
      (this.periodoIniId && this.periodoFinId)
        ? `_p${this.periodoIniId}-p${this.periodoFinId}`
        : '';
    const fecha = todayISO();
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob(
      [excelBuffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );

    const empresaSlug = this.empresaInfo?.razon_social
      ? this.empresaInfo.razon_social.replace(/[^\w\d]+/g, '_')
      : 'empresa';

    saveAs(blob, `${empresaSlug}_BalanzaComprobacion${rangoSlug}_${fecha}.xlsx`);

    this.showToast({
      type: 'success',
      title: 'Excel generado',
      message: `Se exportaron ${rows.length} filas ${allRows ? '(todas)' : '(filtradas)'}`
    });
  }

}
