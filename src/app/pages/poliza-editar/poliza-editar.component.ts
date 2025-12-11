import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalSeleccionCuentaComponent } from '@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component';

import { PolizasService } from '@app/services/polizas.service';
import { CuentasService } from '@app/services/cuentas.service';
import type { Poliza, Movimiento } from '@app/services/polizas.service';
import { SavingOverlayComponent } from '@app/components/saving-overlay/saving-overlay.component';
import {
  catchError,
  of,
  switchMap,
  throwError,
  firstValueFrom,
  finalize,
  from,
  concatMap,
  tap
} from 'rxjs';

/** <- forma compatible con el servicio y el modal */
type Cuenta = {
  id_cuenta: number;
  codigo: string;
  nombre: string;
  nivel: number;
  esPadre: boolean;
  ctaMayor?: boolean;
  posteable?: boolean | number | '1' | '0' | string;
};

type Ejercicio = {
  id_ejercicio: number;
  nombre?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  activo?: boolean | number | '1' | '0';
};

type MovimientoUI = Movimiento & {
  _cuentaQuery?: string;
  id_movimiento?: number;
  orden?: number;
  _arrival?: number;
};

type PolizaUI = Omit<Poliza, 'movimientos'> & {
  movimientos: MovimientoUI[];
};

type CfdiOption = {
  uuid: string;
  folio?: string | null;
  fecha?: string | null;
  total?: number | string | null;
};
type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
type UsuarioLigero = { id_usuario: number; nombre?: string; email?: string;[k: string]: any };

type CentroCostoItem = {
  serie_venta: any;
  id_centrocosto: number;
  nombre: string;
  clave?: string | null;

  parent_id?: number | null;
  nivel?: number;
  esPadre?: boolean;
  posteable?: boolean | 0 | 1 | '0' | '1' | null;
  _expandido?: boolean;
};

@Component({
  selector: 'app-poliza-editar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PolizasLayoutComponent,
    ToastMessageComponent,
    ModalComponent,
    ModalSeleccionCuentaComponent,
    SavingOverlayComponent
  ],
  templateUrl: './poliza-editar.component.html',
  styleUrls: ['./poliza-editar.component.scss']
})
export class PolizaEditarComponent implements OnInit {
  private apiBase = 'http://localhost:3000/api/v1';
  private get api(): any { return this.apiSvc as any; }

  sidebarOpen = true;
  loading = true;
  errorMsg = '';
  updating = false;

  trackByMov = (_: number, m: MovimientoUI) => m.id_movimiento ?? m.orden ?? -1;

  id_poliza!: number;

  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };

  saving = false;
  saveTotal = 0;
  saveDone = 0;

  currentUser: UsuarioLigero | null = null;

  ejercicioActual: Ejercicio | null = null;
  ejercicioActualId!: number;
  ejercicios: Ejercicio[] = [];
  private allPeriodos: Array<{
    id_periodo: number;
    id_ejercicio: number | null;
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    _raw?: any;
  }> = [];
  periodos: Array<{ id_periodo: number; nombre: string }> = [];
  compareById = (a: any, b: any) => a && b && a.id_periodo === b.id_periodo;

  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  centros: Array<{ id_centro: number; nombre: string }> = [];

  centrosCosto: CentroCostoItem[] = [];
  private centrosCostoMap = new Map<number, CentroCostoItem>();

  poliza: Partial<PolizaUI> & {
    id_poliza?: number;
    estado?: string;
    fecha_creacion?: string;
    created_at?: string;
    updated_at?: string;
  } = { movimientos: [] };

  /** Plan de cuentas plano (con nivel, esPadre, etc.) */
  cuentas: Cuenta[] = [];
  /** Lo que se manda directamente al modal (misma referencia siempre) */
  cuentasParaModal: any[] = [];

  cuentasMap = new Map<number, Cuenta>();
  cuentasFiltradas: Cuenta[][] = [];
  cuentaOpenIndex: number | null = null;

  modalCuentasAbierto = false;
  indiceMovimientoSeleccionado: number | null = null;

  // Modal de centro de costo
  modalCentroAbierto = false;
  centroSeleccionadoModal: any = null;
  centrosCostoComoCuentas: any[] = [];

  xmlMovimientoIndex: number | null = null;
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';
  cfdiOptions: CfdiOption[] = [];
  uuidSeleccionado?: string;

  private lastOrderMap = new Map<number, number>();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private apiSvc: PolizasService,
    private cuentasSvc: CuentasService,
  ) { }

  ngOnInit(): void {
    this.cargarCatalogosBase();      // Tipos y Centros
    this.getCentros();               // Centros de costo

    this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.id_poliza)) {
      this.showToast({ type: 'warning', title: 'Aviso', message: 'ID de póliza inválido.' });
      this.loading = false;
      return;
    }

    this.cargarPeriodosAll();
    this.cargarEjercicioActivo();
    this.cargarPoliza(this.id_poliza);
    this.cargarCuentas();
    this.cargarUsuarioActual();
    this.cargarCfdiRecientes();
  }

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  // ----------------- Catálogos base -----------------
  private cargarCatalogosBase() {
    // Tipos de póliza
    this.http.get<any>(`${this.apiBase}/tipo-poliza`).subscribe({
      next: (r) => {
        const arr = this.normalizeList(r);
        this.tiposPoliza = arr.map((t: any) => ({
          id_tipopoliza: Number(t.id_tipopoliza ?? t.id ?? t.ID),
          nombre: String(t.nombre ?? t.descripcion ?? t.NOMBRE ?? 'Tipo')
        }));
      },
      error: (e) => console.error('Tipos de póliza:', e)
    });

    // Centros
    this.http.get<any>(`${this.apiBase}/centros`).subscribe({
      next: (r) => {
        const arr = this.normalizeList(r);
        this.centros = arr.map((c: any) => {
          const id = Number(c.id_centro ?? c.id ?? c.ID);
          const serie = String(c.serie_venta ?? c.serie ?? c.codigo ?? '').trim();
          const nombre = String(c.nombre ?? c.descripcion ?? '').trim();
          const etiqueta = serie && nombre ? `${serie} — ${nombre}` : (serie || nombre || `Centro ${id}`);
          return { id_centro: id, nombre: etiqueta };
        });
      },
      error: (e) => console.error('Centros:', e)
    });
  }

  // ----------------- Ejercicio / Periodos -----------------
  private cargarEjercicioActivo(): void {
    const svc: any = this.api;
    const fn =
      svc.getEjercicioActivo ||
      svc.fetchEjercicioActivo ||
      svc.getEjercicio ||
      svc.fetchEjercicio ||
      svc.listEjercicios ||
      svc.getEjercicios;

    if (typeof fn !== 'function') {
      console.warn('⚠ No existe método de API para Ejercicio.');
      this.ejercicioActual = null;
      this.ejercicios = [];
      return;
    }

    const isList = (fn === svc.listEjercicios || fn === svc.getEjercicios);

    fn.call(svc).subscribe({
      next: (r: any) => {
        const items = isList ? this.normalizeList(r) : [r];

        this.ejercicios = items
          .map((e: any) => this.normalizeEjercicio(e))
          .filter((e: Ejercicio | null): e is Ejercicio => !!e)
          .filter((e: Ejercicio) => {
            const activoFlag = e.activo === true || e.activo === 1 || e.activo === '1';
            const hoy = this.todayISO();
            const fi = this.fmtDate(e.fecha_inicio);
            const ff = this.fmtDate(e.fecha_fin);
            const dentroDeFechas = !!(fi && ff && fi <= hoy && hoy <= ff && fi !== '—' && ff !== '—');
            return activoFlag || dentroDeFechas;
          });

        const elegido =
          items.find((x: any) => x?.is_selected) ??
          items.find((x: any) => {
            const fi = this.fmtDate(x?.fecha_inicio ?? x?.inicio);
            const ff = this.fmtDate(x?.fecha_fin ?? x?.fin);
            const hoy = this.todayISO();
            return fi && ff && fi !== '—' && ff !== '—' && fi <= hoy && hoy <= ff;
          }) ??
          items[0];

        this.ejercicioActual = this.normalizeEjercicio(elegido);
        this.ejercicioActualId = Number(this.ejercicioActual?.id_ejercicio ?? NaN);

        this.applyPeriodoFilter();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar ejercicio:', err);
        this.ejercicioActual = null;
        this.ejercicios = [];
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo cargar el ejercicio actual.' });
      }
    });
  }

  public esPosteable(c: Partial<Pick<Cuenta, 'posteable'>> | any): boolean {
    const v = c?.posteable;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v === 1;
    if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    return false;
  }

  onEjercicioSeleccionado(id: any) {
    const ejercicioId = Number(id);
    const seleccionado = this.ejercicios.find(e => Number(e.id_ejercicio) === ejercicioId);

    if (seleccionado) {
      this.ejercicioActual = seleccionado;
      this.ejercicioActualId = ejercicioId;
      this.guardarEjercicioSeleccionado(ejercicioId);
      this.applyPeriodoFilter();
    }
  }

  private guardarEjercicioSeleccionado(id_ejercicio: number) {
    const svc: any = this.api;
    if (typeof svc.selectEjercicio !== 'function') {
      console.warn('⚠ No hay método API selectEjercicio(). Se continúa sin persistir selección.');
    } else {
      svc.selectEjercicio(id_ejercicio).subscribe({
        next: () => this.showToast({
          type: 'success',
          title: 'Ejercicio actualizado',
          message: `Se guardó el ejercicio ${id_ejercicio} como activo.`
        }),
        error: (err: any) => {
          console.error('❌ Error al guardar ejercicio seleccionado:', err);
          this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo actualizar el ejercicio seleccionado.' });
        }
      });
    }
  }

  private cargarPeriodosAll() {
    const svc: any = this.api;
    const fn = svc.getPeriodos || svc.listPeriodos || null;

    if (typeof fn === 'function') {
      fn.call(svc).subscribe({
        next: (r: any) => {
          const items = this.normalizeList(r);
          this.allPeriodos = items.map((p: any) => ({
            id_periodo: Number(p.id_periodo ?? p.id ?? p.ID),
            id_ejercicio: this.toNumOrNull(p.id_ejercicio ?? p.ejercicio_id ?? p.ejercicio ?? p.idEjercicio ?? p.ID_EJERCICIO),
            fecha_inicio: this.fmtDate(p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini),
            fecha_fin: this.fmtDate(p.fecha_fin ?? p.fechaFin ?? p.fin ?? p.end_date ?? p.fecha_fin),
            _raw: p
          }));
          this.applyPeriodoFilter();
        },
        error: (err: any) => {
          console.error('Periodos(svc):', err);
          this.cargarPeriodosAllHttp();
        }
      });
      return;
    }
    this.cargarPeriodosAllHttp();
  }

  private cargarPeriodosAllHttp() {
    this.http.get<any>(`${this.apiBase}/periodos`).subscribe({
      next: (r) => {
        const items = this.normalizeList(r);
        this.allPeriodos = items.map((p: any) => ({
          id_periodo: Number(p.id_periodo ?? p.id ?? p.ID),
          id_ejercicio: this.toNumOrNull(p.id_ejercicio ?? p.ejercicio_id ?? p.ejercicio ?? p.idEjercicio ?? p.ID_EJERCICIO),
          fecha_inicio: this.fmtDate(p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini),
          fecha_fin: this.fmtDate(p.fecha_fin ?? p.fechaFin ?? p.fin ?? p.end_date ?? p.fecha_fin),
          _raw: p
        }));
        this.applyPeriodoFilter();
      },
      error: (e) => console.error('Periodos(http):', e)
    });
  }

  private applyPeriodoFilter(): void {
    if (!Array.isArray(this.allPeriodos) || this.allPeriodos.length === 0) {
      this.periodos = [];
      return;
    }

    const ej = this.ejercicioActual;
    let filtrados: typeof this.allPeriodos = [];

    if (!ej) {
      filtrados = this.allPeriodos.slice();
    } else {
      const idEj = Number(ej.id_ejercicio);
      const ejIni = this.fmtDate(ej.fecha_inicio ?? null);
      const ejFin = this.fmtDate(ej.fecha_fin ?? null);

      filtrados = this.allPeriodos.filter(p => Number.isFinite(p.id_ejercicio) && p.id_ejercicio === idEj);

      if (filtrados.length === 0 && ejIni && ejFin && ejIni !== '—' && ejFin !== '—') {
        filtrados = this.allPeriodos.filter(p => {
          const pi = p.fecha_inicio, pf = p.fecha_fin;
          if (!pi || !pf || pi === '—' || pf === '—') return false;
          return (pi <= ejFin) && (pf >= ejIni);
        });
      }
    }

    const selId = Number(this.poliza?.id_periodo);
    if (Number.isFinite(selId) && !filtrados.some(p => Number(p.id_periodo) === selId)) {
      const found = this.allPeriodos.find(p => Number(p.id_periodo) === selId);
      if (found) filtrados = [found, ...filtrados];
    }

    this.periodos = filtrados.map(p => ({
      id_periodo: Number(p.id_periodo),
      nombre: `${p.fecha_inicio ?? '—'} — ${p.fecha_fin ?? '—'}`
    }));
  }

  get ejercicioLabel(): string {
    const e = this.ejercicioActual;
    if (!e) return '—';
    const nombre = (e.nombre && e.nombre !== '—') ? e.nombre : (e.fecha_inicio && e.fecha_fin ? `${e.fecha_inicio} — ${e.fecha_fin}` : '');
    return nombre || '—';
  }

  // ----------------- Póliza + movimientos -----------------
  cargarPoliza(id: number) {
    const ORDER_KEY = (pid: number) => `polizaOrder:${pid}`;

    const loadSavedOrder = (pid: number): number[] => {
      try { return JSON.parse(localStorage.getItem(ORDER_KEY(pid)) || '[]'); }
      catch { return []; }
    };

    const saveOrder = (pid: number, movs: MovimientoUI[]) => {
      const ids = movs.map(m => Number(m.id_movimiento)).filter(n => Number.isFinite(n));
      try { localStorage.setItem(ORDER_KEY(pid), JSON.stringify(ids)); } catch { }
    };

    const getTime = (m: any) => {
      const s = m?.created_at ?? m?.fecha ?? null;
      const t = s ? Date.parse(String(s)) : NaN;
      return Number.isFinite(t) ? t : NaN;
    };

    this.loading = true;
    this.http.get<any>(`${this.apiBase}/poliza/${id}/movimientos`).subscribe({
      next: (res) => {
        const savedOrderIds = loadSavedOrder(Number(res?.id_poliza ?? id));
        const savedRank = new Map<number, number>(savedOrderIds.map((mid, i) => [Number(mid), i]));

        const movs: MovimientoUI[] = (res?.movimientos ?? []).map((m: any, idx: number) => {
          const mm: MovimientoUI = this.normalizeMovimiento(m) as MovimientoUI;

          (mm as any)._arrival = idx;
          mm.orden = (typeof m?.orden === 'number') ? Number(m.orden) : idx;

          const c = this.cuentasMap.get(Number((mm as any).id_cuenta || 0));
          (mm as any)._cuentaQuery = c ? `${c.codigo} — ${c.nombre}` : ((mm as any)._cuentaQuery ?? '');

          return mm;
        });

        const rank = (m: MovimientoUI) => {
          const idm = Number((m as any).id_movimiento);
          if (Number.isFinite(idm) && savedRank.has(idm)) return { type: 0 as const, v: savedRank.get(idm)! };
          const t = getTime(m);
          if (Number.isFinite(t)) return { type: 1 as const, v: t };
          if (Number.isFinite(idm)) return { type: 2 as const, v: idm };
          return { type: 3 as const, v: Number((m as any)._arrival) || Number.MAX_SAFE_INTEGER };
        };

        movs.sort((a, b) => {
          const ra = rank(a), rb = rank(b);
          if (ra.type !== rb.type) return ra.type - rb.type;
          if (ra.v !== rb.v) return ra.v - rb.v;
          const aa = Number((a as any)._arrival) || 0;
          const ab = Number((b as any)._arrival) || 0;
          return aa - ab;
        });

        movs.forEach((m, i) => {
          if (!Number.isFinite(Number(m.orden))) m.orden = i;
        });

        saveOrder(Number(res?.id_poliza ?? id), movs);

        const idPeriodoRaw = Number(res?.id_periodo);
        const idPeriodo = Number.isFinite(idPeriodoRaw) ? idPeriodoRaw : undefined;

        this.poliza = {
          id_poliza: res?.id_poliza,
          id_tipopoliza: Number(res?.id_tipopoliza),
          id_periodo: idPeriodo,
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

        this.applyPeriodoFilter();
        this.cuentasFiltradas = new Array(this.poliza.movimientos?.length || 0).fill([]);
        this.prefillCuentaQueries();
      },
      error: (err) => {
        console.error('Poliza cargar:', err);
        this.errorMsg = err?.error?.message ?? 'No se pudo cargar la póliza.';
        this.showToast({ type: 'warning', title: 'Aviso', message: this.errorMsg });
      },
      complete: () => (this.loading = false)
    });
  }

  private normalizeMovimiento(m: any): MovimientoUI {
    const base: MovimientoUI = {
      id_cuenta: this.toNumOrNull(m?.id_cuenta),
      ref_serie_venta: this.toStrOrNull(m?.ref_serie_venta) ?? '',
      operacion: (m?.operacion ?? '').toString(),
      monto: this.toNumOrNull(m?.monto),
      cliente: this.toStrOrNull(m?.cliente) ?? '',
      fecha: this.toDateOrNull(m?.fecha) ?? '',
      cc: this.toNumOrNull(m?.cc),
      uuid: this.toStrOrNull(m?.uuid) ?? null,
      id_poliza: this.toNumOrNull(m?.id_poliza) ?? undefined,
      ...(m?.id_movimiento != null ? { id_movimiento: Number(m.id_movimiento) } : {})
    } as any;

    if (typeof m?.orden === 'number') base.orden = Number(m.orden);
    return base;
  }

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

  private lockBodyScroll(on: boolean) {
    try {
      document.body.style.overflow = on ? 'hidden' : '';
    } catch { }
  }

  // ----------------- Actualizar póliza -----------------
  actualizarPoliza(): void {
    if (!this.poliza?.id_poliza) {
      this.showToast({ type: 'warning', title: 'Aviso', message: 'No se encontró el ID de la póliza.' });
      return;
    }

    const cargos = this.getTotal('0');
    const abonos = this.getTotal('1');
    if (Math.abs(cargos - abonos) > 0.001) {
      this.showToast({ type: 'warning', title: 'Partida doble', message: `No cuadra.\nCargos: ${cargos}\nAbonos: ${abonos}` });
      return;
    }

    const p = this.poliza;

    (p.movimientos ?? []).forEach((m, idx) => { m.orden = idx; });

    this.lastOrderMap.clear();
    (p.movimientos ?? []).forEach((m, idx) => {
      const idMov = Number((m as any)?.id_movimiento);
      if (Number.isFinite(idMov)) this.lastOrderMap.set(idMov, idx);
    });

    const payloadHeader = {
      id_tipopoliza: this.toNumOrNull(p.id_tipopoliza)!,
      id_periodo: this.toNumOrNull(p.id_periodo)!,
      id_usuario: this.toNumOrNull(p.id_usuario)!,
      id_centro: this.toNumOrNull(p.id_centro)!,
      folio: this.toStrOrNull(p.folio)!,
      concepto: this.toStrOrNull(p.concepto)!,
    };
    console.log('Periodo seleccionado:', payloadHeader.id_periodo);

    const movs = (p.movimientos ?? []) as MovimientoUI[];

    const toUpdate = movs.filter(m =>
      m.id_movimiento != null &&
      this.toNumOrNull(m.id_cuenta) != null &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );

    const toCreate = movs.filter(m =>
      m.id_movimiento == null &&
      this.toNumOrNull(m.id_cuenta) != null &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );

    this.updating = true;

    const updateReqs = toUpdate.map((m, i) =>
      this.apiSvc.updateMovPoliza(m.id_movimiento!, {
        id_cuenta: this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto: this.toNumOrNull(m.monto),
        cliente: this.toStrOrNull(m.cliente),
        fecha: this.toDateOrNull(m.fecha),
        cc: this.toNumOrNull(m.cc),
        uuid: this.toStrOrNull(m.uuid),
        orden: this.toNumOrNull(m.orden),
      }).pipe(
        catchError(err => throwError(() => this.annotateError(err, {
          i, uuid: m.uuid ?? null, id_mov: m.id_movimiento
        })))
      )
    );

    const createReqs = toCreate.map((m, i) =>
      this.apiSvc.createMovPoliza({
        id_poliza: this.poliza!.id_poliza,
        id_cuenta: this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto: this.toNumOrNull(m.monto),
        cliente: this.toStrOrNull(m.cliente),
        fecha: this.toDateOrNull(m.fecha),
        cc: this.toNumOrNull(m.cc),
        uuid: this.toStrOrNull(m.uuid),
        orden: this.toNumOrNull(m.orden),
      }).pipe(
        catchError(err => throwError(() => this.annotateError(err, {
          i, uuid: m.uuid ?? null, id_mov: undefined
        })))
      )
    );

    const reqs = [...updateReqs, ...createReqs];
    this.saving = true;
    this.saveTotal = reqs.length;
    this.saveDone = 0;
    this.lockBodyScroll(true);

    this.apiSvc.updatePoliza(this.poliza.id_poliza!, payloadHeader).pipe(
      switchMap(() => {
        this.showToast({ type: 'success', title: 'Encabezado actualizado', message: 'Guardando movimientos…' });

        return (reqs.length
          ? from(reqs).pipe(
            concatMap((obs) => obs.pipe(
              tap({
                next: () => this.saveDone++,
                error: () => this.saveDone++
              })
            )),
            finalize(() => {
              this.showToast({ type: 'success', title: 'Listo', message: 'Movimientos guardados.' });
            })
          )
          : of(null)
        );
      }),
      finalize(() => {
        this.saving = false;
        this.saveTotal = 0;
        this.saveDone = 0;
        this.lockBodyScroll(false);
        this.updating = false;
      })
    ).subscribe({
      next: () => {
        const msg = [
          `Póliza actualizada.`,
          toUpdate.length ? ` Movs actualizados: ${toUpdate.length}.` : '',
          toCreate.length ? ` Movs creados: ${toCreate.length}.` : ''
        ].join('');
        this.showToast({ type: 'success', title: 'Listo', message: msg.trim() });
        this.cargarPoliza(this.poliza!.id_poliza!);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Error al actualizar póliza/movimientos';
        console.error('Actualizar:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: msg });
      }
    });
  }

  private inferNivelFromCodigo(codigoRaw: string | null | undefined): number {
    const codigo = (codigoRaw ?? '').toString();
    if (!codigo) return 0;

    // Dejar solo dígitos
    const digits = codigo.replace(/\D/g, '');
    if (!digits) return 0;

    // Quitar ceros de la derecha (relleno)
    const trimmed = digits.replace(/0+$/g, '');
    const len = trimmed.length;

    if (len <= 1) return 0; // 1
    if (len <= 2) return 1; // 11
    if (len <= 4) return 2; // 1101
    if (len <= 6) return 3; // 110101
    if (len <= 8) return 4; // 11010101
    return 5;               // 1101010101 o más largo
  }
  // ----------------- Cuentas -----------------
  private cargarCuentas() {
    this.cuentasSvc.getCuentas().subscribe({
      next: (arr: any) => {
        // 1) Normalizar respuesta
        const items = this.normalizeList(arr);

        // 2) Construir árbol con parentId
        type NodoBase = {
          id: number;
          codigo: string;
          nombre: string;
          parentId: number | null;
          posteable: boolean;
          ctaMayor: boolean;
          hijos: NodoBase[];
        };

        const nodos: NodoBase[] = (items || [])
          .map((x: any) => {
            const id = Number(x.id_cuenta ?? x.id ?? x.ID);
            const codigo = String(x.codigo ?? x.clave ?? x.CODIGO ?? '').trim();
            const nombre = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? '').trim();

            const parentIdRaw = x.parentId ?? x.parent_id ?? null;
            const parentId = parentIdRaw != null ? Number(parentIdRaw) : null;

            const posteableRaw =
              x.posteable ??
              x.es_posteable ??
              x.posteable_flag ??
              x.posteable_indicator;

            const ctaMayorRaw =
              x.ctaMayor ??
              x.cta_mayor ??
              x.es_mayor ??
              x.mayor_flag;

            const posteable =
              posteableRaw === true ||
              posteableRaw === 1 ||
              posteableRaw === '1';

            const ctaMayor =
              ctaMayorRaw === true ||
              ctaMayorRaw === 1 ||
              ctaMayorRaw === '1';

            return <NodoBase>{
              id,
              codigo,
              nombre,
              parentId,
              posteable,
              ctaMayor,
              hijos: []
            };
          })
          .filter((n: NodoBase) => Number.isFinite(n.id));

        // 3) Enlazar hijos con padres
        const porId = new Map<number, NodoBase>();
        nodos.forEach(n => porId.set(n.id, n));

        const raices: NodoBase[] = [];
        porId.forEach(nodo => {
          if (nodo.parentId) {
            const padre = porId.get(nodo.parentId);
            if (padre) {
              padre.hijos.push(nodo);
            } else {
              raices.push(nodo);
            }
          } else {
            raices.push(nodo);
          }
        });

        // 4) Ordenar árbol por código
        const sortTree = (n: NodoBase) => {
          n.hijos.sort((a, b) =>
            a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
          );
          n.hijos.forEach(h => sortTree(h));
        };

        raices.sort((a, b) =>
          a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
        );
        raices.forEach(r => sortTree(r));

        // 5) Aplanar árbol en orden jerárquico con nivel
        const resultado: Cuenta[] = [];

        const visitar = (nodo: NodoBase, nivel: number) => {
          const c: Cuenta = {
            id_cuenta: nodo.id,
            codigo: nodo.codigo,
            nombre: nodo.nombre,
            nivel,
            esPadre: nodo.ctaMayor && !nodo.posteable,
            ctaMayor: nodo.ctaMayor,
            posteable: nodo.posteable
          };
          resultado.push(c);

          nodo.hijos.forEach(h => visitar(h, nivel + 1));
        };

        raices.forEach(r => visitar(r, 0));

        // 6) Asignar a this.cuentas y mapas auxiliares
        this.cuentas = resultado;

        this.cuentasMap.clear();
        for (const c of this.cuentas) {
          if (Number.isFinite(c.id_cuenta)) {
            this.cuentasMap.set(c.id_cuenta, c);
          }
        }

        // 7) Lo que se manda al modal (misma referencia, con _expandido)
        this.cuentasParaModal = this.cuentas.map(c => ({
          ...c,
          _expandido: !!c.esPadre,          // padres empiezan expandidos (pon false si los quieres colapsados)
          ctaMayor: !!c.ctaMayor,
          posteable: this.esPosteable(c),
        }));

        // 8) Rellenar etiquetas en movimientos existentes
        this.prefillCuentaQueries();

        console.log('Plan de cuentas (editar, jerárquico):', this.cuentas);
      },
      error: (e) => {
        console.error('Cuentas (editar):', e);
      }
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

  private nextOrden(): number {
    const movs = this.poliza.movimientos ?? [];
    return movs.reduce((mx, m: any) => Math.max(mx, Number(m?.orden ?? -1)), -1) + 1;
  }

  agregarMovimiento(): void {
    const nuevo: MovimientoUI = {
      id_cuenta: null, ref_serie_venta: '', operacion: '',
      monto: null, cliente: '', fecha: '', cc: null, uuid: null,
      _cuentaQuery: '', orden: this.nextOrden(),
    };
    (this.poliza.movimientos ??= []).push(nuevo);
    this.cuentasFiltradas.push([]);
  }

  // ----------------- Confirmación borrar movimiento -----------------
  confirmOpen = false;
  confirmTitle = 'Eliminar movimiento';
  confirmMessage = '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.';
  private confirmIndex: number | null = null;
  deletingIndexSet = new Set<number>();

  openConfirm(index: number) {
    this.poliza.movimientos ??= [];
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
    const idMov = (mov as any)?.id_movimiento as number | undefined;

    this.deletingIndexSet.add(i);

    const finish = () => {
      (this.poliza.movimientos ??= []).splice(i, 1);
      this.cuentasFiltradas.splice(i, 1);
      (this.poliza.movimientos ?? []).forEach((m, idx) => { (m as MovimientoUI).orden = idx; });
    };

    if (!idMov) {
      finish();
      this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
      return;
    }

    this.apiSvc.deleteMovPoliza(idMov).subscribe({
      next: () => {
        finish();
        this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
      },
      error: (err) => {
        this.deletingIndexSet.delete(i);
        const msg = err?.error?.message || err?.error?.error || 'No se pudo eliminar el movimiento.';
        this.showToast({ type: 'warning', title: 'Aviso', message: msg });
      }
    });
  }

  // ----------------- CFDI recientes + XML -----------------
  private cargarCfdiRecientes(): void {
    const svc: any = this.apiSvc as any;
    const fn =
      svc.listCfdi || svc.getCfdi || svc.getCfdiRecientes || svc.listCfdiRecientes;

    const handle = (arr: any[]) => {
      this.cfdiOptions = (arr || [])
        .map((x: any): CfdiOption => ({
          uuid: String(x.uuid ?? x.UUID ?? '').trim(),
          folio: x.folio ?? x.Folio ?? null,
          fecha: x.fecha ?? x.Fecha ?? null,
          total: x.total ?? x.Total ?? null,
        }))
        .filter(o => !!o.uuid);
    };

    if (typeof fn === 'function') {
      fn.call(svc, { limit: 100 })?.subscribe?.({
        next: (r: any) => {
          const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
          handle(arr);
        },
        error: (err: any) => {
          console.warn('CFDI recientes:', err);
          this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar CFDI recientes.' });
        }
      });
    } else {
      this.http.get<any>(`${this.apiBase}/cfdis?limit=100`).subscribe({
        next: (r) => {
          const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
          handle(arr);
        },
        error: () => { }
      });
    }
  }

  triggerXmlPickerForMovimiento(input: HTMLInputElement, index: number): void {
    this.xmlMovimientoIndex = index;
    this.uploadXmlError = '';
    this.selectedXmlName = '';
    input.value = '';
    input.click();
  }

  async onXmlPickedForMovimiento(event: any, index: number): Promise<void> {
    const file: File = event?.target?.files?.[0];
    if (!file) return;

    const isXml = file.type === 'text/xml' || file.type === 'application/xml' || /\.xml$/i.test(file.name);
    if (!isXml) {
      this.uploadXmlError = 'El archivo debe ser .xml';
      this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
      event.target.value = '';
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      this.uploadXmlError = 'El XML excede 1 MB.';
      this.showToast({ type: 'warning', title: 'Archivo pesado', message: this.uploadXmlError });
      event.target.value = '';
      return;
    }

    this.uploadingXml = true;
    this.selectedXmlName = file.name;

    try {
      const ctx = {
        folio: this.poliza?.folio,
        id_periodo: Number(this.poliza?.id_periodo),
        id_centro: Number(this.poliza?.id_centro),
        id_tipopoliza: Number(this.poliza?.id_tipopoliza),
      };

      const response = await firstValueFrom(this.apiSvc.uploadCfdiXml(file, ctx));
      const uuid = response?.uuid || response?.UUID || null;

      if (!uuid) {
        this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
      } else {
        const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
        if (!movs[index]) {
          (this.poliza.movimientos ??= [])[index] = {} as any;
        }
        movs[index].uuid = uuid;

        if (!this.cfdiOptions.some(x => x.uuid === uuid)) {
          this.cfdiOptions = [{ uuid }, ...this.cfdiOptions].slice(0, 100);
        }

        this.showToast({ title: 'XML asociado', message: `UUID ${uuid} vinculado al movimiento ${index + 1}`, type: 'success' });
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Error al subir el XML.';
      this.uploadXmlError = msg;
      this.showToast({ title: 'Aviso', message: msg, type: 'warning' });
    } finally {
      this.uploadingXml = false;
      event.target.value = '';
    }
  }

  onUuidChange(uuid?: string) {
    this.uuidSeleccionado = uuid || undefined;
  }

  aplicarUuidAlMovimiento(index: number) {
    if (!this.uuidSeleccionado) return;

    const movs = (this.poliza?.movimientos as any[]) || [];
    const mov = movs[index];
    if (!mov) return;

    const uuid = this.uuidSeleccionado;
    mov.uuid = uuid;

    const idMov = Number(mov?.id_movimiento);
    if (Number.isFinite(idMov) && this.poliza?.id_poliza) {
      this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, [idMov]).subscribe({
        next: () => {
          this.showToast({ type: 'success', title: 'UUID aplicado', message: `Se aplicó ${uuid} al movimiento #${index + 1}.` });
        },
        error: (err) => {
          const msg = err?.error?.message || err?.message || 'No se pudo vincular el UUID en servidor.';
          this.showToast({ type: 'warning', title: 'Aviso', message: msg });
        }
      });
    } else {
      this.showToast({ type: 'info', title: 'UUID aplicado', message: `Se aplicó ${uuid}. Se guardará al actualizar la póliza.` });
    }
  }

  vincularUuidAMovimientosExistentes(uuid: string, movimientoIds: number[]) {
    if (!this.poliza?.id_poliza || !uuid || !movimientoIds?.length) return;
    this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, movimientoIds).subscribe({
      next: () => this.showToast({ type: 'success', title: 'UUID vinculado', message: `Se vinculó ${uuid} a ${movimientoIds.length} movimientos.` }),
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'No se pudo vincular el UUID en servidor.';
        this.showToast({ type: 'warning', title: 'Aviso', message: msg });
      }
    });
  }

  // ----------------- Centros de costo -----------------
  private getCentros(): void {
    const svc: any = this.api as any;
    const fn =
      svc.getCentrosCosto ||
      svc.listCentrosCosto ||
      svc.getCentroCostos ||
      svc.listCentroCostos ||
      svc.getCentrosDeCosto ||
      svc.listCentrosDeCosto ||
      svc.getCentros;

    if (typeof fn !== 'function') {
      console.warn(
        'No existe método de API para Centros de Costo; usando vacío.'
      );
      this.centrosCosto = [];
      this.centrosCostoMap.clear();
      return;
    }

    fn.call(this.api).subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);

        type RawCentro = CentroCostoItem & { children?: RawCentro[] };

        const crudos: RawCentro[] = (items || [])
          .map((x: any) => {
            const id = Number(x.id_centro ?? x.id ?? x.ID);
            const parentRaw =
              x.parent_id ??
              x.parentId ??
              x.id_centro_padre ??
              x.centro_padre ??
              null;
            const parent_id =
              parentRaw != null && parentRaw !== ''
                ? Number(parentRaw)
                : null;

            const serie = String(
              x.serie_venta ?? x.serie ?? x.codigo ?? ''
            ).trim();
            const nom = String(
              x.nombre ??
              x.nombre_centro ??
              x.descripcion ??
              x.NOMBRE ??
              ''
            ).trim();
            const clave = String(x.clave ?? x.codigo ?? '').trim();
            const etiqueta = serie
              ? `${serie} — ${nom}`
              : clave
                ? `${clave} — ${nom}`
                : nom || `CC ${id}`;

            return {
              id_centrocosto: id,
              parent_id,
              nombre: etiqueta,
              clave,
              serie_venta: serie,
            } as RawCentro;
          })
          .filter((cc: RawCentro) => Number.isFinite(cc.id_centrocosto));

        const porId = new Map<number, RawCentro>();
        crudos.forEach(c => porId.set(c.id_centrocosto, { ...c, children: [] }));

        const raices: RawCentro[] = [];
        porId.forEach(node => {
          if (
            node.parent_id != null &&
            porId.has(node.parent_id)
          ) {
            porId.get(node.parent_id)!.children!.push(node);
          } else {
            raices.push(node);
          }
        });

        const sortTree = (n: RawCentro) => {
          n.children!.sort((a, b) => {
            const ka = `${a.serie_venta} ${a.nombre}`.toLowerCase();
            const kb = `${b.serie_venta} ${b.nombre}`.toLowerCase();
            return ka.localeCompare(kb, undefined, { numeric: true });
          });
          n.children!.forEach(h => sortTree(h));
        };
        raices.sort((a, b) => {
          const ka = `${a.serie_venta} ${a.nombre}`.toLowerCase();
          const kb = `${b.serie_venta} ${b.nombre}`.toLowerCase();
          return ka.localeCompare(kb, undefined, { numeric: true });
        });
        raices.forEach(r => sortTree(r));

        const resultado: CentroCostoItem[] = [];

        const visitar = (n: RawCentro, nivel: number) => {
          const hijos = n.children ?? [];
          resultado.push({
            id_centrocosto: n.id_centrocosto,
            parent_id: n.parent_id,
            nombre: n.nombre,
            clave: n.clave,
            serie_venta: n.serie_venta,
            nivel,
            esPadre: hijos.length > 0,
            posteable: true,
            _expandido: nivel === 0,
          });

          hijos.forEach(h => visitar(h, nivel + 1));
        };

        raices.forEach(r => visitar(r, 0));

        // 4) Guardar en la VM
        this.centrosCosto = resultado;
        this.centrosCostoMap = new Map(
          this.centrosCosto.map(cc => [cc.id_centrocosto, cc])
        );

        this.centrosCostoComoCuentas = this.centrosCosto.map(cc => ({
          id_cuenta: cc.id_centrocosto,
          codigo: cc.clave || cc.serie_venta || '',
          nombre: cc.nombre,
          nivel: cc.nivel ?? 0,
          esPadre: cc.esPadre ?? false,
          posteable: true,
          _expandido: cc._expandido ?? (cc.nivel === 0),
        }));

      },
      error: (err: any) => {
        console.error('Centros de Costo:', err);
        this.showToast({
          type: 'warning',
          title: 'Aviso',
          message: 'No se pudieron cargar Centros de Costo.',
        });
        this.centrosCosto = [];
        this.centrosCostoMap.clear();
      },
    });
  }

  labelCentroHeader(id: number | null | undefined): string {
    if (!id) return 'Seleccione…';
    const c = this.centrosCosto.find(
      x => Number(x.id_centrocosto) === Number(id)
    );
    return c ? c.nombre : 'Seleccione…';
  }

  abrirModalCentro(): void {
    this.modalCentroAbierto = true;
    this.centroSeleccionadoModal = null;
  }

  cerrarModalCentro(): void {
    this.modalCentroAbierto = false;
  }

  onCentroSeleccionadoModal(cuentaCentro: any): void {
    const idCentro = Number(
      cuentaCentro?.id_cuenta ??
      cuentaCentro?.id_centrocosto ??
      cuentaCentro?.id ??
      null
    );

    if (!Number.isFinite(idCentro)) {
      this.showToast({
        type: 'warning',
        title: 'Centro',
        message: 'No se pudo determinar el centro seleccionado.'
      });
      this.modalCentroAbierto = false;
      return;
    }
    const oldCentro = this.toNumOrNull(this.poliza.id_centro);

    this.poliza.id_centro = idCentro;
    this.propagarCentroEnMovimientos(oldCentro, idCentro);

    this.modalCentroAbierto = false;
  }

  private propagarCentroEnMovimientos(oldCentroId: number | null, newCentroId: number): void {
    const movs = (this.poliza?.movimientos ?? []) as MovimientoUI[];
    if (!movs.length) return;

    const oldSerie = oldCentroId ? this.getSerieVentaByCcId(oldCentroId) : null;
    const newSerie = this.getSerieVentaByCcId(newCentroId);

    movs.forEach((m) => {
      const ccNum = this.toNumOrNull(m.cc);

      if (!ccNum || (oldCentroId && ccNum === oldCentroId)) {
        m.cc = newCentroId;
      }

      const refStr = (m.ref_serie_venta ?? '').toString().trim();

      const debeActualizarSerie =
        !refStr ||
        (oldSerie && refStr === oldSerie);

      if (newSerie && debeActualizarSerie) {
        m.ref_serie_venta = newSerie;
      }
    });
  }

  private getSerieVentaByCcId(ccId?: number | null): string | null {
    if (ccId == null) return null;
    const cc = this.centrosCostoMap.get(Number(ccId));
    const serie = (cc as any)?.serie_venta ?? null;
    return (typeof serie === 'string' && serie.trim()) ? String(serie).trim() : null;
  }

  // ----------------- Helpers de error -----------------
  private extractHttpErrorMessage(err: any): string {
    const e = err || {};
    const tryPaths = [
      e.error?.message,
      e.error?.error,
      e.error?.details,
      e.message,
      (typeof e.error === 'string' ? e.error : ''),
      (typeof e === 'string' ? e : '')
    ].filter(Boolean);

    let msg = tryPaths.find(Boolean) || 'Error desconocido.';
    if (typeof msg !== 'string') msg = JSON.stringify(msg);

    if (/cfdi|uuid|comprobante/i.test(msg)) {
      return `CFDI/UUID: ${msg}`;
    }
    return msg;
  }

  private annotateError(err: any, ctx: { i: number; uuid?: string | null; id_mov?: number | undefined }) {
    const normalized = new Error(this.extractHttpErrorMessage(err));
    (normalized as any).__ctx = ctx;
    return normalized;
  }

  onMovimientoCcChange(index: number, ccId: any): void {
    const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
    if (!movs[index]) return;

    const ccNum = this.toNumOrNull(ccId);
    movs[index].cc = ccNum;

    const serie = this.getSerieVentaByCcId(ccNum ?? undefined);
    if (serie && (!movs[index].ref_serie_venta || !String(movs[index].ref_serie_venta).trim())) {
      movs[index].ref_serie_venta = serie;
    }
  }

  // ----------------- Exportar / utilidades de archivo -----------------
  private descargarBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private xmlEscape(s: any): string {
    const str = (s ?? '').toString();
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private buildPolizaXMLInterno(): string {
    const p = this.poliza || {};
    const movs = (p.movimientos || []) as any[];

    const head = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<Poliza id="${this.xmlEscape(p.id_poliza)}" folio="${this.xmlEscape(p.folio)}"`,
      `        tipo="${this.xmlEscape(p.id_tipopoliza)}" periodo="${this.xmlEscape(p.id_periodo)}"`,
      `        centro="${this.xmlEscape(p.id_centro)}" usuario="${this.xmlEscape(p.id_usuario)}">`,
      `  <Concepto>${this.xmlEscape(p.concepto)}</Concepto>`,
      `  <FechaCreacion>${this.xmlEscape(p.fecha_creacion || p.created_at)}</FechaCreacion>`,
      `  <Movimientos>`
    ].join('\n');

    const body = movs.map((m, i) => [
      `    <Movimiento index="${i + 1}">`,
      `      <Cuenta id="${this.xmlEscape(m.id_cuenta)}"/>`,
      `      <Operacion>${this.xmlEscape(m.operacion)}</Operacion>`,
      `      <Monto>${this.xmlEscape(m.monto)}</Monto>`,
      `      <Cliente>${this.xmlEscape(m.cliente)}</Cliente>`,
      `      <Fecha>${this.xmlEscape(m.fecha)}</Fecha>`,
      `      <CentroCosto>${this.xmlEscape(m.cc)}</CentroCosto>`,
      `      <RefSerieVenta>${this.xmlEscape(m.ref_serie_venta)}</RefSerieVenta>`,
      `      <UUID>${this.xmlEscape(m.uuid)}</UUID>`,
      `    </Movimiento>`
    ].join('\n')).join('\n');

    const tail = [
      `  </Movimientos>`,
      `</Poliza>`
    ].join('\n');

    return `${head}\n${body}\n${tail}\n`;
  }

  // ----------------- Índices / helpers de presentación -----------------
  private cuentasIndex?: Record<string | number, { codigo: string; nombre?: string }>;

  private ensureCuentasIndex() {
    if (this.cuentasIndex) return;
    const src = (this as any).cuentas || (this as any).allCuentas || [];
    this.cuentasIndex = {};
    for (const c of src || []) {
      const id = c.id_cuenta ?? c.id ?? c.pk ?? c.codigo;
      const codigo = c.codigo ?? c.code ?? c.clave ?? String(id ?? '');
      const nombre = c.nombre ?? c.descripcion ?? c.name ?? '';
      if (id != null) this.cuentasIndex[id] = { codigo: String(codigo), nombre: nombre || undefined };
    }
  }

  private resolvePolizaNombre(p: any) {
    const folio = p?.folio ?? p?.id_poliza ?? '';
    return (
      p?.nombre ??
      p?.titulo ??
      p?.descripcion ??
      p?.concepto ??
      (folio ? `Póliza ${folio}` : 'Póliza')
    );
  }

  private periodoLabelById(id?: number | null): string {
    if (!Number.isFinite(Number(id))) return '';
    const p = this.allPeriodos.find(x => Number(x.id_periodo) === Number(id));
    if (!p) return '';
    const ini = p.fecha_inicio ?? '—';
    const fin = p.fecha_fin ?? '—';
    return `${ini} — ${fin}`;
  }

  private resolvePeriodoRango(p: any) {
    const per = p?.Periodo ?? p?.periodo ?? {};
    const ini = per?.fecha_inicio ?? per?.inicio ?? p?.periodo_inicio ?? p?.fecha_inicio ?? null;
    const fin = per?.fecha_fin ?? per?.fin ?? p?.periodo_fin ?? p?.fecha_fin ?? null;

    const iniF = ini ? this.fmtDate(ini) : '';
    const finF = fin ? this.fmtDate(fin) : '';

    if (iniF || finF) {
      if (!iniF && finF) return `— ${finF}`;
      if (iniF && !finF) return `${iniF} —`;
      return `${iniF} — ${finF}`;
    }
    return this.periodoLabelById(this.toNumOrNull(p?.id_periodo));
  }

  private resolveCuenta(m: any) {
    this.ensureCuentasIndex();
    const fromMovCodigo =
      m?.cuenta?.codigo ?? m?.codigo_cuenta ?? m?.cuenta_codigo ?? m?.Cuenta?.codigo ?? null;
    const fromMovNombre =
      m?.cuenta?.nombre ?? m?.cuenta_nombre ?? m?.Cuenta?.nombre ?? null;

    const fromIndex = (m?.id_cuenta != null && this.cuentasIndex?.[m.id_cuenta]) ? this.cuentasIndex![m.id_cuenta] : undefined;

    const codigo = String(fromMovCodigo ?? fromIndex?.codigo ?? m?.id_cuenta ?? '');
    const nombre = String(fromMovNombre ?? fromIndex?.nombre ?? '') || undefined;

    return { codigo, nombre };
  }

  private cuentaEtiqueta(m: any) {
    const { codigo, nombre } = this.resolveCuenta(m);
    return nombre ? `${codigo} — ${nombre}` : codigo;
  }

  private fmtMoney(v: any) {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);
  }

  private opLabel(op: any) {
    return String(op) === '1' || op === 1 ? 'Abono' : 'Cargo';
  }
  private safeStr(v: any) { return (v ?? '').toString(); }

  private buildTablaMovimientosPresentacion() {
    const movs = (this.poliza?.movimientos ?? []) as any[];
    return movs.map((m: any, i: number) => {
      const { codigo } = this.resolveCuenta(m);
      return {
        '#': i + 1,
        'Cuenta': codigo,
        'Operación': this.opLabel(m.operacion),
        'Monto': Number(m.monto ?? 0),
        'Cliente / Concepto': this.safeStr(m.cliente || m.concepto),
        'Fecha': this.fmtDate(m.fecha),
        'CC': m.cc ?? '',
        'Serie Venta': this.safeStr(m.ref_serie_venta),
        'UUID': this.safeStr(m.uuid),
      };
    });
  }

  private tiposPolizaIndex?: Record<string | number, string>;
  private ensureTiposPolizaIndex() {
    if (this.tiposPolizaIndex) return;
    const src = (this as any).tiposPoliza || (this as any).catalogoTipos || [];
    this.tiposPolizaIndex = {};
    for (const t of src || []) {
      const id = t.id_tipopoliza ?? t.id ?? t.pk;
      const desc = t.descripcion ?? t.nombre ?? t.label ?? '';
      if (id != null) this.tiposPolizaIndex[id] = String(desc || id);
    }
  }
  private resolveTipoLabel(p: any) {
    const fromRel = p?.TipoPoliza?.descripcion ?? p?.TipoPoliza?.nombre ?? null;
    this.ensureTiposPolizaIndex();
    const fromIdx = (p?.id_tipopoliza != null) ? this.tiposPolizaIndex?.[p.id_tipopoliza] : null;
    return fromRel || fromIdx || String(p?.id_tipopoliza ?? '');
  }

  private centrosSerieMap = new Map<number, string>();

  private headerPolizaProfesional() {
    const p: any = this.poliza || {};
    return {
      'Póliza': this.resolvePolizaNombre(p),
      'Folio': p.folio ?? '',
      'Tipo': this.resolveTipoLabel(p),
      'Periodo': this.resolvePeriodoRango(p),
      'Centro (id_centro)': p.id_centro ?? '',
      'Usuario (id_usuario)': p.id_usuario ?? '',
      'Concepto': p.concepto ?? '',
      'Fecha creación': this.fmtDate(p.fecha_creacion || p.created_at || ''),
    };
  }

  private buildHeaderPairs(headerObj: Record<string, any>) {
    const entries = Object.entries(headerObj).map(([k, v]) => [k, String(v)]);
    const rows: any[][] = [];
    for (let i = 0; i < entries.length; i += 2) {
      const a = entries[i];
      const b = entries[i + 1] || ['', ''];
      rows.push([a[0], a[1], b[0], b[1]]);
    }
    return rows;
  }

  async exportarPDFPoliza() {
    try {
      const [{ default: jsPDF }, autoTable] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const left = 40, top = 40, line = 18;

      const folioTxt = String(this.poliza?.folio || this.poliza?.id_poliza || '');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
      doc.text(`Póliza ${folioTxt}`, left, top);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const hoy = new Date();
      doc.text(`Generado: ${new Intl.DateTimeFormat('es-MX', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(hoy)}`, left, top + line);

      const headerPairs = this.buildHeaderPairs(this.headerPolizaProfesional());
      (autoTable as any).default(doc, {
        startY: top + line * 2,
        head: [['Campo', 'Valor', 'Campo', 'Valor']],
        body: headerPairs,
        styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
        headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: 'bold' },
        theme: 'striped',
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 165 },
          2: { cellWidth: 90 },
          3: { cellWidth: 170 },
        },
        margin: { left, right: left },
      });

      const data = this.buildTablaMovimientosPresentacion();
      const startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 18 : 160;

      (autoTable as any).default(doc, {
        startY,
        head: [['#', 'Cuenta', 'Operación', 'Monto', 'Cliente / Concepto', 'Fecha', 'CC', 'Serie Venta', 'UUID']],
        body: data.map(r => [
          r['#'], r['Cuenta'], r['Operación'], this.fmtMoney(r['Monto']),
          r['Cliente / Concepto'], r['Fecha'], r['CC'], r['Serie Venta'], r['UUID']
        ]),
        styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: 'bold' },
        theme: 'striped',
        columnStyles: {
          0: { halign: 'right', cellWidth: 22 },
          1: { cellWidth: 60 },
          2: { cellWidth: 50 },
          3: { halign: 'right', cellWidth: 58 },
          4: { cellWidth: 140 },
          5: { cellWidth: 50 },
          6: { cellWidth: 32 },
          7: { cellWidth: 56 },
          8: { cellWidth: 47 },
        },
        margin: { left, right: left },
        didDrawPage: () => {
          const page = `${doc.getCurrentPageInfo().pageNumber} / ${doc.getNumberOfPages()}`;
          doc.setFontSize(9); doc.setTextColor(120);
          doc.text(page, doc.internal.pageSize.getWidth() - left, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
        },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? startY;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      const cargos = this.fmtMoney(this.getTotal('0'));
      const abonos = this.fmtMoney(this.getTotal('1'));
      const dif = this.fmtMoney(this.getDiferencia());
      doc.text(`Cargos: ${cargos}   Abonos: ${abonos}   Diferencia: ${dif}`, left, finalY + 16);

      const folio = folioTxt.replace(/[^\w-]+/g, '_');
      doc.save(`Poliza-${folio || 'sin_folio'}.pdf`);
      this.showToast({ type: 'success', title: 'PDF', message: 'PDF exportado correctamente.' });
    } catch (e: any) {
      this.showToast({ type: 'warning', title: 'Aviso', message: e?.message || 'No se pudo exportar PDF.' });
    }
  }

  async exportarExcelPoliza() {
    try {
      const XLSX = await import('xlsx');

      const folio = String(this.poliza?.folio || `poliza-${this.poliza?.id_poliza ?? ''}`).replace(/[^\w-]+/g, '_');
      const hojaNombre = `Póliza ${folio || 'sin_folio'}`;

      const H = this.headerPolizaProfesional();

      const headerPairs: any[][] = [['Campo', 'Valor', 'Campo', 'Valor']];
      const entries = Object.entries(H).map(([k, v]) => [k, String(v)]);
      for (let i = 0; i < entries.length; i += 2) {
        const a = entries[i];
        const b = entries[i + 1] || ['', ''];
        headerPairs.push([a[0], a[1], b[0], b[1]]);
      }

      const movs = this.buildTablaMovimientosPresentacion();
      const movHeader = ['#', 'Cuenta', 'Operación', 'Monto', 'Cliente / Concepto', 'Fecha', 'CC', 'Serie Venta', 'UUID'];
      const movBody = movs.map(r => [
        r['#'], r['Cuenta'], r['Operación'], Number(r['Monto']),
        r['Cliente / Concepto'], r['Fecha'], r['CC'], r['Serie Venta'], r['UUID']
      ]);

      const aoa: any[][] = [
        [`Póliza ${folio || ''}`],
        [],
        ...headerPairs,
        [],
        movHeader,
        ...movBody
      ];

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      (ws as any)['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

      (ws as any)['!cols'] = [
        { wch: 4 },
        { wch: 16 },
        { wch: 12 },
        { wch: 14 },
        { wch: 44 },
        { wch: 12 },
        { wch: 8 },
        { wch: 16 },
        { wch: 40 },
      ];

      const headerStartRow = 3;
      const headerRows = headerPairs.length;
      const sepRow = headerStartRow + headerRows;
      const movHeaderRow = sepRow + 1;
      const firstDataRow = movHeaderRow + 1;
      const lastDataRow = movHeaderRow + movBody.length;

      for (let r = firstDataRow; r <= lastDataRow; r++) {
        const cell = ws[`D${r}`];
        if (cell) cell.z = '"$"#,##0.00';
      }

      if (movBody.length > 0) (ws as any)['!autofilter'] = { ref: `A${movHeaderRow}:I${lastDataRow}` };
      (ws as any)['!freeze'] = { xSplit: 0, ySplit: movHeaderRow };

      const cargos = this.getTotal('0');
      const abonos = this.getTotal('1');
      const dif = this.getDiferencia();
      const totalsRow = lastDataRow + 2;

      (XLSX as any).utils.sheet_add_aoa(ws, [
        ['Totales'],
        ['Cargos', cargos],
        ['Abonos', abonos],
        ['Diferencia', dif],
      ], { origin: `A${totalsRow}` });

      ['B' + (totalsRow + 1), 'B' + (totalsRow + 2), 'B' + (totalsRow + 3)].forEach(addr => {
        const c = (ws as any)[addr]; if (c) c.z = '"$"#,##0.00';
      });

      const wb = (XLSX as any).utils.book_new();
      (XLSX as any).utils.book_append_sheet(wb, ws, hojaNombre);

      const XLSXMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const wbout = (XLSX as any).write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: XLSXMime });
      this.descargarBlob(blob, `Poliza-${folio || 'sin_folio'}.xlsx`);

      this.showToast({ type: 'success', title: 'Excel', message: 'Excel exportado correctamente.' });
    } catch (e: any) {
      this.showToast({ type: 'warning', title: 'Aviso', message: e?.message || 'No se pudo exportar Excel.' });
    }
  }

  // ----------------- Modal cuentas -----------------
  abrirModalCuentas(index: number): void {
    this.indiceMovimientoSeleccionado = index;
    this.modalCuentasAbierto = true;
  }
  cerrarModalCuentas(): void {
    this.modalCuentasAbierto = false;
    this.indiceMovimientoSeleccionado = null;
  }
  onCuentaSeleccionadaModal(cuenta: { id_cuenta: number; codigo: string; nombre: string }): void {
    if (this.indiceMovimientoSeleccionado == null) return;
    const movs = (this.poliza?.movimientos || []) as any[];
    const i = this.indiceMovimientoSeleccionado;
    if (!movs[i]) return;

    movs[i].id_cuenta = Number(cuenta.id_cuenta);
    movs[i]._cuentaQuery = `${cuenta.codigo} — ${cuenta.nombre}`;
    this.cerrarModalCuentas();
  }

  labelCuenta(id?: number | null): string {
    if (!Number.isFinite(Number(id))) return '';
    const c = this.cuentasMap.get(Number(id));
    return c ? `${c.codigo} — ${c.nombre}` : '';
  }

  onCuentaQueryChange(i: number) {
    const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
    const q = (movs[i]?._cuentaQuery || '').trim().toLowerCase();
    if (!q) { this.cuentasFiltradas[i] = this.cuentas.slice(0, 20); return; }

    const hits = this.cuentas.filter(c =>
      (c.codigo && c.codigo.toLowerCase().includes(q)) ||
      (c.nombre && c.nombre.toLowerCase().includes(q))
    );
    const starts = hits.filter(c => c.codigo?.toLowerCase().startsWith(q));
    const rest = hits.filter(c => !c.codigo?.toLowerCase().startsWith(q));
    this.cuentasFiltradas[i] = [...starts, ...rest].slice(0, 50);
  }
  openCuenta(i: number) {
    this.cuentaOpenIndex = i;
    this.onCuentaQueryChange(i);
  }
  closeCuenta(i: number) {
    setTimeout(() => {
      if (this.cuentaOpenIndex === i) this.cuentaOpenIndex = null;
    }, 120);
  }
  selectCuenta(i: number, c: Cuenta) {
    const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
    const m = movs[i]; if (!m) return;
    m.id_cuenta = Number(c.id_cuenta);
    m._cuentaQuery = `${c.codigo} — ${c.nombre}`;
    this.cuentasFiltradas[i] = [];
    this.cuentaOpenIndex = null;
  }

  // ----------------- Totales / helpers generales -----------------
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
  get currentUserLabel(): string {
    return (this.currentUser?.nombre || '').toString().trim();
  }

  private pad2(n: number) { return String(n).padStart(2, '0'); }
  private todayISO(): string {
    const d = new Date();
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
  }
  private fmtDate(d: any): string {
    if (!d) return '—';
    const s = String(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dt = new Date(s);
    if (isNaN(dt.getTime())) return s;
    return `${dt.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
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
    return `${d.getFullYear()}-${this.pad2(d.getMonth() + 1)}-${this.pad2(d.getDate())}`;
  }
  private normalizeList(res: any) {
    return Array.isArray(res) ? res : (res?.rows ?? res?.data ?? res?.items ?? res?.result ?? res ?? []);
  }
  private normalizeEjercicio(e: any): Ejercicio | null {
    if (!e) return null;
    const id = Number(e.id_ejercicio ?? e.id ?? e.ID);
    if (!Number.isFinite(id)) return null;
    const nombre = String(e.nombre ?? e.descripcion ?? e.year ?? e.ejercicio ?? '').trim();
    return {
      id_ejercicio: id,
      nombre: nombre || undefined,
      fecha_inicio: this.fmtDate(e.fecha_inicio ?? e.inicio ?? e.fechaInicio),
      fecha_fin: this.fmtDate(e.fecha_fin ?? e.fin ?? e.fechaFin),
      activo: Boolean(e.activo ?? e.esta_abierto) as any
    };
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

  // ----------------- Usuario actual -----------------
  private normalizeUsuario(u: any): UsuarioLigero | null {
    if (!u || typeof u !== 'object') return null;
    const raw = (u.user ?? u.data ?? u.currentUser ?? u) || {};
    const s = (v: any) => (v ?? '').toString().trim();
    const rawId = raw.id_usuario ?? raw.idUsuario ?? raw.user_id ?? raw.id ?? raw.ID ?? raw.sub ?? raw.uid;
    const toNum = (v: any): number => {
      if (typeof v === 'number') return v;
      if (v == null) return NaN;
      const n = Number(String(v).replace(/[^\d.-]/g, ''));
      return n;
    };
    const idNum = toNum(rawId);
    const nombreBase = s(
      raw.nombre ?? raw.name ?? raw.full_name ?? raw.fullName ??
      raw.display_name ?? raw.displayName ?? raw.username ??
      raw.preferred_username ?? raw.nombres ?? raw.given_name ?? raw.first_name
    );
    const apP = s(raw.apellido_p ?? raw.apellidoP ?? raw.apellido ?? raw.apellidos ?? raw.last_name ?? raw.family_name);
    const apM = s(raw.apellido_m ?? raw.apellidoM);

    let nombre = [nombreBase, apP, apM].filter(Boolean).join(' ').trim();
    const emailRaw = s(raw.email ?? raw.correo ?? raw.mail);
    const email = emailRaw ? emailRaw.toLowerCase() : undefined;
    if (!nombre) {
      const alias = email ? email.split('@')[0].replace(/[._-]+/g, ' ').trim() : '';
      if (alias) nombre = alias;
    }
    if (!nombre && Number.isFinite(idNum)) nombre = `Usuario ${idNum}`;
    if (!nombre) nombre = 'Usuario';

    const out: any = { ...raw, nombre, email };
    if (Number.isFinite(idNum)) out.id_usuario = idNum;
    return out as UsuarioLigero;
  }

  private cargarUsuarioActual() {
    const svc: any = this.apiSvc as any;
    const fn =
      svc.getCurrentUser ||
      svc.me ||
      svc.getUsuarioActual ||
      svc.getUser ||
      svc.getUsuario;

    if (typeof fn === 'function') {
      fn.call(svc).subscribe({
        next: (r: any) => { this.currentUser = this.normalizeUsuario(r); },
        error: (_e: any) => { this.cargarUsuarioPorFallback(); }
      });
      return;
    }
    this.cargarUsuarioPorFallback();
  }

  private cargarUsuarioPorFallback() {
    const base = this.apiBase;
    const candidates = [
      `${base}/usuarios/me`,
      `${base}/users/me`,
      `${base}/me`,
    ];
    const opts: any = {};

    const onResolved = (r: any) => {
      const user = this.normalizeUsuario(r);
      if (user) {
        this.currentUser = user;
        const idNum = Number(user.id_usuario);
        if (Number.isFinite(idNum) && !this.poliza?.id_usuario) {
          (this.poliza as any).id_usuario = idNum;
        }
      }
    };

    const tryNext = (i: number) => {
      if (i >= candidates.length) {
        const uid = this.toNumOrNull(this.poliza?.id_usuario);
        if (uid) {
          this.http.get<any>(`${base}/usuarios/${uid}`, opts).subscribe({
            next: onResolved,
            error: () => { /* sin usuario; lo dejamos en null */ }
          });
        }
        return;
      }
      this.http.get<any>(candidates[i], opts).subscribe({
        next: onResolved,
        error: () => tryNext(i + 1)
      });
    };
    tryNext(0);
  }
}
