import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  telefono?: string;
  usuario?: string;
  rol?: string;
  roles?: string[];
}

type UsuarioForm = {
  nombre: FormControl<string>;
  apellido_p: FormControl<string>;
  apellido_m: FormControl<string>;
  correo: FormControl<string>;
  telefono: FormControl<string>;
  usuario: FormControl<string>;
  rol: FormControl<string>;
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
  @Input() roles: string[] = ['Administrador', 'Contador', 'Auditor'];
  @Input() readonlyEmail = false;

  @Output() submitted = new EventEmitter<Usuario>();
  @Output() canceled = new EventEmitter<void>();

  form: FormGroup<UsuarioForm>;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido_p: ['', [Validators.required, Validators.minLength(3)]],
      apellido_m: ['', [Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      usuario: [''],
      rol: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const v: Usuario = this.value || { nombre: '', apellido_p: '', apellido_m: '', correo: '', telefono: '', usuario: '', rol: '' };
      this.form.reset(v);
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

    const raw = this.form.getRawValue();
    const { rol, ...rest } = raw;

    const payload: Usuario = {
      ...(this.value?.id_usuario ? { id_usuario: this.value.id_usuario } : {}),
      ...rest,
      roles: rol ? [rol] : []
    };

    this.submitted.emit(payload);
  }


  cancel() { this.canceled.emit(); }
}
