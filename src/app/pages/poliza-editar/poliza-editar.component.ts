import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalSeleccionCuentaComponent } from '@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component';

import { PolizasService } from '@app/services/polizas.service';
import { CuentasService } from '@app/services/cuentas.service';
import type { Poliza, Movimiento } from '@app/services/polizas.service';
import { catchError, forkJoin, of, switchMap, throwError, firstValueFrom } from 'rxjs';

type Cuenta = {
  id: number;
  codigo: string;
  nombre: string;
  ctaMayor: boolean;
  parentId: number | null;
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
type UsuarioLigero = { id_usuario: number; nombre?: string; email?: string; [k: string]: any };

type CentroCostoItem = {
  id_centrocosto: number;
  nombre: string;
  clave?: string | null;
  serie_venta?: string | null;
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
    
  ],
  templateUrl: './poliza-editar.component.html',
  styleUrls: ['./poliza-editar.component.scss']
})
export class PolizaEditarComponent implements OnInit {
  // ===== Config/API =====
  private apiBase = 'http://localhost:3000/api/v1';
  private get api(): any { return this.apiSvc as any; }

  // ===== Estado general =====
  sidebarOpen = true;
  loading = true;
  errorMsg = '';
  updating = false;

  // ===== Ruta =====
  id_poliza!: number;

  // ===== UI/Toast =====
  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true
  };

  // ===== Usuario =====
  currentUser: UsuarioLigero | null = null;

  // ===== Ejercicios/Periodos =====
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

  // ===== Catálogos =====
  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  centros: Array<{ id_centro: number; nombre: string }> = [];

  // ===== Centros de costo =====
  centrosCosto: CentroCostoItem[] = [];
  private centrosCostoMap = new Map<number, CentroCostoItem>();

  // ===== Póliza =====
  poliza: Partial<PolizaUI> & {
    id_poliza?: number;
    estado?: string;
    fecha_creacion?: string;
    created_at?: string;
    updated_at?: string;
  } = { movimientos: [] };

  // ===== Cuentas (typeahead por fila) =====
  cuentas: Cuenta[] = [];
  cuentasMap = new Map<number, Cuenta>();
  cuentasFiltradas: Cuenta[][] = [];
  cuentaOpenIndex: number | null = null;

  // ===== Modal de selección de cuenta =====
  modalCuentasAbierto = false;
  indiceMovimientoSeleccionado: number | null = null;

  // ===== CFDI =====
  xmlMovimientoIndex: number | null = null;
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';
  cfdiOptions: CfdiOption[] = [];
  uuidSeleccionado?: string;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private apiSvc: PolizasService,
    private cuentasSvc: CuentasService,
  ) {}

  // =========================================================
  // Init
  // =========================================================
  ngOnInit(): void {
    this.cargarCatalogosBase();      // Tipos y Centros
    this.getCentros();               // Centros de costo

    this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(this.id_poliza)) {
      this.showToast({ type: 'error', title: 'Error', message: 'ID de póliza inválido.' });
      this.loading = false;
      return;
    }

    // Orden recomendado: periodos -> ejercicio -> póliza -> cuentas/usuario -> CFDI
    this.cargarPeriodosAll();
    this.cargarEjercicioActivo();
    this.cargarPoliza(this.id_poliza);
    this.cargarCuentas();
    this.cargarUsuarioActual();
    this.cargarCfdiRecientes();
  }

  onSidebarToggle(v: boolean) { this.sidebarOpen = v; }

  // =========================================================
  // Catálogos base
  // =========================================================
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

  // =========================================================
  // Ejercicio / Periodos
  // =========================================================
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
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudo cargar el ejercicio actual.' });
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
          this.showToast({ type: 'error', title: 'Error', message: 'No se pudo actualizar el ejercicio seleccionado.' });
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

    // Garantiza que el periodo de la póliza esté presente en el select
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

  // =========================================================
  // Póliza + movimientos
  // =========================================================
  cargarPoliza(id: number) {
    this.loading = true;
    this.http.get<any>(`${this.apiBase}/poliza/${id}/movimientos`).subscribe({
      next: (res) => {
        const movs: MovimientoUI[] = (res?.movimientos ?? []).map((m: any) => {
          const mm: MovimientoUI = this.normalizeMovimiento(m) as MovimientoUI;
          const c = this.cuentasMap.get(Number(mm.id_cuenta || 0));
          mm._cuentaQuery = c ? `${c.codigo} — ${c.nombre}` : (mm._cuentaQuery ?? '');
          return mm;
        });

        // Asegura id_periodo numérico (para evitar TS2322) y lo reinyecta al select si hiciera falta
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

        // Reaplica filtro para reflejar el periodo actual en el select
        this.applyPeriodoFilter();

        this.cuentasFiltradas = new Array(this.poliza.movimientos?.length || 0).fill([]);
        this.prefillCuentaQueries();
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
      uuid: this.toStrOrNull(m?.uuid) ?? null, // <-- CFDI UUID
      id_poliza: this.toNumOrNull(m?.id_poliza) ?? undefined,
      ...(m?.id_movimiento != null ? { id_movimiento: Number(m.id_movimiento) } : {})
    } as any;
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
    const payloadHeader = {
      id_tipopoliza: this.toNumOrNull(p.id_tipopoliza)!,
      id_periodo:    this.toNumOrNull(p.id_periodo)!,
      id_usuario:    this.toNumOrNull(p.id_usuario)!,
      id_centro:     this.toNumOrNull(p.id_centro)!,
      folio:         this.toStrOrNull(p.folio)!,
      concepto:      this.toStrOrNull(p.concepto)!,
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
        id_cuenta:       this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion:       (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto:           this.toNumOrNull(m.monto),
        cliente:         this.toStrOrNull(m.cliente),
        fecha:           this.toDateOrNull(m.fecha),
        cc:              this.toNumOrNull(m.cc),
        uuid:            this.toStrOrNull(m.uuid) // <-- CFDI UUID
      }).pipe(
        catchError(err => throwError(() => this.annotateError(err, {
          i, uuid: m.uuid ?? null, id_mov: m.id_movimiento
        })))
      )
    );

    const createReqs = toCreate.map((m, i) =>
      this.apiSvc.createMovPoliza({
        id_poliza:       this.poliza!.id_poliza,
        id_cuenta:       this.toNumOrNull(m.id_cuenta),
        ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
        operacion:       (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
        monto:           this.toNumOrNull(m.monto),
        cliente:         this.toStrOrNull(m.cliente),
        fecha:           this.toDateOrNull(m.fecha),
        cc:              this.toNumOrNull(m.cc),
        uuid:            this.toStrOrNull(m.uuid) // <-- CFDI UUID
      }).pipe(
        catchError(err => throwError(() => this.annotateError(err, {
          i, uuid: m.uuid ?? null, id_mov: undefined
        })))
      )
    );

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
        this.cargarPoliza(this.poliza!.id_poliza!);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al actualizar póliza/movimientos';
        console.error('Actualizar:', err);
        this.showToast({ type: 'error', title: 'Error', message: msg });
      },
      complete: () => { this.updating = false; }
    });
  }

  // =========================================================
  // Cuentas
  // =========================================================
private cargarCuentas() {
  this.cuentasSvc.getCuentas().subscribe({
    next: (arr) => {
      const todas = Array.isArray(arr) ? arr : [];

      // Mantén TODAS (posteables y no posteables) para que el modal vea la jerarquía completa
      this.cuentas = todas;

      // 🔽 Ordenar por jerarquía padre→hijo
      const { list, niveles } = this.ordenarYNivelarCuentas(this.cuentas);
      this.cuentasOrdenadas = list;
      this.nivelById = niveles;

      // Map para búsquedas por id (usa todas)
      this.cuentasMap.clear();
      for (const c of this.cuentas) this.cuentasMap.set(c.id, c);

      this.prefillCuentaQueries();
    },
    error: (e) => console.error('Cuentas:', e)
  });
}


private cuentasOrdenadas: Cuenta[] = [];
private nivelById = new Map<number, number>();

/** Clave de orden: normaliza segmentos numéricos para 1,2,10 => 01,02,10 */
private keyCodigo(codigo: string | null | undefined): string {
  const s = (codigo ?? '').toString();
  return s
    .split(/(\d+)/g)
    .map(seg => (/^\d+$/.test(seg) ? seg.padStart(8, '0') : seg.toLowerCase()))
    .join('');
}

/** Ordena por jerarquía padre→hijos y devuelve lista aplanada + niveles */
private ordenarYNivelarCuentas(todas: Cuenta[]): { list: Cuenta[]; niveles: Map<number, number> } {
  const byId = new Map<number, Cuenta>();
  for (const c of todas) byId.set(c.id, c);

  // Agrupar hijos por parentId
  const children = new Map<number, Cuenta[]>();
  for (const c of todas) {
    const pid = c.parentId ?? null;
    if (pid != null && byId.has(pid)) {
      const arr = children.get(pid) ?? [];
      arr.push(c);
      children.set(pid, arr);
    }
  }

  // Raíces: sin parentId o con parentId no encontrado
  const roots = todas.filter(c => c.parentId == null || !byId.has(c.parentId));

  // Orden por código amigable
  const sortFn = (a: Cuenta, b: Cuenta) =>
    this.keyCodigo(a.codigo).localeCompare(this.keyCodigo(b.codigo));

  roots.sort(sortFn);
  for (const [pid, arr] of children) arr.sort(sortFn);

  const out: Cuenta[] = [];
  const niveles = new Map<number, number>();

  const dfs = (n: Cuenta, nivel: number) => {
    out.push(n);
    niveles.set(n.id, nivel);
    const kids = children.get(n.id) ?? [];
    for (const k of kids) dfs(k, nivel + 1);
  };

  for (const r of roots) dfs(r, 0);
  return { list: out, niveles };
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
      _cuentaQuery: ''
    };
    (this.poliza.movimientos ??= []).push(nuevo);
    this.cuentasFiltradas.push([]);
  }

  // madal de confirmacion para eliminar movimiento
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
      this.deletingIndexSet.delete(i);
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
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  }

  //cfdi recientesm
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
      // FIX: quitar el guion accidental y consultar al endpoint correcto
      this.http.get<any>(`${this.apiBase}/cfdis?limit=100`).subscribe({
        next: (r) => {
          const arr = Array.isArray(r) ? r : (r?.rows ?? r?.data ?? r?.items ?? r ?? []);
          handle(arr);
        },
        error: () => { /* opcional: silencio */ }
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

  // Usa tu servicio: uploadCfdiXml(file, { folio, id_periodo, id_centro, id_tipopoliza })
  async onXmlPickedForMovimiento(event: any, index: number): Promise<void> {
    const file: File = event?.target?.files?.[0];
    if (!file) return;

    // Validaciones básicas del archivo (opcional: déjalas si quieres UX temprano)
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
      // Contexto que espera tu backend
      const ctx = {
        folio: this.poliza?.folio,
        id_periodo: Number(this.poliza?.id_periodo),
        id_centro: Number(this.poliza?.id_centro),
        id_tipopoliza: Number(this.poliza?.id_tipopoliza),
      };

      // 👇 Aquí usamos tu servicio tal cual lo definiste
      const response = await firstValueFrom(this.apiSvc.uploadCfdiXml(file, ctx));
      const uuid = response?.uuid || response?.UUID || null;

      if (!uuid) {
        this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
      } else {
        const movs = (this.poliza?.movimientos as MovimientoUI[]) || [];
        if (!movs[index]) {
          (this.poliza.movimientos ??= [])[index] = { } as any;
        }
        movs[index].uuid = uuid;

        // Mantén catálogo de recientes en UI
        if (!this.cfdiOptions.some(x => x.uuid === uuid)) {
          this.cfdiOptions = [{ uuid }, ...this.cfdiOptions].slice(0, 100);
        }

        this.showToast({ title: 'XML asociado', message: `UUID ${uuid} vinculado al movimiento ${index + 1}`, type: 'success' });
      }
    } catch (err: any) {
      const msg = err?.error?.message || err?.message || 'Error al subir el XML.';
      this.uploadXmlError = msg;
      this.showToast({ title: 'Error', message: msg, type: 'error' });
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

  // Si ya está persistido, vincula en servidor
  const idMov = Number(mov?.id_movimiento);
  if (Number.isFinite(idMov) && this.poliza?.id_poliza) {
    this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, [idMov]).subscribe({
      next: () => {
        this.showToast({ type: 'success', title: 'UUID aplicado', message: `Se aplicó ${uuid} al movimiento #${index + 1}.` });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'No se pudo vincular el UUID en servidor.';
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  } else {
    // Si no existe en BD, se enviará en el próximo create/update
    this.showToast({ type: 'info', title: 'UUID aplicado', message: `Se aplicó ${uuid}. Se guardará al actualizar la póliza.` });
  }
}
vincularUuidAMovimientosExistentes(uuid: string, movimientoIds: number[]) {
  if (!this.poliza?.id_poliza || !uuid || !movimientoIds?.length) return;
  this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, movimientoIds).subscribe({
    next: () => this.showToast({ type: 'success', title: 'UUID vinculado', message: `Se vinculó ${uuid} a ${movimientoIds.length} movimientos.` }),
    error: (err) => {
      const msg = err?.error?.message || err?.message || 'No se pudo vincular el UUID en servidor.';
      this.showToast({ type: 'error', title: 'Error', message: msg });
    }
  });
}


  // =========================================================
  // Centros de costo
  // =========================================================
  private getCentros(): void {
    const svc: any = this.api as any;
    const fn =
      svc.getCentrosCosto || svc.listCentrosCosto ||
      svc.getCentroCostos || svc.listCentroCostos ||
      svc.getCentrosDeCosto || svc.listCentrosDeCosto ||
      svc.getCentros;

    if (typeof fn !== 'function') {
      console.warn('No existe método de API para Centros de Costo; usando vacío.');
      this.centrosCosto = [];
      this.centrosCostoMap.clear();
      return;
    }

    fn.call(this.api).subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);

        this.centrosCosto = (items || [])
          .map((x: any) => {
            const id = Number(x.id_centrocosto ?? x.id_centro ?? x.id ?? x.ID);
            const serie = String(x.serie_venta ?? x.serie ?? x.codigo ?? '').trim();
            const nom = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? `CC ${id}`).trim();
            const clave = String(x.clave ?? x.codigo ?? '').trim();
            const etiqueta = serie ? `${serie} — ${nom}` : (clave ? `${clave} — ${nom}` : nom);
            return { id_centrocosto: id, nombre: etiqueta, clave, serie_venta: serie } as CentroCostoItem;
          })
          .filter((cc: CentroCostoItem) => Number.isFinite(cc.id_centrocosto));

        this.centrosCostoMap = new Map(this.centrosCosto.map(cc => [cc.id_centrocosto, cc]));
      },
      error: (err: any) => {
        console.error('Centros de Costo:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar Centros de Costo.' });
        this.centrosCosto = [];
        this.centrosCostoMap.clear();
      }
    });
  }
  private getSerieVentaByCcId(ccId?: number | null): string | null {
    if (ccId == null) return null;
    const cc = this.centrosCostoMap.get(Number(ccId));
    const serie = (cc as any)?.serie_venta ?? null;
    return (typeof serie === 'string' && serie.trim()) ? String(serie).trim() : null;
  }

  // ⬇️ Helpers de error
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

  /** Crea un error anotado con contexto del movimiento (índice/uuid/id_movimiento) */
  private annotateError(err: any, ctx: { i: number; uuid?: string|null; id_mov?: number|undefined }) {
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

  
get cuentasParaModal() {
  const fuente = this.cuentasOrdenadas.length ? this.cuentasOrdenadas : this.cuentas;
  return (fuente || []).map(c => ({
    id_cuenta: c.id,
    codigo: c.codigo,
    nombre: c.nombre,
    posteable: this.esPosteable(c),
    nivel: this.nivelById.get(c.id) ?? 0,   // <- para indentar en el modal, si quieres
  }));
}




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
    m.id_cuenta = Number(c.id);
    m._cuentaQuery = `${c.codigo} — ${c.nombre}`;
    this.cuentasFiltradas[i] = [];
    this.cuentaOpenIndex = null;
  }

  // =========================================================
  // Helpers
  // =========================================================
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

  // =========================================================
  // Usuario actual
  // =========================================================
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
