import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  // Campos de vista 
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
 
  private http = inject(HttpClient);
  private subs: Subscription[] = [];

  
  sidebarOpen = true;
  title = 'Catálogo de Cuentas';
  tabs = [{ id: 'datos', label: 'Cuentas' }];
  activeTabId: 'datos' = 'datos';

  
  canEdit = true;
  primaryActionLabel = 'Nueva cuenta';

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

 
  errors: { codigo?: string; nombre?: string } = {};
  touched: { codigo: boolean; nombre: boolean } = { codigo: false, nombre: false };

  get canSave(): boolean {
  
    return !!this.formCuenta.codigo?.trim() && !!this.formCuenta.nombre?.trim();
  }

 
  confirmOpen = false;
  confirmTitle = 'Confirmación';
  confirmMessage = '';
  confirmPayload: { type: 'delete'; id: number } | null = null;

  
  vm: ToastVM = { open: false, title: '', message: '', type: 'info', autoCloseMs: 3500 };

  
  ngOnInit(): void {
    this.loadCuentas();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  
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

 
  onFieldChange(field: 'codigo' | 'nombre', value: string): void {
    const v = (value ?? '').trimStart(); // evita espacios al inicio
    this.formCuenta[field] = v;
    this.touched[field] = true;
    this.validate(field);
  }

  
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
// ================== EXPORTAR A EXCEL ==================
exportToExcel(): void {
  const exportData = this.filteredRows.map(r => ({
    Código: r.codigo,
    Nombre: r.nombre,
    '¿Mayor?': r.ctaMayor ? 'Sí' : 'No',
    'Padre (Código)': r.padreCodigo ?? '',
    'Padre (Nombre)': r.padreNombre ?? '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cuentas');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, `catalogo_cuentas_${new Date().toISOString().split('T')[0]}.xlsx`);
  this.toastOk('Catálogo exportado a Excel');
}

// ================== EXPORTAR A PDF ==================
exportToPDF(): void {
  const doc = new jsPDF();
  doc.text('Catálogo de Cuentas', 14, 15);

  const tableData = this.filteredRows.map(r => [
    r.codigo,
    r.nombre,
    r.ctaMayor ? 'Sí' : 'No',
    r.padreCodigo ?? '',
    r.padreNombre ?? '',
  ]);

  autoTable(doc, {
    head: [['Código', 'Nombre', '¿Mayor?', 'Padre (Código)', 'Padre (Nombre)']],
    body: tableData,
    startY: 20,
  });

  doc.save(`catalogo_cuentas_${new Date().toISOString().split('T')[0]}.pdf`);
  this.toastOk('Catálogo exportado a PDF');
}

// IMPORTAR DESDE EXCEL
importFromExcel(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rowsExcel: any[] = XLSX.utils.sheet_to_json(worksheet);

    const normalize = (str: string | undefined | null) => (str ?? '').toString().trim();

    // Paso 1: crear un Map de código -> parentCodigo
    const cuentasPendientes = rowsExcel.map(r => ({
      codigo: normalize(r['Código']),
      nombre: r['Nombre'],
      ctaMayor: r['¿Mayor?'] === 'Sí',
      parentCodigo: normalize(r['Código Padre']) || null
    }));

    // Paso 2: crear primero los padres: OJO CREO QUE NO LO HACE
    const codigoToId = new Map<string, number>();

    for (const c of cuentasPendientes) {
      // Determinar parentId según código
      let parentId: number | null = null;
      if (c.parentCodigo) parentId = codigoToId.get(c.parentCodigo) ?? null;

      // Crear cuenta en backend
      const created = await new Promise<Cuenta>((resolve, reject) => {
        const s = this.http.post<Cuenta>(API, {
          codigo: c.codigo,
          nombre: c.nombre,
          ctaMayor: c.ctaMayor,
          parentId: parentId
        }).subscribe({
          next: res => resolve(res),
          error: err => reject(err)
        });
        this.subs.push(s);
      });

      codigoToId.set(c.codigo, created.id);
    }

    // Paso 3: recargar tabla para reflejar jerarquía
    this.loadCuentas();
    this.toastOk('Importación completada y jerarquía asociada.');
  };
  reader.readAsArrayBuffer(file);
}


onSearch(term: string) {
  this.searchTerm = term ?? '';
}

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
