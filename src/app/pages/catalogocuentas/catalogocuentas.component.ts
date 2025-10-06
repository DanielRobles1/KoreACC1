import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Standalone deps UI
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Tus componentes standalone
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CrudPanelComponent } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';

const API = 'http://localhost:3000/api/v1/cuentas';

interface Cuenta {
  id: number;
  codigo: string;
  nombre: string;
  ctaMayor: boolean;     // true = cuenta padre
  parentId: number | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos de vista (derivados)
  padreCodigo?: string | null;
  padreNombre?: string | null;
  icon?: string;
}

interface ToastVM {
  open: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  autoCloseMs?: number;
}

@Component({
  selector: 'app-catalogo-cuentas',
  templateUrl: './catalogocuentas.component.html',
  styleUrls: ['./catalogocuentas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    SidebarComponent,
    CrudPanelComponent,
    ModalComponent,
    ToastMessageComponent,
  ],
})
export class CatalogoCuentasComponent implements OnInit, OnDestroy {
  // ====== DI ======
  private http = inject(HttpClient);
  private subs: Subscription[] = [];

  // ====== LAYOUT / TABS ======
  sidebarOpen = true;
  title = 'Catálogo de Cuentas';
  tabs = [{ id: 'datos', label: 'Cuentas' }];
  activeTabId: 'datos' = 'datos';

  // ====== PERMISOS / ACCIONES SUPERIORES ======
  canEdit = true;
  primaryActionLabel = 'Nueva cuenta';

  // ====== GRID ======
  columns: any[] = [
    { key: 'codigo', header: 'Código', width: '140' },
    { key: 'nombre', header: 'Nombre', width: '260' },
    { key: 'ctaMayor', header: '¿Mayor?', width: '90', format: (v: boolean): string => (v ? 'Sí' : 'No') },
    { key: 'padreCodigo', header: 'Padre (código)', width: '140' },
    { key: 'padreNombre', header: 'Padre (nombre)', width: '220' },
  ];

  actions = [
    { id: 'child',  label: 'Crear hijo', icon: 'folder-plus', kind: 'secondary' },
    { id: 'edit',   label: 'Editar',     icon: 'edit',        kind: 'primary'   },
    { id: 'delete', label: 'Eliminar',   icon: 'trash',       kind: 'danger'    },
  ];

  rows: Cuenta[] = [];
  allCuentas: Cuenta[] = []; // para combos de padre

  // ====== MODAL: CUENTA ======
  editOpen = false;
  modalTitle = 'Nueva cuenta';
  modalSize: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  showClose = true;

  editId: number | null = null;
  parentPreselectedId: number | null = null;

  formCuenta: Partial<Cuenta> = {
    codigo: '',
    nombre: '',
    ctaMayor: false,
    parentId: null,
  };

  // --- Estado de validación en vivo ---
  errors: { codigo?: string; nombre?: string } = {};
  touched: { codigo: boolean; nombre: boolean } = { codigo: false, nombre: false };

  get canSave(): boolean {
    // sin errores y con contenido válido
    return !!this.formCuenta.codigo?.trim() && !!this.formCuenta.nombre?.trim();
  }

  // ====== MODAL: CONFIRMACIÓN ======
  confirmOpen = false;
  confirmTitle = 'Confirmación';
  confirmMessage = '';
  confirmPayload: { type: 'delete'; id: number } | null = null;

  // ====== TOAST ======
  vm: ToastVM = { open: false, title: '', message: '', type: 'info', autoCloseMs: 3500 };

  // ====== LIFECYCLE ======
  ngOnInit(): void {
    this.loadCuentas();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ====== DATA ======
  loadCuentas(): void {
    const s = this.http.get<Cuenta[]>(API).subscribe({
      next: (data) => {
        const byId = new Map<number, Cuenta>();
        data.forEach(c => byId.set(c.id, c));
        this.allCuentas = data;
        this.rows = data.map(c => ({
          ...c,
          padreCodigo: c.parentId ? byId.get(c.parentId)?.codigo ?? null : null,
          padreNombre: c.parentId ? byId.get(c.parentId)?.nombre ?? null : null,
        }));
      },
      error: (err) => this.toastError('No se pudieron cargar las cuentas', err),
    });
    this.subs.push(s);
  }

  createCuenta(payload: Partial<Cuenta>): void {
    const s = this.http.post<Cuenta>(API, payload).subscribe({
      next: () => {
        this.toastOk('Cuenta creada');
        this.editOpen = false;
        this.loadCuentas();
      },
      error: (err) => this.handleHttpError(err, 'No se pudo crear la cuenta'),
    });
    this.subs.push(s);
  }

  updateCuenta(id: number, payload: Partial<Cuenta>): void {
    const s = this.http.put<Cuenta>(`${API}/${id}`, payload).subscribe({
      next: () => {
        this.toastOk('Cuenta actualizada');
        this.editOpen = false;
        this.loadCuentas();
      },
      error: (err) => this.handleHttpError(err, 'No se pudo actualizar la cuenta'),
    });
    this.subs.push(s);
  }

  deleteCuenta(id: number): void {
    const s = this.http.delete<{ message: string }>(`${API}/${id}`).subscribe({
      next: () => {
        this.toastOk('Cuenta eliminada');
        this.closeConfirm();
        this.loadCuentas();
      },
      error: (err) => this.handleHttpError(err, 'No se pudo eliminar la cuenta'),
    });
    this.subs.push(s);
  }

  // ====== HANDLERS CRUD-PANEL ======
  onPrimary(): void {
    // Nueva cuenta
    this.editId = null;
    this.parentPreselectedId = null;
    this.modalTitle = 'Nueva cuenta';
    this.formCuenta = {
      codigo: '',
      nombre: '',
      ctaMayor: false,
      parentId: null,
    };
    this.resetValidation();
    this.editOpen = true;
  }

  onEdit(row: Cuenta): void {
    this.editId = row.id;
    this.parentPreselectedId = row.parentId ?? null;
    this.modalTitle = `Editar cuenta: ${row.codigo}`;
    this.formCuenta = {
      codigo: row.codigo,
      nombre: row.nombre,
      ctaMayor: row.ctaMayor,
      parentId: row.parentId ?? null,
    };
    this.resetValidation();
    this.editOpen = true;
  }

  // Acepta tanto { id, row } como { action, row }
  onRowAction(evt: any): void {
    const id: string = evt?.id ?? evt?.action;
    const row: Cuenta = evt?.row;
    if (!id || !row) return;

    if (id === 'edit') return this.onEdit(row);

    if (id === 'child') {
      if (!row.ctaMayor) {
        return this.toastWarn('Solo las cuentas mayor pueden tener subcuentas');
      }
      this.editId = null;
      this.parentPreselectedId = row.id;
      this.modalTitle = `Nueva subcuenta de ${row.codigo}`;
      this.formCuenta = {
        codigo: '',
        nombre: '',
        ctaMayor: false,
        parentId: row.id,
      };
      this.resetValidation();
      this.editOpen = true;
      return;
    }

    if (id === 'delete') {
      this.confirmTitle = 'Eliminar cuenta';
      this.confirmMessage = `¿Deseas eliminar la cuenta ${row.codigo} - ${row.nombre}?`;
      this.confirmPayload = { type: 'delete', id: row.id };
      this.confirmOpen = true;
      return;
    }
  }

  // ====== VALIDACIÓN EN VIVO ======
  private resetValidation(): void {
    this.errors = {};
    this.touched = { codigo: false, nombre: false };
  }

  private validate(field?: 'codigo' | 'nombre'): void {
    // valida campo específico o ambos
    const check = (f: 'codigo' | 'nombre') => {
      const val = (this.formCuenta[f] ?? '').toString().trim();
      if (!val) this.errors[f] = f === 'codigo' ? 'El código es obligatorio' : 'El nombre es obligatorio';
      else this.errors[f] = '';
    };

    if (!field) {
      check('codigo');
      check('nombre');
    } else {
      check(field);
    }
  }

  /** Llamar desde (ngModelChange) en los inputs para validar en tiempo real */
  onFieldChange(field: 'codigo' | 'nombre', value: string): void {
    const v = (value ?? '').trimStart(); // evita espacios al inicio
    this.formCuenta[field] = v;
    this.touched[field] = true;
    this.validate(field);
  }

  // ====== MODAL: CUENTA ======
  closeModal(): void { this.editOpen = false; }
  cancelModal(): void { this.editOpen = false; }

  confirmModal(): void {
    // Valida antes de enviar
    this.touched = { codigo: true, nombre: true };
    this.validate();

    if (!this.canSave) {
      const msg = this.errors.codigo || this.errors.nombre || 'Completa los campos obligatorios';
      return this.toastWarn(msg);
    }

    if (this.formCuenta.ctaMayor && this.formCuenta.parentId) {
      return this.toastWarn('Una cuenta mayor no debe tener cuenta padre');
    }

    const payload: Partial<Cuenta> = {
      codigo: (this.formCuenta.codigo ?? '').trim(),
      nombre: (this.formCuenta.nombre ?? '').trim(),
      ctaMayor: !!this.formCuenta.ctaMayor,
      parentId: this.formCuenta.parentId ?? null,
    };

    if (this.editId == null) this.createCuenta(payload);
    else this.updateCuenta(this.editId, payload);
  }

  // ====== MODAL: CONFIRMACIÓN ======
  closeConfirm(): void {
    this.confirmOpen = false;
    this.confirmPayload = null;
  }
  cancelConfirm(): void { this.closeConfirm(); }
  confirmProceed(): void {
    if (!this.confirmPayload) return this.closeConfirm();
    if (this.confirmPayload.type === 'delete') {
      return this.deleteCuenta(this.confirmPayload.id);
    }
    this.closeConfirm();
  }

  // ====== HELPERS UI ======
  getParentOptions(): Cuenta[] {
    const excludeId = this.editId;
    return this.allCuentas.filter(c => c.id !== excludeId);
  }

  getCodigoPadre(id: number | null): string | null {
    if (!id) return null;
    const c = this.allCuentas.find(x => x.id === id);
    return c ? c.codigo : null;
  }

  onSidebarToggle(open: boolean): void { this.sidebarOpen = open; }
  onTabChange(tabId: string): void { this.activeTabId = tabId as any; }

  // ====== TOASTS & ERRORS ======
  toastOk(msg: string): void {
    this.vm = { open: true, title: 'Éxito', message: msg, type: 'success', autoCloseMs: 2800 };
  }
  toastWarn(msg: string): void {
    this.vm = { open: true, title: 'Atención', message: msg, type: 'warning', autoCloseMs: 3200 };
  }
  toastError(msg: string, err?: any): void {
    this.vm = { open: true, title: 'Error', message: msg, type: 'error', autoCloseMs: 4000 };
  }

  handleHttpError(err: any, fallbackMsg: string): void {
    if (err?.status === 409) return this.toastWarn('Ya existe una cuenta con ese código');
    if (err?.status === 404) return this.toastWarn('La cuenta no existe o fue eliminada');
    if (err?.status === 400) {
      const det = err?.error?.details?.map((d: any) => d.message).join('; ');
      return this.toastWarn(det || fallbackMsg);
    }
    this.toastError(fallbackMsg, err);
  }
// Search
searchTerm = '';

// 👉 lista filtrada (si el CrudPanel te manda el término)
get filteredRows() {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) return this.rows;

  return this.rows.filter((r: any) => {
    const nombre = (r?.nombre ?? '').toLowerCase();
    const codigo = (r?.codigo ?? '').toLowerCase();
    const padresArr = Array.isArray(r?.padreNombre)
      ? r.padreNombre
      : (r?.padreNombre ? [r.padreNombre] : []);
    const hitPadre = padresArr.some((p: string) => p?.toLowerCase().includes(term));
    return nombre.includes(term) || codigo.includes(term) || hitPadre;
  });
}
onSearch(term: string) {
  this.searchTerm = term ?? '';
}

  // trackBy opcional para *ngFor de filas
  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
