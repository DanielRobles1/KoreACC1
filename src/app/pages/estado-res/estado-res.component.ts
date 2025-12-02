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
import { Empresa } from '@app/models/empresa';

// === Tipo estrecho con id_periodo requerido
type PeriodoConId = PeriodoContableDto & { id_periodo: number };

// === Type-guard para estrechar PeriodoContableDto -> PeriodoConId
function hasPeriodoId(p: PeriodoContableDto): p is PeriodoConId {
  return typeof p.id_periodo === 'number';
}

function parseYMDLocal(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2] - 1, d = +m[3];
  const dt = new Date(y, mo, d);
  return isNaN(dt.getTime()) ? null : dt;
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

  onGenerarEstadoResultados() {
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
    const fi = parseYMDLocal(p?.fecha_inicio);
    const ff = parseYMDLocal(p?.fecha_fin);

    if (!fi || !ff) {
      return p?.id_periodo != null ? `Periodo ${p.id_periodo}` : 'Periodo';
    }

    const mesCorto = (d: Date) =>
      d.toLocaleDateString('es-MX', { month: 'short' })
        .replace(/\.$/, '')
        .replace(/^./, c => c.toUpperCase());

    const ultimoDiaMes = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    const mesIni = mesCorto(fi);
    const mesFin = mesCorto(ff);
    const anioIni = fi.getFullYear();
    const anioFin = ff.getFullYear();

    const diaIniPrimero = 1;
    const diaIniUltimo = ultimoDiaMes(fi);
    const diaFinPrimero = 1;
    const diaFinUltimo = ultimoDiaMes(ff);

    if (fi.getMonth() === ff.getMonth() && anioIni === anioFin) {
      return `${mesIni} (${diaIniPrimero}-${diaFinUltimo}) ${anioIni}`;
    }

    return `${mesIni} (${diaIniPrimero}-${diaIniUltimo}) ${anioIni} a ${mesFin} (${diaFinPrimero}-${diaFinUltimo}) ${anioFin}`;
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
      this.showToast({
        type: 'warning',
        title: 'Sin datos',
        message: 'Genera primero el estado de resultados.'
      });
      return;
    }

    const buildHeader = (subtitle: string): any[][] => {
      const rows: any[][] = [];

      if (this.empresaInfo) {
        rows.push([this.empresaInfo.razon_social ?? '']);
        rows.push([`RFC: ${this.empresaInfo.rfc ?? ''}`]);

        if (this.empresaInfo.domicilio_fiscal) {
          rows.push([`Domicilio: ${this.empresaInfo.domicilio_fiscal}`]);
        }

        const contactoParts: string[] = [];
        if (this.empresaInfo.telefono) contactoParts.push(`Tel: ${this.empresaInfo.telefono}`);
        if (this.empresaInfo.correo_contacto) contactoParts.push(`Correo: ${this.empresaInfo.correo_contacto}`);
        if (contactoParts.length > 0) {
          rows.push([contactoParts.join('   ')]);
        }

        rows.push([]); 
      }

      const rangoLabel = this.getRangoPeriodosLabel();
      const fechaLabel = `Fecha de generación: ${this.fmtDateISO()}`;

      const title = subtitle
        ? `Estado de resultados - ${subtitle}`
        : 'Estado de resultados';

      rows.push([title]);
      rows.push([rangoLabel]);
      rows.push([fechaLabel]);
      rows.push([]); 

      return rows;
    };

    const wb = XLSX.utils.book_new();

    const headerResumen = buildHeader('Resumen');
    const headerLinesResumen = headerResumen.length;

    const resumenHead = ['Concepto', 'Importe'];
    const resumenBody = [
      ['Ingresos', this.toNum(er.resumen.ingresos)],
      ['Costos', this.toNum(er.resumen.costos)],
      ['Utilidad bruta', this.toNum(er.resumen.utilidad_bruta)],
      ['Gastos de operación', this.toNum(er.resumen.gastos_operacion)],
      ['Utilidad neta', this.toNum(er.resumen.utilidad_neta)],
    ];

    const aoaResumen = [
      ...headerResumen,
      resumenHead,
      ...resumenBody,
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(aoaResumen);

    // Índices 0-based
    const headRowResumenIdx = headerLinesResumen;          
    const firstDataRowResumenIdx = headerLinesResumen + 1; 
    const lastDataRowResumenIdx = firstDataRowResumenIdx + resumenBody.length - 1;

    this.numFmtCell(wsResumen, 1, 1, firstDataRowResumenIdx, lastDataRowResumenIdx);

    // Autofiltro sobre la tabla
    wsResumen['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headRowResumenIdx, c: 0 },
        e: { r: lastDataRowResumenIdx, c: 1 },
      }),
    };

    (wsResumen as any)['!freeze'] = { xSplit: 0, ySplit: headRowResumenIdx + 1 };

    this.autosize(wsResumen);

    const titleResumen = 'Estado de resultados - Resumen';
    const titleRowResumenIdx = headerResumen.findIndex(r => r[0] === titleResumen);
    if (titleRowResumenIdx >= 0) {
      const addr = XLSX.utils.encode_cell({ r: titleRowResumenIdx, c: 0 });
      if (!wsResumen[addr]) wsResumen[addr] = { t: 's', v: titleResumen };
      (wsResumen[addr] as any).s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'left' }
      };
    }

    for (let c = 0; c < resumenHead.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: headRowResumenIdx, c });
      const cell = wsResumen[addr];
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

    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const headerDetalle = buildHeader('Detalle');
    const headerLinesDet = headerDetalle.length;

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

    const firstDataRowDet = headerLinesDet + 2; 
    const lastDataRowDet = body.length ? firstDataRowDet + body.length - 1 : firstDataRowDet - 1;

    const totalsRow = body.length ? [
      'Totales', '', '', '',
      { f: `SUM(E${firstDataRowDet}:E${lastDataRowDet})` },
      { f: `SUM(F${firstDataRowDet}:F${lastDataRowDet})` },
      { f: `SUM(G${firstDataRowDet}:G${lastDataRowDet})` },
    ] : ['Totales', '', '', '', 0, 0, 0];

    const aoaDetalle = [
      ...headerDetalle,
      HEAD,
      ...body,
      totalsRow,
    ];

    const wsDetalle = XLSX.utils.aoa_to_sheet(aoaDetalle);

    const headRowDetIdx = headerLinesDet;               
    const firstDataRowDetIdx = headerLinesDet + 1;    
    const totalsRowDetIdx = headerLinesDet + 1 + body.length;

    this.numFmtCell(wsDetalle, 4, 6, firstDataRowDetIdx, totalsRowDetIdx);

    wsDetalle['!autofilter'] = {
      ref: XLSX.utils.encode_range({
        s: { r: headRowDetIdx, c: 0 },
        e: { r: totalsRowDetIdx, c: HEAD.length - 1 },
      }),
    };

    (wsDetalle as any)['!freeze'] = { xSplit: 0, ySplit: headRowDetIdx + 1 };

    this.autosize(wsDetalle);

    const titleDet = 'Estado de resultados - Detalle';
    const titleRowDetIdx = headerDetalle.findIndex(r => r[0] === titleDet);
    if (titleRowDetIdx >= 0) {
      const addr = XLSX.utils.encode_cell({ r: titleRowDetIdx, c: 0 });
      if (!wsDetalle[addr]) wsDetalle[addr] = { t: 's', v: titleDet };
      (wsDetalle[addr] as any).s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'left' }
      };
    }

    for (let c = 0; c < HEAD.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: headRowDetIdx, c });
      const cell = wsDetalle[addr];
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

    for (let c = 0; c < HEAD.length; c++) {
      const addr = XLSX.utils.encode_cell({ r: totalsRowDetIdx, c });
      const cell = wsDetalle[addr];
      if (!cell) continue;
      (cell as any).s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'F2F2F2' } },
        alignment: { horizontal: c >= 4 ? 'right' : 'left' },
      };
    }

    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    if (includeSplitSheets) {
      const mkSheetBy = (tipo: 'INGRESO' | 'COSTO' | 'GASTO', subtitle: string, sheetName: string) => {
        const header = buildHeader(subtitle);
        const headerLines = header.length;

        const rows = (er.detalle ?? [])
          .filter(d => d.tipo_er === tipo)
          .map(d => ([
            d.codigo ?? '',
            d.nombre ?? '',
            d.tipo_er ?? '',
            d.naturaleza ?? '',
            this.toNum(d.cargos_per),
            this.toNum(d.abonos_per),
            this.toNum(d.importe),
          ]));

        const firstDataRow = headerLines + 2;
        const lastDataRow = rows.length ? firstDataRow + rows.length - 1 : firstDataRow - 1;

        const tot = rows.length ? [
          'Totales', '', '', '',
          { f: `SUM(E${firstDataRow}:E${lastDataRow})` },
          { f: `SUM(F${firstDataRow}:F${lastDataRow})` },
          { f: `SUM(G${firstDataRow}:G${lastDataRow})` },
        ] : ['Totales', '', '', '', 0, 0, 0];

        const aoa = [
          ...header,
          HEAD,
          ...rows,
          tot,
        ];

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        const headRowIdx = headerLines;
        const firstDataIdx = headerLines + 1;
        const totalsRowIdx = headerLines + 1 + rows.length;

        this.numFmtCell(ws, 4, 6, firstDataIdx, totalsRowIdx);
        ws['!autofilter'] = {
          ref: XLSX.utils.encode_range({
            s: { r: headRowIdx, c: 0 },
            e: { r: totalsRowIdx, c: HEAD.length - 1 },
          }),
        };
        (ws as any)['!freeze'] = { xSplit: 0, ySplit: headRowIdx + 1 };
        this.autosize(ws);

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

        for (let c = 0; c < HEAD.length; c++) {
          const addr = XLSX.utils.encode_cell({ r: totalsRowIdx, c });
          const cell = ws[addr];
          if (!cell) continue;
          (cell as any).s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'F2F2F2' } },
            alignment: { horizontal: c >= 4 ? 'right' : 'left' },
          };
        }

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      };

      mkSheetBy('INGRESO', 'Ingresos', 'Ingresos');
      mkSheetBy('COSTO', 'Costos', 'Costos');
      mkSheetBy('GASTO', 'Gastos', 'Gastos');
    }

    const rangoSlug =
      (this.periodoIniId && this.periodoFinId)
        ? `_p${this.periodoIniId}-p${this.periodoFinId}`
        : '';
    const fecha = this.fmtDateISO();

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob(
      [excelBuffer],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    );

    const empresaSlug = this.empresaInfo?.razon_social
      ? this.empresaInfo.razon_social.replace(/[^\w\d]+/g, '_')
      : 'empresa';

    saveAs(blob, `${empresaSlug}_EstadoResultados${rangoSlug}_${fecha}.xlsx`);

    this.showToast({
      type: 'success',
      title: 'Excel generado',
      message: 'Se exportó el Estado de Resultados.'
    });
  }

}
