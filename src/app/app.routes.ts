// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsuariosComponent } from './pages/usuarios/usuarios/usuarios.component';
import { LoginComponent } from './pages/login/login.component';
import { RecuperarcontrComponent } from './pages/recuperarcontr/recuperarcontr.component';
import { RolesypermisosComponent } from './pages/rolesypermisos/rolesypermisos.component';
import { CambiarPasswordComponent } from './pages/cambiar-password/cambiar-password.component';
import { AuthGuard } from './guards/auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'login/recuperar-password', component: RecuperarcontrComponent },

  { path: 'cambiar-password', component: CambiarPasswordComponent },

  // Rutas protegidas con el guard
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
  { path: 'login/roles', component: RolesypermisosComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'login' } 
];
