import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService, ToastState } from '@app/services/toast-service.service';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { AuthService } from '@app/services/auth.service';
import { CentrosCostosService } from '@app/services/centros-costos.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
type UiCentro = {
  id_centro?: number;
  serie_venta: string;
  nombre_centro: string;
  calle: string;
  num_ext: string;
  num_int: string;
  cp: string;
  region: string;
  telefono: string;
  correo: string;
  activo: boolean;
};

@Component({
  selector: 'app-catalog-centros',
  standalone: true,
  imports: [FormsModule, SidebarComponent, CrudPanelComponent, ModalComponent, ToastMessageComponent],
  templateUrl: './catalog-centros.component.html',
  styleUrls: ['./catalog-centros.component.scss']
})
export class CatalogCentrosComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    public toast: ToastService,
    private auth: AuthService,
    private centroService: CentrosCostosService
  ) {}

  private destroy$ = new Subject<void>();

  // TOAST VM
  vm!: ToastState;

  // MODAL
  modalOpen = false;
  modalTitle = 'Crear nuevo centro de costo';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  saving = false;

  // Modo
  private isEditMode = false;

  confirmOpen = false;
  confirmTitle = 'Confirmar eliminación';
  confirmMessage = '¿Deseas eliminar este centro?';
  confirmBusy = false;
  private pendingDeleteId: number | string | null = null;

  formCentro: UiCentro = this.emptyCentro();

  private emptyCentro(): UiCentro {
    return {
      id_centro: undefined, 
      serie_venta: '',
      nombre_centro: '',
      calle: '',
      num_ext: '',
      num_int: '',
      cp: '',
      region: '',
      telefono: '',
      correo: '',
      activo: true
    };
  }

  closeModal() { this.modalOpen = false; }
  cancelModal() {
    this.modalOpen = false;
    this.formCentro = this.emptyCentro();
    this.isEditMode = false;
  }

  // PERMISOS
  canCreate = false;
  canEdit = false;
  canDelete = false;

  // CRUD CONFIG
  title = 'Centros de costo';
  tabs: CrudTab[] = [
    { id: 'Cuentas', label: 'Cuentas', icon: 'assets/svgs/catalog-cuentas.svg', iconAlt: 'Cuentas', route: '/catalogos/cuentas' },
    { id: 'Centros de costo', label: 'Centros de costo', icon: 'assets/svgs/catalogue-catalog.svg', iconAlt: 'centros-costo', route: '/centros-costo' },
  ];
  activeTabId = 'Centros de costo';
  primaryActionLabel = 'Nuevo centro';

  columns: CrudColumn[] = [
    { key: 'id_centro', header: 'ID', width: '5%' },
    { key: 'serie_venta', header: 'Serie de venta' },
    { key: 'nombre_centro', header: 'Nombre del centro' },
    { key: 'calle', header: 'Calle' },
    { key: 'num_ext', header: 'Número exterior' },
    { key: 'num_int', header: 'Número interior' },
    { key: 'cp', header: 'C. P.' },
    { key: 'region', header: 'Región' },
    { key: 'telefono', header: 'Tel. Contacto' },
    { key: 'correo', header: 'Correo contacto' },
    { key: 'activo', header: 'Estatus' },
  ];
  rows: UiCentro[] = [];

  // NOTA: El componente CrudPanel debe emitir { id:'edit'/'delete', label... }
  actions: CrudAction[] = [];

  // ==== BÚSQUEDA ====
  private norm = (v: unknown) =>
    (v ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  searchTerm = '';

  get filteredRows(): UiCentro[] {
    if (!this.searchTerm) return this.rows;
    const term = this.norm(this.searchTerm);

    return this.rows.filter(r => {
      const id_centro = this.norm(r.id_centro);
      const serie_venta = this.norm(r.serie_venta);
      const nombre_centro = this.norm(r.nombre_centro);
      const calle = this.norm(r.calle);
      const cp = this.norm(r.cp);
      const telefono = this.norm(r.telefono);
      const correo = this.norm(r.correo);
      const activo = this.norm(r.activo);

      return (
        id_centro.includes(term) ||
        serie_venta.includes(term) ||
        nombre_centro.includes(term) ||
        calle.includes(term) ||
        cp.includes(term) ||
        telefono.includes(term) ||
        correo.includes(term) ||
        activo.includes(term)
      );
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  ngOnInit() {
    this.loadCentros();
    this.toast.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => (this.vm = s));

    this.updatePermissionsFromAuth();

    this.auth.permissionsChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log('Permisos han cambiado');
      this.updatePermissionsFromAuth();
    })
  }

  private updatePermissionsFromAuth(): void {
    this.canCreate = this.auth.hasPermission('crear_empresa');
    this.canEdit   = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');

    this.actions = [
      ...(this.canEdit   ? [{ id: 'edit',   label: 'Editar',   tooltip: 'Editar'   }] : []),
      ...(this.canDelete ? [{ id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' }] : []),
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== Cargar lista =====
  loadCentros() {
    this.centroService.getCentros().subscribe({
      next: (data) => (this.rows = data),
      error: (err) => this.toast.error(this.extractErrorMessage(err) ?? 'No se pudieron cargar los centros de costo')
    });
  }

  // ===== Crear (botón primario) =====
  onPrimary() {
    if (!this.canCreate) {
      this.toast.warning('No tienes permisos para crear centros de costo.', 'Acción no permitida');
      return;
    }
    this.isEditMode = false;
    this.modalTitle = 'Crear nuevo centro de costo';
    this.formCentro = this.emptyCentro();
    this.modalOpen = true;
  }

  // ===== Editar (abre modal con datos pre-cargados) =====
  onEdit(row: UiCentro) {
    if (!this.canEdit) {
      this.toast.warning('No tienes permisos para editar.', 'Acción no permitida');
      return;
    }
    this.isEditMode = true;
    // Clonar para no mutar la fila directamente
    this.formCentro = { ...row };
    this.modalTitle = `Editar centro #${row.id_centro ?? ''}`.trim();
    this.modalOpen = true;
  }

  // ===== Acciones de fila (editar/eliminar) =====
  onRowAction(evt: { action: string; row: UiCentro }) {
    if (!evt?.action) return;

    if (evt.action === 'edit') {
      return this.onEdit(evt.row);
    }

    if (evt.action === 'delete') {
      if (!this.canDelete) {
        this.toast.warning('No tienes permisos para eliminar.', 'Acción no permitida');
        return;
      }
      const id = evt.row?.id_centro;
      const nombre = evt.row?.nombre_centro;
      if (!id) {
        this.toast.error('No se encontró el identificador del centro.', 'Error');
        return;
      }

      // Abrimos modal de confirmación 
      this.pendingDeleteId = id;
      this.confirmTitle = 'Confirmar eliminación';
      this.confirmMessage = `¿Eliminar el centro #${id} ${nombre}?`;
      this.confirmOpen = true;
      return;
    }

    this.toast.warning(`Acción no soportada: ${evt.action}`);
  }

  closeConfirm() {
    this.confirmOpen = false;
    this.confirmBusy = false;
    this.pendingDeleteId = null;
  }

  cancelConfirm() {
    this.closeConfirm();
  }

  /** Usuario confirma la eliminación */
  confirmProceed() {
    if (this.pendingDeleteId == null) {
      this.toast.error('No se pudo determinar el centro a eliminar.', 'Error');
      this.closeConfirm();
      return;
    }

    this.confirmBusy = true;

    this.centroService.deleteCentro(this.pendingDeleteId).subscribe({
      next: () => {
        this.confirmBusy = false;
        this.closeConfirm();
        this.toast.success('Centro eliminado (borrado lógico) correctamente.', 'Eliminado');
        this.loadCentros();
      },
      error: (err) => {
        this.confirmBusy = false;
        this.closeConfirm();
        this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo eliminar el centro', 'Error');
      }
    });
  }

  // ===== Confirmar modal: crea o actualiza =====
  confirmCentroModal() {
    if (!this.formValid) {
      this.toast.warning('Revisa los campos requeridos y el formato de correo/CP/teléfono.', 'Formulario incompleto');
      return;
    }

    this.saving = true;

    const onDone = () => (this.saving = false);

    if (this.isEditMode) {
      // ====== UPDATE ======
      this.centroService.actualizarCentro(this.formCentro.id_centro!, this.formCentro).subscribe({
        next: () => {
          onDone();
          this.modalOpen = false;
          this.toast.success('El centro fue actualizado correctamente.', 'Actualización exitosa');
          this.loadCentros();
          this.formCentro = this.emptyCentro();
          this.isEditMode = false;
        },
        error: (err) => {
          onDone();
          this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo actualizar el centro', 'Error');
        }
      });
    } else {
      // ====== CREATE ======
      this.centroService.createCentro(this.formCentro).subscribe({
        next: () => {
          onDone();
          this.modalOpen = false;
          this.toast.success('El centro fue registrado correctamente.', 'Registro exitoso');
          this.loadCentros();
          this.formCentro = this.emptyCentro();
        },
        error: (err) => {
          onDone();
          this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo registrar el centro', 'Error');
        }
      });
    }
  }

  // ===== Validación mínima =====
  get formValid(): boolean {
    const c = this.formCentro;
    const emailOk = !c.correo || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo);
    const cpOk = !c.cp || /^\d{5}$/.test(c.cp);
    const telOk = !c.telefono || /^[\d\s\-\+\(\)]{7,20}$/.test(c.telefono);
    const serieOk = !!c.serie_venta?.trim();  // <-- serie obligatoria no vacía
    const nombreOk = !!c.nombre_centro?.trim();
    const regionOk = !!c.region?.trim();
    return Boolean(nombreOk && serieOk && regionOk && emailOk && cpOk && telOk);
  }

  // NAV / SIDEBAR
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) this.router.navigate([selected.route]);
  }
  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }

  // UTIL
  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }
  // === EXPORTAR A EXCEL ===
exportToExcel() {
  if (!this.rows || this.rows.length === 0) {
    this.toast.warning('No hay datos para exportar.', 'Atención');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(this.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Centros de Costo');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'centros_de_costo.xlsx');
  this.toast.success('Archivo Excel exportado correctamente.');
}

onImportExcel(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const importedData = XLSX.utils.sheet_to_json(worksheet) as UiCentro[];

    if (!importedData.length) {
      this.toast.warning('El archivo no contiene datos válidos.');
      return;
    }

    let processed = 0;
    const total = importedData.length;

    importedData.forEach((centro, index) => {
      // retraso entre peticiones para no saturar el servidor
      setTimeout(() => {
        this.centroService.createCentro(centro).subscribe({
          next: () => {
            processed++;
            console.log(`Centro ${processed}/${total} guardado:`, centro.nombre_centro);

            // Cuando se hayan guardado todos, refrescamos la tabla
            if (processed === total) {
              this.toast.success(`Se importaron ${total} centros correctamente.`);
              this.loadCentros(); //  Recarga los datos en pantalla
            }
          },
          error: (err) => {
            console.error(`❌ Error al guardar centro "${centro.nombre_centro}":`, err);
            this.toast.error(`Error al guardar el centro "${centro.nombre_centro}"`);
          }
        });
      }, index * 200); // 200 ms entre peticiones
    });
  };

  reader.readAsArrayBuffer(file);
}



// === EXPORTAR PDF ===
exportToPDF() {
  if (!this.rows || this.rows.length === 0) {
    this.toast.warning('No hay datos para exportar.', 'Atención');
    return;
  }

  const doc = new jsPDF('l', 'pt', 'a4');
  doc.setFontSize(16);
  doc.text('Centros de Costo', 40, 40);

  const columns = this.columns.map(c => c.header);
  const data = this.rows.map(row => this.columns.map(c => (row as any)[c.key]));

  autoTable(doc, {
    head: [columns],
    body: data,
    startY: 60,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [0, 102, 204] },
  });

  doc.save('centros_de_costo.pdf');
  this.toast.success('PDF exportado correctamente.');
}
}