// src/app/services/roles.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // =======================
  // ROLES
  // =======================
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

  // =======================
  // PERMISOS
  // =======================

  /** Devuelve una página de permisos (sincrónica a tu API).
   *  Si tu backend no soporta limit/offset, puedes ignorar params.
   */
  getPermisos(limit?: number, offset?: number): Observable<any> {
    let params = new HttpParams();
    if (limit != null)  params = params.set('limit', String(limit));
    if (offset != null) params = params.set('offset', String(offset));
    return this.http.get(`${this.apiUrl}/permisos`, { params });
  }

  /** Devuelve TODOS los permisos, paginando si el backend lo hace.
   *  Se adapta a varias formas de respuesta:
   *   - Array plano: [ {nombre: '...'}, ... ] o ['...','...']
   *   - Objeto con data/rows + total/count: { data: [...], total: 123 } o { rows: [...], count: 123 }
   */
  getPermisosAll(pageSize = 500): Observable<string[]> {
    const fetchPage = (offset: number) =>
      this.getPermisos(pageSize, offset);

    // helpers para normalizar
    const toArray = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.rows)) return res.rows;
      return [];
    };
    const getTotal = (res: any, firstItemsLen: number): number => {
      return (
        res?.total ??
        res?.count ??
        res?.pagination?.total ??
        firstItemsLen // fallback si no hay total
      );
    };
    const mapPermNames = (arr: any[]): string[] =>
      arr
        .map((p: any) => typeof p === 'string' ? p : p?.nombre)
        .filter(Boolean);

    // primera página
    return fetchPage(0).pipe(
      switchMap((firstRes: any) => {
        const firstArr = toArray(firstRes);
        const firstNames = mapPermNames(firstArr);
        const total = getTotal(firstRes, firstArr.length);

        // si no hay más páginas, devolver lo obtenido
        if (!total || firstNames.length >= total) {
          return of(firstNames);
        }

        // calcular offsets restantes
        const requests: Observable<any>[] = [];
        for (let offset = firstNames.length; offset < total; offset += pageSize) {
          requests.push(fetchPage(offset));
        }

        if (requests.length === 0) {
          return of(firstNames);
        }

        return forkJoin(requests).pipe(
          map((restResps: any[]) => {
            const rest = restResps.flatMap(r => mapPermNames(toArray(r)));
            return [...firstNames, ...rest];
          })
        );
      })
    );
  }
}
