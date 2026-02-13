import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsuariosComponent } from './pages/seguridad-pages/usuarios/usuarios.component';
import { LoginComponent } from './pages/login/login.component';
import { RecuperarcontrComponent } from './pages/recuperarcontr/recuperarcontr.component';
import { RolesypermisosComponent } from './pages/seguridad-pages/rolesypermisos/rolesypermisos.component';
import { CambiarPasswordComponent } from './pages/cambiar-password/cambiar-password.component';
import { AccesoRestringidoComponent } from './pages/acceso-restringido/acceso-restringido.component';
import { TipopolizaComponent } from './pages/empresa-pages/tipopoliza/tipopoliza.component';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PermissionGuard } from './guards/permission.guard';
import { EmpresaComponent } from './pages/empresa-pages/empresa/empresa.component';
import { ImpuestosComponent } from './pages/empresa-pages/impuestos/impuestos.component';
import { CatalogCentrosComponent } from './pages/catalogos-pages/catalog-centros/catalog-centros.component';
import { PolizasComponent } from './pages/polizas-page/polizas/polizas.component';
import { PolizaHomeComponent } from './pages/polizas-page/poliza-home/poliza-home.component';
import { PolizaEditarComponent } from './pages/polizas-page/poliza-editar/poliza-editar.component';
import { BalanzaComprobacionComponent } from './pages/reportes-pages/balanza-comprobacion/balanza-comprobacion.component';
import { EstadoResComponent } from './pages/reportes-pages/estado-res/estado-res.component';
import { BalanceGralComponent } from './pages/reportes-pages/balance-gral/balance-gral.component';
import { EmpresaPrincipalComponent } from './pages/empresa-pages/empresa-principal/empresa-principal.component';
import { DashboardContableComponent } from './pages/reportes-pages/dashboard-contable/dashboard-contable.component';
import { PolizaAjusteComponent } from './pages/polizas-page/poliza-ajuste/poliza-ajuste.component';
import { PeriodosComponent } from './pages/empresa-pages/periodos/periodos.component';
import { animation } from '@angular/animations';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'login/recuperar-password', component: RecuperarcontrComponent },
  { path: 'cambiar-password', component: CambiarPasswordComponent },

  { path: 'acceso-restringido', component: AccesoRestringidoComponent, canActivate: [AuthGuard], },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: { animation: 'Home' }
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard, PermissionGuard], // logueado + rol
    data: { perms: ['consultar_usuario'], animation: 'Usuarios' }
  },
  {
    path: 'login/roles',
    component: RolesypermisosComponent,
    canActivate: [AuthGuard, PermissionGuard], // logueado + permiso
    data: { perms: ['consultar_rol', 'editar_rol'], animation: 'Rolesypermisos' }
  },
  {
    path: 'empresa',
    component: EmpresaComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: { perms: ['consultar_empresa','editar_empresa','crear_empresa','eliminar_empresa'], animation: 'Empresa' },
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
      import('./pages/catalogos-pages/catalogocuentas/catalogocuentas.component').then(m => m.CatalogoCuentasComponent),
     canActivate: [AuthGuard, PermissionGuard],
     data: { perms: ['consultar_cat_Contable'], animation: 'CatalogoCuentas' }
  },
  {
   path: 'centros-costo',
    component: CatalogCentrosComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_cat_Centros'], animation: 'CatalogCentros'}
},
 {
   path: 'polizas',
    component: PolizasComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_poliza'], animation: 'Polizas'}
},
{
  path: 'polizas/editar/:id',
  component: PolizaEditarComponent,
  data: { animation: 'PolizaEditar' },
},
{ path: 'empresas', component: EmpresaPrincipalComponent, canActivate: [AuthGuard], data: { animation: 'EmpresaPrincipal' } },
{ path: 'ejercicio/:id_ejercicio/periodos', component: PeriodosComponent, data: { animation: 'Periodos' } },
{
   path: 'poliza-home',
    component: PolizaHomeComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_poliza'], animation: 'PolizaHome' }
},
{
   path: 'balanza-comprobacion',
    component: BalanzaComprobacionComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte'], animation: 'BalanzaComprobacion'}
},
{
   path: 'estado-resultados',
    component: EstadoResComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte'], animation: 'EstadoResultados'}
},
{
   path: 'balance-general',
    component: BalanceGralComponent,
    canActivate: [AuthGuard, PermissionGuard],
    data: {perms: ['consultar_reporte'], animation: 'BalanceGeneral'}
},
{ path: 'dashboard-contable', component: DashboardContableComponent, canActivate: [AuthGuard, PermissionGuard], data: { perms: ['consultar_reporte'], animation: 'DashboardContable' } },
  {
    path: 'poliza/ajuste/:id',
    component: PolizaAjusteComponent,
    canActivate: [AuthGuard], 
    data: { perms: ['ajustar_poliza'], animation: 'PolizaAjuste' }
  },
  {
  path: 'tipopoliza',
  component: TipopolizaComponent,
  canActivate: [AuthGuard],
  data: { perms: ['consultar_tipopoliza'], animation: 'Tipopoliza' }
},

  { path: '**', redirectTo: 'login' }

];