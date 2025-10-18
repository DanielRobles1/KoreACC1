import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalComponent } from '@app/components/modal/modal/modal.component';

import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { PolizasService } from '@app/services/polizas.service';
import { CuentasService } from '@app/services/cuentas.service';
import type { Poliza, Movimiento } from '@app/services/polizas.service';
import { forkJoin, of, switchMap } from 'rxjs';

type Cuenta = {
  id: number;
  codigo: string;
  nombre: string;
  ctaMayor: boolean;
  parentId: number | null;
};

type MovimientoUI = Movimiento & {
  _cuentaQuery?: string;
  id_movimiento?: number;
};
type PolizaUI = Omit<Poliza, 'movimientos'> & {
  movimientos: MovimientoUI[];
};

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-poliza-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PolizasLayoutComponent, ToastMessageComponent, ModalComponent],
  templateUrl: './poliza-editar.component.html',
  styleUrls: ['./poliza-editar.component.scss']
})
export class PolizaEditarComponent implements OnInit {
  sidebarOpen = true;

  // ID desde la ruta
  id_poliza!: number;

  // Encabezado + movimientos (mismo shape que usas en "crear")
  poliza: Partial<PolizaUI> & {
    id_poliza?: number;
    estado?: string;
    fecha_creacion?: string;
    created_at?: string;
    updated_at?: string;
  } = { movimientos: [] };

  // Catálogos para selects (se cargan igual que en crear)
  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  periodos:     Array<{ id_periodo: number;  nombre: string }> = [];
  centros:      Array<{ id_centro: number;   nombre: string }> = [];

  // UI
  loading = true;
  errorMsg = '';

  // Catálogo de cuentas
  cuentas: Cuenta[] = [];
  cuentasMap = new Map<number, Cuenta>();
  cuentasFiltradas: Cuenta[][] = []; // por índice de fila
  cuentaOpenIndex: number | null = null;
  updating = false;

  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };

    constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private apiSvc: PolizasService,
    private cuentasSvc: CuentasService,
  ) {}

  ngOnInit(): void {
    this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.id_poliza)) {
      this.showToast({ type: 'error', title: 'Error', message: 'ID de póliza inválido.' });
      this.loading = false;
      return;
    }

    // Carga paralela: catálogos y póliza
    this.cargarCatalogos();
    this.cargarPoliza(this.id_poliza);
    this.cargarCuentas();
  }

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  // --------------------- Data loaders ---------------------
  private apiBase = 'http://localhost:3000/api/v1';

  cargarPoliza(id: number) {
    this.loading = true;
    this.http.get<any>(`${this.apiBase}/poliza/${id}/movimientos`).subscribe({
      next: (res) => {
        const movs: MovimientoUI[] = (res?.movimientos ?? []).map((m: any) => {
          const mm: MovimientoUI = this.normalizeMovimiento(m) as MovimientoUI;
          // Prellena _cuentaQuery si ya tenemos cuentas cargadas
          const c = this.cuentasMap.get(Number(mm.id_cuenta || 0));
          mm._cuentaQuery = c ? `${c.codigo} — ${c.nombre}` : (mm._cuentaQuery ?? '');
          return mm;
        });
        this.poliza = {
          id_poliza: res?.id_poliza,
          id_tipopoliza: Number(res?.id_tipopoliza),
          id_periodo: Number(res?.id_periodo),
          id_usuario: Number(res?.id_usuario),
          id_centro: Number(res?.id_centro),
          folio: String(res?.folio ?? ''),
          concepto: String(res?.concepto ?? ''),
          movimientos: movs,
          estado: res?.estado,
          fecha_creacion: res?.fecha_creacion,
          created_at: res?.created_at,
          updated_at: res?.updated_at
        };
        // Sincroniza filtros por fila
        this.cuentasFiltradas = new Array(this.poliza.movimientos?.length || 0).fill([]); 
        this.prefillCuentaQueries(); // si las cuentas llegaron después
      },
      error: (err) => {
        console.error('Poliza cargar:', err);
        this.errorMsg = err?.error?.message ?? 'No se pudo cargar la póliza.';
        this.showToast({ type: 'error', title: 'Error', message: this.errorMsg });
      },
      complete: () => (this.loading = false)
    });
  }

  private normalizeMovimiento(m: any): Movimiento {
    return {
      id_cuenta: this.toNumOrNull(m?.id_cuenta),
      ref_serie_venta: this.toStrOrNull(m?.ref_serie_venta) ?? '',
      operacion: (m?.operacion ?? '').toString(), // "0" | "1"
      monto: this.toNumOrNull(m?.monto),
      cliente: this.toStrOrNull(m?.cliente) ?? '',
      fecha: this.toDateOrNull(m?.fecha) ?? '',
      cc: this.toNumOrNull(m?.cc),
      uuid: this.toStrOrNull(m?.uuid) ?? null,
      id_poliza: this.toNumOrNull(m?.id_poliza) ?? undefined,
      ...(m?.id_movimiento != null ? { id_movimiento: Number(m.id_movimiento) } : {})
    } as any;
  }

   // Habilita el botón cuando hay encabezado completo y al menos un movimiento válido
  puedeActualizar(): boolean {
    const p = this.poliza || {};
    const okHeader =
      !!(p.folio && String(p.folio).trim()) &&
      Number.isFinite(Number(p.id_tipopoliza)) &&
      Number.isFinite(Number(p.id_periodo)) &&
      Number.isFinite(Number(p.id_centro)) &&
      Number.isFinite(Number(p.id_usuario));

    const movs = Array.isArray(p.movimientos) ? p.movimientos : [];
    const validos = movs.filter(m =>
      this.toNumOrNull(m.id_cuenta) &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );

    return okHeader && validos.length > 0;
  }

  actualizarPoliza(): void {
    if (!this.poliza?.id_poliza) {
      this.showToast({ type: 'warning', title: 'Aviso', message: 'No se encontró el ID de la póliza.' });
      return;
    }

    // Partida doble del lado cliente (mensaje amigable si no cuadra)
    const cargos = this.getTotal('0');
    const abonos = this.getTotal('1');
    if (Math.abs(cargos - abonos) > 0.001) {
      this.showToast({ type: 'warning', title: 'Partida doble', message: `No cuadra.\nCargos: ${cargos}\nAbonos: ${abonos}` });
      return;
    }

    const p = this.poliza;
    // ---- Payload encabezado (igual que ya tenías)
    const payloadHeader = {
      id_tipopoliza: this.toNumOrNull(p.id_tipopoliza)!,
      id_periodo:    this.toNumOrNull(p.id_periodo)!,
      id_usuario:    this.toNumOrNull(p.id_usuario)!,
      id_centro:     this.toNumOrNull(p.id_centro)!,
      folio:         this.toStrOrNull(p.folio)!,
      concepto:      this.toStrOrNull(p.concepto)!,
    };

    // Separa movimientos a actualizar vs crear
    const movs = (p.movimientos ?? []) as MovimientoUI[];

    const toUpdate = movs.filter(m =>
      m.id_movimiento != null &&
      this.toNumOrNull(m.id_cuenta) != null &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );

    const toCreate = movs.filter(m =>
      m.id_movimiento == null && // nuevos
      this.toNumOrNull(m.id_cuenta) != null &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );

    // Requests de actualización
    const updateReqs = toUpdate.map(m =>
      this.apiSvc.updateMovPoliza(m.id_movimiento!, {
        id_cuenta:       this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion:       (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto:           this.toNumOrNull(m.monto),
        cliente:         this.toStrOrNull(m.cliente),
        fecha:           this.toDateOrNull(m.fecha),
        cc:              this.toNumOrNull(m.cc),
        uuid:            this.toStrOrNull(m.uuid)
      })
    );

    // Requests de creación (incluye id_poliza)
    const createReqs = toCreate.map(m =>
      this.apiSvc.createMovPoliza({
        id_poliza:       this.poliza!.id_poliza,
        id_cuenta:       this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion:       (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto:           this.toNumOrNull(m.monto),
        cliente:         this.toStrOrNull(m.cliente),
        fecha:           this.toDateOrNull(m.fecha),
        cc:              this.toNumOrNull(m.cc),
        uuid:            this.toStrOrNull(m.uuid)
      })
    );

    this.updating = true;

    // 1) PUT encabezado -> 2) forkJoin( updates + creates )
    this.apiSvc.updatePoliza(this.poliza.id_poliza, payloadHeader).pipe(
      switchMap(() => {
        const reqs = [...updateReqs, ...createReqs];
        return reqs.length ? forkJoin(reqs) : of(null);
      })
    ).subscribe({
      next: () => {
        const msg = [
          `Póliza actualizada.`,
          toUpdate.length ? ` Movs actualizados: ${toUpdate.length}.` : '',
          toCreate.length ? ` Movs creados: ${toCreate.length}.` : ''
        ].join('');
        this.showToast({ type: 'success', title: 'Listo', message: msg.trim() });
        this.cargarPoliza(this.poliza!.id_poliza!); // refresca ids/estado
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al actualizar póliza/movimientos';
        console.error('Actualizar:', err);
        this.showToast({ type: 'error', title: 'Error', message: msg });
      },
      complete: () => { this.updating = false; }
    });
  }

  private cargarCuentas() {
    this.cuentasSvc.getCuentas().subscribe({
      next: (arr) => {
        this.cuentas = Array.isArray(arr) ? arr : [];
        this.cuentasMap.clear();
        for (const c of this.cuentas) this.cuentasMap.set(c.id, c);
        // Prefill etiquetas si ya hay id_cuenta en los movimientos cargados
        this.prefillCuentaQueries();
      },
      error: (e) => console.error('Cuentas:', e)
    });
  }

  private prefillCuentaQueries() {
    const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
    if (!movs.length || this.cuentasMap.size === 0) return;
    movs.forEach((m) => {
      if (m.id_cuenta && !m._cuentaQuery) {
        const c = this.cuentasMap.get(Number(m.id_cuenta));
        if (c) m._cuentaQuery = `${c.codigo} — ${c.nombre}`;
      }
    });
  }

  agregarMovimiento(): void {
    const nuevo: MovimientoUI = {
      id_cuenta: null,
      ref_serie_venta: '',
      operacion: '',          // "0" | "1"
      monto: null,
      cliente: '',
      fecha: '',
      cc: null,
      uuid: null,
      _cuentaQuery: ''        // <-- listo para typeahead
    };
    (this.poliza.movimientos ??= []).push(nuevo);
    this.cuentasFiltradas.push([]);
  }

  private cargarCatalogos() {
    // GET tipos
    this.http.get<any>(`${this.apiBase}/tipo-poliza`).subscribe({
      next: (r) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r?.result ?? []);
        this.tiposPoliza = arr.map((t: any) => ({
          id_tipopoliza: Number(t.id_tipopoliza ?? t.id ?? t.ID),
          nombre: String(t.nombre ?? t.descripcion ?? t.NOMBRE ?? 'Tipo')
        }));
      },
      error: (e) => console.error('Tipos de póliza:', e)
    });

    // GET periodos
    this.http.get<any>(`${this.apiBase}/periodos`).subscribe({
      next: (r) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r?.result ?? []);
        this.periodos = arr.map((p: any) => {
          const id  = Number(p.id_periodo ?? p.id ?? p.ID);
          const fi0 = p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini;
          const ff0 = p.fecha_fin    ?? p.fechaFin    ?? p.fin    ?? p.end_date   ?? p.fecha_fin;
          return { id_periodo: id, nombre: `${this.fmtDate(fi0)} — ${this.fmtDate(ff0)}` };
        });
      },
      error: (e) => console.error('Periodos:', e)
    });

    // GET centros
    this.http.get<any>(`${this.apiBase}/centros`).subscribe({
      next: (r) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r?.result ?? []);
        this.centros = arr.map((c: any) => {
          const id     = Number(c.id_centro ?? c.id ?? c.ID);
          const serie  = String(c.serie_venta ?? c.serie ?? c.codigo ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          const etiqueta = serie && nombre ? `${serie} — ${nombre}` : (serie || nombre || `Centro ${id}`);
          return { id_centro: id, nombre: etiqueta };
        });
      },
      error: (e) => console.error('Centros:', e)
    });
  }

  // --- Confirm modal state ---
  confirmOpen = false;
  confirmTitle = 'Eliminar movimiento';
  confirmMessage = '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.';
  private confirmIndex: number | null = null;

  // para evitar doble clic en eliminar por fila
  deletingIndexSet = new Set<number>();

  openConfirm(index: number) {
    // Asegura arreglo existente
    this.poliza.movimientos ??= [];
    // rango válido
    if (index < 0 || index >= this.poliza.movimientos.length) return;
    this.confirmIndex = index;
    this.confirmOpen = true;
  }
  closeConfirm() {
    this.confirmOpen = false;
    this.confirmIndex = null;
  }
  cancelConfirm() { this.closeConfirm(); }

  confirmProceed() {
    if (this.confirmIndex == null) return;
    const i = this.confirmIndex;
    this.closeConfirm();

    const movs = this.poliza.movimientos ?? [];
    if (i < 0 || i >= movs.length) return;

    const mov = movs[i];
    // si no tiene id_movimiento => solo elimino en UI
    const idMov = (mov as any)?.id_movimiento as number | undefined;

    // marca la fila mientras elimina
    this.deletingIndexSet.add(i);

    const finish = () => {
      // quita del arreglo local
      (this.poliza.movimientos ??= []).splice(i, 1);
      // ajusta cuentas filtradas si las usas por fila
      this.cuentasFiltradas.splice(i, 1);
      // recalcula totales visuales (opcional, ya lo hace Angular)
      this.deletingIndexSet.delete(i);
    };

    if (!idMov) {
      // movimiento aún no persistido
      finish();
      this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
      return;
    }

    // DELETE backend y luego remueve localmente
    this.apiSvc.deleteMovPoliza(idMov).subscribe({
      next: () => {
        finish();
        this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
      },
      error: (err) => {
        this.deletingIndexSet.delete(i);
        const msg = err?.error?.message || err?.error?.error || 'No se pudo eliminar el movimiento.';
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  }

  // --------------------- Helpers/UI ---------------------
  getTotal(tipo: '0' | '1'): number {
    const movs = Array.isArray(this.poliza?.movimientos) ? this.poliza!.movimientos! : [];
    return movs
      .filter(m => String(m.operacion) === tipo)
      .reduce((s, m) => s + (Number(m.monto) || 0), 0);
  }
  getDiferencia(): number { return this.getTotal('0') - this.getTotal('1'); }

  canGuardarEstilo(): 'ok' | 'warn' | 'bad' {
    const dif = Math.abs(this.getDiferencia());
    if (this.getTotal('0') === 0 && this.getTotal('1') === 0) return 'warn';
    if (dif < 0.0001) return 'ok';
    return 'bad';
  }

  // Conversión utilitaria
  private pad2(n: number) { return String(n).padStart(2, '0'); }
  private fmtDate(d: any): string {
    if (!d) return '—';
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;
    return `${dt.getFullYear()}-${this.pad2(dt.getMonth() + 1)}-${this.pad2(dt.getDate())}`;
  }
  private toNumOrNull(v: any): number | null {
    return (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);
  }
  private toStrOrNull(v: any): string | null {
    return v == null ? null : (String(v).trim() || null);
  }
  private toDateOrNull(v: any): string | null {
    if (!v) return null;
    const s = String(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${this.pad2(d.getMonth()+1)}-${this.pad2(d.getDate())}`;
  }

  // === Typeahead de cuentas (por fila) ===
  onCuentaQueryChange(i: number) {
    const movs = this.poliza?.movimientos as MovimientoUI[] || [];
    const q = (movs[i]?._cuentaQuery || '').trim().toLowerCase();
    if (!q) {
      this.cuentasFiltradas[i] = this.cuentas.slice(0, 20);
      return;
    }
    // Prioriza coincidencias por código, luego por nombre
    const hits = this.cuentas.filter(c =>
      (c.codigo && c.codigo.toLowerCase().includes(q)) ||
      (c.nombre && c.nombre.toLowerCase().includes(q))
    );
    // Opcional: ordenar resultados (primero por empieza-con)
    const starts = hits.filter(c => c.codigo?.toLowerCase().startsWith(q));
    const rest = hits.filter(c => !c.codigo?.toLowerCase().startsWith(q));
    this.cuentasFiltradas[i] = [...starts, ...rest].slice(0, 50);
  }

  openCuenta(i: number) {
    this.cuentaOpenIndex = i;
    // Inicializa con primeras cuentas si no hay query
    this.onCuentaQueryChange(i);
  }

  closeCuenta(i: number) {
    // Cierra con un pequeño delay para permitir click en item
    setTimeout(() => {
      if (this.cuentaOpenIndex === i) this.cuentaOpenIndex = null;
    }, 120);
  }

  selectCuenta(i: number, c: Cuenta) {
    const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
    const m = movs[i]; if (!m) return;
    m.id_cuenta = Number(c.id);
    m._cuentaQuery = `${c.codigo} — ${c.nombre}`;
    this.cuentasFiltradas[i] = [];
    this.cuentaOpenIndex = null;
  }

  private showToast(opts: { message: string; type?: ToastType; title?: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.message = opts.message;
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }
  onToastClosed = () => { this.toast.open = false; };
}
