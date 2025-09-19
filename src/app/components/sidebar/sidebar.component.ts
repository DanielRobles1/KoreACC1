import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

type Item = 'polizas' | 'reportes' | 'dashboard';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  constructor(private auth: AuthService, private router: Router) {}
  active: Item = 'polizas';
  reportesOpen = false;

  // 🔹 Variables para el modal
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  setActive(item: Item) {
    this.active = item;
    if (item !== 'reportes') this.reportesOpen = false;
  }

  toggleReportes() {
    this.reportesOpen = !this.reportesOpen;
    this.active = 'reportes';
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

  // 🔹 Cancelar explícitamente
  cancelConfirm() {
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  // 🔹 Confirmar acción
  confirmProceed() {
    if (this.actionToConfirm) {
      this.actionToConfirm();
    }
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  // 🔹 Lógica real de logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login'])
    })
  }
}
