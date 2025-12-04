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
import { ImpuestosComponent } from './pages/impuestos/impuestos.component';
import { CatalogCentrosComponent } from './pages/catalog-centros/catalog-centros.component';
import { PolizasComponent } from './pages/polizas/polizas.component';
import { PolizaHomeComponent } from './pages/poliza-home/poliza-home.component';
import { PolizaEditarComponent } from './pages/poliza-editar/poliza-editar.component';
import { BalanzaComprobacionComponent } from './pages/balanza-comprobacion/balanza-comprobacion.component';
import { EstadoResComponent } from './pages/estado-res/estado-res.component';
import { BalanceGralComponent } from './pages/balance-gral/balance-gral.component';
import { EmpresaPrincipalComponent } from './pages/empresa-principal/empresa-principal.component';
import { DashboardContableComponent } from './pages/dashboard-contable/dashboard-contable.component';
import { PolizaAjusteComponent } from './pages/poliza-ajuste/poliza-ajuste.component';


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
    data: { perms: ['consultar_empresa','editar_empresa','crear_empresa','eliminar_empresa'] }
  },
  {
    path: 'impuestos',
    component: ImpuestosComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { perms: ['consultar_empresa']}
  },
 {
    path: 'catalogos/cuentas',
    loadComponent: () =>
      import('./pages/catalogocuentas/catalogocuentas.component').then(m => m.CatalogoCuentasComponent),
     canActivate: [AuthGuard, PermissionGuard],
     data: { perms: ['consultar_cat_Contable']}
  },
  {
   path: 'centros-costo',
    component: CatalogCentrosComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_cat_Centros']}
},
 {
   path: 'polizas',
    component: PolizasComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_empresa']}
},
{
  path: 'polizas/editar/:id',
  component: PolizaEditarComponent
},
{ path: 'empresas', component: EmpresaPrincipalComponent },
{
   path: 'poliza-home',
    component: PolizaHomeComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_empresa']}
},
{
   path: 'balanza-comprobacion',
    component: BalanzaComprobacionComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte']}
},
{
   path: 'estado-resultados',
    component: EstadoResComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte']}
},
{
   path: 'balance-general',
    component: BalanceGralComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte']}
},
// app.routes.ts
{ path: 'dashboard-contable', component: DashboardContableComponent }
,
// Ruta para el ajuste de póliza
  {
    path: 'poliza/ajuste/:id',  // :id es el parámetro que representa el ID de la póliza a ajustar
    component: PolizaAjusteComponent,
    canActivate: [AuthGuard], // Si quieres que esta ruta esté protegida por autenticación y permisos
    data: { perms: ['ajustar_poliza'] } // Aquí puedes definir los permisos necesarios para acceder al ajuste
  },
  { path: '**', redirectTo: 'login' }

];