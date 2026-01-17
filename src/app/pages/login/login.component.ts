import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';
import { environment } from '@environments/environment';
import { AuthService } from '../../services/auth.service';
import { WsService } from '@app/services/ws.service';

import { ToastService, ToastState } from '@app/services/toast-service.service';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RecaptchaModule, ToastMessageComponent],
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
  vm!: ToastState;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private ws: WsService,
    public toast: ToastService
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

    this.toast.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => (this.vm = s));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.toast.warning(
        this.summarizeFormErrors() || 'Formulario incompleto.',
        'Revisa los campos'
      );
      return;
    }

    const { username, password, remember } = this.loginForm.value;

    this.loading = true;
    this.toast.info('Validando credenciales...', 'Iniciando sesión');

    this.auth.login(username, password, this.recaptchaToken!).subscribe({
      next: (resp: any) => {
        this.loading = false;

        const user = resp?.user;
        if (user) {
          const usuarioLite = {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            apellido_p: user.apellido_p,
            apellido_m: user.apellido_m,
            apellidos: `${user.apellido_p} ${user.apellido_m}`,
            correo: user.correo,
            debe_cambiar_contrasena: user.debe_cambiar_contrasena,
            roles: user.roles ?? user.Rols?.map((r: any) => r.nombre) ?? [],
          };
          localStorage.setItem('usuario', JSON.stringify(usuarioLite));
        }

        this.toast.success('¡Bienvenido! Redirigiendo...', 'Autenticación exitosa');
        this.ws.connect();
        this.router.navigate(['/poliza-home']);
      },

      error: (err) => {
        this.loading = false;
        if (err?.status === 428) {
          this.toast.info(
            'Debes actualizar tu contraseña para continuar.',
            'Acción requerida'
          );
          this.router.navigate(['/cambiar-password'], {
            state: { token: err?.error?.token, user: err?.error?.user }
          });
          return;
        }

        const statusMsg = this.messageForStatus(err?.status);
        const detail = this.extractErrorMessage(err);
        const msg = statusMsg ? `${statusMsg}\n${detail}` : detail;

        this.authError = detail;
        if (err?.status === 401 || err?.status === 403) {
          this.toast.warning(msg, 'No autorizado');
        } else {
          this.toast.error(msg, 'Error de autenticación');
        }
      }
    });
  }

  forgotPassword() {
    this.toast.info('Te ayudaremos a recuperar tu cuenta.', 'Recuperar contraseña');
    this.router.navigate(['/login/recuperar-password']);
  }

  private extractErrorMessage(err: any): string {
    const direct = err?.error?.message || err?.message;
    if (direct) return String(direct);

    const errors = err?.error?.errors;
    if (Array.isArray(errors) && errors.length) {
      const msgs = errors
        .map((e: any) => e?.msg || e?.message || e?.detail)
        .filter(Boolean);
      if (msgs.length) return msgs.join('\n');
    }

    const detail = err?.error?.detail || err?.statusText;
    if (detail) return String(detail);

    return 'Ocurrió un error al autenticar.';
  }

  private messageForStatus(status?: number): string | null {
    switch (status) {
      case 0: return 'No hay conexión con el servidor. Verifica tu red.';
      case 400: return 'Solicitud inválida. Revisa los datos ingresados.';
      case 401: return 'Credenciales inválidas.';
      case 403: return 'Acceso denegado.';
      case 404: return 'Ruta de autenticación no encontrada.';
      case 409: return 'Conflicto al iniciar sesión.';
      case 422: return 'Datos inválidos. Revisa los campos.';
      case 428: return null;
      case 429: return 'Demasiados intentos. Intenta más tarde.';
      case 500: return 'Error interno del servidor.';
      default: return null;
    }
  }

  private summarizeFormErrors(): string {
    const errs: string[] = [];
    const f = this.loginForm;

    if (f.get('username')?.invalid) errs.push('• Usuario es requerido.');
    if (f.get('password')?.hasError('required')) errs.push('• Contraseña es requerida.');
    if (f.get('password')?.hasError('minlength')) errs.push('• Contraseña debe tener al menos 8 caracteres.');
    if (f.get('recaptcha')?.invalid) errs.push('• Completa el reCAPTCHA.');

    return errs.join('\n');
  }



}
