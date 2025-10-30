import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CuentaLigera = {
  id_cuenta: number;
  codigo: string;
  nombre: string;
  posteable?: boolean | 0 | 1 | '0' | '1' | null; // backend puede mandar varios tipos
};

@Component({
  selector: 'app-modal-seleccion-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-seleccion-cuenta.component.html',
  styleUrls: ['./modal-seleccion-cuenta.component.scss']
})
export class ModalSeleccionCuentaComponent {
  @Input() open = false;
  @Input() cuentas: CuentaLigera[] = [];
  @Input() cuentaSeleccionada: CuentaLigera | null = null;

  @Output() cuentaConfirmada = new EventEmitter<CuentaLigera>();
  @Output() cerrado = new EventEmitter<void>();

  filtro = '';

  private normaliza = (s: string) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  get cuentasFiltradas(): CuentaLigera[] {
    const q = this.normaliza(this.filtro);
    const src = Array.isArray(this.cuentas) ? this.cuentas : [];
    if (!q) return src;
    return src.filter(c => this.normaliza(`${c.codigo} ${c.nombre}`).includes(q));
  }

  /** True si la cuenta es posteable (seleccionable). */
  esPosteable(c: CuentaLigera): boolean {
    const v = c?.posteable;
    // Normaliza a boolean: true si 1/'1'/true; false si 0/'0'/false; default true si viene undefined
    if (v === true || v === 1 || v === '1') return true;
    if (v === false || v === 0 || v === '0') return false;
    return true; // si no viene el campo, asumimos posteable
  }

  /** True si es "grupo" (no posteable) => se pone en negritas y se bloquea. */
  esGrupo(c: CuentaLigera): boolean {
    return !this.esPosteable(c);
  }

  seleccionarCuenta(c: CuentaLigera): void {
    if (this.esGrupo(c)) return; // no permitir seleccionar grupos
    this.cuentaSeleccionada = c;
  }

  confirmar(): void {
    if (this.cuentaSeleccionada) this.cuentaConfirmada.emit(this.cuentaSeleccionada);
  }

  cerrar(): void {
    this.cerrado.emit();
  }
}
