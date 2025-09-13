import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UsuariosComponent } from './pages/usuarios/usuarios/usuarios.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }, 
  {
    path: 'usuarios',
    component: UsuariosComponent
  }
];
