import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PolizasService, Poliza, Movimiento } from '../../services/polizas.service';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { RouterModule } from '@angular/router';
import { ModalSeleccionCuentaComponent } from '@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component';
import { firstValueFrom } from 'rxjs';

type CfdiOption = {
  uuid: string;
  folio?: string | null;
  fecha?: string | null;
  total?: number | string | null;
};

type UsuarioLigero = { id_usuario: number; nombre?: string; email?: string; [k: string]: any };
type Ejercicio = {
  id_ejercicio: number;
  nombre?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  activo?: boolean | number | '1' | '0';
};
type CentroCostoItem = {
  serie_venta: any;
  id_centrocosto: number;
  nombre: string;
  clave?: string | null;
};

type CuentaLigera = { id_cuenta: number; codigo: string; nombre: string };

// Tipos del toast
type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

@Component({
  selector: 'app-polizas',
  standalone: true,
  imports: [CommonModule, FormsModule, PolizasLayoutComponent, ToastMessageComponent, RouterModule, ModalSeleccionCuentaComponent],
  templateUrl: './polizas.component.html',
  styleUrls: ['./polizas.component.scss']
})
export class PolizasComponent implements OnInit {
  ejercicioActual!: any; // objeto completo
  ejercicioActualId!: number; // id del ejercicio seleccionado

  sidebarOpen = true;
  // --- Manejo de XML por movimiento ---
  xmlMovimientoIndex: number | null = null;
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';
  // Usuario actual y CC
  currentUser: UsuarioLigero | null = null;
  centrosCosto: CentroCostoItem[] = [];
  private centrosCostoMap = new Map<number, CentroCostoItem>();
  location: any;
  router: any;
  volver() { this.router.navigate(['/poliza-home']); }

  // Listado
  polizas: Poliza[] = [];
  cuentasQuery = '';
  ejercicios: any[] = []; // array de ejercicios para el select

  tiposPoliza: Array<{ id_tipopoliza: number; nombre: string }> = [];
  periodos: Array<{ id_periodo: number; nombre: string }> = [];
  private allPeriodos: any[] = []; // <- NUEVO: todos los periodos sin filtrar
  centros: Array<{ id_centro: number; nombre: string }> = [];

  // Catálogo de cuentas (para movimientos)
  cuentas: CuentaLigera[] = [];
  cuentasMap = new Map<number, { codigo: string; nombre: string }>();

  // Filtros (encabezado de litado)
  filtroTipo?: number;
  filtroPeriodo?: number;
  filtroCentro?: number;

  // Formulario de nueva póliza
  nuevaPoliza: Partial<Poliza> = { movimientos: [] };

  // CFDI importados y selección de UUID
  cfdiOptions: CfdiOption[] = [];
  uuidSeleccionado?: string;

  // Toast
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
    this.cargarEjercicioActivo();
    this.initUsuarioActual();     // setea id_usuario
    this.cargarCatalogos();       // tipos/periodos/centros
    this.getCentros();            // centros de costo para tabla
    this.cargarCuentas();         // catálogo de cuentas para select
    this.cargarPolizas();         // listado
    this.cargarCfdiRecientes();   // UUIDs
    if (!this.evento.id_empresa) this.evento.id_empresa = 1;
    if (!this.evento.fecha_operacion) this.evento.fecha_operacion = this.todayISO();
  }

  modalCuentasAbierto = false;
  indiceMovimientoSeleccionado: number | null = null;

  abrirModalCuentas(index: number): void {
    this.indiceMovimientoSeleccionado = index;
    this.modalCuentasAbierto = true;
  }

  cerrarModalCuentas(): void {
    this.modalCuentasAbierto = false;
    this.indiceMovimientoSeleccionado = null;
  }

  onCuentaSeleccionadaModal(cuenta: CuentaLigera): void {
    if (this.indiceMovimientoSeleccionado != null) {
      this.nuevaPoliza.movimientos![this.indiceMovimientoSeleccionado].id_cuenta = cuenta.id_cuenta;
    }
    this.cerrarModalCuentas();
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

  private initUsuarioActual() {
    const usr = this.leerUsuarioDescompuesto() || this.leerUsuarioDesdeJwt();
    if (usr && Number.isFinite(usr.id_usuario)) {
      this.currentUser = usr;
      if (!this.nuevaPoliza.id_usuario) this.nuevaPoliza.id_usuario = usr.id_usuario;
    }
  }

  private leerUsuarioDescompuesto(): UsuarioLigero | null {
    try {
      const w: any = window as any;
      const candidatos = [
        w?.Usuario, w?.usuario, w?.currentUser,
        localStorage.getItem('usuario'),
        localStorage.getItem('user'),
        sessionStorage.getItem('usuario')
      ];
      for (const c of candidatos) {
        if (!c) continue;
        const obj = typeof c === 'string' ? JSON.parse(c) : c;
        const id  = Number(obj?.id_usuario ?? obj?.id ?? obj?.sub ?? obj?.uid);
        if (Number.isFinite(id)) {
          return {
            id_usuario: id,
            nombre: obj?.nombre ?? obj?.name ?? obj?.username ?? null,
            email: obj?.email ?? obj?.correo ?? null,
            ...obj
          } as UsuarioLigero;
        }
      }
    } catch {}
    return null;
  }

  private leerUsuarioDesdeJwt(): UsuarioLigero | null {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('token');
    if (!token) return null;

    const payload = this.decodeJwt(token);
    if (!payload) return null;

    const id = Number(payload?.id_usuario ?? payload?.sub ?? payload?.uid);
    if (!Number.isFinite(id)) return null;

    return {
      id_usuario: id,
      nombre: payload?.nombre ?? payload?.name ?? payload?.username ?? null,
      email: payload?.email ?? payload?.correo ?? null,
      ...payload
    } as UsuarioLigero;
  }

  private decodeJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch { return null; }
  }

  getCuentasFiltradasGlobal(): CuentaLigera[] {
    const q = this.normalizaStr(String(this.cuentasQuery || '').trim());
    if (!q) return this.cuentas;
    return this.cuentas.filter(c => {
      const cad = `${c.codigo} ${c.nombre}`;
      return this.normalizaStr(cad).includes(q);
    });
  }
  onCuentaSeleccionada(index: number) {
    const movs = (this.nuevaPoliza.movimientos ?? []);
    if (!movs[index]) return;
    (movs[index] as any)._cuentaQuery = '';
  }
  onCuentaSeleccionadaGlobal(): void { this.cuentasQuery = ''; }
  getCuentasParaFila(index: number, selectedId?: number | null): CuentaLigera[] {
    const base = this.getCuentasFiltradasGlobal();
    if (!selectedId) return base;
    if (base.some(c => c.id_cuenta === selectedId)) return base;
    const sel = this.cuentasMap.get(selectedId);
    return sel ? [{ id_cuenta: selectedId, codigo: sel.codigo, nombre: sel.nombre }, ...base] : base;
  }

  private cargarEjercicioActivo(): void {
    const svc: any = this.api as any;
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
      return;
    }

    const isList = (fn === svc.listEjercicios || fn === svc.getEjercicios);

    fn.call(this.api).subscribe({
      next: (r: any) => {
        console.log('🔍 Resultado de ejercicios:', r);

        const items = isList ? this.normalizeList(r) : [r];

        // Solo incluir ejercicios abiertos o activos
        this.ejercicios = items.filter((e: any) => {
          const activoFlag = e.activo === true || e.activo === 1 || e.activo === '1' || e.activo_flag === 1 || e.esta_abierto === true;
          const hoy = new Date().toISOString().slice(0, 10);

          const fiRaw = e.fecha_inicio ?? e.inicio ?? e.fechaInicio ?? e.inicio_ejercicio;
          const ffRaw = e.fecha_fin ?? e.fin ?? e.fechaFin ?? e.fin_ejercicio;
          const fi = this.fmtDate(fiRaw);
          const ff = this.fmtDate(ffRaw);

          const dentroDeFechas = !!(fi && ff && fi <= hoy && hoy <= ff);
          return activoFlag || dentroDeFechas;
        });

        const seleccionado = items.find((e: any) => e.is_selected) ?? items[0];
        if (seleccionado) this.ejercicioActualId = Number(seleccionado.id_ejercicio ?? seleccionado.id);

        if (!items || !items.length) {
          console.warn('⚠ No se encontraron ejercicios.');
          this.ejercicioActual = null;
          return;
        }

        let elegido = items.find((e: any) => e?.is_selected) ??
                      items.find((e: any) => {
                        const hoy = new Date().toISOString().slice(0, 10);
                        const fi = this.fmtDate(e?.fecha_inicio ?? e?.inicio);
                        const ff = this.fmtDate(e?.fecha_fin ?? e?.fin);
                        return fi <= hoy && hoy <= ff;
                      }) ?? items[0];

        if (!elegido) {
          console.warn('⚠ No se encontró ejercicio activo.');
          this.ejercicioActual = null;
          return;
        }

        this.ejercicioActual = {
          id_ejercicio: Number(elegido.id_ejercicio ?? elegido.id ?? elegido.ID ?? 0),
          nombre: String(
            elegido.nombre ??
            elegido.descripcion ??
            elegido.year ??
            elegido.ejercicio ??
            ''
          ).trim() || `Ejercicio ${elegido.id_ejercicio ?? ''}`,
          fecha_inicio: this.fmtDate(elegido.fecha_inicio ?? elegido.inicio),
          fecha_fin: this.fmtDate(elegido.fecha_fin ?? elegido.fin),
          activo: Boolean(elegido.activo ?? elegido.esta_abierto)
        };

        console.log('✅ Ejercicio elegido:', this.ejercicioActual);

        // NUEVO: filtrar periodos según el ejercicio elegido
        this.applyPeriodoFilter();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar ejercicio:', err);
        this.showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo cargar el ejercicio actual.'
        });
        this.ejercicioActual = null;
      }
    });
  }

  onEjercicioSeleccionado(id: any) {
    const ejercicioId = Number(id);
    const seleccionado = this.ejercicios.find(e => Number(e.id_ejercicio) === ejercicioId);

    if (seleccionado) {
      this.ejercicioActual = seleccionado;
      this.ejercicioActualId = ejercicioId;
      this.guardarEjercicioSeleccionado(ejercicioId);
      // NUEVO: actualizar periodos mostrados
      this.applyPeriodoFilter();
    }
  }

  private guardarEjercicioSeleccionado(id_ejercicio: number) {
    if (!this.api.selectEjercicio) {
      console.warn('⚠ No hay método API para guardar ejercicio seleccionado');
      this.showToast({
        type: 'warning',
        title: 'Aviso',
        message: 'El servicio no expone selectEjercicio().'
      });
      return;
    }

    this.api.selectEjercicio(id_ejercicio).subscribe({
      next: () => {
        console.log('✅ Ejercicio seleccionado guardado en BD:', id_ejercicio);
        this.showToast({
          type: 'success',
          title: 'Ejercicio actualizado',
          message: `Se guardó el ejercicio ${id_ejercicio} como activo.`
        });
      },
      error: (err) => {
        console.error('❌ Error al guardar ejercicio seleccionado:', err);
        this.showToast({
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el ejercicio seleccionado.'
        });
      }
    });
  }

  // Etiqueta legible para UI
  get ejercicioLabel(): string {
    const e = this.ejercicioActual;
    if (!e) return '—';
    const nombre = (e.nombre && e.nombre !== '—') ? e.nombre : (e.fecha_inicio && e.fecha_fin ? `${e.fecha_inicio} — ${e.fecha_fin}` : '');
    return nombre || '—';
  }

  // --- defaults de modo y evento ---
  modoCaptura: 'manual' | 'motor' = 'manual';

  evento: {
    tipo_operacion: 'ingreso' | 'egreso';
    monto_base: number | null;
    fecha_operacion: string; // 'YYYY-MM-DD'
    id_empresa: number | null;
    medio_cobro_pago: 'bancos' | 'caja' | 'clientes' | 'proveedores';
    id_cuenta_contrapartida: number | null;
    cliente: string;
    ref_serie_venta: string;
    cc: number | null;
  } = {
    tipo_operacion: 'ingreso',
    monto_base: null,
    fecha_operacion: '',
    id_empresa: 1,
    medio_cobro_pago: 'bancos',
    id_cuenta_contrapartida: null,
    cliente: '',
    ref_serie_venta: '',
    cc: null
  };

  // Helper: fecha hoy en ISO (YYYY-MM-DD)
  private todayISO(): string {
    const d = new Date();
    const mm = this.pad2(d.getMonth() + 1);
    const dd = this.pad2(d.getDate());
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // Catálogos
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
        console.error('Tipos de póliza:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los tipos de póliza.' });
      }
    });

    // Periodos (NUEVO: guardamos todos y filtramos aparte)
    this.api.getPeriodos().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r) ?? [];
        this.allPeriodos = items.map((p: any) => ({
          id_periodo: Number(p.id_periodo ?? p.id ?? p.ID),
          id_ejercicio: Number(p.id_ejercicio ?? p.ejercicio_id ?? p.ejercicio ?? p.idEjercicio ?? p.ID_EJERCICIO ?? NaN),
          fecha_inicio: this.fmtDate(p.fecha_inicio ?? p.fechaInicio ?? p.inicio ?? p.start_date ?? p.fecha_ini),
          fecha_fin:    this.fmtDate(p.fecha_fin    ?? p.fechaFin    ?? p.fin    ?? p.end_date   ?? p.fecha_fin),
          _raw: p
        }));
        this.applyPeriodoFilter();
      },
      error: err => {
        console.error('Periodos:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los periodos.' });
      }
    });

    // Centros (encabezado)
    this.api.getCentros().subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        this.centros = items.map((c: any) => {
          const id     = Number(c.id_centro ?? c.id ?? c.ID);
          const serie  = String(c.serie_venta ?? c.serie ?? c.codigo ?? '').trim();
          const nombre = String(c.nombre_centro ?? c.descripcion ?? '').trim();
          const etiqueta = serie && nombre ? `${serie} — ${nombre}` : (serie || nombre || `Centro ${id}`);
          return { id_centro: id, nombre: etiqueta };
        });
      },
      error: err => {
        console.error('Centros:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
      }
    });
  }

  // NUEVO: filtrar periodos según ejercicio actual
  private applyPeriodoFilter(): void {
    if (!Array.isArray(this.allPeriodos) || this.allPeriodos.length === 0) {
      this.periodos = [];
      return;
    }

    const ej = this.ejercicioActual;
    if (!ej) {
      // Si aún no hay ejercicio resuelto, muestra todos
      this.periodos = this.allPeriodos.map(p => ({
        id_periodo: p.id_periodo,
        nombre: `${p.fecha_inicio ?? '—'} — ${p.fecha_fin ?? '—'}`
      }));
      return;
    }

    const idEj = Number(ej.id_ejercicio);
    const ejIni = this.fmtDate(ej.fecha_inicio ?? ej.inicio);
    const ejFin = this.fmtDate(ej.fecha_fin ?? ej.fin);

    let filtrados = this.allPeriodos.filter(p => Number.isFinite(p.id_ejercicio) && p.id_ejercicio === idEj);

    if (filtrados.length === 0 && ejIni && ejFin) {
      filtrados = this.allPeriodos.filter(p => {
        const pi = p.fecha_inicio, pf = p.fecha_fin;
        if (!pi || !pf) return false;
        return (pi <= ejFin) && (pf >= ejIni); // solapamiento
      });
    }

    this.periodos = filtrados.map(p => ({
      id_periodo: p.id_periodo,
      nombre: `${p.fecha_inicio ?? '—'} — ${p.fecha_fin ?? '—'}`
    }));
  }

  private getCentros(): void {
    const svc: any = this.api as any;
    const fn =
      svc.getCentrosCosto   || svc.listCentrosCosto ||
      svc.getCentroCostos   || svc.listCentroCostos ||
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
            const id   = Number(x.id_centro ?? x.id_centro ?? x.id ?? x.ID);
            const serie = String(x.serie_venta ?? x.serie ?? x.codigo ?? '').trim();
            const nom   = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? `CC ${id}`).trim();
            const clave = String(x.clave ?? x.codigo ?? '').trim();
            const etiqueta = serie ? `${serie} — ${nom}` : (clave ? `${clave} — ${nom}` : nom);
            return { id_centrocosto: id, nombre: etiqueta } as CentroCostoItem;
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

  // Catálogo de cuentas (para movimientos)
  private cargarCuentas(): void {
    const svc: any = this.api as any;
    const fn =
      svc.getCuentas           || svc.listCuentas ||
      svc.getCatalogoCuentas   || svc.listCatalogoCuentas ||
      svc.getPlanCuentas       || svc.listPlanCuentas;

    if (typeof fn !== 'function') {
      console.warn('No existe método de API para Cuentas; usando vacío.');
      this.cuentas = [];
      this.cuentasMap.clear();
      return;
    }

    fn.call(this.api).subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        const parsed: CuentaLigera[] = (items || []).map((x: any) => {
          const id = Number(x.id_cuenta ?? x.id ?? x.ID);
          const codigo = String(x.codigo ?? x.clave ?? x.CODIGO ?? '').trim();
          const posteable = x.posteable ?? x.es_posteable ?? x.posteable_flag ?? x.posteable_indicator;
          const nombre = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? '').trim();
          return { id_cuenta: id, codigo, nombre, posteable } as any;
        }).filter((c: CuentaLigera) => Number.isFinite(c.id_cuenta));

        parsed.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));

        this.cuentas = parsed;
        this.cuentasMap = new Map(parsed.map(c => [c.id_cuenta, { codigo: c.codigo, nombre: c.nombre }]));
      },
      error: (err: any) => {
        console.error('Cuentas:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar las cuentas.' });
        this.cuentas = [];
        this.cuentasMap.clear();
      }
    });
  }

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
        console.error('Pólizas:', err);
        this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
      }
    });
  }

  // CFDI
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
        console.error('CFDI recientes:', err);
        this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los CFDI recientes.' });
      }
    });
  }

  // Movimientos
  private normalizaStr = (s: string) => s.normalize?.('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() ?? s.toLowerCase();

  onCuentaQueryChange(index: number, value: string) {
    const movs = (this.nuevaPoliza.movimientos ?? []);
    if (!movs[index]) return;
    (movs[index] as any)._cuentaQuery = value ?? '';
  }

  // Detectar cambio de centro principal
  onCentroSeleccionado(): void {
    const idCentro = this.nuevaPoliza.id_centro;
    (this.nuevaPoliza.movimientos ?? []).forEach(mov => {
      if (!mov.cc) mov.cc = idCentro;
    });
  }

  getCuentasFiltradas(index: number): CuentaLigera[] {
    const movs = (this.nuevaPoliza.movimientos ?? []);
    const q = this.normalizaStr(String((movs[index] as any)?._cuentaQuery ?? '').trim());
    if (!q) return this.cuentas;
    return this.cuentas.filter(c => {
      const cad = `${c.codigo} ${c.nombre}`;
      return this.normalizaStr(cad).includes(q);
    });
  }

  labelCuenta(id_cuenta: number | null | undefined): string {
    if (!id_cuenta) return '—';
    const c = this.cuentasMap.get(Number(id_cuenta));
    return c ? `${c.codigo} — ${c.nombre}` : '—';
  }

  triggerXmlPickerForMovimiento(input: HTMLInputElement, index: number): void {
    this.xmlMovimientoIndex = index;
    input.click();
  }

  async onXmlPickedForMovimiento(event: any, index: number): Promise<void> {
    const file: File = event.target.files?.[0];
    if (!file) return;

    try {
      this.uploadingXml = true;
      this.selectedXmlName = file.name;
      this.uploadXmlError = '';

      const response = await firstValueFrom(
        this.api.uploadCfdiXml(file, {
          folio: this.nuevaPoliza.folio,
          id_periodo: Number(this.nuevaPoliza.id_periodo),
          id_centro: Number(this.nuevaPoliza.id_centro),
          id_tipopoliza: Number(this.nuevaPoliza.id_tipopoliza)
        })
      );

      const uuid = response?.uuid || response?.UUID || null;
      if (uuid) {
        if (!this.nuevaPoliza.movimientos) this.nuevaPoliza.movimientos = [];
        if (!this.nuevaPoliza.movimientos[index]) this.nuevaPoliza.movimientos[index] = {} as any;

        this.nuevaPoliza.movimientos[index].uuid = uuid;
        (this.nuevaPoliza.movimientos[index] as any)._xmlName = file.name;

        this.showToast({
          title: 'XML asociado',
          message: `UUID ${uuid} vinculado al movimiento ${index + 1}`,
          type: 'success',
          autoCloseMs: 3500,
        });
      } else {
        this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
      }
    } catch (error: any) {
      console.error('Error al subir XML:', error);
      this.uploadXmlError = error?.error?.message || 'Error al subir el XML.';
      this.showToast({ title: 'Error', message: this.uploadXmlError, type: 'error', autoCloseMs: 4000 });
    } finally {
      this.uploadingXml = false;
      event.target.value = '';
    }
  }

  agregarMovimiento(): void {
    const defaultCuenta = this.cuentas.length ? this.cuentas[0].id_cuenta : null;

    const nuevo: Movimiento & { _cuentaQuery?: string } = {
      id_cuenta: null,
      ref_serie_venta: '',
      operacion: '',          // "0" cargo | "1" abono (string)
      monto: null,
      cliente: '',
      fecha: this.todayISO(),
      cc: this.nuevaPoliza.id_centro ?? null,
      uuid: null as unknown as any,
      _cuentaQuery: defaultCuenta ? this.labelCuenta(defaultCuenta) : ''
    };
    (this.nuevaPoliza.movimientos ??= []).push(nuevo);
  }

  eliminarMovimiento(i: number): void {
    this.nuevaPoliza.movimientos?.splice(i, 1);
  }

  // Validación previa al guardado
  canGuardar(): boolean {
    const p = this.nuevaPoliza;
    if (!p) return false;

    const okHeader =
      !!(p.folio && String(p.folio).trim()) &&
      !!(p.concepto && String(p.concepto).trim()) &&
      this.N(p.id_tipopoliza) !== undefined &&
      this.N(p.id_periodo)    !== undefined &&
      this.N(p.id_centro)     !== undefined &&
      this.N(p.id_usuario)    !== undefined;

    if (!okHeader) return false;

    if (this.modoCaptura === 'motor') {
      return !!(this.evento.monto_base && this.evento.fecha_operacion && this.evento.id_empresa && this.evento.id_cuenta_contrapartida);
    }

    const movs = (p.movimientos ?? []).filter(m =>
      this.toNumOrNull(m.id_cuenta) &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );
    if (movs.length === 0) return false;

    for (const m of movs) {
      const idCuenta = this.toNumOrNull(m.id_cuenta);
      const idCc     = this.toNumOrNull(m.cc);
      if (idCuenta == null || !this.cuentasMap.has(idCuenta)) return false;
      if (idCc != null && !this.centrosCostoMap.has(idCc)) return false;
    }

    return true;
  }

  private validarYExplicarErrores(): boolean {
    const p = this.nuevaPoliza;
    if (!p) {
      this.showToast({ type: 'warning', title: 'Faltan datos', message: 'No hay póliza en edición.' });
      return false;
    }

    const faltantes: string[] = [];
    if (!p.folio)       faltantes.push('Folio');
    if (!p.concepto)    faltantes.push('Concepto');
    if (!p.id_tipopoliza) faltantes.push('Tipo de póliza');
    if (!p.id_periodo)    faltantes.push('Periodo');
    if (!p.id_centro)     faltantes.push('Centro');
    if (!p.id_usuario)    faltantes.push('Usuario');

    if (faltantes.length) {
      this.showToast({ type: 'warning', title: 'Faltan datos', message: `Completa: ${faltantes.join(', ')}.` });
      return false;
    }

    const movs = (p.movimientos ?? []);
    if (movs.length === 0) {
      this.showToast({ type: 'warning', title: 'Movimientos', message: 'Agrega al menos un movimiento.' });
      return false;
    }

    for (let i = 0; i < movs.length; i++) {
      const m = movs[i];
      const idCuenta = this.toNumOrNull(m.id_cuenta);
      const op = m.operacion;
      const monto = this.toNumOrNull(m.monto);
      const idCc = this.toNumOrNull(m.cc);

      if (!idCuenta) {
        this.showToast({ type: 'warning', title: `Movimiento #${i + 1}`, message: 'Selecciona una cuenta contable.' });
        return false;
      }
      if (!this.cuentasMap.has(idCuenta)) {
        this.showToast({ type: 'warning', title: `Movimiento #${i + 1}`, message: 'La cuenta seleccionada no existe en el catálogo.' });
        return false;
      }
      if (!(op === '0' || op === '1')) {
        this.showToast({ type: 'warning', title: `Movimiento #${i + 1}`, message: 'Selecciona si es Cargo (0) o Abono (1).' });
        return false;
      }
      if (!monto || monto <= 0) {
        this.showToast({ type: 'warning', title: `Movimiento #${i + 1}`, message: 'Captura un monto mayor a 0.' });
        return false;
      }
      if (idCc != null && !this.centrosCostoMap.has(idCc)) {
        this.showToast({ type: 'warning', title: `Movimiento #${i + 1}`, message: 'El Centro de Costo seleccionado no existe.' });
        return false;
      }
    }

    const movsValidos = movs.filter(m =>
      this.toNumOrNull(m.id_cuenta) &&
      (m.operacion === '0' || m.operacion === '1') &&
      (this.toNumOrNull(m.monto) ?? 0) > 0
    );
    const cargos = movsValidos.filter(m => m.operacion === '0').reduce((s, m) => s + (this.toNumOrNull(m.monto) || 0), 0);
    const abonos = movsValidos.filter(m => m.operacion === '1').reduce((s, m) => s + (this.toNumOrNull(m.monto) || 0), 0);
    if (Math.abs(cargos - abonos) > 0.001) {
      this.showToast({ type: 'warning', title: 'Partida doble', message: `No cuadra.\nCargos: ${cargos}\nAbonos: ${abonos}` });
    }

    return true;
  }

  // Guardar
  guardarPoliza(): void {
    if (this.modoCaptura === 'manual') {
      if (!this.validarYExplicarErrores()) return;

      const p = this.nuevaPoliza;
      const payload = {
        id_tipopoliza: this.toNumOrNull(p?.id_tipopoliza)!,
        id_periodo:    this.toNumOrNull(p?.id_periodo)!,
        id_usuario:    this.toNumOrNull(p?.id_usuario)!,
        id_centro:     this.toNumOrNull(p?.id_centro)!,
        folio:         this.toStrOrNull(p?.folio)!,
        concepto:      this.toStrOrNull(p?.concepto)!,
        movimientos:  (p?.movimientos ?? []).map(m => ({
          id_cuenta:       this.toNumOrNull(m.id_cuenta),
          ref_serie_venta: this.toStrOrNull(m.ref_serie_venta),
          operacion:       (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
          monto:           this.toNumOrNull(m.monto),
          cliente:         this.toStrOrNull(m.cliente),
          fecha:           this.toDateOrNull(m.fecha),
          cc:              this.toNumOrNull(m.cc),
          uuid:            this.toStrOrNull(m.uuid),
        }))
      };

      this.api.createPoliza(payload).subscribe({
        next: () => {
          this.nuevaPoliza = { movimientos: [], id_usuario: this.currentUser?.id_usuario };
          this.cargarPolizas();
          this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada correctamente.' });
        },
        error: err => {
          const msg = err?.error?.message || err?.error?.error || err?.message || 'Error al guardar póliza';
          console.error('Guardar póliza (manual):', err);
          this.showToast({ type: 'error', title: 'Error', message: msg });
        }
      });

    } else {
      const okHeader =
        this.nuevaPoliza?.folio &&
        this.nuevaPoliza?.concepto &&
        this.nuevaPoliza?.id_tipopoliza &&
        this.nuevaPoliza?.id_periodo &&
        this.nuevaPoliza?.id_centro &&
        this.nuevaPoliza?.id_usuario;

      const okMotor =
        this.evento.monto_base != null && this.evento.monto_base > 0 &&
        !!this.evento.fecha_operacion &&
        !!this.evento.id_empresa &&
        !!this.evento.id_cuenta_contrapartida;

      if (!okHeader || !okMotor) {
        this.showToast({
          type: 'warning',
          title: 'Faltan datos',
          message: 'Completa encabezado y datos del evento (monto, fecha, empresa y cuenta contrapartida).'
        });
        return;
      }

      const body = {
        id_tipopoliza: this.toNumOrNull(this.nuevaPoliza.id_tipopoliza)!,
        id_periodo:    this.toNumOrNull(this.nuevaPoliza.id_periodo)!,
        id_usuario:    this.toNumOrNull(this.nuevaPoliza.id_usuario)!,
        id_centro:     this.toNumOrNull(this.nuevaPoliza.id_centro)!,
        folio:         this.toStrOrNull(this.nuevaPoliza.folio)!,
        concepto:      this.toStrOrNull(this.nuevaPoliza.concepto)!,

        tipo_operacion: this.evento.tipo_operacion,
        monto_base:     Number(this.evento.monto_base),
        fecha_operacion:this.toDateOrNull(this.evento.fecha_operacion)!,
        id_empresa:     Number(this.evento.id_empresa),
        medio_cobro_pago: this.evento.medio_cobro_pago,
        id_cuenta_contrapartida: Number(this.evento.id_cuenta_contrapartida),

        cliente:         this.toStrOrNull(this.evento.cliente) ?? null,
        ref_serie_venta: this.toStrOrNull(this.evento.ref_serie_venta) ?? null,
        cc:              this.toNumOrNull(this.evento.cc) ?? null
      };

      this.api.createPolizaFromEvento(body).subscribe({
        next: () => {
          this.nuevaPoliza = { movimientos: [], id_usuario: this.currentUser?.id_usuario };
          this.cargarPolizas();
          this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada con el motor.' });
        },
        error: err => {
          const msg = err?.error?.message || err?.message || 'Error al crear póliza con el motor';
          console.error('Guardar póliza (motor):', err);
          this.showToast({ type: 'error', title: 'Error', message: msg });
        }
      });
    }
  }

  agregarEventoAPolizaExistente(id_poliza: number): void {
    const okMotor =
      this.evento.monto_base != null && this.evento.monto_base > 0 &&
      !!this.evento.fecha_operacion &&
      !!this.evento.id_empresa &&
      !!this.evento.id_cuenta_contrapartida;

    if (!okMotor) {
      this.showToast({ type: 'warning', title: 'Faltan datos', message: 'Completa los datos del evento.' });
      return;
    }

    const body = {
      tipo_operacion: this.evento.tipo_operacion,
      monto_base: Number(this.evento.monto_base),
      fecha_operacion: this.toDateOrNull(this.evento.fecha_operacion)!,
      id_empresa: Number(this.evento.id_empresa),
      medio_cobro_pago: this.evento.medio_cobro_pago,
      id_cuenta_contrapartida: Number(this.evento.id_cuenta_contrapartida),
      cliente: this.toStrOrNull(this.evento.cliente) ?? null,
      ref_serie_venta: this.toStrOrNull(this.evento.ref_serie_venta) ?? null,
      cc: this.toNumOrNull(this.evento.cc) ?? null
    };

    this.api.expandEventoEnPoliza(id_poliza, body).subscribe({
      next: (r) => {
        this.showToast({ type: 'success', title: 'Agregado', message: `Se agregaron ${r?.count ?? ''} movimientos a la póliza ${id_poliza}.` });
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || 'Error al agregar evento';
        console.error('expand-evento:', err);
        this.showToast({ type: 'error', title: 'Error', message: msg });
      }
    });
  }

  // XML
  triggerXmlPicker(input: HTMLInputElement) {
    this.uploadXmlError = '';
    input.value = '';
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
        console.error('Importar XML:', err);
        this.uploadXmlError = err?.error?.message ?? 'Error importando XML';
        this.showToast({ type: 'error', title: 'Error', message: this.uploadXmlError });
      },
      complete: () => (this.uploadingXml = false),
    });
  }

  // UUID compartido
  onUuidChange(uuid?: string) {
    this.uuidSeleccionado = uuid || undefined;
  }

  aplicarUuidAlMovimiento(index: number) {
    if (!this.uuidSeleccionado) return;
    const movs = this.nuevaPoliza.movimientos ?? [];
    if (movs[index]) movs[index].uuid = this.uuidSeleccionado;
  }

  // Totales
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
