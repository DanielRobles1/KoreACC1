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
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
        ],
      ],
      remember: [false],
      recaptcha: ['', Validators.required], // solo se valida en el form, no se manda
    });
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

    // ⚡ solo enviamos lo que backend necesita
    const { username, password } = this.loginForm.value;

    this.loading = true;
    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        this.loading = false;
        this.authError = err.error?.message || 'Error de autenticación. Verifica tus credenciales.';
      }
    });
  }

  forgotPassword() {
    this.router.navigate(['/login/recuperar-password']);
  }
}
