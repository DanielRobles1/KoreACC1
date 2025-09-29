import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudAction, CrudColumn, CrudPanelComponent, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { RoleFormComponent } from '@app/components/role-form-component/role-form-component.component';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";
import { RolesService } from '@app/services/roles.service';
import { AuthService } from '@app/services/auth.service';

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
  imports: [
    CommonModule,
    CrudPanelComponent,
    ModalComponent,
    ToastMessageComponent,
    RoleFormComponent,
    SidebarComponent,
    FormsModule
  ],
  templateUrl: './rolesypermisos.component.html',
  styleUrls: ['./rolesypermisos.component.scss']
})
export class RolesypermisosComponent {
  @ViewChild('roleFormRef') roleFormRef!: RoleFormComponent;

  constructor(
    private router: Router,
    private rolesSvc: RolesService,
    private auth: AuthService
  ) {}

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
    { id: 'permissions', label: 'Permisos' },
  ];

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

  canCreate = false;
  canEdit = false;
  canDelete = false;

  page = 1;
  totalPages = 1;

  // MODAL "SIN PERMISOS"
  noPermsOpen = false;
  noPermsTitle = 'Acción no permitida';
  noPermsMessage = 'No tienes permisos para realizar esta acción.';
  private openNoPermisosModal(msg?: string) {
    this.noPermsMessage = msg ?? 'No tienes permisos para realizar esta acción.';
    this.noPermsOpen = true;
  }
  closeNoPerms() { this.noPermsOpen = false; }

  // ===== Modales de CRUD =====
  modalOpen = false;
  modalTitle = '';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  editingRole: Partial<UiRole> | null = null;

  confirmOpen = false;
  confirmTitle = 'Confirmar eliminación';
  confirmMessage = '';
  roleToDelete: UiRole | null = null;

  saveConfirmOpen = false;
  saveConfirmTitle = '';
  saveConfirmMessage = '';
  private pendingSaveRole: Partial<UiRole> | null = null;

  // ===== Permisos de un rol =====
  permOpen = false;
  permTitle = 'Editar permisos';
  permRole: UiRole | null = null;
  permSelections: string[] = []; // array temporal con los permisos seleccionados

  // ===== Catálogo de permisos (disponibles) =====
  availablePermissions: string[] = [];

  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }

  // Search
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

  formatPermission(permission: string): string {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  ngOnInit() {
    this.loadRoles();
    this.loadPermisosDisponibles();

    this.canCreate = this.auth.hasPermission('crear_rol');
    this.canEdit   = this.auth.hasPermission('editar_rol');
    this.canDelete = this.auth.hasPermission('eliminar_rol');
    this.actions = [
      ...(this.canEdit ?   [{ id: 'edit',        tooltip: 'Editar Rol' }] : []),
      ...(this.canDelete ? [{ id: 'delete',      tooltip: 'Eliminar Rol' }] : []),
      ...(this.canEdit ?   [{ id: 'permissions', tooltip: 'Editar Permisos' }] : [])
    ];
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

  loadRoles() {
    this.rolesSvc.getRoles().subscribe({
      next: (res) => {
        const arr = this.unwrap<ApiRole[]>(res) ?? [];
        this.rows = arr.map(r => this.normalizeRole(r));
      },
      error: (err) => this.showError(err, 'No se pudieron cargar los roles.')
    });
  }

loadPermisosDisponibles() {
  this.rolesSvc.getPermisosAll(/* pageSize opcional: 500 */).subscribe({
    next: (perms: string[]) => {
      this.availablePermissions = (perms ?? []).filter(Boolean);
    },
    error: (err) => this.showError(err, 'No se pudieron cargar los permisos disponibles.')
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
    if (!this.canCreate) {
      this.openNoPermisosModal('No tienes permisos para crear roles.');
      return;
    }
    this.modalTitle = 'Nuevo Rol';
    this.editingRole = { nombre: '', descripcion: '', permissions: [], activo: true };
    this.modalOpen = true;
  }

  // Acciones de fila
  onRowAction(event: { action: string; row: UiRole }) {
    if (event.action === 'edit') {
      if (!this.canEdit) {
        this.openNoPermisosModal('No tienes permisos para editar roles.');
        return;
      }
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
      if (!this.canDelete) {
        this.openNoPermisosModal('No tienes permisos para eliminar roles.');
        return;
      }
      const toDel = this.rows.find(r => r.id === event.row.id) ?? null;
      this.roleToDelete = toDel;
      if (toDel) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el rol "${toDel.nombre}"?`;
        this.confirmOpen = true;
      }
      return;
    }

    if (event.action === 'permissions') {
      if (!this.canEdit) {
        this.openNoPermisosModal('No tienes permisos para modificar permisos.');
        return;
      }
      const original = this.rows.find(r => r.id === event.row.id);
      if (!original) return;
      this.permRole = { ...original };
      this.permSelections = [...(original.permissions ?? [])]; // copia selecciones
      this.permTitle = `Editar permisos`;
      this.permOpen = true;
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
      const id = role.id;
      const nombre = basePayload.nombre;

      this.rolesSvc.updateRole(id, basePayload).subscribe({
        next: () => {
          this.rolesSvc.replaceRolePermissions(id, permisos).subscribe({
            next: () => {
              this.loadRoles();
              this.closeModal();
              this.showSuccess(`Rol “${nombre}” actualizado correctamente.`);
            },
            error: (err) => this.showError(err, `Error al reemplazar permisos del rol “${nombre}”.`)
          });
        },
        error: (err) => this.showError(err, `Error al actualizar el rol “${nombre}”.`)
      });
      return;
    }

    // CREAR
    const nombreNuevo = basePayload.nombre;

    this.rolesSvc.createRole(basePayload).subscribe({
      next: (createdRes) => {
        const created = this.unwrap<any>(createdRes);
        const newId = created?.id ?? created?.id_rol;

        // si no hay permisos seleccionados, solo cierra/recarga y notifica
        if (!newId || !permisos.length) {
          this.loadRoles();
          this.closeModal();
          this.showSuccess(`Rol “${nombreNuevo}” creado correctamente.`);
          return;
        }

        // asignar permisos del nuevo rol
        this.rolesSvc.replaceRolePermissions(newId, permisos).subscribe({
          next: () => {
            this.loadRoles();
            this.closeModal();
            this.showSuccess(`Rol “${nombreNuevo}” creado y permisos asignados.`);
          },
          error: (err) => this.showError(err, `Rol “${nombreNuevo}” creado, pero falló la asignación de permisos.`)
        });
      },
      error: (err) => this.showError(err, `Error al crear el rol “${nombreNuevo}”.`)
    });
  }

  // Modal CRUD
  onSaveClick() { if (this.roleFormRef) this.roleFormRef.submitForm(); }
  onCancelClick() { this.cancelModal(); }
  closeModal() { this.modalOpen = false; this.editingRole = null; }
  cancelModal() { this.modalOpen = false; this.editingRole = null; }

  // Confirmación
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }
  confirmProceed() {
    if (!this.roleToDelete) { this.confirmOpen = false; return; }
    const nombre = this.roleToDelete.nombre;
    const id = this.roleToDelete.id;

    this.rolesSvc.deleteRole(id).subscribe({
      next: () => {
        this.loadRoles();
        this.confirmOpen = false;
        this.roleToDelete = null;
        this.showSuccess(`Rol “${nombre}” eliminado correctamente.`);
      },
      error: (err) => this.showError(err, `Error al eliminar el rol “${nombre}”.`)
    });
  }

  trackByCat = (_: number, item: { key: string; value: string[] }) => item.key;
  trackByPerm = (_: number, perm: string) => this.canonical(perm);

  onPermCheckboxChange(p: string, ev: Event) {
    this.togglePermOnly(p, ev);
  }

  // Búsqueda desde crud-panel
  onSearch(term: string) {
    this.searchTerm = term;
  }

  // ====== AGRUPACIÓN DE PERMISOS (CORREGIDA) ======
  private permissionGroupsMap: Record<string, string[]> = {
    'Usuarios': ['usuario', 'user'],
    'Pólizas':  ['poliza', 'póliza'],
    'Reportes': ['reporte', 'report'],
    'Roles':    ['rol'],
    'Empresa':  ['empresa', 'company']
  };

  // Devuelve objeto {categoria: permisos[]}
  get groupedPermissions(): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      'Usuarios': [],
      'Pólizas':  [],
      'Reportes': [],
      'Roles':    [],
      'Empresa':  [],
      'Otros':    [],   // 👈 inicializado para evitar 'push' sobre undefined
    };

    for (const raw of this.availablePermissions ?? []) {
      const perm = (raw ?? '').toString();
      const permLc = perm.toLowerCase();

      let added = false;
      for (const [cat, keywords] of Object.entries(this.permissionGroupsMap)) {
        if (keywords.some(k => permLc.includes(k.toLowerCase()))) {
          groups[cat].push(perm);
          added = true;
          break;
        }
      }
      if (!added) groups['Otros'].push(perm);
    }

    return groups;
  }

  // === Buscador de permisos (en modal) ===
  permissionSearch = '';

  filterPerms(perms: string[] = []): string[] {
    if (!perms?.length) return [];
    const term = (this.permissionSearch ?? '').trim().toLowerCase();
    if (!term) return perms;
    return perms.filter(p => p?.toLowerCase().includes(term));
  }

  confirmPermissionsOnly() {
    if (!this.permRole) { this.permOpen = false; return; }
    const nombre = this.permRole.nombre;
    const id = this.permRole.id;
    const permisos = [...this.permSelections];

    this.rolesSvc.replaceRolePermissions(id, permisos).subscribe({
      next: () => {
        this.permOpen = false;
        this.permRole = null;
        this.loadRoles();
        this.showSuccess(`Permisos del rol “${nombre}” actualizados correctamente.`);
      },
      error: (err) => this.showError(err, `Error al actualizar permisos del rol “${nombre}”.`)
    });
  }

  canonical(p: string): string {
    return (p ?? '').toString().trim().toLowerCase();
  }

  isPermSelected(p: string): boolean {
    const cand = this.canonical(p);
    return (this.permSelections ?? []).some(x => this.canonical(x) === cand);
  }

  togglePermOnly(p: string, ev: Event) {
    const checked = (ev.target as HTMLInputElement).checked;
    const cand = this.canonical(p);

    if (checked) {
      const exists = (this.permSelections ?? []).some(x => this.canonical(x) === cand);
      if (!exists) this.permSelections = [...(this.permSelections ?? []), p];
    } else {
      this.permSelections = (this.permSelections ?? []).filter(x => this.canonical(x) !== cand);
    }
  }

  countSelectedInGroup(perms: string[] = []): number {
    if (!perms?.length) return 0;
    const sel = new Set((this.permSelections ?? []).map(x => this.canonical(x)));
    return perms.reduce((acc, p) => acc + (sel.has(this.canonical(p)) ? 1 : 0), 0);
  }

  areAllSelectedInGroup(perms: string[] = []): boolean {
    if (!perms?.length) return false;
    return perms.every(p => this.isPermSelected(p));
  }

  toggleGroup(catKey: string, perms: string[] = []): void {
    if (!perms?.length) return;

    const allSelected = this.areAllSelectedInGroup(perms);
    const targetSet = new Set((this.permSelections ?? []).map(x => this.canonical(x)));

    if (allSelected) {
      for (const p of perms) targetSet.delete(this.canonical(p));
    } else {
      for (const p of perms) targetSet.add(this.canonical(p));
    }

    const canonicalToRaw: Record<string, string> = {};
    for (const p of this.availablePermissions ?? []) {
      canonicalToRaw[this.canonical(p)] = p;
    }

    this.permSelections = Array.from(targetSet)
      .map(c => canonicalToRaw[c])
      .filter(Boolean);
  }
}
