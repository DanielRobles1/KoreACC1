import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

import { SidebarComponent } from '../../../components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from '../../../components/crud-panel/crud-panel.component';
import { ModalComponent } from '../../../components/modal/modal/modal.component';
import { UserFormComponent, Usuario } from '../../../components/user-form/user-form/user-form.component';

export interface Rol {
  id: number;
  nombre: string;
  permisos: string[];
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SidebarComponent, CrudPanelComponent, ModalComponent, UserFormComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) { }

  // MODAL "SIN PERMISOS"
  noPermsOpen = false;
  noPermsTitle = 'Acción no permitida';
  noPermsMessage = 'No tienes permisos para realizar esta acción.';
  private openNoPermisosModal(msg?: string) {
    this.noPermsMessage = msg ?? 'No tienes permisos para realizar esta acción.';
    this.noPermsOpen = true;
  }
  closeNoPerms() { this.noPermsOpen = false; }

  ngOnInit() {
    this.cargarUsuarios();
    this.canCreate = this.auth.hasPermission('crear_usuario');
    this.canEdit = this.auth.hasPermission('editar_usuario');
    this.canDelete = this.auth.hasPermission('eliminar_usuario');

    this.actions = [
      ...(this.canEdit ? [{ id: 'edit', tooltip: 'Editar usuario' }] : []),
      ...(this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar usuario' }] : [])
    ];
  }


  private apiUrl = 'http://localhost:3000/api/v1/usuarios';

  // UI TEXT
  title = 'Gestión de usuarios y permisos';

  // TABS
  tabs: CrudTab[] = [
    { id: 'usuarios', label: 'Usuarios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Usuarios', route: '/usuarios' },
    { id: 'roles', label: 'Roles y permisos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos', route: '/login/roles' },
  ];
  activeTabId = 'usuarios';

  // TABLE: COLUMNS & DATA
  columns: CrudColumn[] = [
    { key: 'id_usuario', header: '#' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'apellido_p', header: 'Apellido Paterno' },
    { key: 'apellido_m', header: 'Apellido Materno' },
    { key: 'correo', header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'estatus', header: 'Estatus' },
    { key: 'rol', header: 'Rol' }
  ];

  rows: Usuario[] = [];
  actions: CrudAction[] = [];

  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }

  // PERMISOS
  canCreate = false;
  canEdit = false;
  canDelete = false;

  // PAGINATION
  page = 1;
  totalPages = 1;

  // FORM MODAL STATE
  modalOpen = false;
  modalTitle = 'Nuevo usuario';
  modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  editing: Usuario | null = null;

  // CONFIRMATION MODAL STATE
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private pendingAction: 'inactivate' | 'reactivate' | 'save' | null = null;
  private pendingRow: Usuario | null = null;
  private pendingUser: Usuario | null = null;

  // ===== API CALLS =====
  cargarUsuarios() {
    this.http.get<{ data: Usuario[]; pagination: any }>(this.apiUrl).subscribe({
      next: (res) => {
        this.rows = res.data.map(u => ({
          ...u,
          rol: u.Rols?.[0]?.nombre ?? 'Sin rol' // 👈 convierte el objeto a string
        }));
        this.totalPages = res.pagination.pages;
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }


  // ===== HANDLERS =====
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) {
      this.router.navigate([selected.route]);
    }
  }

  private requirePermission(
    perm: 'crear_usuario' | 'editar_usuario' | 'eliminar_usuario',
    onAllowed: () => void,
    accionLabel: string
  ) {
    if (this.auth.hasPermission(perm)) {
      onAllowed();
    } else {
      this.openNoPermisosModal(`No tienes permisos para ${accionLabel}.`);
    }
  }

  onPrimary() {
    this.requirePermission('crear_usuario', () => {
      this.editing = null;
      this.modalTitle = 'Añadir usuario';
      this.modalSize = 'md';
      this.modalOpen = true;
    }, 'crear usuarios');
  }

  onRowAction(evt: { action: string; row: Usuario }) {
    if (evt.action === 'edit') {
      this.requirePermission('editar_usuario', () => {
        this.editing = evt.row;
        this.modalTitle = `Editar usuario #${evt.row.id_usuario}`;
        this.modalSize = 'md';
        this.modalOpen = true;
      }, 'editar usuarios');
      return;
    }

    if (evt.action === 'delete') {
      this.requirePermission('eliminar_usuario', () => {
        const isInactive = !evt.row.estatus;
        this.pendingRow = evt.row;

        if (isInactive) {
          this.pendingAction = 'reactivate';
          this.confirmTitle = 'Confirmar reactivación';
          this.confirmMessage = `¿Deseas reactivar a “${evt.row.nombre}” (${evt.row.correo})?`;
        } else {
          this.pendingAction = 'inactivate';
          this.confirmTitle = 'Confirmar inactivación';
          this.confirmMessage = `¿Deseas inactivar a “${evt.row.nombre}” (${evt.row.correo})?`;
        }
        this.confirmOpen = true;
      }, 'inactivar o reactivar usuarios');
    }
  }

  // ===== FORM SUBMIT =====
  upsertUser(user: Usuario) {
    this.pendingAction = 'save';
    this.pendingUser = user;

    const esEdicion = !!this.editing?.id_usuario;
    this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
    this.confirmMessage = esEdicion
      ? `¿Guardar los cambios del usuario “${user.nombre}”?`
      : `¿Crear el usuario “${user.nombre}”?`;

    this.confirmOpen = true;
  }

  // ===== CONFIRM MODAL =====
  closeConfirm() { this.resetConfirm(); }
  cancelConfirm() { this.resetConfirm(); }

  confirmProceed() {
    if (this.pendingAction === 'inactivate' && this.pendingRow) {
      this.http.delete(`${this.apiUrl}/${this.pendingRow.id_usuario}`).subscribe({
        next: () => {
          this.rows = this.rows.map(r =>
            r.id_usuario === this.pendingRow!.id_usuario ? { ...r, estatus: false } : r
          );
          this.resetConfirm();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al inactivar', err)
      });
      return;
    }

    if (this.pendingAction === 'reactivate' && this.pendingRow) {
      this.http.patch<Usuario>(`${this.apiUrl}/${this.pendingRow.id_usuario}/reactivar`, {}).subscribe({
        next: (user) => {
          this.rows = this.rows.map(r =>
            r.id_usuario === this.pendingRow!.id_usuario ? (user ?? { ...r, estatus: true }) : r
          );
          this.resetConfirm();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al reactivar', err)
      });
      return;
    }

    if (this.pendingAction === 'save' && this.pendingUser) {
      const payload = this.pendingUser;
      if (this.editing?.id_usuario) {
        this.http.put<Usuario>(`${this.apiUrl}/${this.editing.id_usuario}`, payload).subscribe({
          next: (user) => {
            this.rows = this.rows.map(r => r.id_usuario === this.editing!.id_usuario ? user : r);
            this.resetConfirm();
            this.modalOpen = false;
            this.cargarUsuarios();
          },
          error: (err) => console.error('Error al actualizar', err)
        });
      } else {
        this.http.post<Usuario>(this.apiUrl, payload).subscribe({
          next: (user: any) => {
            this.rows = [...this.rows, user];
            this.resetConfirm();
            this.modalOpen = false;
          },
          error: (err) => console.error('Error al crear', err)
        });
      }
    }
  }

  private resetConfirm() {
    this.confirmOpen = false;
    this.pendingAction = null;
    this.pendingRow = null;
    this.pendingUser = null;
    this.editing = null;
  }

  // FORM MODAL
  closeModal() { this.modalOpen = false; }
  cancelModal() { this.modalOpen = false; }
}
