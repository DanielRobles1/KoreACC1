import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudAction, CrudColumn, CrudPanelComponent, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
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
  imports: [CommonModule, CrudPanelComponent, ModalComponent, RoleFormComponent, SidebarComponent],
  templateUrl: './rolesypermisos.component.html',
  styleUrls: ['./rolesypermisos.component.scss']
})
export class RolesypermisosComponent {
  @ViewChild('roleFormRef') roleFormRef!: RoleFormComponent;

  constructor(
    private router: Router, 
    private rolesSvc: RolesService,
    private auth: AuthService ) { }

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

  canCreate = false;
  canEdit   = false;
  canDelete = false;

  page = 1;
  totalPages = 1;

 
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


  permOpen = false;
  permTitle = 'Editar permisos';
  permRole: UiRole | null = null;
  permSelections: string[] = []; // array temporal con los permisos seleccionados

 
  availablePermissions: string[] = [];

  
  sidebarOpen = true;

  onSidebarToggle(open: boolean) {
    this.sidebarOpen = open;
  }

 
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
    this.canEdit = this.auth.hasPermission('editar_rol');
    this.canDelete = this.auth.hasPermission('eliminar_rol');
    this.actions = [
      ...(this.canEdit   ? [{ id: 'edit', tooltip: 'Editar Rol' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Rol' }] : []),
      ...(this.canEdit ? [{ id: 'permissions', tooltip: 'Editar Permisos' }] : [])
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
    if (!this.canCreate) {
      console.warn('⛔ No tienes permiso para crear roles');
      return;
    }
    this.modalTitle = 'Nuevo Rol';
    this.editingRole = { nombre: '', descripcion: '', permissions: [], activo: true };
    this.modalOpen = true;
  }

  // Acciones de fila
  onRowAction(event: { action: string; row: UiRole }) {
    if (event.action === 'edit') {
      if (!this.canEdit) return;
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
      if (!this.canDelete) return;
      const toDel = this.rows.find(r => r.id === event.row.id) ?? null;
      this.roleToDelete = toDel;
      if (toDel) {
        this.confirmMessage = `¿Estás seguro de que deseas eliminar el rol "${toDel.nombre}"?`;
        this.confirmOpen = true;
      }
    }

    if (event.action === 'permissions') {
      if (!this.canEdit) return;
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

  trackByCat = (_: number, item: { key: string; value: string[] }) => item.key;
  trackByPerm = (_: number, perm: string) => this.canonical(perm);

  onPermCheckboxChange(p: string, ev: Event) {
    this.togglePermOnly(p, ev);
  }

  // Búsqueda desde crud-panel
  onSearch(term: string) {
    this.searchTerm = term;
  }

  private permissionGroupsMap: Record<string, string[]> = {
    'Usuarios': ['usuario', 'user'],
    'Pólizas': ['poliza', 'póliza'],
    'Reportes': ['reporte', 'report'],
    'Roles': ['rol', 'rol']
  };

  // Devuelve objeto {categoria: permisos[]}
  get groupedPermissions(): Record<string, string[]> {
    const groups: Record<string, string[]> = {
      'Usuarios': [],
      'Pólizas': [],
      'Reportes': [],
      'Roles': []
    };

    for (const perm of this.availablePermissions) {
      let added = false;
      for (const [cat, keywords] of Object.entries(this.permissionGroupsMap)) {
        if (keywords.some(k => perm.toLowerCase().includes(k))) {
          groups[cat].push(perm);
          added = true;
          break;
        }
      }
      if (!added) groups['Otros'].push(perm);
    }

    return groups;
  }
  
  confirmPermissionsOnly() {
    if (!this.permRole) { this.permOpen = false; return; }
    this.rolesSvc.replaceRolePermissions(this.permRole.id, this.permSelections).subscribe({
      next: () => {
        this.permOpen = false;
        this.permRole = null;
        this.loadRoles();
      },
      error: (err) => console.error('Error al actualizar permisos', err)
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
    for (const p of this.availablePermissions) {
      canonicalToRaw[this.canonical(p)] = p;
    }

    this.permSelections = Array.from(targetSet).map(c => canonicalToRaw[c]).filter(Boolean);
  }


}