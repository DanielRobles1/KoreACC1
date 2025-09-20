import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '@app/services/usuarios.service';
import { Router } from '@angular/router';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

type Item = 'polizas' | 'reportes' | 'dashboard' | 'configuracion';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent, EditProfileModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(
    private auth: AuthService,
    private router: Router,
    private users: UsuariosService
  ) {}

  user: any = null;
  active: Item = 'polizas';
  sidebarOpen = true;
  reportesOpen = false;
  configOpen = false;

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  // 🔹 Modal de edición de perfil
  editProfileOpen = false;

  // =====================
  // Sidebar
  // =====================
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  setActive(item: Item) {
    this.active = item;
    if (item !== 'reportes') this.reportesOpen = false;
    if (item !== 'configuracion') this.configOpen = false;
  }

  toggleReportes() {
    this.reportesOpen = !this.reportesOpen;
    this.active = 'reportes';
  }

  toggleConfiguracion() {
    this.configOpen = !this.configOpen;
    this.active = 'configuracion';
  }

  // =====================
  // Logout con confirmación
  // =====================
  openLogoutConfirm() {
    this.confirmTitle = 'Cerrar sesión';
    this.confirmMessage = '¿Seguro que deseas cerrar sesión?';
    this.confirmOpen = true;
    this.actionToConfirm = () => this.onLogout();
  }

  closeConfirm() {
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  cancelConfirm() {
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  confirmProceed() {
    if (this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    });
  }

  
  ngOnInit() {
    this.users.getMe().subscribe({
      next: (data) => this.user = data,
      error: (err) => console.error('Error cargando usuario', err)
    });
  }

  
  openEditProfile() {
    this.editProfileOpen = true;
  }

  closeEditProfile() {
    this.editProfileOpen = false;
  }

 saveProfile(updated: any) {
  this.users.updateMe(updated).subscribe({
  next: (res: any) => {
    this.user = res.usuario;
    this.editProfileOpen = false;
  },
  error: (err) => console.error('Error actualizando perfil', err)
});

}
}
