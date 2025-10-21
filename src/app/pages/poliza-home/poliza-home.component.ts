import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';

import { PolizasService, Poliza, Movimiento } from '../../services/polizas.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

type CfdiOption = {
  uuid: string;
  folio?: string | null;
  fecha?: string | null;
  total?: number | string | null;
};

type PolizaRow = Poliza & { id_poliza?: number; id?: number };

@Component({
  selector: 'app-poliza-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PolizasLayoutComponent,
    CurrencyPipe,
    ToastMessageComponent,
  ],
  templateUrl: './poliza-home.component.html',
  styleUrls: ['./poliza-home.component.scss'],
})
export class PolizaHomeComponent {
  sidebarOpen = true;

  volver() {
    this.location.back();
  }

  //  Listado
  polizas: PolizaRow[] = [];
  polizasFiltradas: PolizaRow[] = []; // se muestra en la tabla

  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  periodos:     Array<{ id_periodo: number;  nombre: string }> = [];
  centros:      Array<{ id_centro: number;   nombre: string }> = [];

  mapTipos    = new Map<number, string>();
  mapPeriodos = new Map<number, string>();
  mapCentros  = new Map<number, string>();
  cuentasMap  = new Map<number, { codigo: string; nombre: string }>();

  filtroTipo?: number;
  filtroPeriodo?: number;

  //  Buscador
  q = '';
  private buscarTimer: ReturnType<typeof setTimeout> | undefined;

  nuevaPoliza: Partial<Poliza> = { movimientos: [] };
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';
  cfdiOptions: CfdiOption[] = [];
  uuidSeleccionado?: string;

  //  TOAST (estado)
  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };

  loadingId: number | null = null; // para deshabilitar botones por fila

  // “Ver más”
  expandedId: number | null = null;                 // cuál fila está expandida
  movsLoadingId: number | null = null;              // para mostrar "Cargando…"
  movsLoaded: Record<number, boolean> = {};         // cache por id

  constructor(
    private location: Location,
    private router: Router,
    private api: PolizasService
  ) {}

  ngOnInit() {
    this.cargarCatalogos();
    this.cargarPolizas();
    this.cargarCfdiRecientes();
    this.cargarCuentas(); // importante para mostrar código/nombre de cuenta
  }

  // ========= Utils =========
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
  private showToast(opts: { type?: ToastType; title?: string; message: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    this.toast.message = opts.message;
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }
  onToastClosed = () => { this.toast.open = false; };

  //  Catálogos 
  cargarCatalogos(): void {
    // Tipos
    this.api.getTiposPoliza().subscribe({
      next: (r: any) => {
        this.tiposPoliza = this.normalizeList(r).map((t: any) => ({
          id_tipopoliza: Number(t.id_tipopoliza ?? t.id ?? t.ID),
          nombre: String(t.nombre ?? t.descripcion ?? t.NOMBRE ?? 'Tipo'),
        }));
        this.mapTipos.clear();
        for (const t of this.tiposPoliza) this.mapTipos.set(t.id_tipopoliza, t.nombre);
      },
      error: err => {
        console.error('Tipos de póliza:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los tipos de póliza.' });
      },
    });

    // Periodos
    this.api.getPeriodos().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.periodos = items.map((p: any) => {
          const id  = Number(p.id_periodo ?? p.id ?? p.ID);
          const fi0 = p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini;
          const ff0 = p.fecha_fin    ?? p.fechaFin    ?? p.fin    ?? p.end_date   ?? p.fecha_fin;
          return { id_periodo: id, nombre: `${this.fmtDate(fi0)} — ${this.fmtDate(ff0)}` };
        });
        this.mapPeriodos.clear();
        for (const p of this.periodos) this.mapPeriodos.set(p.id_periodo, p.nombre);
      },
      error: err => {
        console.error('Periodos:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los periodos.' });
      },
    });

    // Centros
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
        this.mapCentros.clear();
        for (const c of this.centros) this.mapCentros.set(c.id_centro, c.nombre);
      },
      error: err => {
        console.error('Centros:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
      },
    });
  }

  //  Cuentas ( CODIGO — Nombre) 
  cargarCuentas() {
    this.api.getCuentas().subscribe({
      next: (r: any) => {
        const arr = this.normalizeList(r);
        this.cuentasMap.clear();
        for (const c of arr) {
          const id     = Number(c.id_cuenta ?? c.id ?? c.ID);
          const codigo = String(c.codigo ?? c.clave ?? c.code ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          if (!Number.isNaN(id)) this.cuentasMap.set(id, { codigo, nombre });
        }
      },
      error: (e) => console.error('Cuentas:', e)
    });
  }

  cuentaEtiqueta(id?: number | null, m?: any): string {
    if (id == null) {
      const cod = m?.cuenta_codigo ?? m?.codigo ?? '';
      const nom = m?.cuenta_nombre ?? m?.nombre ?? '';
      return (cod || nom) ? `${cod}${cod && nom ? ' — ' : ''}${nom}` : '—';
    }
    const info = this.cuentasMap.get(Number(id));
    if (info && (info.codigo || info.nombre)) {
      return `${info.codigo}${info.codigo && info.nombre ? ' — ' : ''}${info.nombre}`;
    }
    const cod = m?.cuenta_codigo ?? m?.codigo ?? '';
    const nom = m?.cuenta_nombre ?? m?.nombre ?? '';
    if (cod || nom) return `${cod}${cod && nom ? ' — ' : ''}${nom}`;
    return String(id);
  }

  //  ver mas(movimientos) 
  getIdPoliza(p: PolizaRow): number | null {
    const id = (p as any)?.id_poliza ?? (p as any)?.id;
    return (id == null ? null : Number(id));
  }

  toggleVerMas(p: PolizaRow) {
    const id = this.getIdPoliza(p);
    if (!id) return;

    if (this.expandedId === id) { // colapsa si ya está abierto
      this.expandedId = null;
      return;
    }

    this.expandedId = id;

    if (this.movsLoaded[id]) return; // ya cargados

    this.movsLoadingId = id;
    this.api.getPolizaConMovimientos(id).subscribe({
      next: (res: any) => {
        (p as any).movimientos = res?.movimientos ?? [];
        this.movsLoaded[id] = true;
      },
      error: (err) => {
        console.error('getPolizaConMovimientos:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los movimientos.' });
      },
      complete: () => (this.movsLoadingId = null),
    });
  }

  //  Listado 
  cargarPolizas(): void {
    this.api.getPolizas({
      id_tipopoliza: this.filtroTipo,
      id_periodo:    this.filtroPeriodo,
      includeMovimientos: true
    } as any).subscribe({
      next: (r: any) => {
        const list = this.normalizeList(r) ?? (r?.polizas ?? []);
        this.polizas = Array.isArray(list) ? list : [];
        this.aplicarFiltroLocal();

        if (this.polizas.length === 0) {
          this.showToast({ type: 'info', message: 'No se encontraron pólizas para los filtros/búsqueda actuales.' });
        }
      },
      error: err => {
        console.error('Pólizas:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
      },
    });
  }

  // Buscador
  onBuscarChange(_: string) {
    if (this.buscarTimer) clearTimeout(this.buscarTimer);
    this.buscarTimer = setTimeout(() => {
      this.cargarPolizas();
    }, 250);
  }

  private aplicarFiltroLocal() {
    const term = (this.q || '').trim().toLowerCase();
    if (!term) {
      this.polizasFiltradas = this.polizas.slice();
      return;
    }

    this.polizasFiltradas = this.polizas.filter(p => {
      const folio    = String(p.folio ?? '').toLowerCase();
      const concepto = String(p.concepto ?? '').toLowerCase();
      const centro   = this.nombreCentro(p.id_centro).toLowerCase();
      const tipo     = this.nombreTipo(p.id_tipopoliza).toLowerCase();
      const periodo  = this.nombrePeriodo(p.id_periodo).toLowerCase();

      const movMatch = Array.isArray(p.movimientos) && p.movimientos.some(m => {
        const uuid    = String((m as any)?.uuid ?? '').toLowerCase();
        const cliente = String((m as any)?.cliente ?? '').toLowerCase();
        const ref     = String((m as any)?.ref_serie_venta ?? '').toLowerCase();
        return uuid.includes(term) || cliente.includes(term) || ref.includes(term);
      });

      return (
        folio.includes(term) ||
        concepto.includes(term) ||
        centro.includes(term) ||
        tipo.includes(term) ||
        periodo.includes(term) ||
        movMatch
      );
    });
  }

  getEstado(p: any): 'Cuadrada' | 'Descuadrada' | 'Pendiente' | 'Cerrada' | 'Cancelada' | 'Borrador' | 'Activa' | string {
    const raw = (p.estado ?? p.estatus ?? p.status ?? p.state ?? '').toString().trim();
    if (raw) return raw;

    const movs: Movimiento[] = Array.isArray(p?.movimientos) ? p.movimientos : [];
    if (!movs.length) return 'Borrador';
    const cargos = movs.filter(m => String(m.operacion) === '0').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    const abonos = movs.filter(m => String(m.operacion) === '1').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    return Math.abs(cargos - abonos) < 0.0001 ? 'Cuadrada' : 'Descuadrada';
  }

  estadoClass(p: any): string {
    const e = this.getEstado(p).toLowerCase();
    if (e.includes('cuadra')) return 'estado ok';
    if (e.includes('cerr'))   return 'estado ok';
    if (e.includes('activa')) return 'estado ok';
    if (e.includes('pend'))   return 'estado warn';
    if (e.includes('borr'))   return 'estado warn';
    if (e.includes('canc'))   return 'estado bad';
    return 'estado warn';
  }

  nombreCentro = (id: number | null | undefined) =>
    (id == null ? '' : (this.mapCentros.get(id) ?? String(id)));
  nombreTipo = (id: number | null | undefined) =>
    (id == null ? '' : (this.mapTipos.get(id) ?? String(id)));
  nombrePeriodo = (id: number | null | undefined) =>
    (id == null ? '' : (this.mapPeriodos.get(id) ?? String(id)));

  //  Acciones 
  trackByFolio = (_: number, p: PolizaRow) => p?.id_poliza ?? p?.folio ?? _;

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  editarPoliza(p: PolizaRow) {
    const id = (p as any)?.id_poliza ?? (p as any)?.id;
    if (!id) {
      console.warn('No se encontró id_poliza en la fila seleccionada');
      return;
    }
    this.router.navigate(['/polizas', 'editar', String(id)]);
  }

  eliminarPoliza(id_poliza?: number): void {
    if (id_poliza == null) {
      this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' });
      return;
    }
    if (!confirm('¿Deseas eliminar esta póliza?')) return;

    this.api.deletePoliza(id_poliza).subscribe({
      next: () => {
        this.cargarPolizas();
        this.showToast({ type: 'success', title: 'Listo', message: 'Póliza eliminada correctamente.' });
      },
      error: err => {
        console.error('Error al eliminar póliza:', err);
        const msg = err?.error?.message || 'No se pudo eliminar la póliza.';
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  }

  irANueva() {
    this.router.navigate(['/polizas', 'nueva']);
  }

  //  Cambio de estado 
  private isAllowedEstado(e: any): e is 'Por revisar' | 'Revisada' | 'Contabilizada' {
    return e === 'Por revisar' || e === 'Revisada' || e === 'Contabilizada';
  }

  canMarcarRevisada(p: PolizaRow): boolean {
    const e = (this.getEstado(p) || '').toLowerCase();
    return !e.includes('cance') && !e.includes('cerr') && !e.includes('contab');
  }

  canMarcarContabilizada(p: PolizaRow): boolean {
    const e = (this.getEstado(p) || '').toLowerCase();
    return e.includes('revis') || e.includes('cuadra');
  }

  cambiarEstadoPoliza(p: PolizaRow, nuevo: 'Por revisar' | 'Revisada' | 'Contabilizada') {
    if (!this.isAllowedEstado(nuevo)) {
      this.showToast({ type: 'warning', title: 'Estado inválido', message: 'Solo: Por revisar, Revisada, Contabilizada.' });
      return;
    }
    const id = this.getIdPoliza(p);
    if (!id) {
      this.showToast({ type: 'warning', title: 'Sin ID', message: 'No se puede cambiar el estado: falta id_poliza.' });
      return;
    }

    this.loadingId = id;
    this.api.changeEstadoPoliza(id, nuevo).subscribe({
      next: (res: any) => {
        (p as any).estado = res?.estado ?? nuevo;
        this.showToast({
          type: 'success',
          title: 'Estado actualizado',
          message: `La póliza ${id} ahora está: ${(p as any).estado}.`
        });
      },
      error: (err) => {
        console.error('changeEstadoPoliza:', err);
        const msg = err?.error?.message || 'No se pudo cambiar el estado.';
        this.showToast({ type: 'error', title: 'Error', message: msg });
      },
      complete: () => (this.loadingId = null),
    });
  }

  triggerXmlPicker(input: HTMLInputElement) {
    this.uploadXmlError = '';
    input.value = '';
    input.click();
  }

  onXmlPicked(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    const isXml = file.type === 'text/xml' || file.type === 'application/xml' || /\.xml$/i.test(file.name);
    if (!isXml) {
      this.uploadXmlError = 'El archivo debe ser .xml';
      this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      this.uploadXmlError = 'El XML excede 1 MB';
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
          total: res?.total ?? res?.Total ?? null,
        };
        if (opt.uuid && !this.cfdiOptions.some(x => x.uuid === opt.uuid)) {
          this.cfdiOptions = [...this.cfdiOptions, opt];
        }
        if (opt.uuid) this.uuidSeleccionado = opt.uuid;

        this.showToast({ type: 'success', title: 'XML cargado', message: 'Se importó el CFDI correctamente.' });
      },
      error: (err) => {
        console.error('Importar XML:', err);
        this.uploadXmlError = err?.error?.message ?? 'Error importando XML';
        this.showToast({ type: 'error', title: 'Error', message: this.uploadXmlError });
      },
      complete: () => (this.uploadingXml = false),
    });
  }

  //  CFDI recientes 
  cargarCfdiRecientes() {
    const svc: any = this.api as any;
    if (typeof svc.listCfdi !== 'function') return;

    svc.listCfdi({ limit: 100 }).subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
        this.cfdiOptions = arr
          .map((x: any) => ({
            uuid:  String(x.uuid ?? x.UUID ?? '').trim(),
            folio: x.folio ?? x.Folio ?? null,
            fecha: x.fecha ?? x.Fecha ?? null,
            total: x.total ?? x.Total ?? null,
          }))
          .filter((o: CfdiOption) => !!o.uuid);
      },
      error: (e: any) => {
        console.error('CFDI recientes:', e?.message || e);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar CFDI recientes.' });
      },
    });
  }
}
