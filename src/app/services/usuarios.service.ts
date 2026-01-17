import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido_p: string;
  apellido_m?: string;
  correo: string;
  telefono?: string;
  usuario: string;
  contrasena?: string;
  estatus: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl =  `${environment.urlBase}/api/v1/usuarios`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
updateMe(data: any) {
  return this.http.put(`${this.apiUrl}/me`, data);
}




  updateUsuario(id: number, payload: Partial<Usuario>) {
    return this.http.put<{ message: string; usuario: Usuario }>(`${this.apiUrl}/${id}`, payload);
  }
}
