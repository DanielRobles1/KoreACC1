import { Component } from '@angular/core';
import { CrudAction, CrudColumn, CrudPanelComponent, CrudTab } from '../../../components/crud-panel/crud-panel.component';
import { SidebarComponent } from '../../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [SidebarComponent, CrudPanelComponent],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent {
  title = 'Gestión de usuarios y permisos';

  tabs: CrudTab[] = [
    { id: 'usuarios', label: 'Usuarios', icon: 'assets/svgs/poliza.svg',  iconAlt: 'Usuarios' },
    { id: 'roles',    label: 'Roles y permisos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Roles y permisos' },
  ];
  activeTabId = 'usuarios';

  columns: CrudColumn[] = [
    { key: 'id', header: '#' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'correo', header: 'Correo' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'rol', header: 'Rol' },
  ];

  rows = [
    { id: 1, nombre: 'Alejandro Rivera', correo: 'ale@gmail.com', telefono: '951-xxx-xx-xx', rol: 'Contador' },
    { id: 2, nombre: 'Daniel', correo: 'dani@gmail.com', telefono: '951-xxx-xx-xx', rol: 'Administrador' },
  ];

  actions: CrudAction[] = [
    { id: 'edit', tooltip: 'Editar usuario' },
    { id: 'delete', tooltip: 'Eliminar usuario' },
  ];

  page = 1;
  totalPages = 68;

  onTabChange(id: string) { this.activeTabId = id; }
  onPrimary() { console.log('nuevo usuario'); }
}