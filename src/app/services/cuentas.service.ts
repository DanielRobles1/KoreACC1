import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Cuenta {
  id: number;
  codigo: string;
  nombre: string;
  ctaMayor: boolean;
  parentId: number | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;

  padreCodigo?: string | null;
  padreNombre?: string | null;
  icon?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private apiURL = 'http://localhost:3000/api/v1/cuentas';
  
  constructor( private http: HttpClient) { }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<Cuenta[]>(this.apiURL);
  }
}
