import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WsService implements OnDestroy {
  private socket?: Socket;

  constructor(private auth: AuthService) { }

  connect(): void {
    const token = this.auth.getToken();
    if (!token) {
      console.warn('[WS] No hay token, no se abre conexión');
      return;
    }

    // Si ya hay un socket conectado, no abras otro
    if (this.socket && this.socket.connected) {
      return;
    }

    // Cierra socket anterior si existiera
    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[WS] Conectado, id:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WS] Desconectado:', reason);
    });

    this.socket.on('permissions:changed', (payload: any) => {
      console.log('[WS] permissions:changed recibido:', payload);
      this.handlePermissionsChangeEvent('permissions:changed', payload);
    });

    this.socket.on('role-permissions:changed', (payload: any) => {
      console.log('[WS] role-permissions:changed recibido:', payload);
      this.handlePermissionsChangeEvent('role-permissions:changed', payload);
    });

  }

  on(event: string, cb: (...args: any[]) => void): () => void {
    if (!this.socket) this.connect();

    if (!this.socket) {
      console.warn('[WS] on(): no hay socket, devolviendo unsubscribe no-op');
      return () => { };
    }

    const handler = (...args: any[]) => cb(...args);

    if (this.socket.connected) {
      this.socket.on(event, handler);
    } else {
      const attach = () => {
        this.socket?.off('connect', attach);
        this.socket?.on(event, handler);
      };
      this.socket.on('connect', attach);
    }

    const unsubscribe = () => {
      try {
        this.socket?.off(event, handler);
      } catch { }
    };
    return unsubscribe;
  }

  private handlePermissionsChangeEvent(source: string, payload: any) {
    console.log(`[WS] Manejar evento ${source}`, payload);

    this.auth
      .refreshUserFromServer()
      .pipe(
        switchMap(() => this.auth.loadPermissions()),
        catchError((err) => {
          console.error(`[WS] Error al actualizar sesión tras ${source}`, err);
          return of(null);
        })
      )
      .subscribe(() => {
        console.log(`[WS] Sesión actualizada tras ${source}`);
      });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
      console.log('[WS] Socket desconectado manualmente');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}