// impuesto-form.component.ts
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ImpuestoServiceTsService } from '@app/services/impuesto.service.ts.service';

const APLICA_EN_OPTS = ['VENTA', 'COMPRA', 'AMBOS'] as const;
const MODO_OPTS = ['TASA', 'CUOTA', 'EXENTO'] as const;
const TIPO_OPTS = ['IVA', 'ISR', 'IEPS', 'RETENCION', 'OTRO'] as const;

type AplicaEn = typeof APLICA_EN_OPTS[number];
type Modo = typeof MODO_OPTS[number];
type TipoImpuesto = typeof TIPO_OPTS[number];

type ImpuestoForm = {
  nombre: FormControl<string>;
  tipo: FormControl<string>;
  modo: FormControl<string>;
  tasa: FormControl<number>;
  aplica_en: FormControl<string>;
  es_estandar: FormControl<boolean>;
  vigencia_inicio: FormControl<string>;
  cuenta_relacionada: FormControl<string>;
};

export interface Impuestos {
  id_impuesto?: number,
  id_empresa: number,
  nombre: string;
  tipo: string;
  modo: string;
  tasa: number;
  aplica_en: string;
  es_estandar: boolean;
  vigencia_inicio: string;
  cuenta_relacionada: string;
}

@Component({
  selector: 'app-impuesto-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './impuesto-form.component.html',
  styleUrls: ['./impuesto-form.component.scss'],
})
export class ImpuestoFormComponent {
  @Input() value: Impuestos | null = null;
  @Input() idEmpresa = 1;
  @Output() submitted = new EventEmitter<Impuestos>();
  @Output() canceled = new EventEmitter<void>();
  isSubmitting = false;
  form: FormGroup<ImpuestoForm>;
  aplicaEnOpts = APLICA_EN_OPTS;
  modoOpts = MODO_OPTS;
  tipoOpts = TIPO_OPTS;

  constructor(private fb: FormBuilder, private impuestosSrv: ImpuestoServiceTsService) {
    this.form = this.fb.nonNullable.group<ImpuestoForm>({
      nombre: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      tipo: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      modo: this.fb.nonNullable.control('', [Validators.required]),
      tasa: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0), Validators.max(100)]),
      aplica_en: this.fb.nonNullable.control('', [Validators.required]),
      es_estandar: this.fb.nonNullable.control(false),
      vigencia_inicio: this.fb.nonNullable.control('', [Validators.required]),
      cuenta_relacionada: this.fb.nonNullable.control('', [Validators.required]),
    });
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
        cuenta_relacionada: this.value.cuenta_relacionada ?? '',
      });
    }else {
      this.form.reset();
    }
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const raw = this.form.getRawValue();

    // Limpieza/normalización ligera
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
      cuenta_relacionada: (raw.cuenta_relacionada ?? '').trim(),
    };

    // Validación adicional opcional
    if (Number.isNaN(payload.tasa)) {
      this.form.get('tasa')?.setErrors({ number: true });
      this.isSubmitting = false;
      return;
    }

    this.submitted.emit(payload);
    this.isSubmitting = false;

    // this.impuestosSrv.crearImpuesto(payload)
    //   .pipe(finalize(() => (this.isSubmitting = false)))
    //   .subscribe({
    //     next: () => {
    //       // éxito: resetea o navega
    //       this.form.reset({
    //         nombre: '',
    //         tipo: '',
    //         modo: '',
    //         tasa: 0,
    //         aplica_en: '',
    //         es_estandar: false,
    //         vigencia_inicio: '',
    //         cuenta_relacionada: '',
    //       });
    //     },
    //     error: (err) => {
    //       console.error('Error al crear impuesto', err);
    //     },
    //   });
    }
    
    onCancel() { this.canceled.emit(); }
}