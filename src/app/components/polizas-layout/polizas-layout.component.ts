import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-polizas-layout',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './polizas-layout.component.html',
  styleUrl: './polizas-layout.component.scss'
})
export class PolizasLayoutComponent {
  /** controla apertura del sidebar desde el padre */
  @Input() open = true;
  /** propaga cambios al padre */
  @Output() openChange = new EventEmitter<boolean>();

  onToggle(v: boolean) {
    this.open = v;
    this.openChange.emit(v);
  }
}
