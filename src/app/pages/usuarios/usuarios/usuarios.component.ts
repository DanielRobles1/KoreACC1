import { Component } from '@angular/core';

// UI Components
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from '../../../components/crud-panel/crud-panel.component';
import { ModalComponent } from '../../../components/modal/modal/modal.component';
import { UserFormComponent, Usuario } from '../../../components/user-form/user-form/user-form.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SidebarComponent, CrudPanelComponent, ModalComponent, UserFormComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'] // <- plural
})
export class UsuariosComponent {

  // UI TEXT
  title = 'Gestión de usuarios y permisos';

  // TABS
  tabs: CrudTab[] = [
    { id: 'usuarios', label: 'Usuarios',         icon: 'assets/svgs/poliza.svg', iconAlt: 'Usuarios' },
    { id: 'roles',    label: 'Roles y permisos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos' },
  ];
  activeTabId = 'usuarios';

  // TABLE: COLUMNS & DATA
  columns: CrudColumn[] = [
    { key: 'id',       header: '#' },
    { key: 'nombre',   header: 'Nombre' },
    { key: 'correo',   header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'rol',      header: 'Rol' },
  ];

  rows: Usuario[] = [
    { id: 1, nombre: 'Alejandro Rivera', correo: 'ale@gmail.com', telefono: '951-xxx-xx-xx', rol: 'Contador' },
    { id: 2, nombre: 'Daniel',           correo: 'dani@gmail.com', telefono: '951-xxx-xx-xx', rol: 'Administrador' },
  ];

  actions: CrudAction[] = [
    { id: 'edit',   tooltip: 'Editar usuario' },
    { id: 'delete', tooltip: 'Eliminar usuario' },
  ];

  // PAGINATION
  page = 1;
  totalPages = 68;

  // FORM MODAL STATE (REUSABLE MODAL + USER FORM)
  modalOpen = false;
  modalTitle = 'Nuevo usuario';
  modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  editing: Usuario | null = null;

  // CONFIRMATION MODAL STATE (REUSABLE)
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'delete' | 'save' | null = null;
  private pendingRow: Usuario | null = null;
  private pendingUser: Usuario | null = null;

  // HANDLERS: TABS
  onTabChange(id: string) {
    this.activeTabId = id;
  }

  // HANDLERS: PRIMARY (ADD NEW) & ROW ACTIONS (EDIT / DELETE)
  onPrimary() {
    // Abrir modal en modo creación
    this.editing = null;
    this.modalTitle = 'Añadir usuario';
    this.modalSize = 'md';
    this.modalOpen = true;
  }

  onRowAction(evt: { action: string; row: Usuario }) {
    if (evt.action === 'edit') {
      // Abrir modal en modo edición
      this.editing = evt.row;
      this.modalTitle = `Editar usuario #${evt.row.id}`;
      this.modalSize = 'md';
      this.modalOpen = true;
      return;
    }

    if (evt.action === 'delete') {
      // Preparar y abrir confirmación de eliminación
      this.pendingAction = 'delete';
      this.pendingRow = evt.row;
      this.confirmTitle = 'Confirmar eliminación';
      this.confirmMessage = `¿Deseas eliminar a “${evt.row.nombre}” (${evt.row.correo})? Esta acción no se puede deshacer.`;
      this.confirmOpen = true;
    }
  }

  // HANDLERS: FORM (EMIT SUBMITTED) → OPEN CONFIRM
  upsertUser(payload: Usuario) {
    // Preparar confirmación de guardado (creación o edición)
    this.pendingAction = 'save';
    this.pendingUser = payload;

    const esEdicion = !!this.editing?.id;
    this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
    this.confirmMessage = esEdicion
      ? `¿Guardar los cambios del usuario “${payload.nombre}”?`
      : `¿Crear el usuario “${payload.nombre}”?`;

    this.confirmOpen = true;
  }

  // HANDLERS: CONFIRM MODAL
  closeConfirm() { this.confirmOpen = false; }

  cancelConfirm() {
    this.confirmOpen = false;
    this.pendingAction = null;
    this.pendingRow = null;
    this.pendingUser = null;
  }

  confirmProceed() {
    // Eliminar
    if (this.pendingAction === 'delete' && this.pendingRow) {
      this.rows = this.rows.filter(r => r.id !== this.pendingRow!.id);
      this.confirmOpen = false;
      this.pendingAction = null;
      this.pendingRow = null;
      return;
    }

    // Guardar (crear o actualizar)
    if (this.pendingAction === 'save' && this.pendingUser) {
      const payload = this.pendingUser;

      if (this.editing?.id) {
        // Actualizar
        this.rows = this.rows.map(r => r.id === this.editing!.id ? { ...r, ...payload } : r);
      } else {
        // Crear
        const nextId = (this.rows.at(-1)?.id || 0) + 1;
        this.rows = [...this.rows, { ...payload, id: nextId }];
      }

      // Cerrar modales y limpiar estado
      this.confirmOpen = false;
      this.modalOpen = false;
      this.pendingAction = null;
      this.pendingUser = null;
      this.editing = null;
      return;
    }
  }

  // ===========================================================================
  // HANDLERS: FORM MODAL OPEN/CLOSE
  // ===========================================================================
  closeModal() { this.modalOpen = false; }
  cancelModal() { this.modalOpen = false; }

  // Nota: Si en el futuro deseas que (confirmed) del modal principal haga submit,
  // ya está conectado en el HTML con la template ref #userFormRef.
}