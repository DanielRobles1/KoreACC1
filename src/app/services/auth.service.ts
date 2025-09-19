// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string, recaptchaToken: string) {
    return this.http.post<{ token: string; user: any }>(
      `${this.apiUrl}/login`,
      { identifier, password, recaptchaToken }
    ).pipe(
      tap(res => {
        console.log('📥 Respuesta del login:', res); // 👈 debug
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);   // ✅ ahora guarda bien el token
          localStorage.setItem('user', JSON.stringify(res.user));
          console.log('🔑 Token guardado en localStorage:', res.token);
        } else {
          console.error('⚠️ No llegó token en la respuesta');
        }
      })
    );
  }

  resetPassword(email: string){
    return this.http.post(
      `${this.apiUrl}/reset-password`,
      { email },
    ).pipe(
      tap(res => console.log('Reset password request sent:', res)),
      catchError(err => {
        console.error('Reset password request failed:', err);
        return throwError(() => err);
      })
    )
  }

  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
    ).pipe(
      tap(res => console.log('Logout server ok:', res)),
      catchError(err => {
        console.warn('Logout server failed, clearing client anyway', err);
        return throwError(() => err);
      }),
      finalize(() => this.clearSession())
    );
  }

  private clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
