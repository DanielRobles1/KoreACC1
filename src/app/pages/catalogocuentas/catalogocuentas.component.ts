import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription, firstValueFrom } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RouterModule } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { CrudPanelComponent, CrudTab } from '@app/components/crud-panel/crud-panel.component';
import { ModalComponent } from '@app/components/modal/modal/modal.component';
import { ToastMessageComponent } from '@app/components/modal/toast-message-component/toast-message-component.component';
import { AuthService } from '@app/services/auth.service';
import { WsService } from '@app/services/ws.service';
import { PermissionWatcher } from '@app/utils/permissions.util';

const API = 'http://localhost:3000/api/v1/cuentas';

type CuentaTipo = 'ACTIVO' | 'PASIVO' | 'CAPITAL' | 'INGRESO' | 'GASTO';
type Naturaleza = 'DEUDORA' | 'ACREEDORA';

interface Cuenta {
  id: number;
  codigo: string;
  nombre: string;
  ctaMayor: boolean;
  posteable: boolean;
  tipo: CuentaTipo;
  naturaleza: Naturaleza;
  parentId: number | null;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  padreCodigo?: string | null;
  padreNombre?: string | null;
  icon?: string;
}

interface CuentaNode {
  data: Cuenta;
  children: CuentaNode[];
  expanded: boolean;
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
    RouterModule,
    HttpClientModule,
    SidebarComponent,
    CrudPanelComponent,
    ModalComponent,
    ToastMessageComponent,
  ],
})
export class CatalogoCuentasComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private ws = inject(WsService);
  private http = inject(HttpClient);
  private subs: Subscription[] = [];

  TIPO_OPTS: CuentaTipo[] = ['ACTIVO', 'PASIVO', 'CAPITAL', 'INGRESO', 'GASTO'];
  NAT_OPTS: Naturaleza[] = ['DEUDORA', 'ACREEDORA'];

  sidebarOpen = true;
  title = 'Catálogo de Cuentas';
  tabs: CrudTab[] = [
    {
      id: 'Cuentas',
      label: 'Cuentas',
      icon: 'assets/svgs/catalog-cuentas.svg',
      iconAlt: 'Cuentas',
      route: '/catalogos/cuentas',
    },
    {
      id: 'Centros de costo',
      label: 'Centros de costo',
      icon: 'assets/svgs/catalogue-catalog.svg',
      iconAlt: 'centros-costo',
      route: '/centros-costo',
    },
  ];
  activeTabId: 'datos' = 'datos';

  primaryActionLabel = 'Nueva cuenta';

  columns: any[] = [
    { key: 'codigo', header: 'Código', width: '140' },
    { key: 'nombre', header: 'Nombre', width: '260' },
    { key: 'ctaMayor', header: '¿Mayor?', width: '90', format: (v: boolean): string => (v ? 'Sí' : 'No') },
    { key: 'tipo', header: 'Tipo', width: '120' },
    { key: 'naturaleza', header: 'Naturaleza', width: '120' },
    { key: 'padreCodigo', header: 'Padre (código)', width: '140' },
    { key: 'padreNombre', header: 'Padre (nombre)', width: '220' },
  ];

  actions: any[] = [];

  private rebuildActions() {
    const acts = [];
    if (this.canCreate) acts.push({ id: 'child', label: 'Crear hijo', icon: 'folder-plus', kind: 'secondary' });
    if (this.canEdit) acts.push({ id: 'edit', label: 'Editar', icon: 'edit', kind: 'primary' });
    if (this.canDelete) acts.push({ id: 'delete', label: 'Eliminar', icon: 'trash', kind: 'danger' });
    this.actions = acts;
  }

  rows: Cuenta[] = [];
  treeRoots: CuentaNode[] = [];
  allCuentas: Cuenta[] = [];

  canCreate = false;
  canEdit = false;
  canDelete = false;

  private permWatcher?: PermissionWatcher;

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
    posteable: true,
    tipo: 'ACTIVO',
    naturaleza: 'DEUDORA',
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

  expandedIds = new Set<number>();

  searchTerm = '';

  ngOnInit(): void {
    this.loadCuentas();

    this.permWatcher = new PermissionWatcher(
      this.auth,
      this.ws,
      {
        toastOk: (m) => this.toastOk(m),
        toastWarn: (m) => this.toastWarn(m),
        toastError: (m, e) => this.toastError(m, e),
      },
      (flags) => {
        this.canCreate = flags.canCreate;
        this.canEdit = flags.canEdit;
        this.canDelete = flags.canDelete;
        this.rebuildActions();
      },
      {
        keys: {
          create: 'crear_cat_Contable',
          edit: 'editar_cat_Contable',
          delete: 'eliminar_cat_Contable',
        },
        socketEvent: ['permissions:changed', 'role-permissions:changed'],
        contextLabel: 'Catálogo contable',
      }
    );
    this.permWatcher.start();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    if (this.permWatcher) this.permWatcher.stop();
  }

  loadCuentas(): void {
    const s = this.http.get<Cuenta[]>(API).subscribe({
      next: (data) => {
        const byId = new Map<number, Cuenta>();
        data.forEach((c) => byId.set(c.id, c));

        this.allCuentas = data;
        this.rows = data.map((c) => ({
          ...c,
          padreCodigo: c.parentId ? byId.get(c.parentId)?.codigo ?? null : null,
          padreNombre: c.parentId ? byId.get(c.parentId)?.nombre ?? null : null,
        }));

        // Construir árbol (mismo enfoque que el primer código)
        this.treeRoots = this.buildTree(this.rows);
      },
      error: (err) => this.toastError('No se pudieron cargar las cuentas', err),
    });
    this.subs.push(s);
  }

  private buildTree(list: Cuenta[]): CuentaNode[] {
    const nodeById = new Map<number, CuentaNode>();
    const roots: CuentaNode[] = [];

    for (const c of list) {
      if (c.id == null) continue;
      nodeById.set(c.id, {
        data: c,
        children: [],
        expanded: false,
      });
    }

    for (const c of list) {
      if (c.id == null) continue;
      const node = nodeById.get(c.id)!;

      if (c.parentId != null) {
        const parent = nodeById.get(c.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private norm(v: unknown): string {
    return (v ?? '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private nodeMatches(node: CuentaNode, term: string): boolean {
    const c = node.data;
    return (
      this.norm(c.codigo).includes(term) ||
      this.norm(c.nombre).includes(term) ||
      this.norm(c.tipo).includes(term) ||
      this.norm(c.naturaleza).includes(term) ||
      this.norm(c.padreCodigo).includes(term) ||
      this.norm(c.padreNombre).includes(term)
    );
  }

  private filterTree(nodes: CuentaNode[], term: string): CuentaNode[] {
    if (!term) return nodes;
    const result: CuentaNode[] = [];

    for (const node of nodes) {
      const childFiltered = this.filterTree(node.children, term);
      const matches = this.nodeMatches(node, term);

      if (matches || childFiltered.length) {
        result.push({
          ...node,
          expanded: childFiltered.length ? true : node.expanded,
          children: childFiltered,
        });
      }
    }
    return result;
  }

  get filteredTreeRoots(): CuentaNode[] {
    const term = this.norm(this.searchTerm);
    if (!term) return this.treeRoots;
    return this.filterTree(this.treeRoots, term);
  }

  toggleNode(node: CuentaNode, event?: MouseEvent): void {
    event?.stopPropagation();
    node.expanded = !node.expanded;
  }

  askDelete(c: Cuenta, event?: MouseEvent): void {
    event?.stopPropagation();
    if (!this.canDelete) return this.toastWarn('No tienes permiso para eliminar.');
    this.confirmTitle = 'Eliminar cuenta';
    this.confirmMessage = `¿Deseas eliminar la cuenta ${c.codigo} - ${c.nombre}?`;
    this.confirmPayload = { type: 'delete', id: c.id };
    this.confirmOpen = true;
  }

  trackByCuentaNodeId = (_: number, n: CuentaNode) => n.data.id;

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
      error: (err) => this.handleHttpError(err, 'No se pudo eliminar la cuenta, revisa si tiene movimientos asociados'),
    });
    this.subs.push(s);
  }

  onPrimary(): void {
    if (!this.canCreate) return this.toastWarn('No tienes permiso para crear cuentas.');
    this.editId = null;
    this.parentPreselectedId = null;
    this.modalTitle = 'Nueva cuenta';
    this.formCuenta = {
      codigo: '',
      nombre: '',
      ctaMayor: false,
      posteable: true,
      tipo: 'ACTIVO',
      naturaleza: 'DEUDORA',
      parentId: this.parentPreselectedId ?? null,
    };
    this.enforcePosteableRule();
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
      posteable: row.posteable,
      tipo: row.tipo,
      naturaleza: row.naturaleza,
      parentId: row.ctaMayor ? null : (row.parentId ?? null),
    };
    this.enforcePosteableRule();
    this.resetValidation();
    this.editOpen = true;
  }

  onRowAction(evt: any): void {
    const id: string = evt?.id ?? evt?.action;
    const row: Cuenta = evt?.row;
    if (!id || !row) return;

    if (id === 'edit') {
      if (!this.canEdit) return this.toastWarn('No tienes permiso para editar.');
      return this.onEdit(row);
    }

    if (id === 'child') {
      if (!this.canCreate) return this.toastWarn('No tienes permiso para crear subcuentas.');
      if (!row.ctaMayor) return this.toastWarn('Solo las cuentas mayor pueden tener subcuentas');
      this.editId = null;
      this.parentPreselectedId = row.id;
      this.modalTitle = `Nueva subcuenta de ${row.codigo}`;
      this.formCuenta = {
        codigo: '',
        nombre: '',
        ctaMayor: false,
        posteable: true,
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        parentId: row.id,
      };
      this.enforcePosteableRule();
      this.resetValidation();
      this.editOpen = true;
      return;
    }

    if (id === 'delete') {
      if (!this.canDelete) return this.toastWarn('No tienes permiso para eliminar.');
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
    const v = (value ?? '').trimStart();
    this.formCuenta[field] = v;
    this.touched[field] = true;
    this.validate(field);
  }

  closeModal(): void {
    this.editOpen = false;
  }
  cancelModal(): void {
    this.editOpen = false;
  }

  confirmModal(): void {
    this.enforcePosteableRule();
    this.touched = { codigo: true, nombre: true };
    this.validate();

    if (!this.canSave) {
      const msg = this.errors.codigo || this.errors.nombre || 'Completa los campos obligatorios';
      return this.toastWarn(msg);
    }

    const payload: Partial<Cuenta> = {
      codigo: (this.formCuenta.codigo ?? '').trim(),
      nombre: (this.formCuenta.nombre ?? '').trim(),
      ctaMayor: !!this.formCuenta.ctaMayor,
      posteable: !!this.formCuenta.posteable,
      tipo: this.formCuenta.tipo!,
      naturaleza: this.formCuenta.naturaleza!,
      parentId: this.formCuenta.parentId ?? null,
    };

    if (this.editId == null) this.createCuenta(payload);
    else this.updateCuenta(this.editId, payload);
  }

  closeConfirm(): void {
    this.confirmOpen = false;
    this.confirmPayload = null;
  }
  cancelConfirm(): void {
    this.closeConfirm();
  }
  confirmProceed(): void {
    if (!this.confirmPayload) return this.closeConfirm();
    if (this.confirmPayload.type === 'delete') {
      return this.deleteCuenta(this.confirmPayload.id);
    }
    this.closeConfirm();
  }

  private enforcePosteableRule(): void {
    if (this.formCuenta.ctaMayor) {
      this.formCuenta.posteable = false;
    } else {
      this.formCuenta.posteable = true;
    }
  }

  onCtaMayorChange(v: boolean) {
    this.formCuenta.ctaMayor = !!v;

    if (this.formCuenta.ctaMayor) {
      this.formCuenta.parentId = null; 
      this.parentPreselectedId = null;
    }

    this.enforcePosteableRule();
  }

  onParentChange(id: number | null) {
  this.formCuenta.parentId = id ?? null;

  if (id != null) {
    this.formCuenta.ctaMayor = false;      // tener padre implica ser subcuenta
    this.enforcePosteableRule();
  }
}

  getParentOptions(): Cuenta[] {
    const excludeId = this.editId;
    return this.allCuentas.filter((c) => c.id !== excludeId && c.ctaMayor === true);
  }

  getCodigoPadre(id: number | null): string | null {
    if (!id) return null;
    const c = this.allCuentas.find((x) => x.id === id);
    return c ? c.codigo : null;
  }

  onSidebarToggle(open: boolean): void {
    this.sidebarOpen = open;
  }
  onTabChange(tabId: string): void {
    this.activeTabId = tabId as any;
  }

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
    this.toastWarn(fallbackMsg);
  }

  //   buascar
  onSearch(term: string) {
    this.searchTerm = (term ?? '').toLowerCase();
  }

  // match directo contra código, nombre y padre
  private matchesSearch(c: Cuenta, term: string): boolean {
    if (!term) return true;
    const nombre = (c.nombre ?? '').toLowerCase();
    const codigo = (c.codigo ?? '').toLowerCase();
    const padreNombre = (c.padreNombre ?? '').toLowerCase();
    const padreCodigo = (c.padreCodigo ?? '').toLowerCase();

    return (
      nombre.includes(term) ||
      codigo.includes(term) ||
      padreNombre.includes(term) ||
      padreCodigo.includes(term)
    );
  }

  private buildChildrenMap(): Map<number, Cuenta[]> {
    const map = new Map<number, Cuenta[]>();
    for (const c of this.rows) {
      if (c.parentId == null) continue;
      if (!map.has(c.parentId)) map.set(c.parentId, []);
      map.get(c.parentId)!.push(c);
    }
    return map;
  }


  private isVisible(
    c: Cuenta,
    term: string,
    childrenMap: Map<number, Cuenta[]>,
    cache: Map<number, boolean>
  ): boolean {
    if (!term) return true;
    if (cache.has(c.id)) return cache.get(c.id)!;

    if (this.matchesSearch(c, term)) {
      cache.set(c.id, true);
      return true;
    }

    const children = childrenMap.get(c.id) ?? [];
    const anyChildVisible = children.some((child) => this.isVisible(child, term, childrenMap, cache));

    cache.set(c.id, anyChildVisible);
    return anyChildVisible;
  }

  private getVisibleRows(): Cuenta[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.rows;

    const childrenMap = this.buildChildrenMap();
    const cache = new Map<number, boolean>();

    return this.rows.filter((c) => this.isVisible(c, term, childrenMap, cache));
  }

  trackByCuentaId = (_: number, c: Cuenta) => c.id;

  getRootCuentas(): Cuenta[] {
    const term = this.searchTerm.trim().toLowerCase();
    const childrenMap = this.buildChildrenMap();
    const cache = new Map<number, boolean>();

    return this.rows.filter(
      (c) => !c.parentId && this.isVisible(c, term, childrenMap, cache)
    );
  }

  getChildren(parentId: number): Cuenta[] {
    const term = this.searchTerm.trim().toLowerCase();
    const childrenMap = this.buildChildrenMap();
    const cache = new Map<number, boolean>();

    const children = childrenMap.get(parentId) ?? [];
    return children.filter((c) => this.isVisible(c, term, childrenMap, cache));
  }

  hasChildren(cuenta: Cuenta): boolean {
    return this.rows.some((r) => r.parentId === cuenta.id);
  }

  toggleExpand(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  //  EXPORTAR A EXCEL 
  exportToExcel(): void {
    const visible = this.getVisibleRows();

    const exportData = visible.map((r) => ({
      Código: r.codigo,
      Nombre: r.nombre,
      '¿Mayor?': r.ctaMayor ? 'Sí' : 'No',
      Posteable: r.posteable ? 'Sí' : 'No',
      Tipo: r.tipo,
      Naturaleza: r.naturaleza,
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

  //  EXPORTAR A PDF 
  exportToPDF(): void {
    const visible = this.getVisibleRows();

    const doc = new jsPDF();
    doc.text('Catálogo de Cuentas', 14, 15);

    const tableData = visible.map((r) => [
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

  importFromExcel(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rowsExcel: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rowsExcel.length) {
        this.toastWarn('El archivo no contiene filas para importar.');
        return;
      }

      const normalize = (v: any) => (v ?? '').toString().trim();

      type CuentaImport = {
        codigo: string;
        nombre: string;
        ctaMayor: boolean;
        posteable: boolean;
        tipo: CuentaTipo;
        naturaleza: Naturaleza;
        parentCodigo: string | null;
      };

      const cuentas: CuentaImport[] = rowsExcel.map((r) => {
        const codigo = normalize(r['Código']);
        const nombre = normalize(r['Nombre']);
        const tipo = normalize(r['Tipo']) as CuentaTipo;
        const naturaleza = normalize(r['Naturaleza']) as Naturaleza;
        const mayorStr = normalize(r['¿Mayor?']);
        const posteableStr = normalize(r['Posteable']);
        const parentCodigoRaw = normalize(r['Padre (Código)']);

        const toBool = (s: string) => {
          const v = s.toLowerCase();
          return v === 'sí' || v === 'si' || v === 'true' || v === '1';
        };

        return {
          codigo,
          nombre,
          tipo,
          naturaleza,
          ctaMayor: toBool(mayorStr),
          posteable: toBool(posteableStr),
          parentCodigo: parentCodigoRaw || null,
        };
      });

      const invalid = cuentas.filter(
        (c) =>
          !c.codigo ||
          !c.nombre ||
          !this.TIPO_OPTS.includes(c.tipo) ||
          !this.NAT_OPTS.includes(c.naturaleza)
      );

      if (invalid.length) {
        this.toastWarn(
          `Hay ${invalid.length} filas con datos inválidos (código, nombre, tipo o naturaleza). Corrige el archivo e inténtalo de nuevo.`
        );
        return;
      }

      const codigoToId = new Map<string, number>();

      this.allCuentas.forEach((c) => {
        if (c.codigo && c.id) {
          codigoToId.set(c.codigo, c.id);
        }
      });

      try {
        for (const c of cuentas.filter((x) => !x.parentCodigo)) {
          if (codigoToId.has(c.codigo)) {
            console.warn(`Código ya existente, se omite creación: ${c.codigo}`);
            continue;
          }

          const payload: Partial<Cuenta> = {
            codigo: c.codigo,
            nombre: c.nombre,
            ctaMayor: c.ctaMayor,
            posteable: c.posteable,
            tipo: c.tipo,
            naturaleza: c.naturaleza,
            parentId: null,
          };

          const created: any = await firstValueFrom(this.http.post(API, payload));

          if (created?.id) {
            codigoToId.set(c.codigo, created.id);
          } else {
            console.warn('No se devolvió ID para:', c);
          }
        }

        for (const c of cuentas.filter((x) => !!x.parentCodigo)) {
          const parentId = c.parentCodigo ? codigoToId.get(c.parentCodigo) : undefined;

          if (!parentId) {
            console.warn(`Padre no encontrado para ${c.codigo} (${c.parentCodigo})`);
            continue;
          }

          if (codigoToId.has(c.codigo)) {
            console.warn(`Código ya existente, se omite creación: ${c.codigo}`);
            continue;
          }

          const payload: Partial<Cuenta> = {
            codigo: c.codigo,
            nombre: c.nombre,
            ctaMayor: c.ctaMayor,
            posteable: c.posteable,
            tipo: c.tipo,
            naturaleza: c.naturaleza,
            parentId,
          };

          const created: any = await firstValueFrom(this.http.post(API, payload));

          if (created?.id) {
            codigoToId.set(c.codigo, created.id);
          } else {
            console.warn('No se devolvió ID para:', c);
          }
        }

        this.loadCuentas();
        this.toastOk('Importación completada y jerarquía asociada correctamente.');
      } catch (err) {
        console.error('Error en importación:', err);
        this.toastError('No se pudo completar la importación', err);
      }
    };

    reader.readAsArrayBuffer(file);

    event.target.value = '';
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}
