import { Component } from '@angular/core';

import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from 'src/app/components/crud-panel/crud-panel.component';
import { SidebarComponent } from "@app/components/sidebar/sidebar.component";

@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [CrudPanelComponent, SidebarComponent],
  templateUrl: './empresa.component.html',
  styleUrl: './empresa.component.scss'
})
export class EmpresaComponent {
sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }
}
