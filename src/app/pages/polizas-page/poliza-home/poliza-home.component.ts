import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { OnboardingService } from '@app/services/onboarding.service';

import { PolizasService} from '../../../services/polizas.service';
import { Poliza, Movimiento } from '@app/models/poliza';
import { EjercicioContableService } from '@app/services/ejercicio-contable.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';

import { AuthService } from '@app/services/auth.service';
import { WsService } from '@app/services/ws.service';
import { PermissionWatcher } from '@app/utils/permissions.util';

import { fmtDate, toDateOrNull, todayISO, periodoEtiqueta, toDateSafe } from '@app/utils/fecha-utils';

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
    ModalComponent
  ],
  templateUrl: './poliza-home.component.html',
  styleUrls: ['./poliza-home.component.scss'],
})
export class PolizaHomeComponent implements OnInit, OnDestroy {

  sidebarOpen = true;
  polizaSeleccionada: Poliza | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private api: PolizasService,
    private ejercicioSvc: EjercicioContableService,
    private onboarding: OnboardingService,
    private auth: AuthService,
    private ws: WsService,
  ) { }

  canCreate = false;
  canEdit = false;
  canDelete = false;

  private permWatcher?: PermissionWatcher;

  seleccionarPoliza(p: Poliza) {
    this.polizaSeleccionada = p;
  }

  irACrearAjuste() {
    if (!this.canCreate) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para crear pólizas.' });
      return;
    }
    if (!this.polizaSeleccionada) {
      this.showToast({
        type: 'warning',
        title: 'Póliza no seleccionada',
        message: 'Por favor, selecciona una póliza antes de crear el ajuste.'
      });
      return;
    }

    const idPoliza = this.polizaSeleccionada.id_poliza;
    if (!idPoliza) {
      this.showToast({
        type: 'error',
        title: 'ID de póliza inválido',
        message: 'No se ha encontrado el ID de la póliza seleccionada.'
      });
      return; // No redirige si el ID de la póliza es inválido
    }

    // Redirige a la página de ajuste con el ID de la póliza seleccionada
    this.router.navigate(['/poliza/ajuste', idPoliza]);
  }

  ejercicios: Array<{ id_ejercicio: number; etiqueta: string }> = [];
  selectedEjercicioId: number | null = null;
  Math = Math;

  ngOnInit() {
    this.permWatcher = new PermissionWatcher(
      this.auth,
      this.ws,
      {
        toastOk: (m) => this.showToast({ type: 'success', message: m }),
        toastWarn: (m) => this.showToast({ type: 'warning', message: m }),
        toastError: (m) => this.showToast({ type: 'error', message: m }),
      },
      (flags) => {
        this.canCreate = flags.canCreate;
        this.canEdit = flags.canEdit;
        this.canDelete = flags.canDelete;
      },
      {
        keys: {
          create: 'crear_poliza',
          edit: 'editar_poliza',
          delete: 'eliminar_poliza',
        },
        socketEvent: ['permissions:changed', 'role-permissions:changed'],
        contextLabel: 'Pólizas',
      }
    );
    this.permWatcher.start();

    this.cargarCatalogos();
    this.cargarCfdiRecientes();
    this.cargarCuentas();
    this.cargarEjercicios();
  }

  ngOnDestroy(): void {
    this.permWatcher?.stop();
  }

  volver() { this.location.back(); }

  confirmModal = {
    open: false,
    title: 'Confirmar eliminación',
    message: '¿Deseas eliminar esta póliza?',
    onConfirm: (() => { }) as () => void,
  };

  approveModal = {
    open: false,
    title: 'Confirmar aprobación',
    message: '¿Deseas marcar esta póliza como Aprobada?',
    onConfirm: (() => { }) as () => void,
  };

  abrirConfirmModal(message: string, onConfirm: () => void, title = 'Confirmar eliminación') {
    this.confirmModal.title = title;
    this.confirmModal.message = message;
    this.confirmModal.onConfirm = onConfirm;
    this.confirmModal.open = true;
  }
  cerrarConfirmModal() { this.confirmModal.open = false; this.confirmModal.onConfirm = () => { }; }
  confirmarConfirmModal() { try { this.confirmModal.onConfirm?.(); } finally { this.cerrarConfirmModal(); } }

  /** Abrir modal de aprobar , pero primero checa si esta cuadrada la poliza */
  abrirApproveModal(p: PolizaRow) {
    const id = this.getIdPoliza(p);
    if (!id) {
      this.showToast({ type: 'warning', title: 'Sin ID', message: 'No se puede aprobar: falta id_poliza.' });
      return;
    }

    this.verificarCuadrada(p, (ok) => {
      if (!ok) {
        this.showToast({
          type: 'warning',
          title: 'No cuadrada',
          message: 'La póliza no está cuadrada. No se puede marcar como Aprobada.'
        });
        return;
      }
      this.approveModal.title = 'Confirmar aprobación';
      this.approveModal.message = `Vas a marcar la póliza ${id} como Aprobada. ¿Continuar?`;
      this.approveModal.onConfirm = () => {
        this.loadingId = id;
        this._hacerCambioEstado(id, p, 'Aprobada');
      };
      this.approveModal.open = true;
    });
  }
  cerrarApproveModal() { this.approveModal.open = false; this.approveModal.onConfirm = () => { }; }
  confirmarApproveModal() { try { this.approveModal.onConfirm?.(); } finally { this.cerrarApproveModal(); } }

  onModalConfirmed() { this.confirmarConfirmModal(); }
  onModalCanceled() { this.cerrarConfirmModal(); }
  onModalClosed() { this.cerrarConfirmModal(); }

  polizas: PolizaRow[] = [];
  polizasFiltradas: PolizaRow[] = [];
  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  periodos: Array<{ id_periodo: number; nombre: string }> = [];
  centros: Array<{ id_centro: number; nombre: string }> = [];

  mapTipos = new Map<number, string>();
  mapPeriodos = new Map<number, string>();
  mapCentros = new Map<number, string>();
  cuentasMap = new Map<number, { codigo: string; nombre: string }>();

  filtroTipo?: number;
  filtroPeriodo?: number;

  q = '';
  private buscarTimer: ReturnType<typeof setTimeout> | undefined;

  nuevaPoliza: Partial<Poliza> = { movimientos: [] };
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';
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
  onToastClosed = () => { this.toast.open = false; };

  loadingId: number | null = null;
  expandedId: number | null = null;
  movsLoadingId: number | null = null;
  movsLoaded: Record<number, boolean> = {};

  // Este es el listado de todas las pólizas
  currentPage = 1;
  pageSize = 10;
  totalPolizas = 0;

  // Listado de movimientos por póliza
  movsPageByPoliza: Record<number, number> = {};
  movsTotalByPoliza: Record<number, number> = {};
  movsPageSize = 10;

  // Helpers para el template
  private getIdPolizaSafe(p: PolizaRow): number {
    const id = this.getIdPoliza(p);
    return id != null ? id : 0;
  }

  movsTotalFor(p: PolizaRow): number {
    const id = this.getIdPolizaSafe(p);
    return this.movsTotalByPoliza[id] ?? 0;
  }

  movsPageFor(p: PolizaRow): number {
    const id = this.getIdPolizaSafe(p);
    return this.movsPageByPoliza[id] ?? 1;
  }

  lastMovsPageFor(p: PolizaRow): number {
    const total = this.movsTotalFor(p);
    return total > 0 ? Math.ceil(total / this.movsPageSize) : 1;
  }

  private normalizeList(res: any) {
    return Array.isArray(res) ? res : (res?.rows ?? res?.data ?? res?.items ?? res?.result ?? []);
  }
  private showToast(opts: { type?: ToastType; title?: string; message: string; autoCloseMs?: number; position?: ToastPosition }) {
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    this.toast.message = opts.message;
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }

  cargarCatalogos(): void {
    this.api.getTiposPoliza().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.tiposPoliza = items.map((t: any) => {
          const id_tipopoliza: number = Number(t.id_tipopoliza ?? t.id ?? t.ID);
          const nombre: string = String(t.nombre ?? t.descripcion ?? t.NOMBRE ?? 'Tipo');
          return { id_tipopoliza, nombre };
        });
        this.mapTipos.clear();
        for (const t of this.tiposPoliza) this.mapTipos.set(t.id_tipopoliza, t.nombre);
      },
      error: err => {
        console.error('Tipos de póliza:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los tipos de póliza.' });
      },
    });

    this.api.getPeriodos().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.periodos = items.map((p: any) => {
          const id = Number(p.id_periodo ?? p.id ?? p.ID);
          const fi0 = p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini;
          const ff0 = p.fecha_fin ?? p.fechaFin ?? p.fin ?? p.end_date ?? p.fecha_fin;
          return { id_periodo: id, nombre: periodoEtiqueta(fi0, ff0) };
        });
        this.mapPeriodos.clear();
        for (const p of this.periodos) this.mapPeriodos.set(p.id_periodo, p.nombre);
      },
      error: err => {
        console.error('Periodos:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los periodos.' });
      },
    });

    this.api.getCentros().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.centros = items.map((c: any) => {
          const id = Number(c.id_centro ?? c.id ?? c.ID);
          const serie = String(c.serie_venta ?? c.serie ?? c.codigo ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          const etiqueta = serie && nombre ? `${serie} — ${nombre}` : (serie || nombre || `Centro ${id}`);
          return { id_centro: id, nombre: etiqueta };
        });
        this.mapCentros.clear();
        for (const c of this.centros) this.mapCentros.set(c.id_centro, c.nombre);
      },
      error: err => {
        console.error('Centros:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los centros.' });
      },
    });
  }

  cargarCuentas() {
    this.api.getCuentas().subscribe({
      next: (r: any) => {
        const arr = this.normalizeList(r);
        this.cuentasMap.clear();
        for (const c of arr) {
          const id = Number(c.id_cuenta ?? c.id ?? c.ID);
          const codigo = String(c.codigo ?? c.clave ?? c.code ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          if (!Number.isNaN(id)) this.cuentasMap.set(id, { codigo, nombre });
        }
      },
      error: (e) => console.error('Cuentas:', e)
    });
  }

  cargarEjercicios() {
    this.ejercicioSvc.listEjerciciosAbiertos({ esta_abierto: true }).subscribe({
      next: (res: any) => {
        const arr = Array.isArray(res) ? res : (res?.rows ?? res?.data ?? res ?? []);

        this.ejercicios = arr.map((e: any) => {
          const id = Number(e.id_ejercicio ?? e.id ?? e.ID);
          const anio = e.anio ?? e.year ?? null;
          const fi = e.fecha_inicio ?? e.inicio ?? e.start_date ?? null;
          const ff = e.fecha_fin ?? e.fin ?? e.end_date ?? null;

          let etiqueta = '';
          if (anio != null) etiqueta = `Ejercicio ${anio}`;
          else if (fi || ff) etiqueta = `${fmtDate(fi)} — ${fmtDate(ff)}`;
          else etiqueta = `Ejercicio ${id}`;

          return { id_ejercicio: id, etiqueta };
        });

        if (!this.selectedEjercicioId && this.ejercicios.length) {
          const hoy = new Date();
          const anioActual = hoy.getFullYear();
          let defaultId: number | null = null;

          const rawPorAnio = arr.find((e: any) => {
            const anio = Number(
              e.anio ??
              e.year ??
              (e.fecha_inicio ? new Date(e.fecha_inicio).getFullYear() : NaN)
            );
            return anio === anioActual;
          });

          if (rawPorAnio) {
            defaultId = Number(rawPorAnio.id_ejercicio ?? rawPorAnio.id ?? rawPorAnio.ID);
          } else if (this.ejercicios.length === 1) {
            defaultId = this.ejercicios[0].id_ejercicio;
          } else {
            const rawPorRango = arr.find((e: any) => {
              const fi = toDateSafe(e.fecha_inicio ?? e.inicio ?? e.start_date);
              const ff = toDateSafe(e.fecha_fin ?? e.fin ?? e.end_date);
              if (!fi && !ff) return false;
              const t = hoy.getTime();
              const ti = fi ? fi.getTime() : -Infinity;
              const tf = ff ? ff.getTime() : Infinity;
              return t >= ti && t <= tf;
            });

            if (rawPorRango) {
              defaultId = Number(rawPorRango.id_ejercicio ?? rawPorRango.id ?? rawPorRango.ID);
            }
          }

          if (defaultId != null) {
            this.selectedEjercicioId = defaultId;
            this.cargarPolizas();
          }
        }
      },
      error: (err) => {
        console.error('Ejercicios contables:', err);
        this.showToast({
          type: 'warning',
          title: 'Aviso',
          message: 'No se pudieron cargar los ejercicios contables.'
        });
      }
    });
  }

  private cargarMovimientosPagina(p: PolizaRow, page: number) {
    const id = this.getIdPoliza(p);
    if (!id) return;

    this.movsLoadingId = id;
    this.api.listPolizaConMovimientos(id, page, this.movsPageSize).subscribe({
      next: (res: any) => {
        (p as any).movimientos = res?.data ?? res?.rows ?? [];
        this.movsPageByPoliza[id] = res?.page ?? page;
        this.movsTotalByPoliza[id] = res?.total ?? (p as any).movimientos.length ?? 0;
        console.log(p)
      },
      error: (err) => {
        console.error('getPolizaConMovimientos:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los movimientos.' });
      },
      complete: () => (this.movsLoadingId = null),
    });
  }

  cambiarPaginaMovimientos(p: PolizaRow, delta: number) {
    const id = this.getIdPoliza(p);
    if (!id) return;

    const current = this.movsPageByPoliza[id] || 1;
    const total = this.movsTotalByPoliza[id] || 0;
    const lastPage = Math.max(1, Math.ceil(total / this.movsPageSize));

    const next = Math.min(Math.max(1, current + delta), lastPage);
    if (next === current) return;

    this.cargarMovimientosPagina(p, next);
  }


  onEjercicioChange(id: number | null) {
    this.selectedEjercicioId = id;
    this.currentPage = 1;
    this.cargarPolizas();
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

  getIdPoliza(p: PolizaRow): number | null {
    const id = (p as any)?.id_poliza ?? (p as any)?.id;
    return (id == null ? null : Number(id));
  }

  /** true si (cargos - abonos) ≈ 0 " */
  private isPolizaCuadrada(p: PolizaRow): boolean {
    const estado = (this.getEstado(p) || '').toLowerCase();
    if (estado.includes('cuadra') || estado.includes('aprob')) return true;

    const movs: Movimiento[] = Array.isArray((p as any).movimientos) ? (p as any).movimientos : [];
    if (!movs.length) return false; // sólo podemos concluir cuadrada si hay datos

    const cargos = movs.filter(m => String(m.operacion) === '0').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    const abonos = movs.filter(m => String(m.operacion) === '1').reduce((s, m) => s + (Number(m.monto) || 0), 0);
    return Math.abs(cargos - abonos) < 0.0001;
  }

  /** Si no hay movimientos cargados, los trae y evalúa si está cuadrada */
  private verificarCuadrada(p: PolizaRow, done: (ok: boolean) => void) {
    const id = this.getIdPoliza(p);
    if (!id) return done(false);

    if (Array.isArray((p as any).movimientos) && (p as any).movimientos.length > 0) {
      return done(this.isPolizaCuadrada(p));
    }
    this.api.getPolizaConMovimientos(id).subscribe({
      next: (res: any) => {
        (p as any).movimientos = res?.movimientos ?? [];
        done(this.isPolizaCuadrada(p));
      },
      error: () => done(false)
    });
  }

  canAprobar(p: PolizaRow): boolean {
    return this.canMarcarRevisada(p);
  }

  toggleVerMas(p: PolizaRow) {
    const id = this.getIdPoliza(p);
    if (!id) return;

    if (this.expandedId === id) {
      this.expandedId = null;
      return;
    }

    this.expandedId = id;

    const page = this.movsPageByPoliza[id] ?? 1;
    this.cargarMovimientosPagina(p, page);
  }


  cargarPolizas(): void {
    if (!this.selectedEjercicioId) {
      this.polizas = [];
      this.polizasFiltradas = [];
      this.totalPolizas = 0;
      return;
    }

    const obs$ = this.api.getPolizaByEjercicio(this.selectedEjercicioId, {
      page: this.currentPage,
      pageSize: this.pageSize
    });

    obs$.subscribe({
      next: (r: any) => {
        const list = this.normalizeList(r?.data ?? r) ?? [];
        this.polizas = Array.isArray(list) ? list : [];
        this.totalPolizas = r?.total ?? 0;

        this.aplicarFiltroLocal();

        for (const p of this.polizas) {
          this.periodoLabelFromRow(p);
        }

        if (this.polizas.length === 0) {
          this.showToast({
            type: 'info',
            message: 'No hay pólizas registradas para este ejercicio.'
          });
        }
      },
      error: err => {
        console.error('Pólizas:', err);
        this.showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar las pólizas del ejercicio seleccionado.'
        });
      },
    });
  }

  cambiarPagina(pagina: number): void {
    this.currentPage = pagina;
    this.cargarPolizas();
  }

  cambiarTamanioPagina(nuevoTamanio: number): void {
    this.pageSize = nuevoTamanio;
    this.currentPage = 1;
    this.cargarPolizas();
  }

  onBuscarChange(_: string) {
    if (this.buscarTimer) clearTimeout(this.buscarTimer);
    this.buscarTimer = setTimeout(() => {
      this.currentPage = 1;
      this.cargarPolizas();
    }, 250);
  }

  private aplicarFiltroLocal() {
    const term = (this.q || '').trim().toLowerCase();
    if (!term) { this.polizasFiltradas = this.polizas.slice(); return; }

    this.polizasFiltradas = this.polizas.filter(p => {
      const folio = String(p.folio ?? '').toLowerCase();
      const concepto = String(p.concepto ?? '').toLowerCase();
      const centro = this.nombreCentro(p.id_centro).toLowerCase();
      const tipo = this.nombreTipo(p.id_tipopoliza).toLowerCase();
      const periodo = this.periodoLabelFromRow(p).toLowerCase();

      const movMatch = Array.isArray(p.movimientos) && p.movimientos.some(m => {
        const uuid = String((m as any)?.uuid ?? '').toLowerCase();
        const cliente = String((m as any)?.cliente ?? '').toLowerCase();
        const ref = String((m as any)?.ref_serie_venta ?? '').toLowerCase();
        return uuid.includes(term) || cliente.includes(term) || ref.includes(term);
      });

      return folio.includes(term) || concepto.includes(term) || centro.includes(term) ||
        tipo.includes(term) || periodo.includes(term) || movMatch;
    });
  }

  periodoLabelFromRow(p: any): string {
    const id = Number(p?.id_periodo ?? p?.periodo_id);
    const enMapa = this.mapPeriodos.get(id);
    if (enMapa) return enMapa;

    const ini = p?.periodo_inicio ?? p?.fecha_inicio ?? p?.inicio;
    const fin = p?.periodo_fin ?? p?.fecha_fin ?? p?.fin;

    const etiqueta = periodoEtiqueta(ini, fin);
    if (!Number.isNaN(id)) this.mapPeriodos.set(id, etiqueta);
    return etiqueta;
  }


  getEstado(p: any):
    'Cuadrada' | 'Descuadrada' | 'Pendiente' | 'Cerrada' | 'Cancelada' | 'Borrador' | 'Activa' | 'Aprobada' | string {
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
    if (e.includes('cerr')) return 'estado ok';
    if (e.includes('activa')) return 'estado ok';
    if (e.includes('aprob')) return 'estado ok';
    if (e.includes('pend')) return 'estado warn';
    if (e.includes('borr')) return 'estado warn';
    if (e.includes('canc')) return 'estado bad';
    return 'estado warn';
  }

  nombreCentro = (id: number | null | undefined) => (id == null ? '' : (this.mapCentros.get(id) ?? String(id)));
  nombreTipo = (id: number | null | undefined) => (id == null ? '' : (this.mapTipos.get(id) ?? String(id)));
  nombrePeriodo = (id: number | null | undefined) => (id == null ? '' : (this.mapPeriodos.get(id) ?? String(id)));

  trackByFolio = (_: number, p: PolizaRow) => p?.id_poliza ?? p?.folio ?? _;

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  editarPoliza(p: PolizaRow) {
    if (!this.canEdit) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para editar pólizas.' });
      return;
    }
    const id = (p as any)?.id_poliza ?? (p as any)?.id;
    if (!id) { console.warn('No se encontró id_poliza en la fila seleccionada'); return; }
    this.router.navigate(['/polizas', 'editar', String(id)]);
  }

  eliminarPolizaDeFila(p: PolizaRow) {
    if (!this.canDelete) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para eliminar pólizas.' });
      return;
    }
    const id = this.getIdPoliza(p);
    if (!id) { this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' }); return; }
    this.eliminarPoliza(id);
  }

  filtros = {
    folio: '',
    concepto: '',
    centro: '',
    tipo: '',
    periodo: '',
    estado: ''
  };

  aplicarFiltros() {
    this.polizasFiltradas = this.polizas.filter(p => {
      const folio = (p.folio || '').toString().toLowerCase();
      const concepto = (p.concepto || '').toLowerCase();
      const centro = this.nombreCentro(p.id_centro).toLowerCase();
      const tipo = this.nombreTipo(p.id_tipopoliza).toLowerCase();
      const periodo = this.periodoLabelFromRow(p).toLowerCase();
      const estado = this.getEstado(p).toLowerCase();

      return (
        folio.includes(this.filtros.folio.toLowerCase()) &&
        concepto.includes(this.filtros.concepto.toLowerCase()) &&
        centro.includes(this.filtros.centro.toLowerCase()) &&
        tipo.includes(this.filtros.tipo.toLowerCase()) &&
        periodo.includes(this.filtros.periodo.toLowerCase()) &&
        estado.includes(this.filtros.estado.toLowerCase())
      );
    });
  }

  showFilter: Record<string, boolean> = {
    folio: false,
    concepto: false,
    centro: false,
    tipo: false,
    periodo: false,
    estado: false
  };

  toggleFilter(col: string) {
    for (const key in this.showFilter) {
      if (key !== col) this.showFilter[key] = false;
    }
    this.showFilter[col] = !this.showFilter[col];
  }

  eliminarPoliza(id_poliza?: number): void {
    if (!this.canDelete) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para eliminar pólizas.' });
      return;
    }
    if (id_poliza == null) {
      this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' });
      return;
    }

    this.abrirConfirmModal('¿Deseas eliminar esta póliza?', () => {
      this.api.deletePoliza(id_poliza).subscribe({
        next: () => {
          this.cargarPolizas();
          this.showToast({ type: 'success', title: 'Listo', message: 'Póliza eliminada correctamente.' });
        },
        error: err => {
          console.error('Error al eliminar póliza:', err);
          const msg = err?.error?.message || 'No se pudo eliminar la póliza.';
          this.showToast({ type: 'warning', title: 'Aviso', message: msg });
        }
      });
    });
  }

  irANueva() {
    if (!this.canCreate) {
      this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para crear pólizas.' });
      return;
    }
    this.router.navigate(['/polizas']);
  }

  private isAllowedEstadoUI(e: any): e is 'Por revisar' | 'Revisada' | 'Aprobada' | 'Contabilizada' {
    return e === 'Por revisar' || e === 'Revisada' || e === 'Aprobada' || e === 'Contabilizada';
  }

  /** Habilitar botón "Revisada/Aprobada" solo si cuadra */
  canMarcarRevisada(p: PolizaRow): boolean {
    const e = (this.getEstado(p) || '').toLowerCase();
    // Estados que sí bloquean el botón
    if (e.includes('aprob') || e.includes('contab') || e.includes('cance') || e.includes('cerr')) return false;

    const tieneMovs = Array.isArray((p as any).movimientos) && (p as any).movimientos.length > 0;
    return tieneMovs ? this.isPolizaCuadrada(p) : true;
  }
  canMarcarContabilizada(p: PolizaRow): boolean {
    const e = (this.getEstado(p) || '').toLowerCase();
    return e.includes('aprob') || e.includes('revis') || e.includes('cuadra');
  }

  cambiarEstadoPoliza(p: PolizaRow, nuevo: 'Por revisar' | 'Revisada' | 'Aprobada' | 'Contabilizada') {
    if (!this.isAllowedEstadoUI(nuevo)) {
      this.showToast({ type: 'warning', title: 'Estado inválido', message: 'Solo: Por revisar, Revisada, Aprobada, Contabilizada.' });
      return;
    }
    const id = this.getIdPoliza(p);
    if (!id) {
      this.showToast({ type: 'warning', title: 'Sin ID', message: 'No se puede cambiar el estado: falta id_poliza.' });
      return;
    }

    // Si es Aprobada o Revisada, exigir cuadrada
    if (nuevo === 'Aprobada' || nuevo === 'Revisada') {
      this.verificarCuadrada(p, (ok) => {
        if (!ok) {
          this.showToast({
            type: 'warning',
            title: 'No cuadrada',
            message: 'La póliza no está cuadrada. No se puede marcar como Aprobada/Revisada.'
          });
          return;
        }
        const destinoApi: 'Por revisar' | 'Aprobada' | 'Contabilizada' =
          (nuevo === 'Revisada') ? 'Aprobada' : 'Aprobada';
        this.loadingId = id;
        this._hacerCambioEstado(id, p, destinoApi);
      });
      return;
    }

    // Otros estados sin restricción de cuadrada
    this.loadingId = id;
    const destinoApi: 'Por revisar' | 'Aprobada' | 'Contabilizada' = nuevo; // aquí 'nuevo' no es 'Revisada'
    this._hacerCambioEstado(id, p, destinoApi);
  }

  private _hacerCambioEstado(
    id: number,
    p: PolizaRow,
    nuevo: 'Por revisar' | 'Aprobada' | 'Contabilizada'
  ) {
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
        this.showToast({ type: 'warning', title: 'Aviso', message: msg });
      },
      complete: () => (this.loadingId = null),
    });
  }

  //  XML 
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
          uuid: res?.uuid || res?.UUID || '',
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
        this.showToast({ type: 'warning', title: 'Aviso', message: this.uploadXmlError });
      },
      complete: () => (this.uploadingXml = false),
    });
  }

  cargarCfdiRecientes() {
    const svc: any = this.api as any;
    if (typeof svc.listCfdi !== 'function') return;

    svc.listCfdi({ limit: 100 }).subscribe({
      next: (r: any) => {
        const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
        this.cfdiOptions = arr
          .map((x: any) => ({
            uuid: String(x.uuid ?? x.UUID ?? '').trim(),
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
