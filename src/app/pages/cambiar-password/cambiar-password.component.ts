import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
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

  constructor(private fb: FormBuilder, private http: HttpClient,
    private router: Router, private auth: AuthService) {
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

    this.auth.changePassword(this.form.value.oldPassword, this.form.value.password)
      .subscribe({
        next: () => {
          this.mensajeOk = 'Contraseña cambiada exitosamente. Redirigiendo al login...';
          this.form.reset();

          setTimeout(() => {
            this.auth.logout();
            this.router.navigate(['/login']);
            this.loading = false;
          }, 2000);
        },
        error: (err) => {
          this.mensajeError = err.error?.message || 'Error al cambiar la contraseña';
          this.loading = false;
        }
      });
  }
}
