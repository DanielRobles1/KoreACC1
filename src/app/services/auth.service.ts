// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export type UserRole = 'Administrador' | 'Contador' | 'Auditor' | string;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl   = 'http://localhost:3000/api/v1';
  private tokenKey = 'auth_token';
  private userKey  = 'user';
  private permKey  = 'permissions'; // <- cache de permisos

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string, recaptchaToken: string) {
    return this.http.post<{ token: string; user: any }>(
      `${this.apiUrl}/auth/login`,
      { identifier, password, recaptchaToken }
    ).pipe(
      tap(res => {
        console.log('📥 Respuesta del login:', res);
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          console.log('🔑 Token guardado:', res.token);
        } else {
          console.error('⚠️ No llegó token en la respuesta');
        }
      }),
      // tras login, intenta precargar permisos
      tap(async (res) => {
        try {
          const userId = res.user?.id_usuario ?? res.user?.id ?? null;
          if (userId) {
            await this.loadPermissions(userId).toPromise();
          }
        } catch (e) {
          console.warn('No se pudieron precargar permisos aún:', e);
        }
      })
    );
  }

  /** Carga roles/permisos desde tu endpoint y los guarda en localStorage */
  loadPermissions(userId: number) {
    return this.http.get<{ data: Array<{ Permisos?: Array<{ nombre: string }> }> }>(
      `${this.apiUrl}/usuarios/${userId}/roles-permisos`
    ).pipe(
      tap(({ data }) => {
        const set = new Set<string>();
        for (const rol of data ?? []) {
          for (const p of (rol.Permisos ?? [])) set.add(p.nombre);
        }
        const perms = [...set];
        localStorage.setItem(this.permKey, JSON.stringify(perms));
        console.log('✅ Permisos cargados:', perms);
      }),
      catchError(err => {
        console.error('❌ Error al cargar permisos:', err);
        return throwError(() => err);
      })
    );
  }

  resetPassword(email: string){
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { email }).pipe(
      tap(res => console.log('Reset password request sent:', res)),
      catchError(err => {
        console.error('Reset password request failed:', err);
        return throwError(() => err);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
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
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.permKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): any {
    const u = localStorage.getItem(this.userKey);
    return u ? JSON.parse(u) : null;
  }

  getRoles(): UserRole[] {
    return this.getUser()?.roles ?? [];
  }

  getPermissions(): string[] {
    const raw = localStorage.getItem(this.permKey);
    return raw ? JSON.parse(raw) : [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Helpers de autorización */
  hasRole(role: UserRole): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const mine = this.getRoles();
    return roles.some(r => mine.includes(r));
  }

  hasPermission(perm: string): boolean {
    return this.getPermissions().includes(perm);
  }

  hasAnyPermission(perms: string[]): boolean {
    const mine = new Set(this.getPermissions());
    return perms.some(p => mine.has(p));
  }
}
