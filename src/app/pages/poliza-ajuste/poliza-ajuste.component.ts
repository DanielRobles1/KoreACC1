import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PolizasService } from '@app/services/polizas.service';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PolizasLayoutComponent } from '@app/components/polizas-layout/polizas-layout.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalSeleccionCuentaComponent } from '@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component';
import {  RouterModule } from '@angular/router';

type ToastType = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

type CuentaLigera = { id_cuenta: number; codigo: string; nombre: string };
type CentroCostoItem = { id_centrocosto: number; nombre: string; serie_venta?: string | null };

@Component({
  selector: 'app-poliza-ajuste',
  templateUrl: './poliza-ajuste.component.html',
  styleUrls: ['./poliza-ajuste.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PolizasLayoutComponent,
    ToastMessageComponent,
    ModalSeleccionCuentaComponent,
  ],
})
export class PolizaAjusteComponent implements OnInit {
  errorMessage: string | null = null;

  // XML por movimiento
  xmlMovimientoIndex: number | null = null;
  uploadingXml = false;
  selectedXmlName = '';
  uploadXmlError = '';

  sidebarOpen = true;
  idPolizaOrigen!: number;
  polizaOrigen: any;
  encabezadoForm!: FormGroup;
  loading = false;

  totalCargos = 0;
  totalAbonos = 0;
  diferencia = 0;

  currentUser: any = null;
  currentUserId: number | null = null; // id que intentamos sacar del token

  // Modal de cuentas
  modalCuentasAbierto = false;
  // Modal de centros de costo
  modalCentroCostoAbierto = false;
  indiceMovimientoSeleccionado: number | null = null;

  // Catálogo de cuentas y centros de costo
  cuentas: CuentaLigera[] = [];
  cuentasMap = new Map<number, { codigo: string; nombre: string }>();

  centrosCosto: CentroCostoItem[] = [];
  centrosCostoMap = new Map<number, CentroCostoItem>();

  // Toast
  toast = {
    open: false,
    title: '',
    message: '',
    type: 'info' as ToastType,
    position: 'top-right' as ToastPosition,
    autoCloseMs: 3500,
    showClose: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PolizasService,
    private fb: FormBuilder
  ) {
    // Usuario “bonito” guardado en localStorage (para mostrar nombre, etc.)
    const rawUser = localStorage.getItem('usuario');
    if (rawUser) {
      try {
        this.currentUser = JSON.parse(rawUser);
        console.log('Usuario cargado (localStorage.usuario):', this.currentUser);
      } catch (e) {
        console.error('No se pudo parsear usuario de localStorage', e);
      }
    }

    // Intentar sacar el id desde el JWT
    const rawToken =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('jwt');

    if (rawToken) {
      try {
        const parts = rawToken.split('.');
        if (parts.length === 3) {
          const payloadB64 = parts[1];
          const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(
            base64.length + ((4 - (base64.length % 4)) % 4),
            '='
          );
          const json = atob(padded);
          const payload = JSON.parse(json);

          // En tu login el id va normalmente en `sub`
          this.currentUserId = payload.sub ?? payload.id_usuario ?? null;
          console.log('ID de usuario desde token:', this.currentUserId, payload);
        } else {
          console.warn('Token con formato inesperado:', rawToken);
        }
      } catch (e) {
        console.error('No se pudo decodificar el token JWT', e);
      }
    } else {
      console.warn('No hay token en localStorage (token/authToken/jwt)');
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.idPolizaOrigen = idParam ? Number(idParam) : NaN;

    if (isNaN(this.idPolizaOrigen)) {
      this.errorMessage = 'ID de póliza de origen inválido';
      return;
    }

    this.buildForm();

    // Recalcular totales cada vez que cambie el FormArray de movimientos
    this.movimientos.valueChanges.subscribe(() => this.calcularTotales());

    this.loadPolizaOrigen();

    // Catálogos necesarios para labels y modales
    this.cargarCuentas();
    this.cargarCentrosCosto();
  }

  buildForm() {
    this.encabezadoForm = this.fb.group({
      folio: ['', Validators.required],
      concepto: ['', Validators.required],
      movimientos: this.fb.array([]),
    });
  }

  get movimientos(): FormArray {
    return this.encabezadoForm.get('movimientos') as FormArray;
  }
  
get centroCostoOrigenLabel(): string {
  const centro = this.polizaOrigen?.centro;
  if (!centro) return '';

  const raw = String(centro.nombre_centro ?? '').trim();

  // separar
  const partes = raw.split('_').filter(Boolean);

  // proteger contra casos raros
  const serie = partes[0] ?? '';
  const cc = partes[partes.length - 1] ?? '';

  // formar "A0-CC300"
  return `${serie}-${cc}`;
}


  loadPolizaOrigen() {
    this.api.getPolizaConMovimientos(this.idPolizaOrigen).subscribe({
      next: (res) => {
        this.polizaOrigen = res;
        console.log('Póliza origen:', this.polizaOrigen);

        if (!this.polizaOrigen || !this.polizaOrigen.movimientos) {
          this.errorMessage = 'La póliza de origen no contiene movimientos.';
          return;
        }

        this.encabezadoForm.patchValue({
          folio: `AJ-${this.polizaOrigen.folio}`,
          concepto: `Ajuste (reverso) a la póliza ${this.polizaOrigen.folio}`,
        });

        this.movimientos.clear();

        // LÓGICA CONTABLE CORRECTA DE AJUSTE (REVERSO):
        //   - Misma cuenta
        //   - Mismo monto en VALOR ABSOLUTO (positivo)
        //   - Operación invertida: Cargo -> Abono, Abono -> Cargo
        this.polizaOrigen.movimientos.forEach((m: any) => {
          const operacionOriginal = String(m.operacion); // '0' o '1'
          const montoOriginal = Number(m.monto) || 0;
          const montoAjuste = Math.abs(montoOriginal);   // siempre positivo

          this.movimientos.push(
            this.fb.group({
              id_cuenta: [m.id_cuenta || ''],
              operacion: [operacionOriginal === '0' ? '1' : '0'], // invertimos cargo/abono
              monto: [montoAjuste],                              // SIN signo
              cliente: [m.cliente ?? ''],
              cc: [m.cc ?? null],
              fecha: [m.fecha ?? new Date().toISOString().slice(0, 10)],
              ref_serie_venta: [m.ref_serie_venta ?? ''],
              uuid: [m.uuid ?? null],
            })
          );
        });

        this.calcularTotales();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar la póliza de origen';
      },
    });
  }

  calcularTotales() {
    const valores = this.movimientos.value as any[];

    this.totalCargos = valores
      .filter((m) => m.operacion === '0') // cargos
      .reduce((s, m) => s + (Number(m.monto) || 0), 0);

    this.totalAbonos = valores
      .filter((m) => m.operacion === '1') // abonos
      .reduce((s, m) => s + (Number(m.monto) || 0), 0);

    this.diferencia = this.totalCargos - this.totalAbonos;
  }

  guardarAjuste() {
    if (this.encabezadoForm.invalid) {
      this.errorMessage = 'Faltan datos para crear la póliza de ajuste';
      return;
    }

    // Movimientos limpios: solo con cuenta y monto != 0
    const movimientosLimpios = (this.movimientos.value as any[])
      .map((m) => ({
        ...m,
        monto: Math.abs(Number(m.monto) || 0),
      }))
      .filter((m) => m.id_cuenta && m.monto !== 0);

    if (!movimientosLimpios.length) {
      this.errorMessage = 'Debes capturar al menos un movimiento con monto distinto de cero.';
      return;
    }

    // Validación: debe cuadrar
    if (this.diferencia !== 0) {
      this.errorMessage = `La póliza no está cuadrada, diferencia: ${this.diferencia}`;
      return;
    }

    const idUsuarioFinal =
      this.currentUserId ??
      this.polizaOrigen?.id_usuario ??
      this.polizaOrigen?.creador?.id_usuario ??
      null;

    if (!idUsuarioFinal) {
      this.errorMessage = 'No se pudo determinar el usuario actual.';
      return;
    }

    this.loading = true;

    const payload = {
      id_poliza_origen: this.idPolizaOrigen,
      id_tipopoliza: 5, // Ajuste
      id_usuario: idUsuarioFinal,
      id_periodo:
        this.polizaOrigen?.id_periodo ??
        this.polizaOrigen?.periodo?.id_periodo,
      id_centro:
        this.polizaOrigen?.id_centro ??
        this.polizaOrigen?.centro?.id_centro ??
        null,
      folio: this.encabezadoForm.value.folio,
      concepto: this.encabezadoForm.value.concepto,
      movimientos: movimientosLimpios,
    };

    console.log('Payload para crear ajuste:', payload);

    this.api.createPolizaAjuste(payload).subscribe({
      next: () => {
        this.router.navigate(['/poliza-home']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'Error al crear la póliza de ajuste';
      },
      complete: () => (this.loading = false),
    });
  }

  agregarMovimientoVacio() {
    this.movimientos.push(
      this.fb.group({
        id_cuenta: [null],
        operacion: ['0'], // Cargo por defecto
        monto: [0],
        cliente: [''],
        cc: [null],
        fecha: [new Date().toISOString().slice(0, 10)],
        ref_serie_venta: [''],
        uuid: [null],
      })
    );
    this.calcularTotales();
  }

  eliminarMovimiento(i: number) {
    if (i < 0 || i >= this.movimientos.length) return;
    this.movimientos.removeAt(i);
    this.calcularTotales();
  }

  // ==== Catálogos (reutilizado de PolizasComponent, versión reducida) ====

  private normalizeList(res: any) {
    return Array.isArray(res)
      ? res
      : (res?.rows ?? res?.data ?? res?.items ?? res ?? []);
  }

  private cargarCuentas(): void {
    const svc: any = this.api as any;
    const fn =
      svc.getCuentas ||
      svc.listCuentas ||
      svc.getCatalogoCuentas ||
      svc.listCatalogoCuentas ||
      svc.getPlanCuentas ||
      svc.listPlanCuentas;

    if (typeof fn !== 'function') {
      console.warn('No existe método de API para Cuentas; usando vacío.');
      this.cuentas = [];
      this.cuentasMap.clear();
      return;
    }

    fn.call(this.api).subscribe({
      next: (r: any) => {
        const items = this.normalizeList(r);
        const parsed: CuentaLigera[] = (items || [])
          .map((x: any) => {
            const id = Number(x.id_cuenta ?? x.id ?? x.ID);
            const codigo = String(x.codigo ?? x.clave ?? x.CODIGO ?? '').trim();
            const nombre = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? '').trim();
            return { id_cuenta: id, codigo, nombre };
          })
          .filter((c: CuentaLigera) => Number.isFinite(c.id_cuenta));

        parsed.sort((a, b) =>
          a.codigo.localeCompare(b.codigo, undefined, { numeric: true })
        );

        this.cuentas = parsed;
        this.cuentasMap = new Map(
          parsed.map((c) => [c.id_cuenta, { codigo: c.codigo, nombre: c.nombre }])
        );
      },
      error: (err: any) => {
        console.error('Cuentas:', err);
        this.cuentas = [];
        this.cuentasMap.clear();
      },
    });
  }

  private cargarCentrosCosto(): void {
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
            const id = Number(x.id_centro ?? x.id_centrocosto ?? x.id ?? x.ID);
            const serie = String(x.serie_venta ?? x.serie ?? x.codigo ?? '').trim();
            const nom = String(x.nombre ?? x.descripcion ?? x.NOMBRE ?? `CC ${id}`).trim();
            const etiqueta = serie
              ? `${serie} — ${nom}`
              : nom;
            return {
              id_centrocosto: id,
              nombre: etiqueta,
              serie_venta: serie || null,
            } as CentroCostoItem;
          })
          .filter((cc: CentroCostoItem) => Number.isFinite(cc.id_centrocosto));

        this.centrosCostoMap = new Map(
          this.centrosCosto.map((cc) => [cc.id_centrocosto, cc])
        );
      },
      error: (err: any) => {
        console.error('Centros de Costo:', err);
        this.centrosCosto = [];
        this.centrosCostoMap.clear();
      },
    });
  }

  // ==== Labels bonitos ====

  labelCuenta(id_cuenta: number | null | undefined): string {
    if (!id_cuenta) return '—';
    const c = this.cuentasMap.get(Number(id_cuenta));
    if (!c) return `Cuenta ${id_cuenta}`;
    return `${c.codigo} — ${c.nombre}`;
  }

 labelCentroCosto(ccId: number | null | undefined): string {
  if (!ccId) return '—';
  const cc = this.centrosCostoMap.get(Number(ccId));
  if (!cc) return `CC ${ccId}`;

  // obtenemos el nombre crudo
  const raw = (cc.nombre ?? '').toString().trim();

  // Formato esperado: A0_A0_CC300, A0_CC300, C1_C1_CC10, etc.
  const partes =
    raw.includes('_')
      ? raw.split('_').filter(Boolean)
      : [raw];

  const serie = partes[0] ?? '';
  const ultimo = partes[partes.length - 1] ?? '';

  // Resultado final: A0-CC300
  if (serie && ultimo) {
    return `${serie}`;
  }

  return raw;
}

  // ==== XML por movimiento ====

  triggerXmlPickerForMovimiento(input: HTMLInputElement, index: number): void {
    this.xmlMovimientoIndex = index;
    this.uploadXmlError = '';
    this.selectedXmlName = '';
    input.value = '';
    input.click();
  }

  onXmlPickedForMovimiento(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file: File | undefined = input.files?.[0];
    if (!file) return;

    // Validar que sea XML
    const isXml =
      file.type === 'text/xml' ||
      file.type === 'application/xml' ||
      /\.xml$/i.test(file.name);

    if (!isXml) {
      this.uploadXmlError = 'El archivo debe ser .xml';
      this.showToast({
        type: 'warning',
        title: 'Archivo no válido',
        message: this.uploadXmlError,
      });
      input.value = '';
      return;
    }

    // Tamaño máximo 1 MB (igual que en PolizasComponent)
    if (file.size > 1 * 1024 * 1024) {
      this.uploadXmlError = 'El XML excede el tamaño permitido (1 MB).';
      this.showToast({
        type: 'warning',
        title: 'Archivo pesado',
        message: this.uploadXmlError,
      });
      input.value = '';
      return;
    }

    this.uploadingXml = true;
    this.selectedXmlName = file.name;
    this.uploadXmlError = '';

    const ctx = {
      folio: this.encabezadoForm.value.folio,
      id_periodo:
        this.polizaOrigen?.id_periodo ??
        this.polizaOrigen?.periodo?.id_periodo,
      id_centro:
        this.polizaOrigen?.id_centro ??
        this.polizaOrigen?.centro?.id_centro ??
        null,
      id_tipopoliza: 5, // Ajuste
    };

    this.api.uploadCfdiXml(file, ctx).subscribe({
      next: (res: any) => {
        const uuid = res?.uuid || res?.UUID || '';
        if (uuid && this.movimientos.at(index)) {
          this.movimientos.at(index).patchValue({ uuid });
          this.showToast({
            type: 'success',
            title: 'XML asociado',
            message: `UUID ${uuid} vinculado al movimiento ${index + 1}`,
          });
        } else {
          this.showToast({
            type: 'warning',
            title: 'Aviso',
            message: 'El servidor no devolvió UUID.',
          });
        }
      },
      error: (err: any) => {
        console.error('Error al subir XML:', err);
        this.uploadXmlError = err?.error?.message ?? 'Error al subir el XML.';
        this.showToast({
          type: 'error',
          title: 'Error',
          message: this.uploadXmlError,
        });
      },
      complete: () => {
        this.uploadingXml = false;
        if (input) input.value = '';
      },
    });
  }

  // ==== Modales ====

  // Modal de Selección de Cuenta
  abrirModalCuentas(index: number) {
    this.indiceMovimientoSeleccionado = index;
    this.modalCuentasAbierto = true;
  }

  cerrarModalCuentas() {
    this.modalCuentasAbierto = false;
    this.indiceMovimientoSeleccionado = null;
  }

  onCuentaSeleccionadaModal(cuenta: CuentaLigera) {
    if (this.indiceMovimientoSeleccionado !== null) {
      this.movimientos.controls[this.indiceMovimientoSeleccionado].patchValue({
        id_cuenta: cuenta.id_cuenta,
      });
    }
    this.cerrarModalCuentas();
  }

  // Modal de Centro de Costo
  abrirModalCentroCosto(index: number) {
    this.indiceMovimientoSeleccionado = index;
    this.modalCentroCostoAbierto = true;
  }

  cerrarModalCentroCosto() {
    this.modalCentroCostoAbierto = false;
    this.indiceMovimientoSeleccionado = null;
  }

  onCentroCostoSeleccionadoModal(cc: CentroCostoItem) {
    if (this.indiceMovimientoSeleccionado !== null) {
      this.movimientos.controls[this.indiceMovimientoSeleccionado].patchValue({
        cc: cc.id_centrocosto,
      });
    }
    this.cerrarModalCentroCosto();
  }

  // ==== Toast helper ====

  private showToast(opts: {
    message: string;
    type?: ToastType;
    title?: string;
    autoCloseMs?: number;
    position?: ToastPosition;
  }) {
    this.toast.message = opts.message;
    this.toast.type = opts.type ?? 'info';
    this.toast.title = opts.title ?? '';
    if (opts.autoCloseMs != null) this.toast.autoCloseMs = opts.autoCloseMs;
    if (opts.position) this.toast.position = opts.position;
    this.toast.open = true;
  }

  onToastClosed() {
    this.toast.open = false;
  }

  // Sidebar Toggle
  onSidebarToggle(v: boolean) {
    this.sidebarOpen = v;
  }

  volver() {
    this.router.navigate(['/poliza-home']);
  }
}
