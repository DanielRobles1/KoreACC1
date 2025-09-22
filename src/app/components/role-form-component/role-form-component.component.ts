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
          placeholder="Una breve descripción del rol."></textarea>
      </div>

      <!-- (Opcional) Activo -->
      <div class="form-field">
        <label class="inline-flex items-center gap-3 text-sm font-semibold text-gray-800">
          <input type="checkbox" [(ngModel)]="localValue.activo" name="activo" class="h-4 w-4">
          Activo
        </label>
      </div>

      
    </form>
  `,
  styles: [`.form-field { margin-bottom: 1rem; display: flex; flex-direction: column; }`]
})
export class RoleFormComponent implements OnInit, OnChanges {
  @Input() role: any;
  @Input() availablePermissions: string[] = [];
  @Output() submitted = new EventEmitter<any>();
  @Output() canceled = new EventEmitter<void>();

  @ViewChild('form') form!: NgForm;

  localValue: any = { id: null, nombre: '', descripcion: '', permissions: [], activo: true };
  searchTerm = '';

  ngOnInit() {
    if (this.role) this.patchFromInput(this.role);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['role']) this.patchFromInput(this.role);
  }

  private patchFromInput(val: any) {
    this.localValue = val ? {
      id: val.id ?? val.id_rol ?? null,
      nombre: val.nombre ?? '',
      descripcion: val.descripcion ?? '',
      permissions: Array.isArray(val.permissions) ? [...val.permissions] : [],
      activo: (typeof val.activo === 'boolean') ? val.activo : true
    } : { id: null, nombre: '', descripcion: '', permissions: [], activo: true };
  }

  submitForm() {
    if (!this.form?.valid) return;
    this.submitted.emit(this.localValue);
  }

  submit() {
    this.submitForm();
  }

  cancel() {
    this.canceled.emit();
  }

  togglePermission(permission: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const arr: string[] = this.localValue.permissions ?? [];
    this.localValue.permissions = checked
      ? (arr.includes(permission) ? arr : [...arr, permission])
      : arr.filter(p => p !== permission);
  }

  filteredPermissions(): string[] {
    if (!this.searchTerm.trim()) return this.availablePermissions;
    const q = this.searchTerm.toLowerCase();
    return this.availablePermissions.filter(p => p.toLowerCase().includes(q));
  }

  formatPermission(permission: string): string {
    return permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}