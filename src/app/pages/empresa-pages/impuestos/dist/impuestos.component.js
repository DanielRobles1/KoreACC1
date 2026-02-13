"use strict";
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
exports.ImpuestosComponent = void 0;
var core_1 = require("@angular/core");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var crud_panel_component_1 = require("@app/components/crud-panel/crud-panel.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var impuesto_form_component_1 = require("@app/components/impuesto-form/impuesto-form.component");
var ImpuestosComponent = /** @class */ (function () {
    function ImpuestosComponent(impuestoService, router, auth, toast) {
        this.impuestoService = impuestoService;
        this.router = router;
        this.auth = auth;
        this.toast = toast;
        this.idEmpresa = 1;
        this.modalOpen = false;
        this.modalTitle = 'Crear nuevo impuesto';
        this.modalSize = 'md';
        this.editingImpuesto = null;
        this.confirmOpen = false;
        this.confirmTitle = '';
        this.confirmMessage = '';
        this.impuestoToDelete = null;
        this.pendingAction = 'save';
        this.pendingImpuesto = null;
        // PERMISOS 
        this.canCreate = false;
        this.canEdit = false;
        this.canDelete = false;
        // CRUD PANEL
        this.title = 'Impuestos';
        this.tabs = [
            { id: 'datos', label: 'Ejercicios', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
            { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },
            { id: 'empresa', label: 'Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
            {
                id: 'tipo-poliza',
                label: '+ Tipo póliza'
            }
        ];
        this.activeTabId = 'impuestos';
        this.primaryActionLabel = 'Nuevo impuesto';
        this.columns = [
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
        this.rows = [];
        this.actions = [
            { id: 'edit', label: 'Editar', tooltip: 'Editar impuesto' },
            { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar impuesto' }
        ];
        // BÚSQUEDA 
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
    ImpuestosComponent.prototype.closeModal = function () { this.modalOpen = false; };
    ImpuestosComponent.prototype.cancelModal = function () { this.modalOpen = false; };
    Object.defineProperty(ImpuestosComponent.prototype, "filteredRows", {
        get: function () {
            var _this = this;
            if (!this.searchTerm)
                return this.rows;
            var term = this.norm(this.searchTerm);
            return this.rows.filter(function (r) {
                var _a;
                var nombre = _this.norm(r.nombre);
                var tipo = _this.norm(r.tipo);
                var modo = _this.norm(r.modo);
                var aplica = _this.norm(r.aplica_en);
                var tasa = _this.norm(String(r.tasa));
                var cuenta = _this.norm(String((_a = r.id_cuenta) !== null && _a !== void 0 ? _a : ''));
                return (nombre.includes(term) ||
                    tipo.includes(term) ||
                    modo.includes(term) ||
                    aplica.includes(term) ||
                    tasa.includes(term) ||
                    cuenta.includes(term));
            });
        },
        enumerable: false,
        configurable: true
    });
    ImpuestosComponent.prototype.onSearch = function (term) {
        this.searchTerm = term;
    };
    ImpuestosComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.toast.state$.subscribe(function (s) { return (_this.vm = s); });
        this.cargaImpuestos();
        this.canCreate = this.auth.hasPermission('crear_empresa');
        this.canEdit = this.auth.hasPermission('editar_empresa');
        this.canDelete = this.auth.hasPermission('eliminar_empresa');
        this.actions = __spreadArrays((this.canEdit ? [{ id: 'edit', label: 'Editar', tooltip: 'Editar impuesto' }] : []), (this.canDelete ? [{ id: 'delete', label: 'Eliminar', tooltip: 'Eliminar impuesto' }] : []));
    };
    ImpuestosComponent.prototype.cargaImpuestos = function () {
        var _this = this;
        this.impuestoService.getImpuestos().subscribe({
            next: function (data) {
                _this.rows = (data !== null && data !== void 0 ? data : []).map(function (d) {
                    var _a, _b, _c;
                    return ({
                        id_impuesto: d.id_impuesto,
                        id_empresa: (_a = d.id_empresa) !== null && _a !== void 0 ? _a : _this.idEmpresa,
                        nombre: d.nombre,
                        tipo: d.tipo,
                        modo: d.modo,
                        tasa: d.tasa,
                        aplica_en: d.aplica_en,
                        es_estandar: d.es_estandar,
                        vigencia_inicio: d.vigencia_inicio,
                        id_cuenta: (_c = (_b = d.id_cuenta) !== null && _b !== void 0 ? _b : d.cuenta_relacionada) !== null && _c !== void 0 ? _c : null // ✅ asegura campo presente
                    });
                });
            },
            error: function (err) {
                var _a;
                _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'No se pudieron cargar los impuestos.', 'Error', 0);
            }
        });
    };
    ImpuestosComponent.prototype.onPrimary = function () {
        if (!this.canCreate) {
            this.toast.warning('No tienes permisos para crear impuestos.', 'Acción no permitida');
            return;
        }
        this.modalTitle = 'Crear nuevo impuesto';
        this.editingImpuesto = null;
        this.modalOpen = true;
    };
    //  ACCIONES 
    ImpuestosComponent.prototype.onRowAction = function (evt) {
        if (evt.action === 'edit') {
            if (!this.canEdit) {
                this.toast.warning('No tienes permisos para editar impuestos.', 'Acción no permitida');
                return;
            }
            this.modalTitle = "Editar impuesto: " + evt.row.nombre;
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
            this.confirmMessage = "\u00BFEst\u00E1s seguro de que deseas eliminar el impuesto \"" + evt.row.nombre + "\"? Esta acci\u00F3n no se puede deshacer.";
            this.confirmOpen = true;
        }
    };
    ImpuestosComponent.prototype.upsertImpuesto = function (impuesto) {
        var _a;
        this.pendingAction = 'save';
        this.pendingImpuesto = impuesto;
        var esEdicion = !!((_a = this.editingImpuesto) === null || _a === void 0 ? void 0 : _a.id_impuesto);
        this.confirmTitle = esEdicion ? 'Confirmar actualización' : 'Confirmar creación';
        this.confirmMessage = esEdicion
            ? "\u00BFGuardar los cambios del impuesto \u201C" + impuesto.nombre + "\u201D?"
            : "\u00BFCrear el impuesto \u201C" + impuesto.nombre + "\u201D?";
        this.confirmOpen = true;
    };
    ImpuestosComponent.prototype.closeConfirm = function () { this.confirmOpen = false; };
    ImpuestosComponent.prototype.cancelConfirm = function () { this.confirmOpen = false; };
    ImpuestosComponent.prototype.confirmProceed = function () {
        var _this = this;
        var _a;
        if (this.pendingAction === 'delete' && this.impuestoToDelete) {
            this.impuestoService.eliminarImpuesto(this.impuestoToDelete.id_impuesto)
                .subscribe({
                next: function () {
                    _this.rows = _this.rows.filter(function (r) { return r.id_impuesto !== _this.impuestoToDelete.id_impuesto; });
                    _this.toast.success("El impuesto \"" + _this.impuestoToDelete.nombre + "\" fue eliminado correctamente.");
                    _this.impuestoToDelete = null;
                    _this.confirmOpen = false;
                },
                error: function (err) {
                    var _a;
                    _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : "No se pudo eliminar el impuesto \"" + _this.impuestoToDelete.nombre + "\".");
                    _this.confirmOpen = false;
                }
            });
        }
        else if (this.pendingAction === 'save' && this.pendingImpuesto) {
            var esEdicion_1 = !!((_a = this.editingImpuesto) === null || _a === void 0 ? void 0 : _a.id_impuesto);
            var request$ = esEdicion_1
                ? this.impuestoService.actualizarImpuesto(this.pendingImpuesto.id_impuesto, this.pendingImpuesto)
                : this.impuestoService.crearImpuesto(this.pendingImpuesto);
            request$.subscribe({
                next: function (res) {
                    if (esEdicion_1) {
                        _this.rows = _this.rows.map(function (r) { return (r.id_impuesto === res.id_impuesto ? res : r); });
                        _this.toast.success("El impuesto \"" + res.nombre + "\" fue actualizado correctamente.");
                    }
                    else {
                        _this.rows = __spreadArrays(_this.rows, [res]);
                        _this.toast.success("El impuesto \"" + res.nombre + "\" fue creado correctamente.");
                    }
                    _this.modalOpen = false;
                    _this.confirmOpen = false;
                },
                error: function (err) {
                    var _a, _b, _c;
                    var fallback = esEdicion_1
                        ? "No se pudo actualizar el impuesto \"" + ((_a = _this.pendingImpuesto) === null || _a === void 0 ? void 0 : _a.nombre) + "\"."
                        : "No se pudo crear el impuesto \"" + ((_b = _this.pendingImpuesto) === null || _b === void 0 ? void 0 : _b.nombre) + "\".";
                    _this.toast.error((_c = _this.extractErrorMessage(err)) !== null && _c !== void 0 ? _c : fallback);
                    _this.confirmOpen = false;
                }
            });
        }
    };
    // ==== NAV TABS ====
    ImpuestosComponent.prototype.onTabChange = function (tabId) {
        this.activeTabId = tabId;
        var selected = this.tabs.find(function (t) { return t.id === tabId; });
        if (selected === null || selected === void 0 ? void 0 : selected.route)
            this.router.navigate([selected.route]);
    };
    ImpuestosComponent.prototype.onSidebarToggle = function (open) { this.sidebarOpen = open; };
    ImpuestosComponent.prototype.extractErrorMessage = function (err) {
        var _a;
        return ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || (typeof err === 'string' ? err : null);
    };
    ImpuestosComponent = __decorate([
        core_1.Component({
            selector: 'app-impuestos',
            standalone: true,
            imports: [
                sidebar_component_1.SidebarComponent,
                crud_panel_component_1.CrudPanelComponent,
                modal_component_1.ModalComponent,
                toast_message_component_component_1.ToastMessageComponent,
                impuesto_form_component_1.ImpuestoFormComponent
            ],
            templateUrl: './impuestos.component.html',
            styleUrls: ['./impuestos.component.scss']
        })
    ], ImpuestosComponent);
    return ImpuestosComponent;
}());
exports.ImpuestosComponent = ImpuestosComponent;
