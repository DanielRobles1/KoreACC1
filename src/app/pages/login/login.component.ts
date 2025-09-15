// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from '@environments/environment';

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
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8), // mínimo 8 caracteres
          // Validación estricta activada por defecto
          Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/),
        ],
      ],
      remember: [false],
      recaptcha: ['', Validators.required],
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

    console.log('✅ Datos enviados:', this.loginForm.value);

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/usuarios']);
    }, 1000);
  }

  forgotPassword() {
  this.router.navigate(['/login/recuperar-password']);
}
}
