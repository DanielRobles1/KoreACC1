import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../services/auth.service';
import { WsService } from '@app/services/ws.service';

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
    private auth: AuthService,
    private ws: WsService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      remember: [false],
      recaptcha: ['', Validators.required],
    });

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

    if (remember) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    this.loading = true;
    this.auth.login(username, password, this.recaptchaToken!).subscribe({
      // 👇 importante: recibir la respuesta
      next: (resp: any) => {
        this.loading = false;

        // === Guardar usuario con id_usuario en localStorage ===
        const user = resp?.user;
        if (user) {
          const usuarioLite = {
            id_usuario: user.id_usuario,                     // <- lo que usa PolizaAjuste
            nombre: user.nombre,
            apellido_p: user.apellido_p,
            apellido_m: user.apellido_m,
            apellidos: `${user.apellido_p} ${user.apellido_m}`,
            correo: user.correo,
            debe_cambiar_contrasena: user.debe_cambiar_contrasena,
            roles: user.roles ?? user.Rols?.map((r: any) => r.nombre) ?? [],
          };

          localStorage.setItem('usuario', JSON.stringify(usuarioLite));
          console.log('Usuario guardado en localStorage:', usuarioLite);
        }

        // Conectar WS y navegar
        this.ws.connect();
        this.router.navigate(['/poliza-home']);
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
