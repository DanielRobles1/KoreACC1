import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '@app/services/usuarios.service';
import { Router } from '@angular/router';
import { UserFormComponent, Usuario as UsuarioForm } from '../user-form/user-form/user-form.component';

type Item = 'polizas' | 'reportes' | 'dashboard' | 'configuracion';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent, ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private auth: AuthService, private router: Router, private users: UsuariosService) {}

  user: any = null;
  editing = false;
  active: Item = 'polizas';
  sidebarOpen = true;
  reportesOpen = false;
  configOpen = false;

  // 🔹 Variables para el modal
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  // Sidebar
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

  // 🔹 Abrir modal para cerrar sesión
  openLogoutConfirm() {
    this.confirmTitle = 'Cerrar sesión';
    this.confirmMessage = '¿Seguro que deseas cerrar sesión?';
    this.confirmOpen = true;
    this.actionToConfirm = () => this.onLogout();
  }

  // 🔹 Cerrar modal sin hacer nada
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

  // 🔹 Lógica real de logout
  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    })
  }

  ngOnInit() {
    this.users.getMe().subscribe({
      next: (data) => this.user = data,
      error: (err) => console.error('Error cargando usuario', err)
    });
  }
}