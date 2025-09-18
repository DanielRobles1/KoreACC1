import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudAction, CrudColumn, CrudPanelComponent, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { RoleFormComponent } from '@app/components/role-form-component/role-form-component.component';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";
import { RolesService } from '@app/services/roles.service'; // 👈 usa tu service

type ApiRole = {
  id?: number;
  id_rol?: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  permisos?: string[];
  Permisos?: { nombre: string }[];
};

type UiRole = {
  id: number;
  nombre: string;
  descripcion?: string;
  permissions: string[];
  activo?: boolean;
};

@Component({
  selector: 'app-rolesypermisos',
  standalone: true,
  imports: [CommonModule, CrudPanelComponent, ModalComponent, RoleFormComponent, SidebarComponent],
  templateUrl: './rolesypermisos.component.html',
  styleUrls: ['./rolesypermisos.component.scss']
})
export class RolesypermisosComponent {
  @ViewChild('roleFormRef') roleFormRef!: RoleFormComponent;

  constructor(private router: Router, private rolesSvc: RolesService) {}

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
    { key: 'id', header: 'ID', width: '64px' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'permissions', header: 'Permisos' },
  ];

  rows: UiRole[] = [];
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
  editingRole: Partial<UiRole> | null = null;

  // ===== CONFIRMACIÓN (DELETE) =====
  confirmOpen = false;
  confirmTitle = 'Confirmar eliminación';
  confirmMessage = '';
  roleToDelete: UiRole | null = null;

  // ===== CONFIRMACIÓN (SAVE: crear/editar) =====
  saveConfirmOpen = false;
  saveConfirmTitle = '';
  saveConfirmMessage = '';
  private pendingSaveRole: Partial<UiRole> | null = null;

  // =======================
  // PERMISOS DISPONIBLES
  // =======================
  availablePermissions: string[] = [];

  // =======================
  // BÚSQUEDA
  // =======================
  searchTerm = '';
  get filteredRows() {
    if (!this.searchTerm) return this.rows;
    const term = this.searchTerm.toLowerCase();
    return this.rows.filter(r =>
      r.nombre.toLowerCase().includes(term) ||
      (r.descripcion ?? '').toLowerCase().includes(term) ||
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
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // =======================
  // INIT
  // =======================
  ngOnInit() {
    this.loadRoles();
    this.loadPermisosDisponibles();
  }

  // Normaliza un rol recibido de la API a la forma de UI
  private normalizeRole(api: ApiRole): UiRole {
    const id = api.id ?? api.id_rol ?? 0;
    const permissions =
      Array.isArray(api.permisos) ? api.permisos :
      Array.isArray(api.Permisos) ? api.Permisos.map(p => p.nombre) :
      [];
    return {
      id,
      nombre: api.nombre,
      descripcion: api.descripcion ?? '',
      activo: api.activo,
      permissions,
    };
  }

  private unwrap<T>(res: any): T {
    return (res && typeof res === 'object' && 'data' in res) ? res.data as T : res as T;
  }

  // =======================
  // CARGAS
  // =======================
  loadRoles() {
    this.rolesSvc.getRoles().subscribe({
      next: (res) => {
        const arr = this.unwrap<ApiRole[]>(res) ?? [];
        this.rows = arr.map(r => this.normalizeRole(r));
        // Si tu backend soporta paginación, setea totalPages aquí
      },
      error: (err) => console.error('Error al cargar roles', err)
    });
  }

  loadPermisosDisponibles() {
    this.rolesSvc.getPermisos().subscribe({
      next: (res) => {
        const permisos = this.unwrap<any[]>(res) ?? [];
        // Soporta dos formas: array de strings o de objetos { nombre }
        this.availablePermissions = permisos.map((p: any) => typeof p === 'string' ? p : p?.nombre).filter(Boolean);
      },
      error: (err) => console.error('Error al cargar permisos', err)
    });
  }

  // =======================
  // HANDLERS
  // =======================
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) this.router.navigate([selected.route]);
  }

  // Nuevo rol
  onPrimary() {
    this.modalTitle = 'Nuevo Rol';
    this.editingRole = { nombre: '', descripcion: '', permissions: [], activo: true };
    this.modalOpen = true;
  }

  // Acciones de fila
  onRowAction(event: { action: string; row: UiRole }) {
    if (event.action === 'edit') {
      this.modalTitle = 'Editar Rol';
      const original = this.rows.find(r => r.id === event.row.id);
      if (original) {
        this.editingRole = {
          id: original.id,
          nombre: original.nombre,
          descripcion: original.descripcion ?? '',
          permissions: [...original.permissions],
          activo: original.activo ?? true
        };
        this.modalOpen = true;
      }
      return;
    }

    if (event.action === 'delete') {
      const toDel = this.rows.find(r => r.id === event.row.id) ?? null;
      this.roleToDelete = toDel;
      if (toDel) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el rol "${toDel.nombre}"?`;
        this.confirmOpen = true;
      }
    }
  }

  // Guardar (crear/actualizar) + reemplazar permisos
  prepareUpsert(role: Partial<UiRole>) {
    this.pendingSaveRole = role;
    const isEdit = !!role.id;
    this.saveConfirmTitle = isEdit ? 'Confirmar actualización' : 'Confirmar creación';
    this.saveConfirmMessage = isEdit
      ? `¿Guardar los cambios del rol "${role.nombre}"?`
      : `¿Crear el nuevo rol "${role.nombre}"?`;
    this.saveConfirmOpen = true;
  }

  closeSaveConfirm() { this.saveConfirmOpen = false; }
  cancelSaveConfirm() { this.saveConfirmOpen = false; this.pendingSaveRole = null; }

  // Se ejecuta tras confirmar en el modal de guardado
  confirmSaveProceed() {
    if (!this.pendingSaveRole) { this.saveConfirmOpen = false; return; }
    const role = this.pendingSaveRole;
    this.saveConfirmOpen = false;
    this.pendingSaveRole = null;
    this.upsertRole(role);
  }

  // ===== Guardar (crear/actualizar) + reemplazar permisos 
  private upsertRole(role: Partial<UiRole>) {
    const basePayload = {
      nombre: role.nombre ?? '',
      descripcion: role.descripcion ?? '',
      activo: role.activo ?? true
    };
    const permisos = role.permissions ?? [];

    // EDITAR
    if (role.id) {
      this.rolesSvc.updateRole(role.id, basePayload).subscribe({
        next: () => {
          this.rolesSvc.replaceRolePermissions(role.id!, permisos).subscribe({
            next: () => { this.loadRoles(); this.closeModal(); },
            error: (err) => console.error('Error al reemplazar permisos', err)
          });
        },
        error: (err) => console.error('Error al actualizar rol', err)
      });
      return;
    }

    // CREAR
    this.rolesSvc.createRole(basePayload).subscribe({
      next: (createdRes) => {
        const created = this.unwrap<any>(createdRes);
        const newId = created?.id ?? created?.id_rol;
        if (newId && permisos.length) {
          this.rolesSvc.replaceRolePermissions(newId, permisos).subscribe({
            next: () => { this.loadRoles(); this.closeModal(); },
            error: (err) => console.error('Error al asignar permisos al nuevo rol', err)
          });
        } else {
          this.loadRoles();
          this.closeModal();
        }
      },
      error: (err) => console.error('Error al crear rol', err)
    });
  }

  // Modal
  onSaveClick() { if (this.roleFormRef) this.roleFormRef.submitForm(); }
  onCancelClick() { this.cancelModal(); }
  closeModal() { this.modalOpen = false; this.editingRole = null; }
  cancelModal() { this.modalOpen = false; this.editingRole = null; }

  // Confirmación
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }
  confirmProceed() {
    if (!this.roleToDelete) { this.confirmOpen = false; return; }
    this.rolesSvc.deleteRole(this.roleToDelete.id).subscribe({
      next: () => {
        this.loadRoles();
        this.confirmOpen = false;
        this.roleToDelete = null;
      },
      error: (err) => console.error('Error al eliminar rol', err)
    });
  }

  // Búsqueda desde crud-panel
  onSearch(term: string) {
    this.searchTerm = term;
  }
}