import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component'; 


export type CrudTab = {
  id: string;
  label: string;
  icon?: string;
  iconAlt?: string;
  route?: string;
  type?: 'text' | 'radio' | 'checkbox' | 'actions';
};
export type CrudColumn = { key: string; header: string; width?: string };
export type CrudAction = { id: string; label?: string; tooltip?: string };

@Component({
  selector: 'app-crud-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent,RouterModule],
  templateUrl: './crud-panel.component.html',
  styleUrls: ['./crud-panel.component.scss'], 
})
export class CrudPanelComponent {
  /** Header */
  @Input() title = '';
  @Input() disablePrimary = false;
 @Input() hidePrimary = false;

 // Emite la fila seleccionada cuando cambia el radio
  @Output() selection = new EventEmitter<any>();
  @Input() selectionMode: 'none' | 'single' = 'none';    // opt-in
@Input() idKey: string = 'id';                         // pk genérica
@Input() selectedRowId: string | number | null = null;

  onRadioChange(row: any) {
    this.selectedRowId = row.id;
    this.selection.emit(row);
  }
 route?: string; //
  /** Tabs (Usuarios / Roles y permisos / etc.) */
  @Input() tabs: CrudTab[] = [];
  @Input() activeTabId?: string;
  @Output() tabChange = new EventEmitter<string>();

  /** Search */
  @Input() showSearch = true;
  @Input() placeholderSearch = 'Buscar...';
  @Output() search = new EventEmitter<string>();
  innerSearch = '';

  @Input() primaryActionLabel = 'Nuevo';
  @Output() primaryAction = new EventEmitter<void>();

  /** Tabla */
  @Input() columns: CrudColumn[] = [];
  @Input() data: any[] = [];

  /** Acciones por fila */
  @Input() actions: CrudAction[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar' },
  ];
  @Output() action = new EventEmitter<{ action: string; row: any }>();
  @Output() edit = new EventEmitter<any>();
  @Output() remove = new EventEmitter<any>();

  /** Paginación */
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  onTabClick(id: string) { this.tabChange.emit(id); }
  onPrimary() { this.primaryAction.emit(); }
  onSearchChange(v: string) { this.search.emit(v); }

  onActionClick(id: string, row: any) {
    this.action.emit({ action: id, row });
    if (id === 'edit') this.edit.emit(row);
    if (id === 'delete') this.remove.emit(row);
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.pageChange.emit(this.page);
  }

  trackByIndex(i: number) { return i; }

  get visiblePages(): (number | '…')[] {
    const set = new Set<number>([1, this.page - 1, this.page, this.page + 1, this.totalPages]);
    const arr = [...set].filter(n => n >= 1 && n <= this.totalPages).sort((a, b) => a - b);
    const out: (number | '…')[] = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push('…');
    }
    return out;
  }

  onRowClick(row: any) {
  if (this.selectionMode !== 'single') return;
  // si el host controla selectedRowId, solo emite; el host actualizará el input
  this.selection.emit(row);
}
}