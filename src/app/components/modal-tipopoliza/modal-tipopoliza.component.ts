import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PolizasService, TipoPolizaCreate, TipoPoliza } from '@app/services/polizas.service';
import { ModalComponent } from "../modal/modal/modal.component";

@Component({
  selector: 'app-modal-tipopoliza',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './modal-tipopoliza.component.html',
  styleUrls: ['./modal-tipopoliza.component.scss'],
})
export class TipoPolizaModalComponent implements OnChanges {
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<any>();

  form: FormGroup;
  loading = false;
  submitted = false;
  naturalezas: string[] = [];

  tipos: TipoPoliza[] = [];

  //  ESTADO DE EDICIÓN 
  editing = false;
  editingId: number | null = null;
  tipoEditando: TipoPoliza | null = null;

  //  ELIMINAR (modal confirmaciom) 
  showDeleteModal = false;
  tipoAEliminar: TipoPoliza | null = null;

  constructor(
    private fb: FormBuilder,
    private polizas: PolizasService,
  ) {
    this.form = this.fb.group({
      naturaleza: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue === true) {
      this.loadTipos();
    }
  }

  // Cargar lista
  async loadTipos(): Promise<void> {
    try {
      this.loading = true;

      const [tipos, naturalezas] = await Promise.all([
        firstValueFrom(this.polizas.getTiposPoliza()),
        firstValueFrom(this.polizas.getNaturalezasPoliza()),
      ]);

      this.tipos = tipos;
      this.naturalezas = naturalezas ?? [];

      console.log('NATURALEZAS', this.naturalezas);
    } catch (err) {
      this.tipos = [];
      this.naturalezas = [];
    } finally {
      this.loading = false;
    }
  }

  // INICIAR EDICIÓN
  startEdit(t: TipoPoliza) {
    this.editing = true;
    this.editingId = t.id_tipopoliza;
    this.tipoEditando = t;
    this.form.patchValue({
      naturaleza: t.naturaleza,
      descripcion: t.descripcion
    });
  }

  cancelEdit() {
    this.editing = false;
    this.editingId = null;
    this.tipoEditando = null;
    this.form.reset();
    this.submitted = false;
  }

  // CONFIRMAR ELIMINAR
  confirmarEliminar(tipo: TipoPoliza) {
    this.tipoAEliminar = tipo;
    this.showDeleteModal = true;
  }

  cancelarEliminar() {
    this.tipoAEliminar = null;
    this.showDeleteModal = false;
  }

  async eliminarDefinitivo() {
    if (!this.tipoAEliminar) return;
    try {
      this.loading = true;
      await firstValueFrom(this.polizas.deleteTipoPoliza(this.tipoAEliminar.id_tipopoliza));
      await this.loadTipos();
    } finally {
      this.loading = false;
      this.cancelarEliminar();
    }
  }

  // CERRAR MODAL PRINCIPAL
  close() {
    this.open = false;
    this.openChange.emit(false);
    this.cancelEdit();
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open && !this.loading) this.close(); }

  // CREAR / ACTUALIZAR
  async onSubmit() {
    this.submitted = true;
    if (this.form.invalid || this.loading) return;

    const payload: TipoPolizaCreate = {
      naturaleza: this.form.value.naturaleza,
      descripcion: this.form.value.descripcion.trim(),
    };

    this.loading = true;
    try {
      if (this.editing && this.editingId != null) {
        await firstValueFrom(this.polizas.updateTipoPoliza(this.editingId, payload));
      } else {
        await firstValueFrom(this.polizas.createTipoPoliza(payload));
      }

      await this.loadTipos();
      this.saved.emit(true);
      this.cancelEdit();
    } finally {
      this.loading = false;
    }
  }
}
