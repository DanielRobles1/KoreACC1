// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();

  if (token) {
    console.log('📌 Token encontrado:', token);
    console.log('📌 Request URL:', req.url);
    console.log('📌 Headers antes de enviar:', req.headers);

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.warn('⚠️ No hay token en el storage');
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearSession();
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      } else if (err.status === 428) {
        if (router.url !== '/cambiar-password') {
          router.navigate(['/cambiar-password']);
        }
      } else if (err.status === 403) {
        router.navigate(['/acceso-restringido'], { state: { reason: 'No tienes permiso para acceder a este recurso.' } });
      }

      return throwError(() => err);
    })
  );
};
