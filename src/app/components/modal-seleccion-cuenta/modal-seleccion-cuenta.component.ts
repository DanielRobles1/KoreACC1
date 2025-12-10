import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


type CuentaNodoInterno = {
  id_cuenta: number;
  codigo: string;
  nombre: string;

  nivel: number;                          // 0 = raíz, 1 = hijo, etc.
  esPadre?: boolean | 0 | 1 | '0' | '1';  // true si tiene hijos
  posteable?: boolean | 0 | 1 | '0' | '1' | null;

  _expandido: boolean;                    // control UI
};

@Component({
  selector: 'app-modal-seleccion-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-seleccion-cuenta.component.html',
  styleUrls: ['./modal-seleccion-cuenta.component.scss'],
})
export class ModalSeleccionCuentaComponent implements OnChanges {
  @Input() open = false;


  @Input() cuentas: any[] = [];

  @Input() cuentaSeleccionada: any | null = null;

  @Input() noPosteablesComoTitulo = false;
  @Input() permitirSeleccionNoPosteables = true;

  @Output() cuentaConfirmada = new EventEmitter<any>();
  @Output() cerrado = new EventEmitter<void>();

  filtro = '';

  private cuentasBase: CuentaNodoInterno[] = [];

  nodosVisibles: CuentaNodoInterno[] = [];

  private normaliza = (s: string | null | undefined) =>
    (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  private mapToNodo(c: any): CuentaNodoInterno {
    return {
      id_cuenta: c.id_cuenta,
      codigo: c.codigo,
      nombre: c.nombre,
      nivel: c.nivel ?? 0,
      esPadre: c.esPadre,
      posteable: c.posteable,
      _expandido: !!c._expandido,
    };
  }

  esPadre(c: CuentaNodoInterno): boolean {
    const v = c.esPadre;
    if (v === true || v === 1 || v === '1') return true;
    if (v === false || v === 0 || v === '0') return false;
    return false;
  }

  esPosteable(c: CuentaNodoInterno): boolean {
    const v = c.posteable;
    if (v === true || v === 1 || v === '1') return true;
    if (v === false || v === 0 || v === '0') return false;
    return true;
  }

  esGrupo(c: CuentaNodoInterno): boolean {
    return !this.esPosteable(c);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cuentas']) {
      this.cuentasBase = (this.cuentas ?? []).map((c) => this.mapToNodo(c));
      this.rebuildTree();
    }
  }

  onFiltroChange(): void {
    this.rebuildTree();
  }

  rebuildTree(): void {
    const texto = this.normaliza(this.filtro);

    if (texto) {
      this.nodosVisibles = this.cuentasBase.filter((c) =>
        this.normaliza(`${c.codigo} ${c.nombre}`).includes(texto)
      );
      return;
    }

    const resultado: CuentaNodoInterno[] = [];
    const expandedByLevel = new Map<number, boolean>(); // nivel - expandido

    for (const c of this.cuentasBase) {
      const lvl = c.nivel ?? 0;

      if (lvl === 0) {
        // raíz: siempre visible
        resultado.push(c);

        if (this.esPadre(c)) {
          expandedByLevel.set(0, !!c._expandido);
        }
        continue;
      }

      // visible solo si TODOS  están expandido=true
      let visible = true;
      for (let l = 0; l < lvl; l++) {
        if (expandedByLevel.get(l) !== true) {
          visible = false;
          break;
        }
      }
      if (!visible) continue;

      resultado.push(c);

      if (this.esPadre(c)) {
        expandedByLevel.set(lvl, !!c._expandido);
      }
    }

    this.nodosVisibles = resultado;
  }

  toggleNodo(n: CuentaNodoInterno): void {
    n._expandido = !n._expandido;
    this.rebuildTree();
  }

  //  selección 
  seleccionarCuenta(c: CuentaNodoInterno): void {
    if (!this.permitirSeleccionNoPosteables && this.esGrupo(c)) return;
    this.cuentaSeleccionada =
      this.cuentas.find((x) => x.id_cuenta === c.id_cuenta) ?? c;
  }

  confirmar(): void {
    if (this.cuentaSeleccionada) {
      this.cuentaConfirmada.emit(this.cuentaSeleccionada);
    }
  }

  cerrar(): void {
    this.cerrado.emit();
  }
}
