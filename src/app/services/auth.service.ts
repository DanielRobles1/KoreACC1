import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap, switchMap, map } from 'rxjs/operators';
import { Observable, throwError, of, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '@environments/environment';
import { UsuarioSesion } from '@app/models/auth';
import { normalizeUser, toUserId } from '@app/utils/user-utils';

export type UserRole = string;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.urlBase}/api/v1`;
  private tokenKey = 'auth_token';
  private userKey = 'user';
  private permKey = 'permissions';

  constructor(private http: HttpClient) {
    const u = this.getUser();
    this.userSubject.next(u);
  }

  private permissionsChangedSubject = new Subject<void>();
  permissionsChanged$ = this.permissionsChangedSubject.asObservable();

  private userSubject = new BehaviorSubject<UsuarioSesion | null>(null);
  user$ = this.userSubject.asObservable();
  userId$ = this.user$.pipe(map(u => (u?.id_usuario ?? null)));

  login(identifier: string, password: string, recaptchaToken: string) {
    const body = { identifier, password, recaptchaToken };

    return this.http.post<{ token: string; user: any; code?: string; message?: string }>(
      `${this.apiUrl}/auth/login`,
      body,
      { observe: 'response' }
    ).pipe(
      switchMap((response) => {
        if (response.status === 200) {
          const res = response.body!;
          localStorage.setItem(this.tokenKey, res.token);

          const normalized = normalizeUser(res.user);
          localStorage.setItem(this.userKey, JSON.stringify(normalized ?? res.user));
          this.userSubject.next(normalized);

          console.log('Login exitoso', res);

          return this.loadPermissions().pipe(
            tap(() => console.log('Permisos cargados tras login')),
            catchError(err => {
              console.error('No se pudieron cargar permisos en login', err);
              return of(null);
            })
          );
        }
        return of(null);
      }),
      catchError((err) => {
        if (err.status === 428) {
          console.warn('Cambio de contraseña requerido', err.error);

          if (err.error?.token) {
            localStorage.setItem(this.tokenKey, err.error.token);

            const normalized = normalizeUser(err.error.user);
            localStorage.setItem(this.userKey, JSON.stringify(normalized ?? err.error.user));
            this.userSubject.next(normalized);
          }
        } else {
          console.error('Error en login', err);
        }
        return throwError(() => err);
      })
    );
  }

  loadPermissions() {
    return this.http.get<{ permisos: Array<{ nombre: string }> }>(
      `${this.apiUrl}/usuarios/permisos`
    ).pipe(
      tap(({ permisos }) => {
        const perms = permisos.map(p => p.nombre);
        localStorage.setItem(this.permKey, JSON.stringify(perms));
        console.log('Permisos cargados:', perms);
        this.permissionsChangedSubject.next();
      }),
      catchError(err => {
        console.error('Error al cargar permisos:', err);
        return throwError(() => err);
      })
    );
  }

  refreshUserFromServer() {
    return this.http.get<any>(`${this.apiUrl}/usuarios/me`).pipe(
      tap(user => {
        const normalized = normalizeUser(user);
        localStorage.setItem(this.userKey, JSON.stringify(normalized ?? user));
        this.userSubject.next(normalized);

        console.log('Usuario refrescado desde servidor:', user);
        this.permissionsChangedSubject.next();
      }),
      catchError(err => {
        console.error('Error al refrescar usuario:', err);
        return throwError(() => err);
      })
    );
  }

  resetPassword(email: string) {
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

  changePassword(oldPassword: string, password: string) {
    return this.http.patch(`${this.apiUrl}/auth/change-password`, {
      oldPassword,
      newPassword: password
    });
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.permKey);

    this.userSubject.next(null);
  }

  // ---------- GETTERS ----------
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): UsuarioSesion | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return normalizeUser(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const id = this.userSubject.value?.id_usuario ?? toUserId(this.getUser());
    return Number.isFinite(Number(id)) ? Number(id) : null;
  }

  getUserIdOrThrow(): number {
    const id = this.getUserId();
    if (!id) throw new Error('No se pudo resolver id_usuario (sesión no válida).');
    return id;
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