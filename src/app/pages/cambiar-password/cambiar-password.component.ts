import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cambiar-password.component.html',
  styleUrls: ['./cambiar-password.component.scss']
})
export class CambiarPasswordComponent {
  form: FormGroup;
  loading = false;
  mensajeOk = '';
  mensajeError = '';
  showPassword = false;
  showConfirmPassword = false;
  private baseUrl = `${environment.urlBase}/api/v1`

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit() {
    if (this.form.invalid) {
      this.mensajeError = 'Por favor completa todos los campos correctamente';
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.mensajeError = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;
    this.mensajeOk = '';
    this.mensajeError = '';

    this.http.patch(`${this.baseUrl}/auth/change-password`, {
      oldPassword: this.form.value.oldPassword,
      newPassword: this.form.value.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.mensajeOk = 'Contraseña cambiada con éxito';
        this.router.navigate(['/login']);
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        this.mensajeError = err.error?.message || 'Error al cambiar la contraseña';
      }
    });


  }
}
