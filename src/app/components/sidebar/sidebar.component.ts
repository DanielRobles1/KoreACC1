import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  Router,
  RouterModule,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import { ModalComponent } from '../modal/modal/modal.component';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';

import { AuthService } from '../../services/auth.service';
import { WsService } from '@app/services/ws.service';
import { UsuariosService } from '@app/services/usuarios.service';

/* TIPOS */

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
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent,
    EditProfileModalComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  /*  SIDEBAR */

  @Input() open = true;
  @Output() openChange = new EventEmitter<boolean>();

  isMobile = false;

  user: any = null;
  active: Item = '';

  private lastOpenMenu: Item = '';

  /*  MENÚS */

  reportesOpen = false;
  configOpen = false;

  usuariosPermisosOpen = false;
  catalogosOpen = false;
  empresaOpen = false;

  /*   MODALES */

  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  editProfileOpen = false;

  tempUser: any = {};
  private actionToConfirm: (() => void) | null = null;

  constructor(
    private auth: AuthService,
    public router: Router,
    private users: UsuariosService,
    private ws: WsService
  ) { }

  /* RESPONSIVE */

  checkMobile = () => {

    this.isMobile = window.innerWidth <= 768;

    if (this.isMobile) {
      this.open = false;
    } else {
      this.open = true;
    }

    this.openChange.emit(this.open);
  };



  ngOnInit() {

    
    this.checkMobile();

    window.addEventListener('resize', this.checkMobile);

    /* RESTAURAR MENÚ */
    const saved = localStorage.getItem('sidebarMenu');

    if (saved) {
      this.restoreMenu(saved as Item);
    }

    /* ESCUCHAR RUTAS */
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {

        if (this.lastOpenMenu) {
          this.restoreMenu(this.lastOpenMenu);
        }

      });

    /* USER */
    this.users.getMe().subscribe({
      next: (data) => {

        const apellidos = (data.apellidos || '').trim();
        const [apellido_p, apellido_m = ''] = apellidos.split(' ');

        this.user = {
          ...data,
          apellido_p,
          apellido_m
        };

      },
      error: (err) => console.error(err)
    });

  }



  toggleSidebar() {
    this.open = !this.open;
    this.openChange.emit(this.open);
  }

  /* TOGGLES PRINCIPALES */

  toggleReportes() {

    const willOpen = !this.reportesOpen;

    this.closeAll();

    this.reportesOpen = willOpen;

    if (willOpen) {
      this.active = 'reportes';
      this.saveMenuState('reportes');
    } else {
      this.clearMenuState();
    }
  }

  toggleConfiguracion() {

    const willOpen = !this.configOpen;

    this.closeAll();

    this.configOpen = willOpen;

    if (willOpen) {
      this.active = 'configuracion';
      this.saveMenuState('configuracion');
    } else {
      this.clearMenuState();
    }
  }

  /*SUBMENÚS */

  toggleUsuariosPermisos() {

    const willOpen = !this.usuariosPermisosOpen;

    this.usuariosPermisosOpen = willOpen;

    this.catalogosOpen = false;
    this.empresaOpen = false;

    if (willOpen) {
      this.active = 'usuarios-permisos';
      this.saveMenuState('usuarios-permisos');
    } else {
      this.clearMenuState();
    }
  }

  toggleCatalogos() {

    const willOpen = !this.catalogosOpen;

    this.catalogosOpen = willOpen;

    this.usuariosPermisosOpen = false;
    this.empresaOpen = false;

    if (willOpen) {
      this.active = 'catalogos';
      this.saveMenuState('catalogos');
    } else {
      this.clearMenuState();
    }
  }

  toggleEmpresa() {

    const willOpen = !this.empresaOpen;

    this.empresaOpen = willOpen;

    this.usuariosPermisosOpen = false;
    this.catalogosOpen = false;

    if (willOpen) {
      this.active = 'empresa';
      this.saveMenuState('empresa');
    } else {
      this.clearMenuState();
    }
  }

 

  closeAll() {

    this.reportesOpen = false;
    this.configOpen = false;

    this.usuariosPermisosOpen = false;
    this.catalogosOpen = false;
    this.empresaOpen = false;
  }

  restoreMenu(menu: Item) {

    this.closeAll();

    switch (menu) {

      case 'reportes':
        this.reportesOpen = true;
        break;

      case 'configuracion':
        this.configOpen = true;
        break;

      case 'usuarios-permisos':
        this.configOpen = true;
        this.usuariosPermisosOpen = true;
        break;

      case 'catalogos':
        this.configOpen = true;
        this.catalogosOpen = true;
        break;

      case 'empresa':
        this.configOpen = true;
        this.empresaOpen = true;
        break;
    }

    this.active = menu;
  }

  saveMenuState(menu: Item) {

    this.lastOpenMenu = menu;

    localStorage.setItem('sidebarMenu', menu);
  }

  clearMenuState() {

    this.lastOpenMenu = '';

    localStorage.removeItem('sidebarMenu');
  }

  setActive(item: Item) {

    this.active = item;

    if (this.isMobile) {
      this.open = false;
      this.openChange.emit(this.open);
    }
  }

  /*  LOGOUT */

  openLogoutConfirm() {

    this.confirmTitle = 'Cerrar sesión';
    this.confirmMessage = '¿Seguro que deseas cerrar sesión?';

    this.confirmOpen = true;

    this.actionToConfirm = () => this.onLogout();
  }

  cancelConfirm() {

    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  closeConfirm() {
    this.cancelConfirm();
  }

  confirmProceed() {

    if (this.actionToConfirm) {
      this.actionToConfirm();
    }

    this.confirmOpen = false;
    this.actionToConfirm = null;
  }

  onLogout() {

    localStorage.clear();

    this.ws.disconnect();

    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  /*perfil */

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
      error: (err) => console.error(err)
    });
  }

  closeEditProfile() {
    this.editProfileOpen = false;
  }

 

  ngOnDestroy() {

    window.removeEventListener('resize', this.checkMobile);
  }

}
