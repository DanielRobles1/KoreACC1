import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudAction, CrudColumn, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { ImpuestoFormComponent, Impuestos } from '@app/components/impuesto-form/impuesto-form.component';
import { ImpuestoServiceTsService } from '@app/services/impuesto.service.ts.service';
import { AuthService } from '@app/services/auth.service';
import { ToastService, ToastState } from '@app/services/toast-service.service';

@Component({
  selector: 'app-impuestos',
  standalone: true,
  imports: [
    SidebarComponent,
    CrudPanelComponent,
    ModalComponent,
    ToastMessageComponent,
    ImpuestoFormComponent
  ],
  templateUrl: './impuestos.component.html',
  styleUrls: ['./impuestos.component.scss']
})
export class ImpuestosComponent {
  idEmpresa: number = 1;
  constructor(
    private impuestoService: ImpuestoServiceTsService,
    private router: Router,
    private auth: AuthService,
    public toast: ToastService
  ) {}

 
  vm!: ToastState;

  
  modalOpen = false;
  modalTitle = 'Crear nuevo impuesto';
  modalSize: 'sm' | 'md' | 'lg' = 'md';
  editingImpuesto: Impuestos | null = null;

  closeModal() { this.modalOpen = false; }
  cancelModal() { this.modalOpen = false; }

  
  confirmOpen = false;
  confirmTitle = '';
  confirmMessage = '';
  impuestoToDelete: Impuestos | null = null;
  private pendingAction: 'save' | 'delete' = 'save';
  private pendingImpuesto: Impuestos | null = null;

  // PERMISOS 
  canCreate = false;
  canEdit = false;
  canDelete = false;

  // CRUD PANEL
  title = 'Impuestos';
  tabs: CrudTab[] = [
    { id: 'datos', label: 'Ejercicios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
    // { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },

    { id: 'empresa', label: 'Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresas' },
  
    
    {
    id: 'tipo-poliza',
    label: '+ Tipo póliza',
    }  
  ];
  activeTabId = 'impuestos';
  primaryActionLabel = 'Nuevo impuesto';

  columns: CrudColumn[] = [
    { key: 'id_impuesto', header: 'ID', width: '5%' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'modo', header: 'Modo' },
    { key: 'tasa', header: 'Tasa (%)', width: '10%' },
    { key: 'aplica_en', header: 'Aplica en' },
    { key: 'es_estandar', header: 'Estándar', width: '10%' },
    { key: 'vigencia_inicio', header: 'Vigencia inicio', width: '15%' },
    { key: 'id_cuenta', header: 'Cuenta relacionada' } // ✅ clave corregida
  ];

  rows: Impuestos[] = [];

  actions: CrudAction[] = [
    { id: 'edit', label: 'Editar', tooltip: 'Editar impuesto' },
    { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar impuesto' }
  ];

  // BÚSQUEDA 
  private norm = (v: unknown) =>
    (v ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  searchTerm = '';

  get filteredRows(): Impuestos[] {
    if (!this.searchTerm) return this.rows;
    const term = this.norm(this.searchTerm);

    return this.rows.filter(r => {
      const nombre = this.norm(r.nombre);
      const tipo = this.norm(r.tipo);
      const modo = this.norm(r.modo);
      const aplica = this.norm(r.aplica_en);
      const tasa = this.norm(String(r.tasa));
      const cuenta = this.norm(String(r.id_cuenta ?? ''));

      return (
        nombre.includes(term) ||
        tipo.includes(term) ||
        modo.includes(term) ||
        aplica.includes(term) ||
        tasa.includes(term) ||
        cuenta.includes(term)
      );
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
  }

  ngOnInit() {
    this.toast.state$.subscribe(s => (this.vm = s));
    this.cargaImpuestos();

    this.canCreate = this.auth.hasPermission('crear_empresa');
    this.canEdit   = this.auth.hasPermission('editar_empresa');
    this.canDelete = this.auth.hasPermission('eliminar_empresa');

    this.actions = [
      ...(this.canEdit   ? [{ id: 'edit', label: 'Editar', tooltip: 'Editar impuesto' }] : []),
      ...(this.canDelete ? [{ id: 'delete', label: 'Eliminar', tooltip: 'Eliminar impuesto' }] : []),
    ];
  }

  cargaImpuestos() {
    this.impuestoService.getImpuestos().subscribe({
      next: (data) => {
        this.rows = (data ?? []).map((d: any) => ({
          id_impuesto: d.id_impuesto,
          id_empresa: d.id_empresa ?? this.idEmpresa,
          nombre: d.nombre,
          tipo: d.tipo,
          modo: d.modo,
          tasa: d.tasa,
          aplica_en: d.aplica_en,
          es_estandar: d.es_estandar,
          vigencia_inicio: d.vigencia_inicio,
          id_cuenta: d.id_cuenta ?? d.cuenta_relacionada ?? null // ✅ asegura campo presente
        }));
      },
      error: (err) => {
        this.toast.error(this.extractErrorMessage(err) ?? 'No se pudieron cargar los impuestos.', 'Error', 0);
      }
    });
  }

  
  onPrimary() {
    if (!this.canCreate) {
      this.toast.warning('No tienes permisos para crear impuestos.', 'Acción no permitida');
      return;
    }
    this.modalTitle = 'Crear nuevo impuesto';
    this.editingImpuesto = null;
    this.modalOpen = true;
  }

  //  ACCIONES 
  onRowAction(evt: { action: string; row: Impuestos }) {
    if (evt.action === 'edit') {
      if (!this.canEdit) {
        this.toast.warning('No tienes permisos para editar impuestos.', 'Acción no permitida');
        return;
      }
      this.modalTitle = `Editar impuesto: ${evt.row.nombre}`;
      this.editingImpuesto = evt.row;
      this.modalOpen = true;
      return;
    }

    if (evt.action === 'delete') {
      if (!this.canDelete) {
        this.toast.warning('No tienes permisos para eliminar los impuestos registrados.', 'Acción no permitida');
        return;
      }
      this.impuestoToDelete = evt.row;
      this.pendingAction = 'delete';
      this.confirmTitle = 'Confirmar eliminación';
      this.confirmMessage = `¿Estás seguro de que deseas eliminar el impuesto "${evt.row.nombre}"? Esta acción no se puede deshacer.`;
      this.confirmOpen = true;
    }
  }

 
  upsertImpuesto(impuesto: Impuestos) {
    this.pendingAction = 'save';
    this.pendingImpuesto = impuesto;

    const esEdicion = !!this.editingImpuesto?.id_impuesto;
    this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
    this.confirmMessage = esEdicion
      ? `¿Guardar los cambios del impuesto “${impuesto.nombre}”?`
      : `¿Crear el impuesto “${impuesto.nombre}”?`;

    this.confirmOpen = true;
  }

  
  closeConfirm() { this.confirmOpen = false; }
  cancelConfirm() { this.confirmOpen = false; }

  confirmProceed() {
    if (this.pendingAction === 'delete' && this.impuestoToDelete) {
      this.impuestoService.eliminarImpuesto(this.impuestoToDelete.id_impuesto!)
        .subscribe({
          next: () => {
            this.rows = this.rows.filter(r => r.id_impuesto !== this.impuestoToDelete!.id_impuesto);
            this.toast.success(`El impuesto "${this.impuestoToDelete!.nombre}" fue eliminado correctamente.`);
            this.impuestoToDelete = null;
            this.confirmOpen = false;
          },
          error: (err) => {
            this.toast.error(this.extractErrorMessage(err) ?? `No se pudo eliminar el impuesto "${this.impuestoToDelete!.nombre}".`);
            this.confirmOpen = false;
          }
        });
    } else if (this.pendingAction === 'save' && this.pendingImpuesto) {
      const esEdicion = !!this.editingImpuesto?.id_impuesto;

      const request$ = esEdicion
        ? this.impuestoService.actualizarImpuesto(this.pendingImpuesto.id_impuesto!, this.pendingImpuesto)
        : this.impuestoService.crearImpuesto(this.pendingImpuesto);

      request$.subscribe({
        next: (res) => {
          if (esEdicion) {
            this.rows = this.rows.map(r => (r.id_impuesto === res.id_impuesto ? res : r));
            this.toast.success(`El impuesto "${res.nombre}" fue actualizado correctamente.`);
          } else {
            this.rows = [...this.rows, res];
            this.toast.success(`El impuesto "${res.nombre}" fue creado correctamente.`);
          }
          this.modalOpen = false;
          this.confirmOpen = false;
        },
        error: (err) => {
          const fallback = esEdicion
            ? `No se pudo actualizar el impuesto "${this.pendingImpuesto?.nombre}".`
            : `No se pudo crear el impuesto "${this.pendingImpuesto?.nombre}".`;
          this.toast.error(this.extractErrorMessage(err) ?? fallback);
          this.confirmOpen = false;
        }
      });
    }
  }

  // ==== NAV TABS ====
  onTabChange(tabId: string) {
    this.activeTabId = tabId;
    const selected = this.tabs.find(t => t.id === tabId);
    if (selected?.route) this.router.navigate([selected.route]);
  }

  sidebarOpen = true;
  onSidebarToggle(open: boolean) { this.sidebarOpen = open; }

  
  private extractErrorMessage(err: any): string | null {
    return err?.error?.message || err?.message || (typeof err === 'string' ? err : null);
  }
}
