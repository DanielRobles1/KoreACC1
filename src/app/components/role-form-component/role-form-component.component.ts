import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-form-component.component.html',
  styleUrls: ['./role-form-component.component.scss'] 
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
 if (!this.form?.valid) return;
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