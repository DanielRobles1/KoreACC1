import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs'; 
import { environment } from '@environments/environment';
import { UiCentro } from '@app/models/centros';

@Injectable({
  providedIn: 'root'
})
export class CentrosCostosService {
  private apiURL = `${environment.urlBase}/api/v1/centros`;
  constructor(private http: HttpClient) { }

  getCentros(): Observable<UiCentro[]> {
    return this.http.get<UiCentro[]>(this.apiURL);
  }

  getRoots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/roots/list`);
  }

  getChildren(parentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/${parentId}/children`);
  }

  getSubtree(rootId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/${rootId}/subtree`);
  }

  moveCentro(id: number, new_parent_id: number | null): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/${id}/move`, { new_parent_id });
  }

  createCentro(data: UiCentro): Observable<any> {
    return this.http.post<any>(this.apiURL, data);
  }

  actualizarCentro(id: number | string, data: Partial<UiCentro>): Observable<any>{
    return this.http.put<any>(`${this.apiURL}/${id}`, data);
  }

  deleteCentro(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
  bulkCreateCentros(data: UiCentro[]): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/bulk`, data);
  }

  downloadCentrosExcel() {
    return this.http.get(`${this.apiURL}/export.xlsx`, { responseType: 'blob', observe: 'response' });
  }

}
