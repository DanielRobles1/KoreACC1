import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

import { UsuariosComponent } from './pages/usuarios/usuarios/usuarios.component';

import { LoginComponent } from './pages/login/login.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomeComponent
  }, 
  {
    path: 'usuarios',
    component: UsuariosComponent
  }
];
