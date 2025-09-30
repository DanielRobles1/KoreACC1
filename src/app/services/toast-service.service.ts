import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastState {
  open: boolean;
  title: string;
  message: string;
  type: ToastType;
  autoCloseMs: number; // 0 = sin autocierre
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _state$ = new BehaviorSubject<ToastState>({
    open: false,
    title: '',
    message: '',
    type: 'info',
    autoCloseMs: 3500
  });

  state$ = this._state$.asObservable();

  show(message: string, type: ToastType = 'info', title = '', autoCloseMs = 3500) {
    this._state$.next({ open: true, title, message, type, autoCloseMs });
  }

  info(m: string, t = '') { this.show(m, 'info', t); }
  success(m: string, t = 'Éxito', ms = 3000) { this.show(m, 'success', t, ms); }
  warning(m: string, t = 'Aviso') { this.show(m, 'warning', t); }
  error(m: string, t = 'Error', ms = 0) { this.show(m, 'error', t, ms); }

  close() {
    const s = this._state$.getValue();
    this._state$.next({ ...s, open: false });
  }
}
