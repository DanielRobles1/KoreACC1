import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '@app/services/usuarios.service';
import { Router, RouterModule } from '@angular/router';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

type Item = 'polizas' | 'reportes' | 'dashboard' | 'configuracion' | 'usuarios-permisos' | 'catalogos' | 'empresa';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, EditProfileModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();

  constructor(
    private auth: AuthService,
    private router: Router,
    private users: UsuariosService
  ) { }

  user: any = null;
  active: Item = 'configuracion';
  reportesOpen = false;
  configOpen = false;
tempUser: any = {};
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  editProfileOpen = false;

  private toggleUsuarios = true;

  usuariosPermisosOpen = false;
  catalogosOpen = false;
  empresaOpen = false;

  toggleUsuariosPermisos() {
    this.usuariosPermisosOpen = !this.usuariosPermisosOpen;
    this.active = 'usuarios-permisos';
  }
  toggleCatalogos() {
    this.catalogosOpen = !this.catalogosOpen;
    this.active = 'catalogos';
  }
  toggleEmpresa() {
    this.empresaOpen = !this.empresaOpen;
    this.active = 'empresa';
  }

  toggleSidebar() {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }

  setActive(item: Item) {
    this.active = item;
    if (item !== 'reportes') this.reportesOpen = false;
    if (item !== 'configuracion') this.configOpen = false;
    if (item !== 'usuarios-permisos') this.usuariosPermisosOpen = false;
    if (item !== 'catalogos') this.catalogosOpen = false;
    if (item !== 'empresa') this.empresaOpen = false;
  }

  toggleReportes() {
    this.reportesOpen = !this.reportesOpen;
    this.active = 'reportes';
  }

  toggleConfiguracion() {
    this.configOpen = !this.configOpen;
    this.active = 'configuracion';
  }

  openLogoutConfirm() {
    this.confirmTitle = 'Cerrar sesión';
    this.confirmMessage = '¿Seguro que deseas cerrar sesión?';
    this.confirmOpen = true;
    this.actionToConfirm = () => this.onLogout();
  }

  closeConfirm() { this.confirmOpen = false; this.actionToConfirm = null; }
  cancelConfirm() { this.confirmOpen = false; this.actionToConfirm = null; }

  confirmProceed() {
    if (this.actionToConfirm) this.actionToConfirm();
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']) });
  }

  ngOnInit() {
    this.users.getMe().subscribe({
      next: (data) => { this.user = data, console.log('Usuario cargado:', data); },
      error: (err) => console.error('Error cargando usuario', err)
    });
  }

  openEditProfile() { 
  if (this.user) {
    this.tempUser = { ...this.user }; // copia de usuario actual
  }
  this.editProfileOpen = true; 
}

saveProfile(updated: any) {
  this.users.updateMe(updated).subscribe({
    next: (res: any) => {
      this.user = res.usuario; // actualiza usuario real
      this.editProfileOpen = false;
    },
    error: (err) => console.error('Error actualizando perfil', err)
  });
}

  closeEditProfile() { this.editProfileOpen = false; }

  
}