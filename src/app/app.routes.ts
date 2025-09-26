// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsuariosComponent } from './pages/usuarios/usuarios/usuarios.component';
import { LoginComponent } from './pages/login/login.component';
import { RecuperarcontrComponent } from './pages/recuperarcontr/recuperarcontr.component';
import { RolesypermisosComponent } from './pages/rolesypermisos/rolesypermisos.component';
import { CambiarPasswordComponent } from './pages/cambiar-password/cambiar-password.component';
import { AccesoRestringidoComponent } from './pages/acceso-restringido/acceso-restringido.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PermissionGuard } from './guards/permission.guard';
import { EmpresaComponent } from './pages/empresa/empresa.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'login/recuperar-password', component: RecuperarcontrComponent },
  { path: 'cambiar-password', component: CambiarPasswordComponent },

  { path: 'acceso-restringido', component: AccesoRestringidoComponent, canActivate: [AuthGuard], },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard], // sólo logueado
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard, PermissionGuard], // logueado + rol
    data: { perms: ['consultar_usuario'] }
  },
  {
    path: 'login/roles',
    component: RolesypermisosComponent,
    canActivate: [AuthGuard, PermissionGuard], // logueado + permiso
    data: { perms: ['consultar_rol', 'editar_rol'] }
  },
  {
    path: 'empresa',
    component: EmpresaComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { perms: ['consultar_empresa']}

  },

  { path: '**', redirectTo: 'login' }
];