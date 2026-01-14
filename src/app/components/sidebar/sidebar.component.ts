import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../modal/modal/modal.component";
import { AuthService } from '../../services/auth.service';
import { WsService } from '@app/services/ws.service';
import { UsuariosService } from '@app/services/usuarios.service';
import { Router, RouterModule } from '@angular/router';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

type Item =
  | 'polizas'
  | 'reportes'
  | 'dashboard'
  | 'configuracion'
  | 'usuarios-permisos'
  | 'catalogos'
  | 'empresa'
  | '';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, EditProfileModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnDestroy {
  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();

  user: any = null;
  active: Item = '';
  reportesOpen = false;
  configOpen = false;
  tempUser: any = {};
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  private actionToConfirm: (() => void) | null = null;

  editProfileOpen = false;

  usuariosPermisosOpen = false;
  catalogosOpen = false;
  empresaOpen = false;

  // Timeouts para el hover
  private openReportesTimeout: any;
  private closeReportesTimeout: any;
  private openUsuariosPermisosTimeout: any;
  private closeUsuariosPermisosTimeout: any;
  private openCatalogosTimeout: any;
  private closeCatalogosTimeout: any;
  private openEmpresaTimeout: any;
  private closeEmpresaTimeout: any;
  private openConfigTimeout: any;
  private closeConfigTimeout: any;

  // Delay antes de abrir (ms)
  private readonly OPEN_DELAY = 200;
  // Delay antes de cerrar (ms)
  private readonly CLOSE_DELAY = 400;

  constructor(
    private auth: AuthService,
    public router: Router,
    private users: UsuariosService,
    private ws: WsService
  ) { }

  // Métodos para Reportes
  openReportes() {
    this.cancelCloseReportes();
    this.cancelOpenReportes();
    
    this.openReportesTimeout = setTimeout(() => {
      this.reportesOpen = true;
      this.active = 'reportes';
    }, this.OPEN_DELAY);
  }

  scheduleCloseReportes() {
    this.cancelOpenReportes();
    this.closeReportesTimeout = setTimeout(() => {
      this.reportesOpen = false;
    }, this.CLOSE_DELAY);
  }

  cancelCloseReportes() {
    if (this.closeReportesTimeout) {
      clearTimeout(this.closeReportesTimeout);
    }
  }

  cancelOpenReportes() {
    if (this.openReportesTimeout) {
      clearTimeout(this.openReportesTimeout);
    }
  }

  toggleReportes() {
    this.cancelOpenReportes();
    this.cancelCloseReportes();
    this.reportesOpen = !this.reportesOpen;
    this.active = 'reportes';
  }

  // Métodos para Configuración
  openConfiguracion() {
    this.cancelCloseConfig();
    this.cancelOpenConfig();
    
    this.openConfigTimeout = setTimeout(() => {
      this.configOpen = true;
      this.active = 'configuracion';
    }, this.OPEN_DELAY);
  }

  scheduleCloseConfig() {
    this.cancelOpenConfig();
    this.closeConfigTimeout = setTimeout(() => {
      this.configOpen = false;
    }, this.CLOSE_DELAY);
  }

  cancelCloseConfig() {
    if (this.closeConfigTimeout) {
      clearTimeout(this.closeConfigTimeout);
    }
  }

  cancelOpenConfig() {
    if (this.openConfigTimeout) {
      clearTimeout(this.openConfigTimeout);
    }
  }

  toggleConfiguracion() {
    this.cancelOpenConfig();
    this.cancelCloseConfig();
    this.configOpen = !this.configOpen;
    this.active = 'configuracion';
  }

  // Métodos para Usuarios/Permisos
  openUsuariosPermisos() {
    this.cancelCloseUsuariosPermisos();
    this.cancelOpenUsuariosPermisos();
    
    this.openUsuariosPermisosTimeout = setTimeout(() => {
      this.usuariosPermisosOpen = true;
      this.active = 'usuarios-permisos';
    }, this.OPEN_DELAY);
  }

  scheduleCloseUsuariosPermisos() {
    this.cancelOpenUsuariosPermisos();
    this.closeUsuariosPermisosTimeout = setTimeout(() => {
      this.usuariosPermisosOpen = false;
    }, this.CLOSE_DELAY);
  }

  cancelCloseUsuariosPermisos() {
    if (this.closeUsuariosPermisosTimeout) {
      clearTimeout(this.closeUsuariosPermisosTimeout);
    }
  }

  cancelOpenUsuariosPermisos() {
    if (this.openUsuariosPermisosTimeout) {
      clearTimeout(this.openUsuariosPermisosTimeout);
    }
  }

  toggleUsuariosPermisos() {
    this.cancelOpenUsuariosPermisos();
    this.cancelCloseUsuariosPermisos();
    this.usuariosPermisosOpen = !this.usuariosPermisosOpen;
    this.active = 'usuarios-permisos';
  }

  // Métodos para Catálogos
  openCatalogos() {
    this.cancelCloseCatalogos();
    this.cancelOpenCatalogos();
    
    this.openCatalogosTimeout = setTimeout(() => {
      this.catalogosOpen = true;
      this.active = 'catalogos';
    }, this.OPEN_DELAY);
  }

  scheduleCloseCatalogos() {
    this.cancelOpenCatalogos();
    this.closeCatalogosTimeout = setTimeout(() => {
      this.catalogosOpen = false;
    }, this.CLOSE_DELAY);
  }

  cancelCloseCatalogos() {
    if (this.closeCatalogosTimeout) {
      clearTimeout(this.closeCatalogosTimeout);
    }
  }

  cancelOpenCatalogos() {
    if (this.openCatalogosTimeout) {
      clearTimeout(this.openCatalogosTimeout);
    }
  }

  toggleCatalogos() {
    this.cancelOpenCatalogos();
    this.cancelCloseCatalogos();
    this.catalogosOpen = !this.catalogosOpen;
    this.active = 'catalogos';
  }

  // Métodos para Empresa
  openEmpresa() {
    this.cancelCloseEmpresa();
    this.cancelOpenEmpresa();
    
    this.openEmpresaTimeout = setTimeout(() => {
      this.empresaOpen = true;
      this.active = 'empresa';
    }, this.OPEN_DELAY);
  }

  scheduleCloseEmpresa() {
    this.cancelOpenEmpresa();
    this.closeEmpresaTimeout = setTimeout(() => {
      this.empresaOpen = false;
    }, this.CLOSE_DELAY);
  }

  cancelCloseEmpresa() {
    if (this.closeEmpresaTimeout) {
      clearTimeout(this.closeEmpresaTimeout);
    }
  }

  cancelOpenEmpresa() {
    if (this.openEmpresaTimeout) {
      clearTimeout(this.openEmpresaTimeout);
    }
  }

  toggleEmpresa() {
    this.cancelOpenEmpresa();
    this.cancelCloseEmpresa();
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
    if (this.actionToConfirm) this.actionToConfirm();
    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  onLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.ws.disconnect();
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        console.error('Error al cerrar sesión', err);
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit() {
    this.users.getMe().subscribe({
      next: (data) => {
        console.log('Usuario cargado:', data);
        const apellidos = (data.apellidos || '').trim();
        const [apellido_p, apellido_m = ''] = apellidos.split(' ');

        this.user = {
          ...data,
          apellido_p,
          apellido_m
        };

        console.log('Usuario descompuesto:', this.user);
      },
      error: (err) => console.error('Error cargando usuario', err)
    });
  }

  openEditProfile() {
    if (this.user) {
      this.tempUser = { ...this.user };
    }
    this.editProfileOpen = true;
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

  closeEditProfile() {
    this.editProfileOpen = false;
  }

  ngOnDestroy() {
    this.cancelOpenReportes();
    this.cancelOpenConfig();
    this.cancelOpenUsuariosPermisos();
    this.cancelOpenCatalogos();
    this.cancelOpenEmpresa();
    
    this.cancelCloseReportes();
    this.cancelCloseConfig();
    this.cancelCloseUsuariosPermisos();
    this.cancelCloseCatalogos();
    this.cancelCloseEmpresa();
  }
}