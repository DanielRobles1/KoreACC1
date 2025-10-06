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
exports.__esModule = true;
exports.CatalogoCuentasComponent = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
// Standalone deps UI
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
// Tus componentes standalone
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var crud_panel_component_1 = require("@app/components/crud-panel/crud-panel.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var API = 'http://localhost:3000/api/v1/cuentas';
var CatalogoCuentasComponent = /** @class */ (function () {
    function CatalogoCuentasComponent() {
        // ====== DI ======
        this.http = core_1.inject(http_1.HttpClient);
        this.subs = [];
        // ====== LAYOUT / TABS ======
        this.sidebarOpen = true;
        this.title = 'Catálogo de Cuentas';
        this.tabs = [{ id: 'datos', label: 'Cuentas' }];
        this.activeTabId = 'datos';
        // ====== PERMISOS / ACCIONES SUPERIORES ======
        this.canEdit = true;
        this.primaryActionLabel = 'Nueva cuenta';
        // ====== GRID ======
        this.columns = [
            { key: 'codigo', header: 'Código', width: '140' },
            { key: 'nombre', header: 'Nombre', width: '260' },
            { key: 'ctaMayor', header: '¿Mayor?', width: '90', format: function (v) { return (v ? 'Sí' : 'No'); } },
            { key: 'padreCodigo', header: 'Padre (código)', width: '140' },
            { key: 'padreNombre', header: 'Padre (nombre)', width: '220' },
        ];
        this.actions = [
            { id: 'child', label: 'Crear hijo', icon: 'folder-plus', kind: 'secondary' },
            { id: 'edit', label: 'Editar', icon: 'edit', kind: 'primary' },
            { id: 'delete', label: 'Eliminar', icon: 'trash', kind: 'danger' },
        ];
        this.rows = [];
        this.allCuentas = []; // para combos de padre
        // ====== MODAL: CUENTA ======
        this.editOpen = false;
        this.modalTitle = 'Nueva cuenta';
        this.modalSize = 'md';
        this.showClose = true;
        this.editId = null;
        this.parentPreselectedId = null;
        this.formCuenta = {
            codigo: '',
            nombre: '',
            ctaMayor: false,
            parentId: null
        };
        // --- Estado de validación en vivo ---
        this.errors = {};
        this.touched = { codigo: false, nombre: false };
        // ====== MODAL: CONFIRMACIÓN ======
        this.confirmOpen = false;
        this.confirmTitle = 'Confirmación';
        this.confirmMessage = '';
        this.confirmPayload = null;
        // ====== TOAST ======
        this.vm = { open: false, title: '', message: '', type: 'info', autoCloseMs: 3500 };
        // Search
        this.searchTerm = '';
    }
    Object.defineProperty(CatalogoCuentasComponent.prototype, "canSave", {
        get: function () {
            var _a, _b;
            // sin errores y con contenido válido
            return !!((_a = this.formCuenta.codigo) === null || _a === void 0 ? void 0 : _a.trim()) && !!((_b = this.formCuenta.nombre) === null || _b === void 0 ? void 0 : _b.trim());
        },
        enumerable: false,
        configurable: true
    });
    // ====== LIFECYCLE ======
    CatalogoCuentasComponent.prototype.ngOnInit = function () {
        this.loadCuentas();
    };
    CatalogoCuentasComponent.prototype.ngOnDestroy = function () {
        this.subs.forEach(function (s) { return s.unsubscribe(); });
    };
    // ====== DATA ======
    CatalogoCuentasComponent.prototype.loadCuentas = function () {
        var _this = this;
        var s = this.http.get(API).subscribe({
            next: function (data) {
                var byId = new Map();
                data.forEach(function (c) { return byId.set(c.id, c); });
                _this.allCuentas = data;
                _this.rows = data.map(function (c) {
                    var _a, _b, _c, _d;
                    return (__assign(__assign({}, c), { padreCodigo: c.parentId ? (_b = (_a = byId.get(c.parentId)) === null || _a === void 0 ? void 0 : _a.codigo) !== null && _b !== void 0 ? _b : null : null, padreNombre: c.parentId ? (_d = (_c = byId.get(c.parentId)) === null || _c === void 0 ? void 0 : _c.nombre) !== null && _d !== void 0 ? _d : null : null }));
                });
            },
            error: function (err) { return _this.toastError('No se pudieron cargar las cuentas', err); }
        });
        this.subs.push(s);
    };
    CatalogoCuentasComponent.prototype.createCuenta = function (payload) {
        var _this = this;
        var s = this.http.post(API, payload).subscribe({
            next: function () {
                _this.toastOk('Cuenta creada');
                _this.editOpen = false;
                _this.loadCuentas();
            },
            error: function (err) { return _this.handleHttpError(err, 'No se pudo crear la cuenta'); }
        });
        this.subs.push(s);
    };
    CatalogoCuentasComponent.prototype.updateCuenta = function (id, payload) {
        var _this = this;
        var s = this.http.put(API + "/" + id, payload).subscribe({
            next: function () {
                _this.toastOk('Cuenta actualizada');
                _this.editOpen = false;
                _this.loadCuentas();
            },
            error: function (err) { return _this.handleHttpError(err, 'No se pudo actualizar la cuenta'); }
        });
        this.subs.push(s);
    };
    CatalogoCuentasComponent.prototype.deleteCuenta = function (id) {
        var _this = this;
        var s = this.http["delete"](API + "/" + id).subscribe({
            next: function () {
                _this.toastOk('Cuenta eliminada');
                _this.closeConfirm();
                _this.loadCuentas();
            },
            error: function (err) { return _this.handleHttpError(err, 'No se pudo eliminar la cuenta'); }
        });
        this.subs.push(s);
    };
    // ====== HANDLERS CRUD-PANEL ======
    CatalogoCuentasComponent.prototype.onPrimary = function () {
        // Nueva cuenta
        this.editId = null;
        this.parentPreselectedId = null;
        this.modalTitle = 'Nueva cuenta';
        this.formCuenta = {
            codigo: '',
            nombre: '',
            ctaMayor: false,
            parentId: null
        };
        this.resetValidation();
        this.editOpen = true;
    };
    CatalogoCuentasComponent.prototype.onEdit = function (row) {
        var _a, _b;
        this.editId = row.id;
        this.parentPreselectedId = (_a = row.parentId) !== null && _a !== void 0 ? _a : null;
        this.modalTitle = "Editar cuenta: " + row.codigo;
        this.formCuenta = {
            codigo: row.codigo,
            nombre: row.nombre,
            ctaMayor: row.ctaMayor,
            parentId: (_b = row.parentId) !== null && _b !== void 0 ? _b : null
        };
        this.resetValidation();
        this.editOpen = true;
    };
    // Acepta tanto { id, row } como { action, row }
    CatalogoCuentasComponent.prototype.onRowAction = function (evt) {
        var _a;
        var id = (_a = evt === null || evt === void 0 ? void 0 : evt.id) !== null && _a !== void 0 ? _a : evt === null || evt === void 0 ? void 0 : evt.action;
        var row = evt === null || evt === void 0 ? void 0 : evt.row;
        if (!id || !row)
            return;
        if (id === 'edit')
            return this.onEdit(row);
        if (id === 'child') {
            if (!row.ctaMayor) {
                return this.toastWarn('Solo las cuentas mayor pueden tener subcuentas');
            }
            this.editId = null;
            this.parentPreselectedId = row.id;
            this.modalTitle = "Nueva subcuenta de " + row.codigo;
            this.formCuenta = {
                codigo: '',
                nombre: '',
                ctaMayor: false,
                parentId: row.id
            };
            this.resetValidation();
            this.editOpen = true;
            return;
        }
        if (id === 'delete') {
            this.confirmTitle = 'Eliminar cuenta';
            this.confirmMessage = "\u00BFDeseas eliminar la cuenta " + row.codigo + " - " + row.nombre + "?";
            this.confirmPayload = { type: 'delete', id: row.id };
            this.confirmOpen = true;
            return;
        }
    };
    // ====== VALIDACIÓN EN VIVO ======
    CatalogoCuentasComponent.prototype.resetValidation = function () {
        this.errors = {};
        this.touched = { codigo: false, nombre: false };
    };
    CatalogoCuentasComponent.prototype.validate = function (field) {
        var _this = this;
        // valida campo específico o ambos
        var check = function (f) {
            var _a;
            var val = ((_a = _this.formCuenta[f]) !== null && _a !== void 0 ? _a : '').toString().trim();
            if (!val)
                _this.errors[f] = f === 'codigo' ? 'El código es obligatorio' : 'El nombre es obligatorio';
            else
                _this.errors[f] = '';
        };
        if (!field) {
            check('codigo');
            check('nombre');
        }
        else {
            check(field);
        }
    };
    /** Llamar desde (ngModelChange) en los inputs para validar en tiempo real */
    CatalogoCuentasComponent.prototype.onFieldChange = function (field, value) {
        var v = (value !== null && value !== void 0 ? value : '').trimStart(); // evita espacios al inicio
        this.formCuenta[field] = v;
        this.touched[field] = true;
        this.validate(field);
    };
    // ====== MODAL: CUENTA ======
    CatalogoCuentasComponent.prototype.closeModal = function () { this.editOpen = false; };
    CatalogoCuentasComponent.prototype.cancelModal = function () { this.editOpen = false; };
    CatalogoCuentasComponent.prototype.confirmModal = function () {
        var _a, _b, _c;
        // Valida antes de enviar
        this.touched = { codigo: true, nombre: true };
        this.validate();
        if (!this.canSave) {
            var msg = this.errors.codigo || this.errors.nombre || 'Completa los campos obligatorios';
            return this.toastWarn(msg);
        }
        if (this.formCuenta.ctaMayor && this.formCuenta.parentId) {
            return this.toastWarn('Una cuenta mayor no debe tener cuenta padre');
        }
        var payload = {
            codigo: ((_a = this.formCuenta.codigo) !== null && _a !== void 0 ? _a : '').trim(),
            nombre: ((_b = this.formCuenta.nombre) !== null && _b !== void 0 ? _b : '').trim(),
            ctaMayor: !!this.formCuenta.ctaMayor,
            parentId: (_c = this.formCuenta.parentId) !== null && _c !== void 0 ? _c : null
        };
        if (this.editId == null)
            this.createCuenta(payload);
        else
            this.updateCuenta(this.editId, payload);
    };
    // ====== MODAL: CONFIRMACIÓN ======
    CatalogoCuentasComponent.prototype.closeConfirm = function () {
        this.confirmOpen = false;
        this.confirmPayload = null;
    };
    CatalogoCuentasComponent.prototype.cancelConfirm = function () { this.closeConfirm(); };
    CatalogoCuentasComponent.prototype.confirmProceed = function () {
        if (!this.confirmPayload)
            return this.closeConfirm();
        if (this.confirmPayload.type === 'delete') {
            return this.deleteCuenta(this.confirmPayload.id);
        }
        this.closeConfirm();
    };
    // ====== HELPERS UI ======
    CatalogoCuentasComponent.prototype.getParentOptions = function () {
        var excludeId = this.editId;
        return this.allCuentas.filter(function (c) { return c.id !== excludeId; });
    };
    CatalogoCuentasComponent.prototype.getCodigoPadre = function (id) {
        if (!id)
            return null;
        var c = this.allCuentas.find(function (x) { return x.id === id; });
        return c ? c.codigo : null;
    };
    CatalogoCuentasComponent.prototype.onSidebarToggle = function (open) { this.sidebarOpen = open; };
    CatalogoCuentasComponent.prototype.onTabChange = function (tabId) { this.activeTabId = tabId; };
    // ====== TOASTS & ERRORS ======
    CatalogoCuentasComponent.prototype.toastOk = function (msg) {
        this.vm = { open: true, title: 'Éxito', message: msg, type: 'success', autoCloseMs: 2800 };
    };
    CatalogoCuentasComponent.prototype.toastWarn = function (msg) {
        this.vm = { open: true, title: 'Atención', message: msg, type: 'warning', autoCloseMs: 3200 };
    };
    CatalogoCuentasComponent.prototype.toastError = function (msg, err) {
        this.vm = { open: true, title: 'Error', message: msg, type: 'error', autoCloseMs: 4000 };
    };
    CatalogoCuentasComponent.prototype.handleHttpError = function (err, fallbackMsg) {
        var _a, _b;
        if ((err === null || err === void 0 ? void 0 : err.status) === 409)
            return this.toastWarn('Ya existe una cuenta con ese código');
        if ((err === null || err === void 0 ? void 0 : err.status) === 404)
            return this.toastWarn('La cuenta no existe o fue eliminada');
        if ((err === null || err === void 0 ? void 0 : err.status) === 400) {
            var det = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.map(function (d) { return d.message; }).join('; ');
            return this.toastWarn(det || fallbackMsg);
        }
        this.toastError(fallbackMsg, err);
    };
    Object.defineProperty(CatalogoCuentasComponent.prototype, "filteredRows", {
        // 👉 lista filtrada (si el CrudPanel te manda el término)
        get: function () {
            var term = this.searchTerm.trim().toLowerCase();
            if (!term)
                return this.rows;
            return this.rows.filter(function (r) {
                var _a, _b;
                var nombre = ((_a = r === null || r === void 0 ? void 0 : r.nombre) !== null && _a !== void 0 ? _a : '').toLowerCase();
                var codigo = ((_b = r === null || r === void 0 ? void 0 : r.codigo) !== null && _b !== void 0 ? _b : '').toLowerCase();
                var padresArr = Array.isArray(r === null || r === void 0 ? void 0 : r.padreNombre)
                    ? r.padreNombre
                    : ((r === null || r === void 0 ? void 0 : r.padreNombre) ? [r.padreNombre] : []);
                var hitPadre = padresArr.some(function (p) { return p === null || p === void 0 ? void 0 : p.toLowerCase().includes(term); });
                return nombre.includes(term) || codigo.includes(term) || hitPadre;
            });
        },
        enumerable: false,
        configurable: true
    });
    CatalogoCuentasComponent.prototype.onSearch = function (term) {
        this.searchTerm = term !== null && term !== void 0 ? term : '';
    };
    // trackBy opcional para *ngFor de filas
    CatalogoCuentasComponent.prototype.trackById = function (index, item) {
        return item.id;
    };
    CatalogoCuentasComponent = __decorate([
        core_1.Component({
            selector: 'app-catalogo-cuentas',
            templateUrl: './catalogocuentas.component.html',
            styleUrls: ['./catalogocuentas.component.scss'],
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                http_1.HttpClientModule,
                sidebar_component_1.SidebarComponent,
                crud_panel_component_1.CrudPanelComponent,
                modal_component_1.ModalComponent,
                toast_message_component_component_1.ToastMessageComponent,
            ]
        })
    ], CatalogoCuentasComponent);
    return CatalogoCuentasComponent;
}());
exports.CatalogoCuentasComponent = CatalogoCuentasComponent;
