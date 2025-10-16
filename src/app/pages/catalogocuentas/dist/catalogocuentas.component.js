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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CatalogoCuentasComponent = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var XLSX = require("xlsx");
var file_saver_1 = require("file-saver");
var jspdf_1 = require("jspdf");
var jspdf_autotable_1 = require("jspdf-autotable");
var rxjs_1 = require("rxjs");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var crud_panel_component_1 = require("@app/components/crud-panel/crud-panel.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var API = 'http://localhost:3000/api/v1/cuentas';
var CatalogoCuentasComponent = /** @class */ (function () {
    function CatalogoCuentasComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.subs = [];
        this.sidebarOpen = true;
        this.title = 'Catálogo de Cuentas';
        this.tabs = [{ id: 'datos', label: 'Cuentas' }];
        this.activeTabId = 'datos';
        this.canEdit = true;
        this.primaryActionLabel = 'Nueva cuenta';
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
        this.errors = {};
        this.touched = { codigo: false, nombre: false };
        this.confirmOpen = false;
        this.confirmTitle = 'Confirmación';
        this.confirmMessage = '';
        this.confirmPayload = null;
        this.vm = { open: false, title: '', message: '', type: 'info', autoCloseMs: 3500 };
        // Search
        this.searchTerm = '';
    }
    Object.defineProperty(CatalogoCuentasComponent.prototype, "canSave", {
        get: function () {
            var _a, _b;
            return !!((_a = this.formCuenta.codigo) === null || _a === void 0 ? void 0 : _a.trim()) && !!((_b = this.formCuenta.nombre) === null || _b === void 0 ? void 0 : _b.trim());
        },
        enumerable: false,
        configurable: true
    });
    CatalogoCuentasComponent.prototype.ngOnInit = function () {
        this.loadCuentas();
    };
    CatalogoCuentasComponent.prototype.ngOnDestroy = function () {
        this.subs.forEach(function (s) { return s.unsubscribe(); });
    };
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
    CatalogoCuentasComponent.prototype.onFieldChange = function (field, value) {
        var v = (value !== null && value !== void 0 ? value : '').trimStart(); // evita espacios al inicio
        this.formCuenta[field] = v;
        this.touched[field] = true;
        this.validate(field);
    };
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
    // ================== EXPORTAR A EXCEL ==================
    CatalogoCuentasComponent.prototype.exportToExcel = function () {
        var exportData = this.filteredRows.map(function (r) {
            var _a, _b;
            return ({
                Código: r.codigo,
                Nombre: r.nombre,
                '¿Mayor?': r.ctaMayor ? 'Sí' : 'No',
                'Padre (Código)': (_a = r.padreCodigo) !== null && _a !== void 0 ? _a : '',
                'Padre (Nombre)': (_b = r.padreNombre) !== null && _b !== void 0 ? _b : ''
            });
        });
        var worksheet = XLSX.utils.json_to_sheet(exportData);
        var workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cuentas');
        var excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        file_saver_1.saveAs(blob, "catalogo_cuentas_" + new Date().toISOString().split('T')[0] + ".xlsx");
        this.toastOk('Catálogo exportado a Excel');
    };
    // ================== EXPORTAR A PDF ==================
    CatalogoCuentasComponent.prototype.exportToPDF = function () {
        var doc = new jspdf_1["default"]();
        doc.text('Catálogo de Cuentas', 14, 15);
        var tableData = this.filteredRows.map(function (r) {
            var _a, _b;
            return [
                r.codigo,
                r.nombre,
                r.ctaMayor ? 'Sí' : 'No',
                (_a = r.padreCodigo) !== null && _a !== void 0 ? _a : '',
                (_b = r.padreNombre) !== null && _b !== void 0 ? _b : '',
            ];
        });
        jspdf_autotable_1["default"](doc, {
            head: [['Código', 'Nombre', '¿Mayor?', 'Padre (Código)', 'Padre (Nombre)']],
            body: tableData,
            startY: 20
        });
        doc.save("catalogo_cuentas_" + new Date().toISOString().split('T')[0] + ".pdf");
        this.toastOk('Catálogo exportado a PDF');
    };
    CatalogoCuentasComponent.prototype.importFromExcel = function (event) {
        var _this = this;
        var file = event.target.files[0];
        if (!file)
            return;
        var reader = new FileReader();
        reader.onload = function (e) { return __awaiter(_this, void 0, void 0, function () {
            var data, workbook, sheetName, worksheet, rowsExcel, normalize, cuentas, codigoToId, _i, _a, c, created, _b, _c, c, parentId, created, err_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        data = new Uint8Array(e.target.result);
                        workbook = XLSX.read(data, { type: 'array' });
                        sheetName = workbook.SheetNames[0];
                        worksheet = workbook.Sheets[sheetName];
                        rowsExcel = XLSX.utils.sheet_to_json(worksheet);
                        normalize = function (str) { return (str !== null && str !== void 0 ? str : '').toString().trim(); };
                        cuentas = rowsExcel.map(function (r) { return ({
                            codigo: normalize(r['Código']),
                            nombre: normalize(r['Nombre']),
                            ctaMayor: normalize(r['¿Mayor?']) === 'Sí',
                            parentCodigo: normalize(r['Código Padre']) || null
                        }); });
                        codigoToId = new Map();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 10, , 11]);
                        _i = 0, _a = cuentas.filter(function (x) { return !x.parentCodigo; });
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        c = _a[_i];
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.http.post('http://localhost:3000/api/v1/cuentas', c))];
                    case 3:
                        created = _d.sent();
                        if (created === null || created === void 0 ? void 0 : created.id) {
                            codigoToId.set(c.codigo, created.id);
                        }
                        else {
                            console.warn('⚠️ No se devolvió ID para:', c);
                        }
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _b = 0, _c = cuentas.filter(function (x) { return x.parentCodigo; });
                        _d.label = 6;
                    case 6:
                        if (!(_b < _c.length)) return [3 /*break*/, 9];
                        c = _c[_b];
                        parentId = codigoToId.get(c.parentCodigo);
                        if (!parentId) {
                            console.warn("\u26A0\uFE0F Padre no encontrado para " + c.codigo + " (" + c.parentCodigo + ")");
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.http.post('http://localhost:3000/api/v1/cuentas', __assign(__assign({}, c), { parentId: parentId })))];
                    case 7:
                        created = _d.sent();
                        if (created === null || created === void 0 ? void 0 : created.id) {
                            codigoToId.set(c.codigo, created.id);
                        }
                        _d.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 6];
                    case 9:
                        // === 3️⃣ Refrescar la tabla ===
                        this.loadCuentas();
                        this.toastOk('Importación completada y jerarquía asociada correctamente.');
                        return [3 /*break*/, 11];
                    case 10:
                        err_1 = _d.sent();
                        console.error('❌ Error en importación:', err_1);
                        this.toastError('No se pudo completar la importación', err_1);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        }); };
        reader.readAsArrayBuffer(file);
    };
    CatalogoCuentasComponent.prototype.onSearch = function (term) {
        this.searchTerm = term !== null && term !== void 0 ? term : '';
    };
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
