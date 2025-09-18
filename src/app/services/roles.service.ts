import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }

  createRole(role: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, role);
  }

  updateRole(id: number, role: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }

  replaceRolePermissions(id: number, permisos: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles/${id}/permisos`, { permisos });
  }

  // Permisos
  getPermisos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permisos`);
  }

  createPermiso(permiso: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/permisos`, permiso);
  }

  updatePermiso(id: number, permiso: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/permisos/${id}`, permiso);
  }

  deletePermiso(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/permisos/${id}`);
  }
}