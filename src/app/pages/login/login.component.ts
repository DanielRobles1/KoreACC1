// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from '@environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RecaptchaModule],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: environment.recaptchaSiteKey } as RecaptchaSettings,
    },
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  recaptchaToken: string | null = null;
  loading = false;
  authError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          //Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
        ],
      ],
      remember: [false],
      recaptcha: ['', Validators.required], // solo se valida en el form, no se manda
    });

    // Al iniciar, si hay username guardado lo cargamos
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({
        username: savedUsername,
        remember: true
      });
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onRecaptchaResolved(token: string | null): void {
    this.recaptchaToken = token;
    this.loginForm.patchValue({ recaptcha: token ?? '' });
  }

  submit(): void {
    this.authError = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password, remember } = this.loginForm.value;

    // Guardar o limpiar del remember
    if (remember) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    this.loading = true;
    this.auth.login(username, password, this.recaptchaToken!).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/empresa']); 
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 428) {
          
          this.router.navigate(['/cambiar-password'], {
            state: { token: err.error.token, user: err.error.user }
          });
        } else {
          this.authError = err.error?.message || 'Error de autenticación. Verifica tus credenciales.';
        }
      }
    });
  }

  forgotPassword() {
    this.router.navigate(['/login/recuperar-password']);
  }
}
