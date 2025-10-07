import { Component, EventEmitter, Input, Output, SimpleChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, map, debounceTime, startWith, shareReplay } from 'rxjs';
import { ImpuestoServiceTsService } from '@app/services/impuesto.service.ts.service';
import { CuentasService } from '@app/services/cuentas.service'; // <-- tu service
// ^ ajusta la ruta si es diferente

const APLICA_EN_OPTS = ['VENTA', 'COMPRA', 'AMBOS'] as const;
const MODO_OPTS = ['TASA', 'CUOTA', 'EXENTO'] as const;
const TIPO_OPTS = ['IVA', 'ISR', 'IEPS', 'RETENCION', 'OTRO'] as const;

type ImpuestoForm = {
  nombre: FormControl<string>;
  tipo: FormControl<string>;
  modo: FormControl<string>;
  tasa: FormControl<number>;
  aplica_en: FormControl<string>;
  es_estandar: FormControl<boolean>;
  vigencia_inicio: FormControl<string>;
  cuenta_relacionada: FormControl<string | null>; // <-- ahora numérico (id)
};

export interface Impuestos {
  id_impuesto?: number;
  id_empresa: number;
  nombre: string;
  tipo: string;
  modo: string;
  tasa: number;
  aplica_en: string;
  es_estandar: boolean;
  vigencia_inicio: string;
  cuenta_relacionada: string | null; // <-- id de cuenta (o null)
}

// Mismo interface de tu service
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

@Component({
  selector: 'app-impuesto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './impuesto-form.component.html',
  styleUrls: ['./impuesto-form.component.scss'],
})
export class ImpuestoFormComponent implements OnInit {
  @Input() value: Impuestos | null = null;
  @Input() idEmpresa = 1;
  @Output() submitted = new EventEmitter<Impuestos>();
  @Output() canceled = new EventEmitter<void>();

  isSubmitting = false;
  form: FormGroup<ImpuestoForm>;
  aplicaEnOpts = APLICA_EN_OPTS;
  modoOpts = MODO_OPTS;
  tipoOpts = TIPO_OPTS;

  // --- Cuentas ---
  private cuentas$ = this.cuentasSrv.getCuentas().pipe(shareReplay(1));
  private cuentaSearch$ = new BehaviorSubject<string>('');
  cuentaSearch = '';

  cuentasFiltradas$ = combineLatest([
    this.cuentas$,
    this.cuentaSearch$.pipe(debounceTime(200), startWith(''))
  ]).pipe(
    map(([cuentas, term]) => {
      const q = (term || '').trim().toLowerCase();
      if (!q) return cuentas;
      return cuentas.filter(c =>
        (c.codigo?.toLowerCase().includes(q)) ||
        (c.nombre?.toLowerCase().includes(q))
      );
    }),
    shareReplay(1)
  );

  cuentasFiltradasCount$ = this.cuentasFiltradas$.pipe(map(list => list.length));

  constructor(
    private fb: FormBuilder,
    private impuestosSrv: ImpuestoServiceTsService,
    private cuentasSrv: CuentasService
  ) {
    this.form = this.fb.nonNullable.group<ImpuestoForm>({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      tipo: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      modo: this.fb.nonNullable.control('', [Validators.required]),
      tasa: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      aplica_en: this.fb.nonNullable.control('', [Validators.required]),
      es_estandar: this.fb.nonNullable.control(false),
      vigencia_inicio: this.fb.nonNullable.control('', [Validators.required]),
      cuenta_relacionada: this.fb.control<string | null>(null),
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && this.value) {
      this.form.patchValue({
        nombre: this.value.nombre ?? '',
        tipo: this.value.tipo ?? '',
        modo: this.value.modo ?? '',
        tasa: this.value.tasa ?? 0,
        aplica_en: this.value.aplica_en ?? '',
        es_estandar: this.value.es_estandar ?? false,
        vigencia_inicio: this.value.vigencia_inicio ?? '',
        cuenta_relacionada: this.value.cuenta_relacionada ?? null,
      });
    } else {
      this.form.reset();
    }
  }

  get f() {
    return this.form.controls;
  }

  onCuentaSearch(term: string) {
    this.cuentaSearch = term;
    this.cuentaSearch$.next(term);
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const raw = this.form.getRawValue();

    const payload: Impuestos = {
      id_impuesto: this.value?.id_impuesto,
      id_empresa: this.idEmpresa,
      nombre: (raw.nombre ?? '').trim(),
      tipo: (raw.tipo ?? '').trim().toUpperCase(),
      modo: (raw.modo ?? '').trim().toUpperCase(),
      tasa: Number(raw.tasa),
      aplica_en: (raw.aplica_en ?? '').trim().toUpperCase(),
      es_estandar: !!raw.es_estandar,
      vigencia_inicio: (raw.vigencia_inicio ?? '').trim(),
      cuenta_relacionada: raw.cuenta_relacionada ?? null,
    };

    if (Number.isNaN(payload.tasa)) {
      this.form.get('tasa')?.setErrors({ number: true });
      this.isSubmitting = false;
      return;
    }

    this.submitted.emit(payload);
    this.isSubmitting = false;
  }

  onCancel() { this.canceled.emit(); }
}
