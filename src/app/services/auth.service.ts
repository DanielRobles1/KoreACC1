// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string) {
    return this.http.post<{ token: string; user: any }>(
      `${this.apiUrl}/login`,
      { identifier, password }
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

  logout() {
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
