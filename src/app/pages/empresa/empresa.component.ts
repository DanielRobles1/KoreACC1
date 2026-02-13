import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TipoPolizaModalComponent } from '@app/components/modal-tipopoliza/modal-tipopoliza.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from 'src/app/components/crud-panel/crud-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastService, ToastState } from '@app/services/toast-service.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';

import { EmpresaServiceTsService } from '@app/services/empresa.service.ts.service';
import { AuthService } from '@app/services/auth.service';
import { PeriodoContableService } from '@app/services/periodo-contable.service';
import { PeriodoContableDto, PeriodoTipo } from '@app/models/periodo';

import { EjercicioContableService } from '@app/services/ejercicio-contable.service';
import { EjercicioContableDto } from '@app/models/ejercicio';
import { PolizasService } from '@app/services/polizas.service';

type UiEmpresa = {
  id?: number;
  id_empresa?: number;
  razon_social: string;
  rfc: string;
  domicilio_fiscal: string;
  telefono: string;
  correo_contacto: string;
  razon_comercial: string;
};

type ConfirmKind =
  | 'empresa-save'
  | 'empresa-delete'
  | 'periodo-save'
  | 'periodo-delete'
  | 'periodo-cerrar'
  | 'ejercicio-save'
  | 'ejercicio-delete'
  | 'ejercicio-abrir'
  | 'ejercicio-cerrar'
  | null;

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, CrudPanelComponent, SidebarComponent, ModalComponent, ToastMessageComponent, TipoPolizaModalComponent],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
})
export class EmpresaComponent implements OnInit {
  constructor(
    private empresaService: EmpresaServiceTsService,
    private periodosService: PeriodoContableService,
    private auth: AuthService,
    public toast: ToastService,
    private ejerciciosService: EjercicioContableService,
    private polizasService: PolizasService,
    private router: Router,
  ) { }

  sidebarOpen = true;

  // tablas
  title = 'Configuración de la Empresa';
  tabs: CrudTab[] = [
    { id: 'datos', label: 'Ejercicios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
    // { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },
    { id: 'empresa', label: 'empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/empresas' },
    {
      id: 'tipo-poliza',
      label: '+ Tipo póliza',
    }

  ];
  activeTabId: 'datos' | 'periodos' = 'datos';

  // Empresa
  primaryActionLabel = 'Editar datos';
  columns: CrudColumn[] = [
    { key: 'id', header: '#', width: '64px' },
    { key: 'razon_social', header: 'Razón social' },
    { key: 'rfc', header: 'RFC' },
    { key: 'domicilio_fiscal', header: 'Domicilio fiscal' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'correo_contacto', header: 'Correo de contacto' },
  ];
  rows: UiEmpresa[] = [];
  actions: CrudAction[] = [{ id: 'edit', label: 'Editar', tooltip: 'Editar' }];

  // Permisos
  canEdit = false;
  canDelete = false;

  // Toast (estado)
  vm!: ToastState;

  // Modal empresa
  editOpen = false;
  modalTitle = 'Editar Empresa';
  modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  showClose = true;

  formEmpresa: UiEmpresa = {
    razon_social: '',
    rfc: '',
    domicilio_fiscal: '',
    telefono: '',
    correo_contacto: '',
    razon_comercial: '',
  };

  // Modal período
  modalPeriodoOpen = false;
  modalPeriodoTitle = 'Crear período';
  formPeriodo: Partial<PeriodoContableDto> = {
    tipo_periodo: 'MENSUAL',
    fecha_inicio: '',
    fecha_fin: '',
    esta_abierto: true,
  };
  editPeriodoId: number | null = null;

  // controles de creación automática dentro del modal de período
  autoCreate = false;
  autoCreateTipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL';


  primaryActionLabel3 = 'Nuevo ejercicio';
  columns3: CrudColumn[] = [
    { key: 'id_ejercicio', header: '#', width: '72px' },
    { key: 'anio', header: 'Año' },
    { key: 'fecha_inicio', header: 'Inicio' },
    { key: 'fecha_fin', header: 'Fin' },
    { key: 'esta_abierto', header: 'Abierto' },
  ];
  ejercicios: EjercicioContableDto[] = [];
  actions3: CrudAction[] = [
    { id: 'edit', label: 'Editar', tooltip: 'Editar' },
    { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
    { id: 'abrir', label: 'Abrir', tooltip: 'Marcar como abierto' },
    { id: 'cerrar', label: 'Cerrar', tooltip: 'Marcar como cerrado' },
    { id: 'select', label: 'Seleccionar', tooltip: 'Seleccionar ejercicio actual' },
  ];

  // Modal ejercicio
  modalEjercicioOpen = false;
  modalEjercicioTitle = 'Crear ejercicio';
  formEjercicio: Partial<EjercicioContableDto> = {
    anio: new Date().getFullYear(),
    fecha_inicio: '',
    fecha_fin: '',
    esta_abierto: true,
  };
  editEjercicioId: number | null = null;

  // Selección actual para periodos
  ejercicioSeleccionado: EjercicioContableDto | null = null;
  tpOpen = false;
  // Modal confirm
  confirmOpen = false;
  confirmTitle = 'Confirmar acción';
  confirmMessage = '';
  private confirmKind: ConfirmKind = null;
  private confirmPayload: any = null;

  // PARA FECHAS
  minDate: string = '';

  // FECHAS 
  private pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  private toISO(d: Date) { return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`; }
  private todayLocal(): Date { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); }
  private parseISODateLocal(iso: string): Date { const [y, m, d] = iso.split('-').map(Number); return new Date(y, (m ?? 1) - 1, d ?? 1); }
  private isPast(dateStr: string): boolean { if (!dateStr) return false; const d = this.parseISODateLocal(dateStr); return d < this.todayLocal(); }

  private startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
  private startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1); }
  private endOfYear(d: Date) { return new Date(d.getFullYear(), 12, 0); }
  private addDays(d: Date, days: number) { const r = new Date(d); r.setDate(r.getDate() + days); return r; }

  private startOfWeek(d: Date) {
    const wd = d.getDay();                 // 0=Dom, 1=Lun,----6=Sáb
    const diff = (wd === 0 ? -6 : 1 - wd); // llevar a lunes
    const res = new Date(d);
    res.setDate(d.getDate() + diff);
    return new Date(res.getFullYear(), res.getMonth(), res.getDate());
  }

  private computeCurrentPeriod(type: PeriodoTipo, ref?: Date): { start: Date; end: Date } | null {
    if (type === 'PERSONALIZADO') return null;
    const base = ref ?? this.todayLocal();
    switch (type) {
      case 'SEMANAL': return { start: this.startOfWeek(base), end: this.addDays(this.startOfWeek(base), 6) };
      case 'MENSUAL': return { start: this.startOfMonth(base), end: this.endOfMonth(base) };
      case 'ANUAL': return { start: this.startOfYear(base), end: this.endOfYear(base) };
    }
    return null;
  }
  onTipoPolizaCreado(_nuevo: any) {
    // Aquí puedes refrescar catálogos si aplica
    this.vm = {
      open: true,
      title: 'Guardado',
      message: 'Tipo de póliza creado correctamente.',
      type: 'success',
      autoCloseMs: 3000
    };
    // Si prefieres cerrar el modal desde el padre:
    // this.closeTipoPolizaModal();
  }

  private setDatesByType(type: PeriodoTipo, referenceDate?: Date) {
    if (type === 'PERSONALIZADO') return;
    const range = this.computeCurrentPeriod(type, referenceDate ?? this.todayLocal());
    if (!range) return;
    this.formPeriodo.fecha_inicio = this.toISO(range.start);
    this.formPeriodo.fecha_fin = this.toISO(range.end);
  }

  // CICLO DE VIDA
  ngOnInit() {
    this.toast.state$.subscribe(s => this.vm = s);
    this.canEdit = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');

    this.actions = [
      ...(this.canEdit ? [{ id: 'edit', tooltip: 'Editar Empresa' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Empresa' }] : []),
    ];

    this.actions3 = [
      ...(this.canEdit ? [
        { id: 'edit', tooltip: 'Editar Ejercicio' },
        { id: 'abrir', tooltip: 'Marcar como abierto' },
        { id: 'cerrar', tooltip: 'Marcar como cerrado' },
      ] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Ejercicio' }] : []),
    ];

    this.minDate = this.toISO(this.todayLocal());
    this.loadDataEmpresa();
  }

  openSuccess(message: string) { this.toast.success(message, 'Éxito', 3000); }
  openError(message: string, err?: unknown) { if (err) console.error('[EmpresaComponent] Aviso:', err); this.toast.warning(message, 'Aviso', 0); }

  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }

  loadDataEmpresa() {
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        const one = Array.isArray(data) ? data[0] : data;
        this.rows = one ? [one as UiEmpresa] : [];
        if (this.rows[0]) {
          this.restoreEjercicioSeleccionado();
          this.loadEjercicios();
        }
      },
      error: (err) => this.toast.error(this.extractErrorMessage(err) ?? 'Error al cargar los datos de la empresa.', 'Error', 0),
    });
  }

  onTabChange(id: string) {
    if (id === 'tipo-poliza') {
      this.tpOpen = true;
      return;
    }

    if (id === 'datos' || id === 'periodos') {
      this.activeTabId = id;
    }
  }


  // Editar empresa
  onPrimary() {
    if (!this.canEdit) return this.openError('No tienes permisos para editar la empresa');
    const empresa = this.rows[0];
    if (!empresa) return this.openError('No hay datos de empresa para editar');
    this.formEmpresa = { ...empresa };
    this.editOpen = true;
  }
  onEdit(row: UiEmpresa) {
    if (!this.canEdit) return this.openError('No tienes permisos para editar');
    this.formEmpresa = { ...row };
    this.editOpen = true;
  }
  closeModal() { this.editOpen = false; }
  cancelModal() { this.editOpen = false; }
  confirmModal() {
    this.confirmTitle = 'Confirmar guardado';
    this.confirmMessage = '¿Deseas guardar los cambios de la empresa?';
    this.confirmKind = 'empresa-save';
    this.confirmPayload = null;
    this.confirmOpen = true;
  }

  // PERI
  private empresaId(): number | null {
    const e = this.rows[0];
    const id = (e?.id_empresa ?? e?.id) as number | undefined;
    return id ?? null;
  }

  onTipoPeriodoChange(newType: PeriodoTipo) {
    this.formPeriodo.tipo_periodo = newType;
    if (newType === 'PERSONALIZADO' || this.autoCreate) return;
    const ref = this.formPeriodo.fecha_inicio
      ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
      : this.todayLocal();
    this.setDatesByType(newType, ref);
  }

  onFechaInicioChange(newStartStr: string) {
    this.formPeriodo.fecha_inicio = newStartStr;
    if (this.autoCreate) return;

    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;
    if (t && t !== 'PERSONALIZADO') {
      const ref = this.parseISODateLocal(newStartStr);
      this.setDatesByType(t, ref);
    } else {
      if (this.isPast(newStartStr)) {
        const todayStr = this.minDate;
        this.formPeriodo.fecha_inicio = todayStr;
        this.openError('La fecha de inicio no puede ser pasada. Se ajustó a hoy.');
      }
      const fi = this.formPeriodo.fecha_inicio!;
      const ff = this.formPeriodo.fecha_fin;
      if (ff && this.parseISODateLocal(ff) < this.parseISODateLocal(fi)) {
        this.formPeriodo.fecha_fin = fi;
      }
    }
  }

  onFechaFinChange(newEndStr: string) {
    if (this.autoCreate) return;
    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;

    if (t && t !== 'PERSONALIZADO') {
      const ref = this.formPeriodo.fecha_inicio
        ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
        : this.todayLocal();
      this.setDatesByType(t, ref);
      return;
    }

    this.formPeriodo.fecha_fin = newEndStr;
    if (this.isPast(newEndStr)) {
      const todayStr = this.minDate;
      this.formPeriodo.fecha_fin = todayStr;
      this.openError('La fecha de fin no puede ser pasada. Se ajustó a hoy.');
    }
    const fi = this.formPeriodo.fecha_inicio;
    if (fi && this.parseISODateLocal(newEndStr) < this.parseISODateLocal(fi)) {
      this.formPeriodo.fecha_fin = fi;
      this.openError('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }
  }

  // Cierre modal período
  closePeriodoModal() { this.modalPeriodoOpen = false; }
  cancelPeriodoModal() { this.modalPeriodoOpen = false; }

  // Confirmación antes de guardar período
  confirmPeriodoModal() {
    // Flujo especial: crear automáticamente todos los periodos del ejercicio
    if (this.autoCreate && !this.editPeriodoId) {
      if (!this.ejercicioSeleccionado?.id_ejercicio) {
        return this.openError('Selecciona un ejercicio contable.');
      }
      this.modalPeriodoOpen = false;             // cerrar el modal
      this.generatePeriodsForSelectedExercise(this.autoCreateTipo); // disparar generación
      return;
    }

    // Validación modo manual
    if (!this.formPeriodo.tipo_periodo || !this.formPeriodo.fecha_inicio || !this.formPeriodo.fecha_fin) {
      return this.openError('Completa tipo de período, fecha de inicio y fin.');
    }

    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;

    if (t === 'PERSONALIZADO' &&
      (this.isPast(this.formPeriodo.fecha_inicio) || this.isPast(this.formPeriodo.fecha_fin))) {
      return this.openError('Las fechas no pueden ser pasadas.');
    }

    if (this.parseISODateLocal(this.formPeriodo.fecha_fin) < this.parseISODateLocal(this.formPeriodo.fecha_inicio)) {
      return this.openError('La fecha de fin no puede ser anterior a la de inicio.');
    }

    const creando = !this.editPeriodoId;
    this.confirmTitle = creando ? 'Confirmar creación' : 'Confirmar actualización';
    this.confirmMessage = creando
      ? `¿Crear el período ${this.formPeriodo.tipo_periodo} del ${this.formPeriodo.fecha_inicio} al ${this.formPeriodo.fecha_fin}?`
      : `¿Guardar los cambios del período del ${this.formPeriodo.fecha_inicio} al ${this.formPeriodo.fecha_fin}?`;
    this.confirmKind = 'periodo-save';
    this.confirmPayload = null;
    this.confirmOpen = true;
  }

  // EJERCICIOS: lógica de almacenamiento local de selección
  private storageKey(): string | null {
    const idEmp = this.empresaId();
    return idEmp ? `ejercicio_seleccionado:${idEmp}` : null;
  }

  private saveEjercicioSeleccionado(ej: EjercicioContableDto | null) {
    const key = this.storageKey();
    if (!key) return;
    if (ej) localStorage.setItem(key, JSON.stringify(ej));
    else localStorage.removeItem(key);
  }

  private restoreEjercicioSeleccionado() {
    const key = this.storageKey();
    if (!key) return;
    const raw = localStorage.getItem(key);
    this.ejercicioSeleccionado = raw ? JSON.parse(raw) as EjercicioContableDto : null;
  }

  get ejercicioSeleccionadoLabel(): string {
    const ej = this.ejercicioSeleccionado;
    return ej ? `Ejercicio seleccionado: ${ej.anio}` : 'Sin ejercicio seleccionado';
  }

  loadEjercicios() {
    const idEmp = this.empresaId();
    if (!idEmp) return;
    this.ejerciciosService.listByEmpresa(idEmp).subscribe({
      next: (items) => this.ejercicios = items ?? [],
      error: (err) => this.openError('Error al cargar los ejercicios', err),
    });
  }

  // Abrir creación de ejercicio
  onPrimaryEjercicio() {
    if (!this.canEdit) return this.openError('No tienes permisos para crear ejercicios');
    this.modalEjercicioTitle = 'Crear ejercicio';
    this.editEjercicioId = null;

    const y = new Date().getFullYear();
    const fi = this.toISO(this.startOfYear(new Date(y, 0, 1)));
    const ff = this.toISO(this.endOfYear(new Date(y, 0, 1)));

    this.formEjercicio = {
      anio: y,
      fecha_inicio: fi,
      fecha_fin: ff,
      esta_abierto: true,
      id_empresa: this.empresaId()!,
    };
    const { min, max } = this.yearToBounds(y);
    this.ejFechaMin = min;
    this.ejFechaMax = max;

    this.modalEjercicioOpen = true;
  }

  onEjercicioAction(evt: { action: string; row: EjercicioContableDto }) {
    switch (evt.action) {
      case 'edit':
        if (!this.canEdit) return this.openError('No tienes permisos para editar ejercicios');
        this.modalEjercicioTitle = 'Editar ejercicio';
        this.editEjercicioId = evt.row.id_ejercicio ?? null;
        this.formEjercicio = { ...evt.row };
        if (this.formEjercicio.anio) {
          const y = Number(this.formEjercicio.anio);
          const { min, max } = this.yearToBounds(y);
          this.ejFechaMin = min;
          this.ejFechaMax = max;

          // Opcional: si las fechas guardadas quedaron fuera del año, encuadra
          this.formEjercicio.fecha_inicio = this.clampToYear(this.formEjercicio.fecha_inicio!, y);
          this.formEjercicio.fecha_fin = this.clampToYear(this.formEjercicio.fecha_fin!, y);
        }
        this.modalEjercicioOpen = true;
        break;

      case 'delete':
        if (!this.canDelete) return this.openError('No tienes permisos para eliminar ejercicios');
        this.confirmTitle = 'Confirmar eliminación';
        this.confirmMessage = `¿Eliminar el ejercicio ${evt.row.anio}? Esta acción no se puede deshacer.`;
        this.confirmKind = 'ejercicio-delete';
        this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
        this.confirmOpen = true;
        break;

      case 'abrir':
        if (!this.canEdit) return this.openError('No tienes permisos para abrir ejercicios');
        this.confirmTitle = 'Confirmar apertura';
        this.confirmMessage = `¿Marcar como ABIERTO el ejercicio ${evt.row.anio}?`;
        this.confirmKind = 'ejercicio-abrir';
        this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
        this.confirmOpen = true;
        break;

      case 'cerrar':
        if (!this.canEdit) return this.openError('No tienes permisos para cerrar ejercicios');
        this.confirmTitle = 'Confirmar cierre';
        this.confirmMessage = `¿Marcar como CERRADO el ejercicio ${evt.row.anio}? Esto generará la póliza de cierre y actualizará la apertura del siguiente ejercicio (si existe).`;
        this.confirmKind = 'ejercicio-cerrar';
        this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
        this.confirmOpen = true;
        break;

      case 'select':
        const id = Number(evt.row.id_ejercicio);
        this.persistEjercicioSeleccion(id);
        break;

      default:
        this.openError(`Acción no soportada: ${evt.action}`);
    }
  }

  setEjercicioSeleccionado(ej: EjercicioContableDto | null) {
    this.ejercicioSeleccionado = ej;
    this.saveEjercicioSeleccionado(ej);

    if (ej?.id_ejercicio) {
      this.router.navigate(['/ejercicio', ej.id_ejercicio, 'periodos'],
        { state: { anio: ej.anio } }
      );
    }
  }

  private updateSelectedEjercicioUI(ej: EjercicioContableDto | null) {
    this.ejercicioSeleccionado = ej;
    this.saveEjercicioSeleccionado(ej);
  }

  private persistEjercicioSeleccion(id_ejercicio: number) {
    this.polizasService.selectEjercicio(id_ejercicio).subscribe({
      next: (res: any) => {
        // Refleja is_selected en memoria de forma segura
        this.ejercicios = this.ejercicios.map(e => ({
          ...e,
          is_selected: e.id_ejercicio === id_ejercicio
        }));
        const nuevoSel = this.ejercicios.find(e => e.id_ejercicio === id_ejercicio) || null;
        this.updateSelectedEjercicioUI(nuevoSel);
        this.openSuccess('Ejercicio seleccionado.');
      },
      error: (err) => {
        console.error('❌ Error al seleccionar ejercicio en BD:', err);
        this.openError('No se pudo seleccionar el ejercicio en el servidor.', err);
      }
    });
  }


  onSelectEjercicioId = (id: number | string) => {
    const row = this.ejercicios.find(e => e.id_ejercicio === Number(id));
    if (!row) return;
    this.updateSelectedEjercicioUI({ ...row });
  };


  ejFechaMin: string = '';
  ejFechaMax: string = '';

  private yearToBounds(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return { min: this.toISO(start), max: this.toISO(end) };
  }

  private clampToYear(isoDate: string, year: number): string {
    if (!isoDate) return isoDate;
    const { min, max } = this.yearToBounds(year);
    const d = this.parseISODateLocal(isoDate);
    const dMin = this.parseISODateLocal(min);
    const dMax = this.parseISODateLocal(max);
    if (d < dMin) return min;
    if (d > dMax) return max;
    return isoDate;
  }

  private setEjercicioDatesFromYear(year: number) {
    const { min, max } = this.yearToBounds(year);
    this.formEjercicio.fecha_inicio = min;
    this.formEjercicio.fecha_fin = max;
    this.ejFechaMin = min;
    this.ejFechaMax = max;
  }

  onEjercicioAnioChange(year: number) {
    this.setEjercicioDatesFromYear(Number(year));
  }

  onEjercicioFechaInicioChange(newStart: string) {
    const y = Number(this.formEjercicio.anio);
    if (!y) return;

    this.formEjercicio.fecha_inicio = this.clampToYear(newStart, y);

    if (this.formEjercicio.fecha_fin) {
      const fi = this.parseISODateLocal(this.formEjercicio.fecha_inicio!);
      const ff = this.parseISODateLocal(this.formEjercicio.fecha_fin);
      if (ff < fi) {
        this.formEjercicio.fecha_fin = this.formEjercicio.fecha_inicio;
      }
    }
  }

  onEjercicioFechaFinChange(newEnd: string) {
    const y = Number(this.formEjercicio.anio);
    if (!y) return;
    this.formEjercicio.fecha_fin = this.clampToYear(newEnd, y);

    if (this.formEjercicio.fecha_inicio) {
      const fi = this.parseISODateLocal(this.formEjercicio.fecha_inicio);
      const ff = this.parseISODateLocal(this.formEjercicio.fecha_fin!);
      if (ff < fi) {
        this.formEjercicio.fecha_inicio = this.formEjercicio.fecha_fin!;
      }
    }
  }


  // Guardar ejercicio desde modal
  confirmEjercicioModal() {
    const idEmp = this.empresaId();
    if (!idEmp) return this.openError('No hay empresa seleccionada.');
    const f = this.formEjercicio;

    if (!f?.anio || !f.fecha_inicio || !f.fecha_fin) {
      return this.openError('Completa año, fecha de inicio y fin.');
    }
    const fi = this.parseISODateLocal(f.fecha_inicio);
    const ff = this.parseISODateLocal(f.fecha_fin);
    if (ff < fi) return this.openError('La fecha de fin no puede ser anterior a la de inicio.');

    const creando = !this.editEjercicioId;
    this.confirmTitle = creando ? 'Confirmar creación' : 'Confirmar actualización';
    this.confirmMessage = creando
      ? `¿Crear el ejercicio ${f.anio} (${f.fecha_inicio} a ${f.fecha_fin})?`
      : `¿Guardar cambios del ejercicio ${f.anio}?`;
    this.confirmKind = 'ejercicio-save';
    this.confirmPayload = null;
    this.confirmOpen = true;
  }

  // Cierre modal ejercicio
  closeEjercicioModal() { this.modalEjercicioOpen = false; }
  cancelEjercicioModal() { this.modalEjercicioOpen = false; }


  closeConfirm() { this.confirmOpen = false; this.confirmKind = null; this.confirmPayload = null; }
  cancelConfirm() { this.closeConfirm(); }

  confirmProceed() {
    const kind = this.confirmKind;
    const payload = this.confirmPayload;
    this.closeConfirm();

    switch (kind) {
      case 'empresa-delete': {
        const id = payload?.id_empresa as number | undefined;
        if (!id) {
          return this.openError('No se encontró el identificador de la empresa.');
        }

        this.empresaService.deleteEmpresa(id).subscribe({
          next: () => {
            this.rows = [];
            this.ejercicios = [];
            this.ejercicioSeleccionado = null;

            const key = this.storageKey?.();
            if (key) {
              localStorage.removeItem(key);
            }

            this.openSuccess('Empresa eliminada correctamente.');
          },
          error: (err) => {
            this.openError('No se pudo eliminar la empresa.', err);
          }
        });
        break;
      }

      case 'empresa-save': {
        const id = this.formEmpresa.id_empresa ?? this.formEmpresa.id;
        if (id == null) return this.openError('No se encontró el identificador de la empresa');
        const { id: _omit1, id_empresa: _omit2, ...payloadEmpresa } = this.formEmpresa;

        this.empresaService.updateEmpresa(id as number, payloadEmpresa).subscribe({
          next: () => {
            this.rows = [{ ...(this.rows[0] ?? {}), ...this.formEmpresa }];
            this.editOpen = false;
            this.openSuccess('Datos de la empresa actualizados correctamente.');
          },
          error: (err) => this.openError('No se pudo actualizar la empresa', err),
        });
        break;
      }

      case 'periodo-save': {
        const idEmp = this.empresaId();
        if (!idEmp) return this.openError('No hay empresa seleccionada.');

        const ejSel = this.ejercicioSeleccionado;
        if (!ejSel?.id_ejercicio) {
          return this.openError('Selecciona un ejercicio contable antes de crear/editar períodos.');
        }
        break;
      }

      case 'periodo-cerrar': {
        const idp = payload?.id_periodo as number | undefined;
        if (!idp) return this.openError('No se encontró el identificador del período.');

        this.periodosService.cerrar(idp).subscribe({
        });
        break;
      }

      case 'periodo-delete': {
        const idp = payload?.id_periodo as number | undefined;
        if (!idp) return this.openError('No se encontró el identificador del período.');

        this.periodosService.delete(idp).subscribe({
        });
        break;
      }

      case 'ejercicio-save': {
        const idEmp = this.empresaId();
        if (!idEmp) return this.openError('No hay empresa seleccionada.');

        const payloadEj: EjercicioContableDto = {
          id_empresa: idEmp,
          anio: Number(this.formEjercicio.anio),
          fecha_inicio: this.formEjercicio.fecha_inicio!,
          fecha_fin: this.formEjercicio.fecha_fin!,
          esta_abierto: this.formEjercicio.esta_abierto ?? true,
          id_ejercicio: this.editEjercicioId ?? undefined,
        };

        const req$ = this.editEjercicioId
          ? this.ejerciciosService.update(this.editEjercicioId, payloadEj)
          : this.ejerciciosService.create(payloadEj);

        req$.subscribe({
          next: (saved) => {
            this.modalEjercicioOpen = false;
            if (this.editEjercicioId) {
              this.ejercicios = this.ejercicios.map(e =>
                e.id_ejercicio === this.editEjercicioId ? { ...e, ...saved } : e
              );
              if (this.ejercicioSeleccionado?.id_ejercicio === this.editEjercicioId) {
                this.setEjercicioSeleccionado(saved);
              }
              this.openSuccess('Ejercicio actualizado.');
            } else {
              this.ejercicios = [...this.ejercicios, saved];
              this.setEjercicioSeleccionado(saved);
              this.openSuccess('Ejercicio creado.');
              this.router.navigate(
                ['/ejercicio', saved.id_ejercicio, 'periodos'],
                {
                  state: {
                    anio: saved.anio,
                    openGenerarModal: true,
                    defaultTipo: 'MENSUAL',
                  }
                }
              );
            }
          },
          error: (err) => this.openError('No se pudo guardar el ejercicio', err),
        });
        break;
      }

      case 'ejercicio-delete': {
        const id = payload?.id_ejercicio as number | undefined;
        if (!id) return this.openError('No se encontró el identificador del ejercicio.');
        this.ejerciciosService.delete(id).subscribe({
          next: () => {
            this.ejercicios = this.ejercicios.filter(e => e.id_ejercicio !== id);
            if (this.ejercicioSeleccionado?.id_ejercicio === id) {
              this.setEjercicioSeleccionado(null);
            }
            this.openSuccess('Ejercicio eliminado.');
          },
          error: (err) => this.openError('No se pudo eliminar el ejercicio', err),
        });
        break;
      }

      case 'ejercicio-abrir': {
        const id = payload?.id_ejercicio as number | undefined;
        if (!id) return this.openError('No se encontró el identificador del ejercicio.');
        this.ejerciciosService.abrir(id).subscribe({
          next: (res) => {
            this.ejercicios = this.ejercicios.map(e =>
              e.id_ejercicio === id ? { ...e, ...res } : e
            );
            if (this.ejercicioSeleccionado?.id_ejercicio === id) {
              this.setEjercicioSeleccionado(res);
            }
            this.openSuccess('Ejercicio marcado como ABIERTO.');
          },
          error: (err) => this.openError('No se pudo abrir el ejercicio', err),
        });
        break;
      }

      case 'ejercicio-cerrar': {
        const id = payload?.id_ejercicio as number | undefined;
        if (!id) return this.openError('No se encontró el identificador del ejercicio.');

        const userId = 1; // ⚠️ pendiente de amarrar al usuario real
        if (!userId) {
          return this.openError('No se pudo obtener el id_usuario del usuario autenticado.');
        }
        const centroId = 300;
        if (!centroId) {
          return this.openError('No se pudo determinar el centro de costo (id_centro).');
        }

        const cuentaResultadosId = 53;
        const traspasarACapital = false;
        const cuentaCapitalId = traspasarACapital ? 51 : null;

        this.ejerciciosService.cerrar(id, {
          cuentaResultadosId,
          traspasarACapital,
          cuentaCapitalId,
          id_usuario: userId,
          id_centro: centroId,
        }).subscribe({
          next: (res) => {
            this.ejercicios = this.ejercicios.map(e =>
              e.id_ejercicio === id ? { ...e, esta_abierto: false } : e
            );
            if (this.ejercicioSeleccionado?.id_ejercicio === id) {
              this.setEjercicioSeleccionado({
                ...this.ejercicioSeleccionado,
                esta_abierto: false,
              } as any);
            }
            this.openSuccess(
              res?.mensaje ||
              'Ejercicio marcado como CERRADO. Se generó póliza de cierre y se recalculó la apertura del siguiente ejercicio (si aplica).'
            );
          },
          error: (err) =>
            this.toast.error(
              this.extractErrorMessage(err) ?? 'Error al cargar los datos de la empresa.',
              'Error',
              0
            ),
        });
        break;
      }
    }
  }


  onRowAction(evt: { action: string; row: UiEmpresa }) {
    if (evt.action === 'edit') {
      return this.onEdit(evt.row);
    }

    if (evt.action === 'delete') {
      if (!this.canDelete) {
        return this.openError('No tienes permisos para eliminar la empresa');
      }

      const id = evt.row.id_empresa ?? evt.row.id;
      if (!id) {
        return this.openError('No se encontró el identificador de la empresa.');
      }

      this.confirmTitle = 'Confirmar eliminación';
      this.confirmMessage = `¿Eliminar la empresa "${evt.row.razon_social}"? Esta acción no se puede deshacer.`;
      this.confirmKind = 'empresa-delete';
      this.confirmPayload = { id_empresa: id };
      this.confirmOpen = true;
      return;
    }

    this.openError(`Acción no soportada: ${evt.action}`);
  }

  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }

  // Abrir gestor de ejercicios
  onOpenEjercicioManager() {
    this.onPrimaryEjercicio();
  }

  // GENERACIÓN AUTOMÁTICA DE PERÍODOS 
  genModalOpen = false;
  genTipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL';
  genIncluirCerrados = false;
  isGenerating = false;

  private ensureEjercicioSeleccionado(): EjercicioContableDto {
    const ej = this.ejercicioSeleccionado;
    if (!ej?.id_ejercicio) {
      this.openError('Selecciona un ejercicio contable antes de generar períodos.');
      throw new Error('No exercise selected');
    }
    return ej;
  }
  async generatePeriodsForSelectedExercise(tipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL') {
    let ej: EjercicioContableDto;
    try {
      ej = this.ensureEjercicioSeleccionado();
    } catch {
      return;
    }

    const idEmp = this.empresaId();
    if (!idEmp) {
      this.openError('No hay empresa seleccionada.');
      return;
    }

    this.isGenerating = true;
    this.openSuccess(`Generando períodos ${tipo.toLowerCase()}...`);
    // ⚠️⚠️PENDIENTE A CAMBIAR⚠️⚠️
    const userId = 1;
    const centroId = 300;

    this.periodosService.generate(ej.id_ejercicio!, tipo, userId, centroId).subscribe({
      next: (periodosGenerados) => {
        const n = Array.isArray(periodosGenerados) ? periodosGenerados.length : undefined;
        this.openSuccess(
          n != null
            ? `Períodos ${tipo.toLowerCase()} generados: ${n}.`
            : `Períodos ${tipo.toLowerCase()} generados correctamente.`
        );
      },
      error: (err) => {
        this.openError('No se pudieron generar los períodos.', err);
      },
      complete: () => {
        this.isGenerating = false;
      },
    });
  }

  openGenerarPeriodos(tipo: Exclude<PeriodoTipo, 'PERSONALIZADO'> = 'MENSUAL') {
    this.genTipo = tipo;
    this.generatePeriodsForSelectedExercise(tipo);
  }
}