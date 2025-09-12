import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { PrincipalComponent, PageTab } from '../../components/principal/principal.component';

type User = { id:number; name:string; email:string; phone:string; role:string };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, PrincipalComponent],
  templateUrl: './home.component.html'
})

export class HomeComponent {
  // tabs para el layout principal
  tabs: PageTab[] = [
    { id: 'users', label: 'Usuarios' },
    { id: 'roles', label: 'Roles y permisos' }
  ];
  active = 'users';

  // 👇 ESTA propiedad faltaba
  users: User[] = [
    { id: 1, name: 'Ana',  email: 'ana@demo.com',  phone: '555-123', role: 'Admin'  },
    { id: 2, name: 'Luis', email: 'luis@demo.com', phone: '555-456', role: 'Viewer' }
  ];

  primaryActionLabel = 'Nuevo Usuario';
  newUser() { /* abre modal o navega */ }
  edit(u: User) { /* ... */ }
  remove(u: User) { /* ... */ }
}
