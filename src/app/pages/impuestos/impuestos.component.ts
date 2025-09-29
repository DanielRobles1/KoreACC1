import { Component } from '@angular/core';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ImpuestoServiceTsService } from '@app/services/impuesto.service.ts.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ImpuestoFormComponent, Impuestos } from '@app/components/impuesto-form/impuesto-form.component';
import { AuthService } from '@app/services/auth.service';


@Component({
  selector: 'app-impuestos',
  standalone: true,
  imports: [SidebarComponent, CrudPanelComponent, ModalComponent, ToastMessageComponent, ImpuestoFormComponent],
  templateUrl: './impuestos.component.html',
  styleUrl: './impuestos.component.scss'
})
export class ImpuestosComponent {

  constructor(
    private impuestoService: ImpuestoServiceTsService,
    private router: Router,
    private http: HttpClient,
    private auth: AuthService,
  ) { }

  // FORM MODAL
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  impuestoToDelete: Impuestos | null = null;
  private pendingAction = 'save';
  private pendingImpuesto: Impuestos | null = null;
  closeModal() { this.modalOpen = false; }
  cancelModal() { this.modalOpen = false; }

  canCreate = false;
  canEdit = false;
  canDelete = false;

  modalOpen = false;
  modalTitle = 'Crear nuevo impuesto';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  editingImpuesto: Impuestos | null = null;

  // CONFIGURACIÓN DEL CRUD
  title = 'Impuestos';
  tabs: CrudTab[] = [
    { id: 'empresa', label: 'Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Usuarios', route: '/empresa' },
    { id: 'impuestos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos', route: '/impuestos' },
  ];
  activeTabId = "impuestos";
  primaryActioLabel = 'Nuevo impuesto';
  columns: CrudColumn[] = [
    { key: 'id_impuesto', header: 'ID', width: '5%' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'modo', header: 'Modo' },
    { key: 'tasa', header: 'Tasa (%)', width: '10%' },
    { key: 'aplica_en', header: 'Aplica en' },
    { key: 'es_estandar', header: 'Estándar', width: '10%' },
    { key: 'vigencia_inicio', header: 'Vigencia inicio', width: '15%' },
    { key: 'cuenta_relacionada', header: 'Cuenta relacionada' },
  ];
  rows: Impuestos[] = [];
  actions: CrudAction[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar' },
  ];

  // MODAL "SIN PERMISOS"
  noPermsOpen = false;
  noPermsTitle = 'Acción no permitida';
  noPermsMessage = 'No tienes permisos para realizar esta acción.';
  private openNoPermisosModal(msg?: string) {
    this.noPermsMessage = msg ?? 'No tienes permisos para realizar esta acción.';
    this.noPermsOpen = true;
  }
  closeNoPerms() { this.noPermsOpen = false; }

  // ==== TOASTS GENÉRICOS ====
  successOpen = false;
  successTitle = 'Éxito';
  successMessage = 'Operación realizada correctamente.';

  errorOpen = false;
  errorTitle = 'Error';
  errorMessage = 'Ocurrió un error inesperado.';

  showSuccess(message: string, title = 'Éxito') {
    this.successTitle = title;
    this.successMessage = message;
    this.successOpen = true;
  }
  closeSuccess() { this.successOpen = false; }

  showError(err: any, fallback = 'Ocurrió un error al procesar la solicitud.') {
    const msg = this.extractErrorMessage(err) ?? fallback;
    this.errorTitle = 'Error';
    this.errorMessage = msg;
    this.errorOpen = true;
  }
  closeError() { this.errorOpen = false; }

  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }

  ngOnInit() {
    this.cargaImpuestos();
    this.canCreate = this.auth.hasPermission('crear_empresa');
    this.canEdit = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');
    this.actions = [
      ...(this.canEdit ? [{ id: 'edit', tooltip: 'Editar Impuesto' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Impuesto' }] : []),
    ];
  }

  cargaImpuestos() {
    this.impuestoService.getImpuestos().subscribe({
      next: (data) => {
        this.rows = data;
      },
      error: (err) => {
        this.showError(err, 'No se pudieron cargar los impuestos.');
      }
    })
  }

  // Nuevo impuesto
  onPrimary() {
    if (!this.canCreate) {
      this.openNoPermisosModal('No tienes permisos para crear roles.');
      return;
    }
    this.modalTitle = 'Crear nuevo impuesto';
    this.editingImpuesto = null;
    this.modalOpen = true;
  }

  onRowAction(evt: { action: string, row: Impuestos }) {
    if (evt.action === 'edit') {
      if (!this.canEdit) {
        this.openNoPermisosModal('No tienes permisos para editar impuestos.');
        return;
      }
      this.modalTitle = `Editar impuesto: ${evt.row.nombre}`;
      this.editingImpuesto = evt.row;
      this.modalOpen = true;
      return;
    }

    if (evt.action === 'delete') {
      if (!this.canDelete) {
        this.openNoPermisosModal('No tienes permisos para eliminar los impuestos registrados.');
        return;
      }
      const toDel = this.rows.find(r => r.id_impuesto === evt.row.id_impuesto);
      this.impuestoToDelete = toDel ?? null;
      this.pendingAction = 'delete';
      if (toDel) {
        this.confirmTitle = 'Confirmar eliminación';
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el impuesto "${toDel.nombre}"? Esta acción no se puede deshacer.`;
        this.confirmOpen = true;
      }
    }
  }

  upsertImpuesto(impuesto: Impuestos) {
    this.pendingAction = 'save';
    this.pendingImpuesto = impuesto;

    const esEdicion = !!this.editingImpuesto?.id_impuesto;
    this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
    this.confirmMessage = esEdicion
      ? `¿Guardar los cambios del impuesto “${impuesto.nombre}”?`
      : `¿Crear el impuesto “${impuesto.nombre}”?`;

    this.confirmOpen = true;
  }

  // ===== CONFIRM MODAL =====
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }
  confirmProceed() {
    if (this.pendingAction === 'delete' && this.impuestoToDelete) {
      this.impuestoService.eliminarImpuesto(this.impuestoToDelete.id_impuesto!)
        .subscribe({
          next: () => {
            // Actualizar lista
            this.rows = this.rows.filter(r => r.id_impuesto !== this.impuestoToDelete?.id_impuesto);

            this.showSuccess(`El impuesto "${this.impuestoToDelete?.nombre}" fue eliminado correctamente.`);
            this.impuestoToDelete = null;
            this.confirmOpen = false;
          },
          error: (err) => {
            this.showError(err, `No se pudo eliminar el impuesto "${this.impuestoToDelete?.nombre}".`);
            this.confirmOpen = false;
          }
        });
    }
    else if (this.pendingAction === 'save' && this.pendingImpuesto) {
      const esEdicion = !!this.editingImpuesto?.id_impuesto;

      const request$ = esEdicion
        ? this.impuestoService.actualizarImpuesto(this.pendingImpuesto.id_impuesto!, this.pendingImpuesto)
        : this.impuestoService.crearImpuesto(this.pendingImpuesto);

      request$.subscribe({
        next: (res) => {
          if (esEdicion) {
            // Reemplazar en la lista
            this.rows = this.rows.map(r =>
              r.id_impuesto === res.id_impuesto ? res : r
            );
            this.showSuccess(`El impuesto "${res.nombre}" fue actualizado correctamente.`);
          } else {
            // Agregar a la lista
            this.rows = [...this.rows, res];
            this.showSuccess(`El impuesto "${res.nombre}" fue creado correctamente.`);
          }
          this.modalOpen = false;
          this.confirmOpen = false;
        },
        error: (err) => {
          this.showError(err, esEdicion
            ? `No se pudo actualizar el impuesto "${this.pendingImpuesto?.nombre}".`
            : `No se pudo crear el impuesto "${this.pendingImpuesto?.nombre}".`
          );
          this.confirmOpen = false;
        }
      });
    }
  }

  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) this.router.navigate([selected.route]);
  }

  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }
}
