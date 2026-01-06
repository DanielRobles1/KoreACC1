"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.CatalogCentrosComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var crud_panel_component_1 = require("@app/components/crud-panel/crud-panel.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var XLSX = require("xlsx");
var file_saver_1 = require("file-saver");
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var CatalogCentrosComponent = /** @class */ (function () {
    function CatalogCentrosComponent(router, toast, auth, centroService) {
        this.router = router;
        this.toast = toast;
        this.auth = auth;
        this.centroService = centroService;
        this.destroy$ = new rxjs_1.Subject();
        // MODAL
        this.modalOpen = false;
        this.modalTitle = 'Crear nuevo centro de costo';
        this.modalSize = 'md';
        this.saving = false;
        // Modo
        this.isEditMode = false;
        this.confirmOpen = false;
        this.confirmTitle = 'Confirmar eliminación';
        this.confirmMessage = '¿Deseas eliminar este centro?';
        this.confirmBusy = false;
        this.pendingDeleteId = null;
        this.formCentro = this.emptyCentro();
        // PERMISOS
        this.canCreate = false;
        this.canEdit = false;
        this.canDelete = false;
        // CRUD CONFIG
        this.title = 'Centros de costo';
        this.tabs = [
            { id: 'Cuentas', label: 'Cuentas', icon: 'assets/svgs/catalog-cuentas.svg', iconAlt: 'Cuentas', route: '/catalogos/cuentas' },
            { id: 'Centros de costo', label: 'Centros de costo', icon: 'assets/svgs/catalogue-catalog.svg', iconAlt: 'centros-costo', route: '/centros-costo' },
        ];
        this.activeTabId = 'Centros de costo';
        this.primaryActionLabel = 'Nuevo centro';
        this.columns = [
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
        this.rows = [];
        // NOTA: El componente CrudPanel debe emitir { id:'edit'/'delete', label... }
        this.actions = [];
        // ==== BÚSQUEDA ====
        this.norm = function (v) {
            return (v !== null && v !== void 0 ? v : '')
                .toString()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        };
        this.searchTerm = '';
        this.sidebarOpen = true;
    }
    CatalogCentrosComponent.prototype.emptyCentro = function () {
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
    };
    CatalogCentrosComponent.prototype.closeModal = function () { this.modalOpen = false; };
    CatalogCentrosComponent.prototype.cancelModal = function () {
        this.modalOpen = false;
        this.formCentro = this.emptyCentro();
        this.isEditMode = false;
    };
    Object.defineProperty(CatalogCentrosComponent.prototype, "filteredRows", {
        get: function () {
            var _this = this;
            if (!this.searchTerm)
                return this.rows;
            var term = this.norm(this.searchTerm);
            return this.rows.filter(function (r) {
                var id_centro = _this.norm(r.id_centro);
                var serie_venta = _this.norm(r.serie_venta);
                var nombre_centro = _this.norm(r.nombre_centro);
                var calle = _this.norm(r.calle);
                var cp = _this.norm(r.cp);
                var telefono = _this.norm(r.telefono);
                var correo = _this.norm(r.correo);
                var activo = _this.norm(r.activo);
                return (id_centro.includes(term) ||
                    serie_venta.includes(term) ||
                    nombre_centro.includes(term) ||
                    calle.includes(term) ||
                    cp.includes(term) ||
                    telefono.includes(term) ||
                    correo.includes(term) ||
                    activo.includes(term));
            });
        },
        enumerable: false,
        configurable: true
    });
    CatalogCentrosComponent.prototype.onSearch = function (term) {
        this.searchTerm = term;
    };
    CatalogCentrosComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadCentros();
        this.toast.state$
            .pipe(operators_1.takeUntil(this.destroy$))
            .subscribe(function (s) { return (_this.vm = s); });
        // Ajusta estos nombres a tus permisos reales de "centros de costo"
        this.canCreate = this.auth.hasPermission('crear_empresa');
        this.canEdit = this.auth.hasPermission('editar_empresa');
        this.canDelete = this.auth.hasPermission('eliminar_empresa');
        this.actions = __spreadArrays((this.canEdit ? [{ id: 'edit', label: 'Editar', tooltip: 'Editar' }] : []), (this.canDelete ? [{ id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' }] : []));
    };
    CatalogCentrosComponent.prototype.ngOnDestroy = function () {
        this.destroy$.next();
        this.destroy$.complete();
    };
    // ===== Cargar lista =====
    CatalogCentrosComponent.prototype.loadCentros = function () {
        var _this = this;
        this.centroService.getCentros().subscribe({
            next: function (data) { return (_this.rows = data); },
            error: function (err) { var _a; return _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'No se pudieron cargar los centros de costo'); }
        });
    };
    // ===== Crear (botón primario) =====
    CatalogCentrosComponent.prototype.onPrimary = function () {
        if (!this.canCreate) {
            this.toast.warning('No tienes permisos para crear centros de costo.', 'Acción no permitida');
            return;
        }
        this.isEditMode = false;
        this.modalTitle = 'Crear nuevo centro de costo';
        this.formCentro = this.emptyCentro();
        this.modalOpen = true;
    };
    // ===== Editar (abre modal con datos pre-cargados) =====
    CatalogCentrosComponent.prototype.onEdit = function (row) {
        var _a;
        if (!this.canEdit) {
            this.toast.warning('No tienes permisos para editar.', 'Acción no permitida');
            return;
        }
        this.isEditMode = true;
        // Clonar para no mutar la fila directamente
        this.formCentro = __assign({}, row);
        this.modalTitle = ("Editar centro #" + ((_a = row.id_centro) !== null && _a !== void 0 ? _a : '')).trim();
        this.modalOpen = true;
    };
    // ===== Acciones de fila (editar/eliminar) =====
    CatalogCentrosComponent.prototype.onRowAction = function (evt) {
        var _a, _b;
        if (!(evt === null || evt === void 0 ? void 0 : evt.action))
            return;
        if (evt.action === 'edit') {
            return this.onEdit(evt.row);
        }
        if (evt.action === 'delete') {
            if (!this.canDelete) {
                this.toast.warning('No tienes permisos para eliminar.', 'Acción no permitida');
                return;
            }
            var id = (_a = evt.row) === null || _a === void 0 ? void 0 : _a.id_centro;
            var nombre = (_b = evt.row) === null || _b === void 0 ? void 0 : _b.nombre_centro;
            if (!id) {
                this.toast.error('No se encontró el identificador del centro.', 'Error');
                return;
            }
            // Abrimos modal de confirmación 
            this.pendingDeleteId = id;
            this.confirmTitle = 'Confirmar eliminación';
            this.confirmMessage = "\u00BFEliminar el centro #" + id + " " + nombre + "?";
            this.confirmOpen = true;
            return;
        }
        this.toast.warning("Acci\u00F3n no soportada: " + evt.action);
    };
    CatalogCentrosComponent.prototype.closeConfirm = function () {
        this.confirmOpen = false;
        this.confirmBusy = false;
        this.pendingDeleteId = null;
    };
    CatalogCentrosComponent.prototype.cancelConfirm = function () {
        this.closeConfirm();
    };
    /** Usuario confirma la eliminación */
    CatalogCentrosComponent.prototype.confirmProceed = function () {
        var _this = this;
        if (this.pendingDeleteId == null) {
            this.toast.error('No se pudo determinar el centro a eliminar.', 'Error');
            this.closeConfirm();
            return;
        }
        this.confirmBusy = true;
        this.centroService.deleteCentro(this.pendingDeleteId).subscribe({
            next: function () {
                _this.confirmBusy = false;
                _this.closeConfirm();
                _this.toast.success('Centro eliminado (borrado lógico) correctamente.', 'Eliminado');
                _this.loadCentros();
            },
            error: function (err) {
                var _a;
                _this.confirmBusy = false;
                _this.closeConfirm();
                _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'No se pudo eliminar el centro', 'Error');
            }
        });
    };
    // ===== Confirmar modal: crea o actualiza =====
    CatalogCentrosComponent.prototype.confirmCentroModal = function () {
        var _this = this;
        if (!this.formValid) {
            this.toast.warning('Revisa los campos requeridos y el formato de correo/CP/teléfono.', 'Formulario incompleto');
            return;
        }
        this.saving = true;
        var onDone = function () { return (_this.saving = false); };
        if (this.isEditMode) {
            // ====== UPDATE ======
            this.centroService.actualizarCentro(this.formCentro.id_centro, this.formCentro).subscribe({
                next: function () {
                    onDone();
                    _this.modalOpen = false;
                    _this.toast.success('El centro fue actualizado correctamente.', 'Actualización exitosa');
                    _this.loadCentros();
                    _this.formCentro = _this.emptyCentro();
                    _this.isEditMode = false;
                },
                error: function (err) {
                    var _a;
                    onDone();
                    _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'No se pudo actualizar el centro', 'Error');
                }
            });
        }
        else {
            // ====== CREATE ======
            this.centroService.createCentro(this.formCentro).subscribe({
                next: function () {
                    onDone();
                    _this.modalOpen = false;
                    _this.toast.success('El centro fue registrado correctamente.', 'Registro exitoso');
                    _this.loadCentros();
                    _this.formCentro = _this.emptyCentro();
                },
                error: function (err) {
                    var _a;
                    onDone();
                    _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'No se pudo registrar el centro', 'Error');
                }
            });
        }
    };
    Object.defineProperty(CatalogCentrosComponent.prototype, "formValid", {
        // ===== Validación mínima =====
        get: function () {
            var _a, _b, _c;
            var c = this.formCentro;
            var emailOk = !c.correo || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.correo);
            var cpOk = !c.cp || /^\d{5}$/.test(c.cp);
            var telOk = !c.telefono || /^[\d\s\-\+\(\)]{7,20}$/.test(c.telefono);
            var serieOk = !!((_a = c.serie_venta) === null || _a === void 0 ? void 0 : _a.trim()); // <-- serie obligatoria no vacía
            var nombreOk = !!((_b = c.nombre_centro) === null || _b === void 0 ? void 0 : _b.trim());
            var regionOk = !!((_c = c.region) === null || _c === void 0 ? void 0 : _c.trim());
            return Boolean(nombreOk && serieOk && regionOk && emailOk && cpOk && telOk);
        },
        enumerable: false,
        configurable: true
    });
    // NAV / SIDEBAR
    CatalogCentrosComponent.prototype.onTabChange = function (tabId) {
        this.activeTabId = tabId;
        var selected = this.tabs.find(function (t) { return t.id === tabId; });
        if (selected === null || selected === void 0 ? void 0 : selected.route)
            this.router.navigate([selected.route]);
    };
    CatalogCentrosComponent.prototype.onSidebarToggle = function (open) { this.sidebarOpen = open; };
    // UTIL
    CatalogCentrosComponent.prototype.extractErrorMessage = function (err) {
        var _a;
        return ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || (typeof err === 'string' ? err : null);
    };
    // === EXPORTAR A EXCEL ===
    CatalogCentrosComponent.prototype.exportToExcel = function () {
        if (!this.rows || this.rows.length === 0) {
            this.toast.warning('No hay datos para exportar.', 'Atención');
            return;
        }
        var worksheet = XLSX.utils.json_to_sheet(this.rows);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Centros de Costo');
        var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        file_saver_1.saveAs(blob, 'centros_de_costo.xlsx');
        this.toast.success('Archivo Excel exportado correctamente.');
    };
    CatalogCentrosComponent.prototype.onImportExcel = function (event) {
        var _this = this;
        var file = event.target.files[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var importedData = XLSX.utils.sheet_to_json(worksheet);
            if (!importedData.length) {
                _this.toast.warning('El archivo no contiene datos válidos.');
                return;
            }
            var processed = 0;
            var total = importedData.length;
            importedData.forEach(function (centro, index) {
                // retraso entre peticiones para no saturar el servidor
                setTimeout(function () {
                    _this.centroService.createCentro(centro).subscribe({
                        next: function () {
                            processed++;
                            console.log("Centro " + processed + "/" + total + " guardado:", centro.nombre_centro);
                            // Cuando se hayan guardado todos, refrescamos la tabla
                            if (processed === total) {
                                _this.toast.success("Se importaron " + total + " centros correctamente.");
                                _this.loadCentros(); //  Recarga los datos en pantalla
                            }
                        },
                        error: function (err) {
                            console.error("\u274C Error al guardar centro \"" + centro.nombre_centro + "\":", err);
                            _this.toast.error("Error al guardar el centro \"" + centro.nombre_centro + "\"");
                        }
                    });
                }, index * 200); // 200 ms entre peticiones
            });
        };
        reader.readAsArrayBuffer(file);
    };
    // === EXPORTAR PDF ===
    CatalogCentrosComponent.prototype.exportToPDF = function () {
        var _this = this;
        if (!this.rows || this.rows.length === 0) {
            this.toast.warning('No hay datos para exportar.', 'Atención');
            return;
        }
        var doc = new jspdf_1["default"]('l', 'pt', 'a4');
        doc.setFontSize(16);
        doc.text('Centros de Costo', 40, 40);
        var columns = this.columns.map(function (c) { return c.header; });
        var data = this.rows.map(function (row) { return _this.columns.map(function (c) { return row[c.key]; }); });
        jspdf_autotable_1["default"](doc, {
            head: [columns],
            body: data,
            startY: 60,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 4 },
            headStyles: { fillColor: [0, 102, 204] }
        });
        doc.save('centros_de_costo.pdf');
        this.toast.success('PDF exportado correctamente.');
    };
    CatalogCentrosComponent = __decorate([
        core_1.Component({
            selector: 'app-catalog-centros',
            standalone: true,
            imports: [forms_1.FormsModule, sidebar_component_1.SidebarComponent, crud_panel_component_1.CrudPanelComponent, modal_component_1.ModalComponent, toast_message_component_component_1.ToastMessageComponent],
            templateUrl: './catalog-centros.component.html',
            styleUrls: ['./catalog-centros.component.scss']
        })
    ], CatalogCentrosComponent);
    return CatalogCentrosComponent;
}());
exports.CatalogCentrosComponent = CatalogCentrosComponent;
