import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// UI Components
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
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // API URL (ajústala a tu backend)
  private apiUrl = 'http://localhost:3000/api/v1/usuarios';

  // UI TEXT
  title = 'Gestión de usuarios y permisos';

  // TABS
  tabs: CrudTab[] = [
    { id: 'usuarios', label: 'Usuarios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Usuarios', route: '/usuarios' },
    { id: 'roles', label: 'Roles y permisos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos', route: '/login/roles' },
  ];
  activeTabId = 'usuarios';

  // ROLES REGISTRADOS (mock, podrías traerlos del backend)
  roles: Rol[] = [
    { id: 1, nombre: 'Administrador', permisos: ['crear_usuario', 'editar_usuario', 'eliminar_usuario', 'gestionar_roles'] },
    { id: 2, nombre: 'Contador', permisos: ['ver_reportes', 'exportar_datos'] },
  ];

  // TABLE: COLUMNS & DATA
  columns: CrudColumn[] = [
    { key: 'id_usuario', header: '#' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'apellido_p', header: 'Apellido Paterno' },
    { key: 'apellido_m', header: 'Apellido Materno' },
    { key: 'correo', header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'estatus', header: 'Estatus' },
  ];

  rows: Usuario[] = [];

  actions: CrudAction[] = [
    { id: 'edit', tooltip: 'Editar usuario' },
    { id: 'delete', tooltip: 'Eliminar usuario' },
  ];

  sidebarOpen = true;

  onSidebarToggle(open: boolean) {
    this.sidebarOpen = open;
  }

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
  private pendingAction: 'delete' | 'save' | null = null;
  private pendingRow: Usuario | null = null;
  private pendingUser: Usuario | null = null;

  // ===== API CALLS =====
  cargarUsuarios() {
    this.http.get<{ data: Usuario[]; pagination: any }>(this.apiUrl).subscribe({
      next: (res) => {
        console.log('📥 Respuesta usuarios:', res);
        this.rows = res.data;
        this.totalPages = res.pagination.pages;
      },
      error: (err) => { console.error('Error al cargar usuarios', err); }
    });
  }

  // ===== HANDLERS =====

  // TABS
  onTabChange(id: string) {
    this.activeTabId = id;
    const selected = this.tabs.find(t => t.id === id);
    if (selected?.route) {
      this.router.navigate([selected.route]);
    }
  }

  // PRIMARY (ADD NEW)
  onPrimary() {
    this.editing = null;
    this.modalTitle = 'Añadir usuario';
    this.modalSize = 'md';
    this.modalOpen = true;
  }

  // ROW ACTIONS
  onRowAction(evt: { action: string; row: Usuario }) {
    if (evt.action === 'edit') {
      this.editing = evt.row;
      this.modalTitle = `Editar usuario #${evt.row.id_usuario}`;
      this.modalSize = 'md';
      this.modalOpen = true;
      return;
    }

    if (evt.action === 'delete') {
      this.pendingAction = 'delete';
      this.pendingRow = evt.row;
      this.confirmTitle = 'Confirmar eliminación';
      this.confirmMessage = `¿Deseas eliminar a “${evt.row.nombre}” (${evt.row.correo})? Esta acción no se puede deshacer.`;
      this.confirmOpen = true;
    }
  }

  // FORM SUBMIT
  upsertUser(payload: Usuario) {
    this.pendingAction = 'save';
    this.pendingUser = payload;

    const esEdicion = !!this.editing?.id_usuario;
    this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
    this.confirmMessage = esEdicion
      ? `¿Guardar los cambios del usuario “${payload.nombre}”?`
      : `¿Crear el usuario “${payload.nombre}”?`;

    this.confirmOpen = true;
  }

  // CONFIRM MODAL
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.resetConfirm(); }

  confirmProceed() {
    if (this.pendingAction === 'delete' && this.pendingRow) {
      this.http.delete(`${this.apiUrl}/${this.pendingRow.id_usuario}`).subscribe({
        next: () => {
          this.rows = this.rows.filter(r => r.id_usuario !== this.pendingRow!.id_usuario);
          this.resetConfirm();
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }

    if (this.pendingAction === 'save' && this.pendingUser) {
      const payload = this.pendingUser;
      if (this.editing?.id_usuario) {
        // actualizar
        this.http.put<Usuario>(`${this.apiUrl}/${this.editing.id_usuario}`, payload).subscribe({
          next: (user) => {
            this.rows = this.rows.map(r => r.id_usuario === this.editing!.id_usuario ? user : r);
            this.resetConfirm();
            this.modalOpen = false;
          },
          error: (err) => console.error('Error al actualizar', err)
        });
      } else {
        // crear
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
