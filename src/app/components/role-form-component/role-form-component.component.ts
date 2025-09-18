import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form #form="ngForm" (ngSubmit)="submit()" class="space-y-6">
      <!-- Nombre -->
      <div class="form-field">
        <label for="name" class="block text-sm font-semibold text-gray-800">Nombre del Rol</label>
        <input
          id="name"
          type="text"
          [(ngModel)]="localValue.nombre"
          name="nombre"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 transition-colors duration-200"
          placeholder="Ej: Administrador, Editor, etc."
        />
      </div>

      <!-- Descripción -->
      <div class="form-field">
        <label for="description" class="block text-sm font-semibold text-gray-800">Descripción</label>
        <textarea
          id="description"
          [(ngModel)]="localValue.descripcion"
          name="descripcion"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 transition-colors duration-200"
          placeholder="Una breve descripción del rol."
        ></textarea>
      </div>

      <!-- Buscador -->
      <div class="form-field">
        <label class="block text-sm font-semibold text-gray-800">Buscar permisos</label>
        <input
          type="text"
          [(ngModel)]="searchTerm"
          name="searchTerm"
          placeholder="Escribe para filtrar permisos..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-3 transition-colors duration-200"
        />
      </div>

      <!-- Permisos agrupados -->
      <div class="form-field">
        <label class="block text-sm font-semibold text-gray-800">Permisos</label>
        <div class="mt-3 space-y-6">
          <div *ngFor="let category of permissionCategories">
            <h3 class="text-md font-bold text-purple-700 mb-2">{{ category.label }}</h3>
            <div class="space-y-2 ml-4">
              <label
                *ngFor="let permission of filteredPermissionsByCategory(category)"
                class="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  [id]="permission"
                  [value]="permission"
                  [checked]="localValue.permissions?.includes(permission)"
                  (change)="togglePermission(permission, $event)"
                  class="focus:ring-purple-500 h-5 w-5 text-purple-600 border-gray-300 rounded transition-colors duration-200"
                />
                <span class="text-sm font-medium text-gray-700">
                  {{ formatPermission(permission) }}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .form-field { margin-bottom: 1rem; display: flex; flex-direction: column; }
  `]
})
export class RoleFormComponent implements OnInit, OnChanges {
  @Input() role: any;
  @Input() availablePermissions: string[] = [];
  @Output() submitted = new EventEmitter<any>();
  @Output() canceled = new EventEmitter<void>();

  @ViewChild('form') form!: NgForm;   

  localValue: any = { nombre: '', descripcion: '', permissions: [] };
  searchTerm: string = '';

  // Categorías de permisos
  permissionCategories = [
    { label: 'Catálogo de cuentas', keys: ['catalogo_ver','catalogo_crear','catalogo_editar','catalogo_eliminar'] },
    { label: 'Sucursales', keys: ['sucursales_ver','sucursales_crear','sucursales_editar','sucursales_eliminar'] },
    { label: 'Pólizas', keys: ['polizas_ver','polizas_crear','polizas_editar','polizas_eliminar'] },
    { label: 'Movimientos', keys: ['movimientos_ver','movimientos_crear','movimientos_editar','movimientos_eliminar'] },
    { label: 'Reportes', keys: ['reportes_ver','reportes_exportar'] },
    { label: 'Administración', keys: ['gestionar_usuarios','gestionar_roles'] }
  ];

  ngOnInit() {
    if (this.role) {
      this.localValue = { ...this.role };
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['role']) {
      this.localValue = this.role
        ? { ...this.role }
        : { nombre: '', descripcion: '', permissions: [] };
    }
  }

  // submit desde modal o enter
  submitForm() {
    if (this.form.valid) {
      this.submitted.emit(this.localValue);
    }
  }

  submit() {
    this.submitted.emit(this.localValue);
  }

  cancel() {
    this.canceled.emit();
  }

  // ✅ Agregar / quitar permiso
  togglePermission(permission: string, event: any) {
    if (event.target.checked) {
      if (!this.localValue.permissions.includes(permission)) {
        this.localValue.permissions.push(permission);
      }
    } else {
      this.localValue.permissions = this.localValue.permissions.filter((p: string) => p !== permission);
    }
  }

  // Filtrapor categoría y por buscador
  filteredPermissionsByCategory(category: { label: string, keys: string[] }): string[] {
    let perms = category.keys;
    if (!this.searchTerm.trim()) return perms;
    return perms.filter(p => p.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  // mostrar permisos 
  formatPermission(permission: string): string {
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
