// src/app/components/principal/principal.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component'; // ajusta la ruta si cambia

export type PageTab = { id: string; label: string };

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [NgIf, NgFor, SidebarComponent],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.scss']
})
export class PrincipalComponent {
  @Input() title = '';
  @Input() tabs: PageTab[] = [];
  @Input() activeTabId?: string;

  @Input() primaryActionLabel?: string;
  @Output() primaryAction = new EventEmitter<void>();

  sidebarOpen = false;
  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar() { this.sidebarOpen = false; }
  setActive(id: string) { this.activeTabId = id; }
}
