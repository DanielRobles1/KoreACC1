import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { CrudPanelComponent } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TipoPolizaModalComponent } from '@app/components/modal-tipopoliza/modal-tipopoliza.component';

import { PolizasService } from '@app/services/polizas.service';
import { TipoPoliza } from '@app/models/poliza';

@Component({
  selector: 'app-tipopoliza',
  standalone: true,
  imports: [
    CommonModule,
    CrudPanelComponent,
    ModalComponent,
    ToastMessageComponent,
    SidebarComponent,
    TipoPolizaModalComponent
  ],
  templateUrl: './tipopoliza.component.html',
  styleUrls: ['./tipopoliza.component.scss']
})
export class TipopolizaComponent implements OnInit {

  constructor(private polizasService: PolizasService) {}

  ngOnInit(): void {
    this.loadTipos();
  }

  // LAYOUT

  sidebarOpen = true;

  onSidebarToggle(open: boolean) {
    this.sidebarOpen = open;
  }



  tiposPoliza: TipoPoliza[] = [];
  loading = false;

  loadTipos() {
    this.loading = true;

    this.polizasService.getTiposPoliza().subscribe({
      next: (data) => this.tiposPoliza = data ?? [],
      error: (err) => this.openError('Error al cargar tipos', err),
      complete: () => this.loading = false
    });
  }


  modalOpen = false;
  tipoSeleccionado: TipoPoliza | null = null;

  openModal() {
    this.tipoSeleccionado = null; 
    this.modalOpen = true;
  }

  editarDesdeTabla(row: TipoPoliza) {
    this.tipoSeleccionado = row; 
    this.modalOpen = true;
  }

  // DELETE

  confirmOpen = false;
  confirmTitle = '';
  confirmPayload: TipoPoliza | null = null;

  confirmarEliminar(row: TipoPoliza) {
    this.confirmTitle = `¿Eliminar "${row.descripcion}"?`;
    this.confirmPayload = row;
    this.confirmOpen = true;
  }

  confirmCancel() {
    this.confirmOpen = false;
    this.confirmPayload = null;
  }

  confirmProceed() {
    if (!this.confirmPayload) return;

    const id = this.confirmPayload.id_tipopoliza;
    this.confirmCancel();

    this.polizasService.deleteTipoPoliza(id).subscribe({
      next: () => {
        this.tiposPoliza = this.tiposPoliza.filter(
          t => t.id_tipopoliza !== id
        );
        this.openSuccess('Eliminado correctamente');
      },
      error: (err) => this.openError('No se pudo eliminar', err)
    });
  }

  // TOAST

  toastOpen = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  openSuccess(msg: string) {
    this.toastType = 'success';
    this.toastMessage = msg;
    this.toastOpen = true;
  }

  openError(msg: string, err?: any) {
    console.error(err);
    this.toastType = 'error';
    this.toastMessage = msg;
    this.toastOpen = true;
  }
}
