import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  telefono?: string;
  rol?: string;
  area?: string;
}

type UsuarioForm = {
  nombre: FormControl<string>;
  correo: FormControl<string>;
  telefono: FormControl<string>;
  rol: FormControl<string>;
  area: FormControl<string>;
};

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnChanges {
  @Input() value: Usuario | null = null;
  @Input() roles: string[] = ['Administrador', 'Contador', 'Auditor', 'Invitado'];
  @Input() readonlyEmail = false;

  @Output() submitted = new EventEmitter<Usuario>();
  @Output() canceled = new EventEmitter<void>();

  form: FormGroup<UsuarioForm>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      rol: [''],
      area: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const v = this.value || { nombre: '', correo: '', telefono: '', rol: '', area: '' };
      this.form.reset(v);
      // opcional: bloquear correo en edición
      if (this.readonlyEmail) this.form.get('correo')?.disable();
      else this.form.get('correo')?.enable();
    }
  }

  get f() { return this.form.controls; } 

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload: Usuario = {
      ...(this.value?.id ? { id: this.value.id } : {}),
      ...this.form.getRawValue()
    };
    this.submitted.emit(payload);
  }

  cancel() { this.canceled.emit(); }
}
