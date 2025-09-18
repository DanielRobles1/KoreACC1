import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudAction, CrudColumn, CrudPanelComponent, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { RoleFormComponent } from '@app/components/role-form-component/role-form-component.component';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";

@Component({
  selector: 'app-rolesypermisos',
  standalone: true,
  imports: [CommonModule, CrudPanelComponent, ModalComponent, RoleFormComponent, SidebarComponent],
  templateUrl: './rolesypermisos.component.html',
  styleUrls: ['./rolesypermisos.component.scss']
})
export class RolesypermisosComponent {
  @ViewChild('roleFormRef') roleFormRef!: RoleFormComponent;

  constructor(private router: Router) {}

  // =======================
  // UI CONFIG
  // =======================
  title = 'Roles y permisos';
  tabs: CrudTab[] = [
    { id: 'usuarios', label: 'Usuarios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Usuarios', route: '/usuarios' },
    { id: 'roles', label: 'Roles y permisos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos', route: '/login/roles' },
  ];
  activeTabId = 'roles';
  primaryActionLabel = 'Nuevo Rol';

  // =======================
  // TABLA
  // =======================
  columns: CrudColumn[] = [
    { key: 'id', header: 'ID', width: '50px' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'permissions', header: 'Permisos' },
  ];

  rows: any[] = [
    { id: 1, nombre: 'Administrador', descripcion: 'Acceso completo', permissions: ['catalogo_ver', 'catalogo_crear', 'gestionar_roles'] },
    { id: 2, nombre: 'Contador', descripcion: 'Acceso limitado', permissions: ['catalogo_ver', 'reportes_ver'] }
  ];

  actions: CrudAction[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar' },
  ];

  page = 1;
  totalPages = 1;

  // =======================
  // MODAL
  // =======================
  modalOpen = false;
  modalTitle = '';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  editingRole: any = null;

  // =======================
  // CONFIRMACIÓN
  // =======================
  confirmOpen = false;
  confirmTitle = 'Confirmar eliminación';
  confirmMessage = '';
  roleToDelete: any = null;

  // =======================
  // PERMISOS DISPONIBLES
  // =======================
  availablePermissions = [
    'catalogo_ver','catalogo_crear','catalogo_editar','catalogo_eliminar',
    'sucursales_ver','sucursales_crear','sucursales_editar','sucursales_eliminar',
    'polizas_ver','polizas_crear','polizas_editar','polizas_eliminar',
    'movimientos_ver','movimientos_crear','movimientos_editar','movimientos_eliminar',
    'reportes_ver','reportes_exportar',
    'gestionar_usuarios','gestionar_roles'
  ];

  // =======================
  // BÚSQUEDA
  // =======================
  searchTerm = '';
  get filteredRows() {
    if (!this.searchTerm) return this.rows;
    const term = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.nombre.toLowerCase().includes(term) ||
      r.descripcion.toLowerCase().includes(term) ||
      r.permissions.some((p: string) => p.toLowerCase().includes(term))
    );
  }

  get tableRows() {
    return this.filteredRows.map(r => ({
      ...r,
      permissions: this.formatPermissions(r.permissions)
    }));
  }

  private formatPermissions(perms: string[]): string {
    if (!perms || perms.length === 0) return '-';
    if (perms.length <= 3) return perms.map(p => this.formatPermission(p)).join(', ');
    return `${perms.slice(0, 3).map(p => this.formatPermission(p)).join(', ')} (+${perms.length - 3} más)`;
  }

  private formatPermission(permission: string): string {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  // =======================
  // HANDLERS
  // =======================
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) {
      this.router.navigate([selected.route]);
    }
  }

  // Nuevo rol
  onPrimary() {
    this.modalTitle = 'Nuevo Rol';
    this.editingRole = { nombre: '', descripcion: '', permissions: [] };
    this.modalOpen = true;
  }

  // Acciones de fila
  onRowAction(event: any) {
    if (event.action === 'edit') {
      this.modalTitle = 'Editar Rol';
      const originalRole = this.rows.find(r => r.id === event.row.id);
      if (originalRole) {
        this.editingRole = {
          id: originalRole.id,
          nombre: originalRole.nombre,
          descripcion: originalRole.descripcion,
          permissions: [...originalRole.permissions],
        };
        this.modalOpen = true;
      }
    } else if (event.action === 'delete') {
      this.roleToDelete = this.rows.find(r => r.id === event.row.id);
      if (this.roleToDelete) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el rol "${this.roleToDelete.nombre}"?`;
        this.confirmOpen = true;
      }
    }
  }

  // Guardar rol
  upsertRole(role: any) {
    if (role.id) {
      const idx = this.rows.findIndex(r => r.id === role.id);
      if (idx !== -1) this.rows[idx] = role;
    } else {
      role.id = this.rows.length ? Math.max(...this.rows.map(r => r.id)) + 1 : 1;
      this.rows.push(role);
    }
    this.closeModal();
  }

  // Modal
  onSaveClick() {
    if (this.roleFormRef) this.roleFormRef.submitForm();
  }
  onCancelClick() { this.cancelModal(); }
  closeModal() { this.modalOpen = false; }
  cancelModal() { this.modalOpen = false; }

  // Confirmación
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }
  confirmProceed() {
    if (this.roleToDelete) {
      this.rows = this.rows.filter(r => r.id !== this.roleToDelete.id);
    }
    this.confirmOpen = false;
  }

  // Búsqueda desde crud-panel
  onSearch(term: string) {
    this.searchTerm = term;
  }
}
