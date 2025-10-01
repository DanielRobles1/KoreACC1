import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from 'src/app/components/crud-panel/crud-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastService, ToastState } from '@app/services/toast-service.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';

import { EmpresaServiceTsService } from '@app/services/empresa.service.ts.service';
import { AuthService } from '@app/services/auth.service';
import { PeriodoContableService, PeriodoContableDto, PeriodoTipo } from '@app/services/periodo-contable.service';

type UiEmpresa = {
  id?: number;
  id_empresa?: number;
  razon_social: string;
  rfc: string;
  domicilio_fiscal: string;
  telefono: string;
  correo_contacto: string;
};

type ConfirmKind = 'empresa-save' | 'periodo-save' | 'periodo-delete' | null;

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, CrudPanelComponent, SidebarComponent, ModalComponent, ToastMessageComponent],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
})
export class EmpresaComponent implements OnInit {
  constructor(
    private empresaService: EmpresaServiceTsService,
    private periodosService: PeriodoContableService,
    private auth: AuthService,
    public toast: ToastService
  ) {}

  // ===== Layout =====
  sidebarOpen = true;

  // ===== Tabs =====
  title = 'Configuración de la Empresa';
  tabs: CrudTab[] = [
    { id: 'datos',    label: 'Empresa',   icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa',  route: '/empresa' },
    { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },
  ];
  activeTabId: 'datos' | 'periodos' = 'datos';

  // ===== Empresa =====
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
  };

  // ===== Períodos =====
  primaryActionLabel2 = 'Nuevo período';
  columns2: CrudColumn[] = [
    { key: 'id_periodo',   header: '#', width: '72px' },
    { key: 'tipo_periodo', header: 'Tipo' },
    { key: 'fecha_inicio', header: 'Inicio' },
    { key: 'fecha_fin',    header: 'Fin' },
    { key: 'esta_abierto', header: 'Abierto' },
  ];
  periodos: PeriodoContableDto[] = [];
  actions2: CrudAction[] = [
    { id: 'edit', label: 'Editar', tooltip: 'Editar' },
    { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
  ];

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

  // Modal confirm genérico
  confirmOpen = false;
  confirmTitle = 'Confirmar acción';
  confirmMessage = '';
  private confirmKind: ConfirmKind = null;
  private confirmPayload: any = null;

  // ===== Fechas/validación =====
  minDate: string = '';

  // ===== Utils de fechas (local-safe) =====
  private pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
  private toISO(d: Date) {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  }
  private todayLocal(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  private parseISODateLocal(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
  private isPast(dateStr: string): boolean {
    if (!dateStr) return false;
    const d = this.parseISODateLocal(dateStr);
    return d < this.todayLocal();
  }

  private startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  private endOfMonth(d: Date)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
  private startOfYear(d: Date)  { return new Date(d.getFullYear(), 0, 1); }
  private endOfYear(d: Date)    { return new Date(d.getFullYear(), 12, 0); }
  private addDays(d: Date, days: number)   { const r = new Date(d); r.setDate(r.getDate() + days); return r; }

  // Semana Lunes-Domingo
  private startOfWeek(d: Date) {
    const wd = d.getDay();                 // 0=Dom, 1=Lun,...6=Sáb
    const diff = (wd === 0 ? -6 : 1 - wd); // llevar a lunes
    const res = new Date(d);
    res.setDate(d.getDate() + diff);
    return new Date(res.getFullYear(), res.getMonth(), res.getDate());
  }

  // ==== Período COMPLETO que contiene la fecha de referencia ====
  private computeCurrentPeriod(
    type: PeriodoTipo,
    ref?: Date
  ): { start: Date; end: Date } | null {
    if (type === 'PERSONALIZADO') return null;

    const base = ref ?? this.todayLocal();
    let start: Date;
    let end: Date;

    switch (type) {
      case 'SEMANAL':
        start = this.startOfWeek(base);
        end   = this.addDays(start, 6);
        break;
      case 'MENSUAL':
        start = this.startOfMonth(base);
        end   = this.endOfMonth(base);
        break;
      case 'ANUAL':
        start = this.startOfYear(base);
        end   = this.endOfYear(base);
        break;
    }
    return { start, end };
  }

  /** Establece fechas según el tipo, usando el período COMPLETO actual
   * (el que contiene la fecha de referencia; por defecto, HOY). */
  private setDatesByType(type: PeriodoTipo, referenceDate?: Date) {
    if (type === 'PERSONALIZADO') return;
    const range = this.computeCurrentPeriod(type, referenceDate ?? this.todayLocal());
    if (!range) return;
    this.formPeriodo.fecha_inicio = this.toISO(range.start);
    this.formPeriodo.fecha_fin    = this.toISO(range.end);
  }

  // ===== Ciclo de vida =====
  ngOnInit() {
    this.toast.state$.subscribe(s => this.vm = s);
    this.canEdit   = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');

    this.actions = [
      ...(this.canEdit   ? [{ id: 'edit', tooltip: 'Editar Empresa' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Empresa' }] : []),
    ];
    this.actions2 = [
      ...(this.canEdit   ? [{ id: 'edit',   tooltip: 'Editar Periodo' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Periodo' }] : []),
    ];

    this.minDate = this.toISO(this.todayLocal());
    this.loadDataEmpresa();
  }

  openSuccess(message: string) {
    this.toast.success(message, 'Éxito', 3000);
  }
  openError(message: string, err?: unknown) {
    if (err) console.error('[EmpresaComponent] Error:', err);
    this.toast.error(message, 'Error', 0);
  }

  // ===== Empresa =====
  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }

  loadDataEmpresa() {
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        const one = Array.isArray(data) ? data[0] : data;
        this.rows = one ? [one as UiEmpresa] : [];
        if (this.rows[0]) this.loadPeriodos();
      },
      error: (err) => this.toast.error(this.extractErrorMessage(err) ?? 'Error al cargar los datos de la empresa.', 'Error', 0),
    });
  }
  onTabChange(id: string) {
    if (id === 'datos' || id === 'periodos') this.activeTabId = id;
    if (id === 'periodos') this.loadPeriodos();
  }

  // Editar empresa
  onPrimary() {
    if (!this.canEdit) return this.openError('No tienes permisos para editar la empresa');
    const empresa = this.rows[0];
    if (!empresa)  return this.openError('No hay datos de empresa para editar');
    this.formEmpresa = { ...empresa };
    this.editOpen = true;
  }
  onEdit(row: UiEmpresa) {
    if (!this.canEdit) return this.openError('No tienes permisos para editar');
    this.formEmpresa = { ...row };
    this.editOpen = true;
  }
  closeModal()  { this.editOpen = false; }
  cancelModal() { this.editOpen = false; }
  confirmModal() {
    this.confirmTitle = 'Confirmar guardado';
    this.confirmMessage = '¿Deseas guardar los cambios de la empresa?';
    this.confirmKind = 'empresa-save';
    this.confirmPayload = null;
    this.confirmOpen = true;
  }

  // ===== Períodos =====
  private empresaId(): number | null {
    const e = this.rows[0];
    const id = (e?.id_empresa ?? e?.id) as number | undefined;
    return id ?? null;
  }
  loadPeriodos() {
    const idEmp = this.empresaId();
    if (!idEmp) return;
    this.periodosService.listByEmpresa(idEmp).subscribe({
      next: (items) => this.periodos = items ?? [],
      error: (err) => this.openError('Error al cargar los períodos', err),
    });
  }

  // Cambios de tipo/fecha en el modal de período
  onTipoPeriodoChange(newType: PeriodoTipo) {
    this.formPeriodo.tipo_periodo = newType;
    if (newType === 'PERSONALIZADO') return;

    // Si hay fecha de inicio úsala como referencia; si no, hoy.
    const ref = this.formPeriodo.fecha_inicio
      ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
      : this.todayLocal();

     this.setDatesByType(newType, this.todayLocal());
  }

  onFechaInicioChange(newStartStr: string) {
    this.formPeriodo.fecha_inicio = newStartStr;

    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;
    if (t && t !== 'PERSONALIZADO') {
      // Para tipos automáticos, tomar el período COMPLETO que contiene esa fecha
      const ref = this.parseISODateLocal(newStartStr);
      this.setDatesByType(t, ref);
    } else {
      // PERSONALIZADO: validar no pasado y fin >= inicio
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
    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;

    if (t && t !== 'PERSONALIZADO') {
      // En automáticos, ignoramos cambios manuales y forzamos el fin correcto
      const ref = this.formPeriodo.fecha_inicio
        ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
        : this.todayLocal();
      this.setDatesByType(t, ref);
      return;
    }

    // PERSONALIZADO: validaciones
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

  // Abrir creación de período
  onPrimaryPeriodo() {
    if (!this.canEdit) return this.openError('No tienes permisos para crear períodos');
    this.modalPeriodoTitle = 'Crear período';
    this.editPeriodoId = null;
    this.formPeriodo = { tipo_periodo: 'MENSUAL', fecha_inicio: '', fecha_fin: '', esta_abierto: true };

    // Mes ACTUAL completo (del 1 al último día)
    this.setDatesByType('MENSUAL', this.todayLocal());

    this.modalPeriodoOpen = true;
  }

  onPeriodoAction(evt: { action: string; row: PeriodoContableDto }) {
    switch (evt.action) {
      case 'edit':
        if (!this.canEdit) return this.openError('No tienes permisos para editar períodos');
        this.modalPeriodoTitle = 'Editar período';
        this.editPeriodoId = evt.row.id_periodo ?? null;
        this.formPeriodo = { ...evt.row }; // respetar lo guardado
        this.modalPeriodoOpen = true;
        break;

      case 'delete':
        if (!this.canDelete) return this.openError('No tienes permisos para eliminar períodos');
        this.confirmTitle = 'Confirmar eliminación';
        this.confirmMessage = `¿Eliminar el período del ${evt.row.fecha_inicio} al ${evt.row.fecha_fin}? Esta acción no se puede deshacer.`;
        this.confirmKind = 'periodo-delete';
        this.confirmPayload = { id_periodo: evt.row.id_periodo };
        this.confirmOpen = true;
        break;

      default:
        this.openError(`Acción no soportada: ${evt.action}`);
    }
  }

  // Cierre modal período
  closePeriodoModal()  { this.modalPeriodoOpen = false; }
  cancelPeriodoModal() { this.modalPeriodoOpen = false; }

  // Confirmación antes de guardar período
  confirmPeriodoModal() {
    if (!this.formPeriodo.tipo_periodo || !this.formPeriodo.fecha_inicio || !this.formPeriodo.fecha_fin) {
      return this.openError('Completa tipo de período, fecha de inicio y fin.');
    }

    const t = this.formPeriodo.tipo_periodo as PeriodoTipo;

    // Solo PERSONALIZADO prohíbe pasado; los demás pueden abarcar días previos del período actual.
    if (t === 'PERSONALIZADO' &&
        (this.isPast(this.formPeriodo.fecha_inicio) || this.isPast(this.formPeriodo.fecha_fin))) {
      return this.openError('Las fechas no pueden ser pasadas.');
    }

    // Orden siempre válido
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

  // ===== Confirmación genérica =====
  closeConfirm() { this.confirmOpen = false; this.confirmKind = null; this.confirmPayload = null; }
  cancelConfirm() { this.closeConfirm(); }

  confirmProceed() {
    const kind = this.confirmKind;
    const payload = this.confirmPayload;
    this.closeConfirm();

    switch (kind) {
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
        const payloadPeriodo: PeriodoContableDto = {
          id_empresa: idEmp,
          tipo_periodo: this.formPeriodo.tipo_periodo as PeriodoTipo,
          fecha_inicio: this.formPeriodo.fecha_inicio!,
          fecha_fin: this.formPeriodo.fecha_fin!,
          esta_abierto: this.formPeriodo.esta_abierto ?? true,
          periodo_daterange: undefined,
        };
        const req$ = this.editPeriodoId
          ? this.periodosService.update(this.editPeriodoId, payloadPeriodo)
          : this.periodosService.create(payloadPeriodo);

        req$.subscribe({
          next: (saved) => {
            this.modalPeriodoOpen = false;
            if (this.editPeriodoId) {
              this.periodos = this.periodos.map(p => p.id_periodo === this.editPeriodoId ? { ...p, ...saved } : p);
              this.openSuccess('Período actualizado.');
            } else {
              this.periodos = [...this.periodos, saved];
              this.openSuccess('Período creado.');
            }
          },
          error: (err) => this.openError('No se pudo guardar el período', err),
        });
        break;
      }

      case 'periodo-delete': {
        const idp = payload?.id_periodo as number | undefined;
        if (!idp) return this.openError('No se encontró el identificador del período.');

        this.periodosService.delete(idp).subscribe({
          next: () => {
            this.periodos = this.periodos.filter(p => p.id_periodo !== idp);
            this.openSuccess('Período eliminado.');
          },
          error: (err) => this.openError('No se pudo eliminar el período', err),
        });
        break;
      }
    }
  }

  // ===== Común =====
  onRowAction(evt: { action: string; row: UiEmpresa }) {
    if (evt.action === 'edit') return this.onEdit(evt.row);
    this.openError(`Acción no soportada: ${evt.action}`);
  }
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }
}
