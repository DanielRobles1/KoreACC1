import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from 'src/app/components/crud-panel/crud-panel.component';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";
import { EmpresaServiceTsService } from '@app/services/empresa.service.ts.service';
import { AuthService } from '@app/services/auth.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';

type UiEmpresa = {
  id: number;
  razon_social: string;
  rfc: string;
  domicilio_fiscal: string;
  telefono: string;
  correo_contacto: string;
}

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CrudPanelComponent, SidebarComponent, ToastMessageComponent, ModalComponent],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss'
})
export class EmpresaComponent {
  constructor(
    private router: Router,
    private empresaService: EmpresaServiceTsService,
    private auth: AuthService) {}

  // Configuración del CrudPanel
  title = 'Configuración de la Empresa';
  tabs: CrudTab[] = [
    { id: 'datos', label: 'Datos de la Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
    { id: 'periodos', label: 'Períodos Contables', icon: 'assets/svgs/poliza.svg', iconAlt: 'Periodos', route: '/usuarios' }
  ]
  activeTabId = 'datos';
  primaryActionLabel = 'Actualizar Datos';
  columns: CrudColumn[] = [
    { key: 'id', header: '#', width: '64px' },
    { key: 'razon_social', header: 'Razón social' },
    { key: 'rfc', header: 'RFC' },
    { key: 'domicilio_fiscal', header: 'Domicilio fiscal' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'correo_contacto', header: 'Correo de contacto' },
  ];

  rows: UiEmpresa[] = [];
  actions: CrudAction[] = [];

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

  canCreate = false;
  canEdit = false;
  canDelete = false;

  modalOpen = false;
  modalTitle = '';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  editingRole: Partial<UiEmpresa> | null = null;

  confirmOpen = false;
  confirmTitle = 'Confirmar eliminación';
  confirmMessage = '';
  companyToDelete: UiEmpresa | null = null;

  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }

  ngOnInit() {
    this.loadDataEmpresa();

    this.canCreate = this.auth.hasPermission('crear_empresa');
    this.canEdit = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');

    this.actions = [
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Información' }] : []),
    ];
  }

  loadDataEmpresa() {
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        const empresa = data[0];
        this.rows = [empresa];
      },
      error: (error) => this.showError('Error al cargar los datos de la empresa', error)
    });
  }

  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) this.router.navigate([selected.route]);
  }

  // Actualizar datos de la empresa
  onPrimary() {
    if (!this.canCreate) {
      this.openNoPermisosModal('No tienes permisos para crear roles.');
      return;
    }
    this.modalTitle = 'Actualizar datos de la empresa';
    this.editingRole = { razon_social: '', rfc: '', domicilio_fiscal: '', telefono: '', correo_contacto: '' };
    this.modalOpen = true;
  }

  onRowAction(evt: { action: string, row: UiEmpresa }) {
    if (evt.action === 'delete') {
      if (!this.canDelete) {
        this.openNoPermisosModal('No tienes permisos para eliminar la información de la empresa.');
        return;
      }
      const toDel = this.rows.find(r => r.id === evt.row.id);
      this.companyToDelete = toDel ?? null;
      if (toDel) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar la información de la empresa "${toDel.razon_social}"? Esta acción no se puede deshacer.`;
        this.confirmOpen = true;
      }
    }
  }

  // Confirmación
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }
  confirmProceed() {
    if (!this.companyToDelete) { this.confirmOpen = false; return; }
    const { razon_social: nombre, id } = this.companyToDelete;
    this.empresaService.deleteEmpresa(id).subscribe({
      next: () => {
        this.loadDataEmpresa();
        this.confirmOpen = false;
        this.companyToDelete = null;
        this.showSuccess(`Rol “${nombre}” eliminado correctamente.`);
      },
      error: (err) => this.showError(err, `Error al eliminar el rol “${nombre}”.`)
    });
  }

  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }
}
