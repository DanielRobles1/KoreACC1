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
import { WsService } from '@app/services/ws.service';
import { PermissionWatcher } from '@app/utils/permissions.util';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule } from '@angular/common';
import { UiCentro, CentroNode } from '@app/models/centros';

@Component({
  selector: 'app-catalog-centros',
  standalone: true,
  imports: [FormsModule, SidebarComponent, CrudPanelComponent, ModalComponent, ToastMessageComponent, CommonModule],
  templateUrl: './catalog-centros.component.html',
  styleUrls: ['./catalog-centros.component.scss']
})
export class CatalogCentrosComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    public toast: ToastService,
    private auth: AuthService,
    private centroService: CentrosCostosService,
    private ws: WsService,
  ) { }

  private destroy$ = new Subject<void>();
  private permWatcher?: PermissionWatcher;

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
  treeRoots: CentroNode[] = [];

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


    this.permWatcher = new PermissionWatcher(
      this.auth,
      this.ws,
      {
        toastOk: (m) => this.toast.success(m),
        toastWarn: (m) => this.toast.warning(m),
        toastError: (m, _e) => this.toast.error(m),
      },
      (flags) => {
        this.canCreate = flags.canCreate;
        this.canEdit = flags.canEdit;
        this.canDelete = flags.canDelete;
        this.rebuildActions();
      },
      {
        keys: {
          create: 'crear_cat_Centros',
          edit: 'editar_cat_Centros',
          delete: 'eliminar_cat_Centros',
        },
        socketEvent: ['permissions:changed', 'role-permissions:changed'],
        contextLabel: 'Centros de costo',
      }
    );
    this.permWatcher.start();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.permWatcher?.stop();
  }

  private rebuildActions(): void {
    this.actions = [
      ...(this.canEdit ? [{ id: 'edit', label: 'Editar', tooltip: 'Editar' } as CrudAction] : []),
      ...(this.canDelete ? [{ id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' } as CrudAction] : []),
    ];
  }

  // ===== Cargar lista =====
  loadCentros() {
    this.centroService.getCentros().subscribe({
      next: (data) => {
        this.rows = data;
        this.treeRoots = this.buildTree(data);
      },
      error: (err) =>
        this.toast.error(
          this.extractErrorMessage(err) ?? 'No se pudieron cargar los centros de costo'
        ),
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
    this.formCentro = { ...row }; // clonar
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
        this.toast.error('No se encontró el identificador del centro.', 'Fallo');
        return;
      }

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
      this.toast.error('No se pudo determinar el centro a eliminar.', 'Fallo');
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
        this.toast.warning(this.extractErrorMessage(err) ?? 'No se pudo eliminar el centro', 'Fallo');
      }
    });
  }

  toggleNode(node: CentroNode, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    node.expanded = !node.expanded;
  }

  askDelete(c: UiCentro, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.onRowAction({ action: 'delete', row: c });
  }


  private buildTree(list: UiCentro[]): CentroNode[] {
    const nodeById = new Map<number, CentroNode>();
    const roots: CentroNode[] = [];

    // Crear nodos base
    for (const c of list) {
      if (c.id_centro == null) continue;
      nodeById.set(c.id_centro, {
        data: c,
        children: [],
        expanded: false,
      });
    }

    // Enlazar padres e hijos
    for (const c of list) {
      if (c.id_centro == null) continue;
      const node = nodeById.get(c.id_centro)!;

      if (c.parent_id != null) {
        const parent = nodeById.get(c.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // Si el padre no está, lo tratamos como raíz
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  get filteredTreeRoots(): CentroNode[] {
    if (!this.searchTerm) return this.treeRoots;
    const term = this.norm(this.searchTerm);
    return this.filterTree(this.treeRoots, term);
  }

  private filterTree(nodes: CentroNode[], term: string): CentroNode[] {
    const result: CentroNode[] = [];

    for (const node of nodes) {
      const matches = this.nodeMatches(node, term);
      const filteredChildren = this.filterTree(node.children, term);

      if (matches || filteredChildren.length) {
        result.push({
          ...node,
          // al filtrar, abrimos nodos que tienen hijos que coinciden
          expanded: filteredChildren.length ? true : node.expanded,
          children: filteredChildren,
        });
      }
    }

    return result;
  }

  private nodeMatches(node: CentroNode, term: string): boolean {
    const c = node.data;
    return (
      this.norm(c.nombre_centro).includes(term) ||
      this.norm(c.serie_venta).includes(term) ||
      this.norm(c.region).includes(term) ||
      this.norm(c.cp).includes(term)
    );
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
          this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo actualizar el centro', 'Fallo');
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
          this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo registrar el centro', 'Fallo');
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
    const serieOk = !!c.serie_venta?.trim();
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

    this.centroService.downloadCentrosExcel().subscribe({
      next: (response) => {
        const blob = new Blob([response.body!], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'centros_de_costo.xlsx');
        this.toast.success('Excel exportado correctamente.');
      },
      error: (err) => {
        this.toast.error(this.extractErrorMessage(err) ?? 'No se pudo exportar a Excel', 'Fallo');
      }
    });
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
        setTimeout(() => {
          this.centroService.createCentro(centro).subscribe({
            next: () => {
              processed++;
              console.log(`Centro ${processed}/${total} guardado:`, centro.nombre_centro);
              if (processed === total) {
                this.toast.success(`Se importaron ${total} centros correctamente.`);
                this.loadCentros();
              }
            },
            error: (err) => {
              console.error(`❌ Error al guardar centro "${centro.nombre_centro}":`, err);
              this.toast.error(`Error al guardar el centro "${centro.nombre_centro}"`);
            }
          });
        }, index * 200);
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