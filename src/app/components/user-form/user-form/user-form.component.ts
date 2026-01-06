import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesService } from '@app/services/roles.service';

export interface Usuario {
  id_usuario?: number;
  nombre: string;
  apellido_p: string;
  apellido_m: string;
  correo: string;
  telefono?: string;
  usuario?: string;
  estatus?: boolean;
  rol?: string;
  roles?: string[];
  Rols?: { nombre: string }[];
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
export class UserFormComponent implements OnChanges, OnInit {
  @Input() value: Usuario | null = null;
  @Input() readonlyEmail = false;

  @Output() submitted = new EventEmitter<Usuario>();
  @Output() canceled = new EventEmitter<void>();

  form: FormGroup<UsuarioForm>;
  roles: string[] = []; 

  constructor(private fb: FormBuilder, private rolesService: RolesService) {
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

ngOnInit(): void {
  this.rolesService.getRoles().subscribe({
    next: (res: any) => {
      console.log('Respuesta de roles:', res);

      // Los roles reales están en res.data
      const rolesArray = res.data || [];
      this.roles = rolesArray.map((r: any) => r.nombre);

      // Marcar rol si ya existe en el usuario
      if (this.value?.rol) {
        this.form.get('rol')?.setValue(this.value.rol);
      }

      console.log('Roles procesados:', this.roles);
    },
    error: (err) => console.error('Error cargando roles', err)
  });
}





  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const v: Usuario = this.value || { nombre: '', apellido_p: '', apellido_m: '', correo: '', telefono: '', usuario: '', rol: '' };
      this.form.reset(v);

      // Marcar rol si ya existe
      if (v.rol) {
        this.form.get('rol')?.setValue(v.rol);
      }

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
