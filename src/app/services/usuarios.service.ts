import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/api/v1/usuarios';

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }
}
