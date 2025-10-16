import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PolizasService, Poliza, Movimiento } from '../../services/polizas.service';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';

type CfdiOption = {
  uuid: string;
  folio?: string | null;
  fecha?: string | null;
  total?: number | string | null;
};

// Tipos del toast
type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-polizas',
  standalone: true,
  imports: [CommonModule, FormsModule, PolizasLayoutComponent, ToastMessageComponent],
  templateUrl: './polizas.component.html',
  styleUrls: ['./polizas.component.scss']
})
export class PolizasComponent implements OnInit {
  sidebarOpen = true;

  // Listado
  polizas: Poliza[] = [];

  // Catálogos para selects
  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  periodos:     Array<{ id_periodo: number;  nombre: string }> = [];
  centros:      Array<{ id_centro: number;   nombre: string }> = [];

  // Filtros (
  filtroTipo?: number;
  filtroPeriodo?: number;
  filtroCentro?: number;

  // Formulario de nueva póliza
  nuevaPoliza: Partial<Poliza> = { movimientos: [] };

  // Estado de importación de XML
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';

  // CFDI importados y selección de UUID
  cfdiOptions: CfdiOption[] = [];
  uuidSeleccionado?: string;

  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };

  constructor(private api: PolizasService) {}


  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarPolizas();
    this.cargarCfdiRecientes(); 
  }

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  private showToast(opts: { message: string; type?: ToastType; title?: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.message = opts.message;
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }
  onToastClosed = () => { this.toast.open = false; };

  private normalizeList(res: any) {
    return Array.isArray(res) ? res : (res?.rows ?? res?.data ?? res?.items ?? res?.result ?? []);
  }
  private pad2(n: number) { return String(n).padStart(2, '0'); }
  private fmtDate(d: any): string {
    if (!d) return '—';
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;
    return `${dt.getFullYear()}-${this.pad2(dt.getMonth() + 1)}-${this.pad2(dt.getDate())}`;
  }
  private toNumOrNull = (v: any): number | null =>
    (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
  private toStrOrNull = (v: any): string | null =>
    (v == null ? null : (String(v).trim() || null));
  private toDateOrNull = (v: any): string | null => {
    if (!v) return null;
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${this.pad2(d.getMonth()+1)}-${this.pad2(d.getDate())}`;
  };
  private N(v: any): number | undefined {
    if (v === '' || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  cargarCatalogos(): void {
    // Tipos de póliza
    this.api.getTiposPoliza().subscribe({
      next: (r: any) => {
        this.tiposPoliza = this.normalizeList(r).map((t: any) => ({
          id_tipopoliza: Number(t.id_tipopoliza ?? t.id ?? t.ID),
          nombre: String(t.nombre ?? t.descripcion ?? t.NOMBRE ?? 'Tipo')
        }));
      },
      error: err => {
        console.error('Error cargando tipos de póliza:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los tipos de póliza.' });
      }
    });

    this.api.getPeriodos().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.periodos = items.map((p: any) => {
          const id  = Number(p.id_periodo ?? p.id ?? p.ID);
          const fi0 = p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini;
          const ff0 = p.fecha_fin    ?? p.fechaFin    ?? p.fin    ?? p.end_date   ?? p.fecha_fin;
          return { id_periodo: id, nombre: `${this.fmtDate(fi0)} — ${this.fmtDate(ff0)}` };
        });
      },
      error: err => {
        console.error('Error cargando periodos:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los periodos.' });
      }
    });

    this.api.getCentros().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.centros = items.map((c: any) => {
          const id     = Number(c.id_centro ?? c.id ?? c.ID);
          const serie  = String(c.serie_venta ?? c.serie ?? c.codigo ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          const etiqueta = serie && nombre ? `${serie} — ${nombre}` : (serie || nombre || `Centro ${id}`);
          return { id_centro: id, nombre: etiqueta };
        });
      },
      error: err => {
        console.error('Error cargando centros:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
      }
    });
  }

  //  Pólizas 
  cargarPolizas(): void {
    this.api.getPolizas({
      id_tipopoliza: this.filtroTipo,
      id_periodo:    this.filtroPeriodo,
      id_centro:     this.filtroCentro
    }).subscribe({
      next: (r: any) => {
        const list = this.normalizeList(r) ?? (r?.polizas ?? []);
        this.polizas = Array.isArray(list) ? list : [];
        if (this.polizas.length === 0) {
          this.showToast({ type: 'info', message: 'No se encontraron pólizas con los filtros actuales.' });
        }
      },
      error: err => {
        console.error('Error al cargar pólizas:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
      }
    });
  }

  cargarCfdiRecientes(): void {
    this.api.listCfdi({ limit: 100 }).subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
        this.cfdiOptions = arr
          .map((x: any): CfdiOption => ({
            uuid:  String(x.uuid ?? x.UUID ?? '').trim(),
            folio: x.folio ?? x.Folio ?? null,
            fecha: x.fecha ?? x.Fecha ?? null,
            total: x.total ?? x.Total ?? null,
          }))
          .filter((o: CfdiOption) => !!o.uuid);
      },
      error: (err) => {
        console.error('Error cargando CFDI:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los CFDI recientes.' });
      }
    });
  }

  //  Movimientos 
  agregarMovimiento(): void {
    const nuevo: Movimiento = {
      id_cuenta: null,
      ref_serie_venta: '',
      operacion: '',          // string ("" | "0" | "1")
      monto: null,
      cliente: '',
      fecha: '',
      cc: null,
      uuid: null as unknown as any 
    };
    (this.nuevaPoliza.movimientos ??= []).push(nuevo);
  }

  eliminarMovimiento(i: number): void {
    this.nuevaPoliza.movimientos?.splice(i, 1);
  }

  canGuardar(): boolean {
    const p = this.nuevaPoliza;
    if (!p) return false;

    const okHeader =
      !!(p.folio && String(p.folio).trim()) &&
      !!(p.concepto && String(p.concepto).trim()) &&
      this.N(p.id_tipopoliza) !== undefined &&
      this.N(p.id_periodo) !== undefined &&
      this.N(p.id_centro) !== undefined &&
      this.N(p.id_usuario) !== undefined;

    if (!okHeader) return false;

    const temp = { movimientos: (p.movimientos ?? []) } as any;
    const cargos = this.getTotal(temp as Poliza, '0');
    const abonos = this.getTotal(temp as Poliza, '1');

    return cargos === abonos && cargos > 0;
  }

  //  Guardar 
  guardarPoliza(): void {
    const p = this.nuevaPoliza;

    // Validación front de partida doble para evitar 400 del back
    const movsValidos = (p?.movimientos ?? []).filter(m =>
      this.toNumOrNull(m.id_cuenta) &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );
    const cargos = movsValidos
      .filter(m => m.operacion === '0')
      .reduce((s, m) => s + (this.toNumOrNull(m.monto) || 0), 0);
    const abonos = movsValidos
      .filter(m => m.operacion === '1')
      .reduce((s, m) => s + (this.toNumOrNull(m.monto) || 0), 0);
    if (Math.abs(cargos - abonos) > 0.001) {
      this.showToast({
        type: 'warning',
        title: 'Partida doble',
        message: `No cuadra.\nCargos: ${cargos}\nAbonos: ${abonos}`
      });
      return;
    }

    const payload = {
      id_tipopoliza: this.toNumOrNull(p?.id_tipopoliza)!, // number
      id_periodo:    this.toNumOrNull(p?.id_periodo)!,    // number
      id_usuario:    this.toNumOrNull(p?.id_usuario)!,    // number
      id_centro:     this.toNumOrNull(p?.id_centro)!,     // number
      folio:         this.toStrOrNull(p?.folio)!,         // string
      concepto:      this.toStrOrNull(p?.concepto)!,      // string
      movimientos: (p?.movimientos ?? []).map(m => {
        const op = (m.operacion === '0' || m.operacion === '1') ? m.operacion : null;
        const uuidFinal = this.toStrOrNull(m.uuid) ?? this.toStrOrNull(this.uuidSeleccionado) ?? null;

        return {
          id_cuenta:       this.toNumOrNull(m.id_cuenta),
          ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
          operacion:       op,
          monto:           this.toNumOrNull(m.monto),
          cliente:         this.toStrOrNull(m.cliente),
          fecha:           this.toDateOrNull(m.fecha),
          cc:              this.toNumOrNull(m.cc),
          uuid:            uuidFinal
        };
      })
    };

    this.api.createPoliza(payload).subscribe({
      next: () => {
        this.nuevaPoliza = { movimientos: [] };
        this.cargarPolizas();
        this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada correctamente.' });
      },
      error: err => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al guardar póliza';
        console.error('Error al guardar póliza:', err);
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  }

  //  Importar XML (CFDI)  /cfdi/import
  triggerXmlPicker(input: HTMLInputElement) {
    this.uploadXmlError = '';
    input.value = ''; // permite re-seleccionar el mismo archivo
    input.click();
  }

  onXmlPicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const isXml =
      file.type === 'text/xml' ||
      file.type === 'application/xml' ||
      /\.xml$/i.test(file.name);

    if (!isXml) {
      this.uploadXmlError = 'El archivo debe ser .xml';
      this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      this.uploadXmlError = 'El XML excede el tamaño permitido (1 MB).';
      this.showToast({ type: 'warning', title: 'Archivo pesado', message: this.uploadXmlError });
      return;
    }

    this.selectedXmlName = file.name;
    this.uploadingXml = true;

    const ctx = {
      folio: this.nuevaPoliza.folio,
      id_periodo: Number(this.nuevaPoliza.id_periodo),
      id_centro: Number(this.nuevaPoliza.id_centro),
      id_tipopoliza: Number(this.nuevaPoliza.id_tipopoliza),
    };

    this.api.uploadCfdiXml(file, ctx).subscribe({
      next: (res) => {
        const opt: CfdiOption = {
          uuid:  res?.uuid || res?.UUID || '',
          folio: res?.folio ?? res?.Folio ?? null,
          fecha: res?.fecha ?? res?.Fecha ?? null,
          total: res?.total ?? res?.Total ?? null
        };
        if (opt.uuid && !this.cfdiOptions.some(x => x.uuid === opt.uuid)) {
          this.cfdiOptions = [...this.cfdiOptions, opt];
        }
        if (opt.uuid) this.uuidSeleccionado = opt.uuid;
        this.showToast({ type: 'success', title: 'XML importado', message: 'El CFDI se importó correctamente.' });
      },
      error: (err) => {
        console.error('Error importando XML:', err);
        this.uploadXmlError = err?.error?.message ?? 'Error importando XML';
        this.showToast({ type: 'error', title: 'Error', message: this.uploadXmlError });
      },
      complete: () => (this.uploadingXml = false),
    });
  }

  //  UUID compartido 
  onUuidChange(uuid?: string) {
    this.uuidSeleccionado = uuid || undefined;
  }

  aplicarUuidAlMovimiento(index: number) {
    if (!this.uuidSeleccionado) return;
    const movs = this.nuevaPoliza.movimientos ?? [];
    if (movs[index]) movs[index].uuid = this.uuidSeleccionado;
  }

  getTotal(p: Poliza | { movimientos?: Movimiento[] }, tipo: '0'|'1'): number {
    const movs = Array.isArray(p?.movimientos) ? p.movimientos : [];
    return movs
      .filter(m => String(m.operacion) === tipo)
      .reduce((s, m) => s + (Number(m.monto) || 0), 0);
  }

  getDiferencia(p: Poliza): number {
    return this.getTotal(p, '0') - this.getTotal(p, '1');
  }

  trackByFolio = (_: number, x: any) => x?.folio ?? _;
}
