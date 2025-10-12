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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EmpresaComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var crud_panel_component_1 = require("src/app/components/crud-panel/crud-panel.component");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var EmpresaComponent = /** @class */ (function () {
    function EmpresaComponent(empresaService, periodosService, auth, toast, ejerciciosService) {
        this.empresaService = empresaService;
        this.periodosService = periodosService;
        this.auth = auth;
        this.toast = toast;
        this.ejerciciosService = ejerciciosService;
        // }Layout
        this.sidebarOpen = true;
        // tablas
        this.title = 'Configuración de la Empresa';
        this.tabs = [
            { id: 'datos', label: 'Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
            { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },
        ];
        this.activeTabId = 'datos';
        // Empresa
        this.primaryActionLabel = 'Editar datos';
        this.columns = [
            { key: 'id', header: '#', width: '64px' },
            { key: 'razon_social', header: 'Razón social' },
            { key: 'rfc', header: 'RFC' },
            { key: 'domicilio_fiscal', header: 'Domicilio fiscal' },
            { key: 'telefono', header: 'Teléfono' },
            { key: 'correo_contacto', header: 'Correo de contacto' },
        ];
        this.rows = [];
        this.actions = [{ id: 'edit', label: 'Editar', tooltip: 'Editar' }];
        // Permisos
        this.canEdit = false;
        this.canDelete = false;
        // Modal empresa
        this.editOpen = false;
        this.modalTitle = 'Editar Empresa';
        this.modalSize = 'md';
        this.showClose = true;
        this.formEmpresa = {
            razon_social: '',
            rfc: '',
            domicilio_fiscal: '',
            telefono: '',
            correo_contacto: ''
        };
        // PERIODOS 
        this.primaryActionLabel2 = 'Nuevo período';
        this.columns2 = [
            { key: 'id_periodo', header: '#', width: '72px' },
            { key: 'tipo_periodo', header: 'Tipo' },
            { key: 'fecha_inicio', header: 'Inicio' },
            { key: 'fecha_fin', header: 'Fin' },
            { key: 'esta_abierto', header: 'Abierto' },
        ];
        this.periodos = [];
        this.actions2 = [
            { id: 'edit', label: 'Editar', tooltip: 'Editar' },
            { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
        ];
        // Modal período
        this.modalPeriodoOpen = false;
        this.modalPeriodoTitle = 'Crear período';
        this.formPeriodo = {
            tipo_periodo: 'MENSUAL',
            fecha_inicio: '',
            fecha_fin: '',
            esta_abierto: true
        };
        this.editPeriodoId = null;
        // controles de creación automática dentro del modal de período
        this.autoCreate = false;
        this.autoCreateTipo = 'MENSUAL';
        this.primaryActionLabel3 = 'Nuevo ejercicio';
        this.columns3 = [
            { key: 'id_ejercicio', header: '#', width: '72px' },
            { key: 'anio', header: 'Año' },
            { key: 'fecha_inicio', header: 'Inicio' },
            { key: 'fecha_fin', header: 'Fin' },
            { key: 'esta_abierto', header: 'Abierto' },
        ];
        this.ejercicios = [];
        this.actions3 = [
            { id: 'edit', label: 'Editar', tooltip: 'Editar' },
            { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
            { id: 'abrir', label: 'Abrir', tooltip: 'Marcar como abierto' },
            { id: 'cerrar', label: 'Cerrar', tooltip: 'Marcar como cerrado' },
            { id: 'select', label: 'Seleccionar', tooltip: 'Seleccionar ejercicio actual' },
        ];
        // Modal ejercicio
        this.modalEjercicioOpen = false;
        this.modalEjercicioTitle = 'Crear ejercicio';
        this.formEjercicio = {
            anio: new Date().getFullYear(),
            fecha_inicio: '',
            fecha_fin: '',
            esta_abierto: true
        };
        this.editEjercicioId = null;
        // Selección actual para periodos
        this.ejercicioSeleccionado = null;
        // Modal confirm
        this.confirmOpen = false;
        this.confirmTitle = 'Confirmar acción';
        this.confirmMessage = '';
        this.confirmKind = null;
        this.confirmPayload = null;
        // PARA FECHAS
        this.minDate = '';
        // GENERACIÓN AUTOMÁTICA DE PERÍODOS 
        this.genModalOpen = false;
        this.genTipo = 'MENSUAL';
        this.genIncluirCerrados = false;
        this.isGenerating = false;
    }
    // FECHAS 
    EmpresaComponent.prototype.pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    EmpresaComponent.prototype.toISO = function (d) { return d.getFullYear() + "-" + this.pad(d.getMonth() + 1) + "-" + this.pad(d.getDate()); };
    EmpresaComponent.prototype.todayLocal = function () { var now = new Date(); return new Date(now.getFullYear(), now.getMonth(), now.getDate()); };
    EmpresaComponent.prototype.parseISODateLocal = function (iso) { var _a = iso.split('-').map(Number), y = _a[0], m = _a[1], d = _a[2]; return new Date(y, (m !== null && m !== void 0 ? m : 1) - 1, d !== null && d !== void 0 ? d : 1); };
    EmpresaComponent.prototype.isPast = function (dateStr) { if (!dateStr)
        return false; var d = this.parseISODateLocal(dateStr); return d < this.todayLocal(); };
    EmpresaComponent.prototype.startOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth(), 1); };
    EmpresaComponent.prototype.endOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); };
    EmpresaComponent.prototype.startOfYear = function (d) { return new Date(d.getFullYear(), 0, 1); };
    EmpresaComponent.prototype.endOfYear = function (d) { return new Date(d.getFullYear(), 12, 0); };
    EmpresaComponent.prototype.addDays = function (d, days) { var r = new Date(d); r.setDate(r.getDate() + days); return r; };
    EmpresaComponent.prototype.startOfWeek = function (d) {
        var wd = d.getDay(); // 0=Dom, 1=Lun,----6=Sáb
        var diff = (wd === 0 ? -6 : 1 - wd); // llevar a lunes
        var res = new Date(d);
        res.setDate(d.getDate() + diff);
        return new Date(res.getFullYear(), res.getMonth(), res.getDate());
    };
    EmpresaComponent.prototype.computeCurrentPeriod = function (type, ref) {
        if (type === 'PERSONALIZADO')
            return null;
        var base = ref !== null && ref !== void 0 ? ref : this.todayLocal();
        switch (type) {
            case 'SEMANAL': return { start: this.startOfWeek(base), end: this.addDays(this.startOfWeek(base), 6) };
            case 'MENSUAL': return { start: this.startOfMonth(base), end: this.endOfMonth(base) };
            case 'ANUAL': return { start: this.startOfYear(base), end: this.endOfYear(base) };
        }
        return null;
    };
    EmpresaComponent.prototype.setDatesByType = function (type, referenceDate) {
        if (type === 'PERSONALIZADO')
            return;
        var range = this.computeCurrentPeriod(type, referenceDate !== null && referenceDate !== void 0 ? referenceDate : this.todayLocal());
        if (!range)
            return;
        this.formPeriodo.fecha_inicio = this.toISO(range.start);
        this.formPeriodo.fecha_fin = this.toISO(range.end);
    };
    // CICLO DE VIDA
    EmpresaComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.toast.state$.subscribe(function (s) { return _this.vm = s; });
        this.canEdit = this.auth.hasPermission('editar_empresa');
        this.canDelete = this.auth.hasPermission('eliminar_empresa');
        this.actions = __spreadArrays((this.canEdit ? [{ id: 'edit', tooltip: 'Editar Empresa' }] : []), (this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Empresa' }] : []));
        this.actions2 = __spreadArrays((this.canEdit ? [{ id: 'edit', tooltip: 'Editar Periodo' }] : []), (this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Periodo' }] : []));
        this.actions3 = __spreadArrays((this.canEdit ? [
            { id: 'edit', tooltip: 'Editar Ejercicio' },
            { id: 'abrir', tooltip: 'Marcar como abierto' },
            { id: 'cerrar', tooltip: 'Marcar como cerrado' },
        ] : []), (this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Ejercicio' }] : []));
        this.minDate = this.toISO(this.todayLocal());
        this.loadDataEmpresa();
    };
    EmpresaComponent.prototype.openSuccess = function (message) { this.toast.success(message, 'Éxito', 3000); };
    EmpresaComponent.prototype.openError = function (message, err) { if (err)
        console.error('[EmpresaComponent] Error:', err); this.toast.error(message, 'Error', 0); };
    EmpresaComponent.prototype.extractErrorMessage = function (err) {
        var _a;
        return ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || (typeof err === 'string' ? err : null);
    };
    EmpresaComponent.prototype.loadDataEmpresa = function () {
        var _this = this;
        this.empresaService.getEmpresa().subscribe({
            next: function (data) {
                var one = Array.isArray(data) ? data[0] : data;
                _this.rows = one ? [one] : [];
                if (_this.rows[0]) {
                    _this.loadPeriodos();
                    _this.loadEjercicios();
                    _this.restoreEjercicioSeleccionado();
                }
            },
            error: function (err) { var _a; return _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'Error al cargar los datos de la empresa.', 'Error', 0); }
        });
    };
    EmpresaComponent.prototype.onTabChange = function (id) {
        if (id === 'datos' || id === 'periodos')
            this.activeTabId = id;
        if (id === 'periodos')
            this.loadPeriodos();
    };
    // Editar empresa
    EmpresaComponent.prototype.onPrimary = function () {
        if (!this.canEdit)
            return this.openError('No tienes permisos para editar la empresa');
        var empresa = this.rows[0];
        if (!empresa)
            return this.openError('No hay datos de empresa para editar');
        this.formEmpresa = __assign({}, empresa);
        this.editOpen = true;
    };
    EmpresaComponent.prototype.onEdit = function (row) {
        if (!this.canEdit)
            return this.openError('No tienes permisos para editar');
        this.formEmpresa = __assign({}, row);
        this.editOpen = true;
    };
    EmpresaComponent.prototype.closeModal = function () { this.editOpen = false; };
    EmpresaComponent.prototype.cancelModal = function () { this.editOpen = false; };
    EmpresaComponent.prototype.confirmModal = function () {
        this.confirmTitle = 'Confirmar guardado';
        this.confirmMessage = '¿Deseas guardar los cambios de la empresa?';
        this.confirmKind = 'empresa-save';
        this.confirmPayload = null;
        this.confirmOpen = true;
    };
    // PERI
    EmpresaComponent.prototype.empresaId = function () {
        var _a;
        var e = this.rows[0];
        var id = ((_a = e === null || e === void 0 ? void 0 : e.id_empresa) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.id);
        return id !== null && id !== void 0 ? id : null;
    };
    EmpresaComponent.prototype.loadPeriodos = function () {
        var _this = this;
        var _a;
        var idEmp = this.empresaId();
        if (!idEmp)
            return;
        var idEj = (_a = this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio;
        this.periodosService.listByEmpresa(idEmp, idEj).subscribe({
            next: function (items) { return _this.periodos = items !== null && items !== void 0 ? items : []; },
            error: function (err) { return _this.openError('Error al cargar los períodos', err); }
        });
    };
    EmpresaComponent.prototype.onTipoPeriodoChange = function (newType) {
        this.formPeriodo.tipo_periodo = newType;
        if (newType === 'PERSONALIZADO' || this.autoCreate)
            return;
        var ref = this.formPeriodo.fecha_inicio
            ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
            : this.todayLocal();
        this.setDatesByType(newType, ref);
    };
    EmpresaComponent.prototype.onFechaInicioChange = function (newStartStr) {
        this.formPeriodo.fecha_inicio = newStartStr;
        if (this.autoCreate)
            return;
        var t = this.formPeriodo.tipo_periodo;
        if (t && t !== 'PERSONALIZADO') {
            var ref = this.parseISODateLocal(newStartStr);
            this.setDatesByType(t, ref);
        }
        else {
            if (this.isPast(newStartStr)) {
                var todayStr = this.minDate;
                this.formPeriodo.fecha_inicio = todayStr;
                this.openError('La fecha de inicio no puede ser pasada. Se ajustó a hoy.');
            }
            var fi = this.formPeriodo.fecha_inicio;
            var ff = this.formPeriodo.fecha_fin;
            if (ff && this.parseISODateLocal(ff) < this.parseISODateLocal(fi)) {
                this.formPeriodo.fecha_fin = fi;
            }
        }
    };
    EmpresaComponent.prototype.onFechaFinChange = function (newEndStr) {
        if (this.autoCreate)
            return;
        var t = this.formPeriodo.tipo_periodo;
        if (t && t !== 'PERSONALIZADO') {
            var ref = this.formPeriodo.fecha_inicio
                ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
                : this.todayLocal();
            this.setDatesByType(t, ref);
            return;
        }
        this.formPeriodo.fecha_fin = newEndStr;
        if (this.isPast(newEndStr)) {
            var todayStr = this.minDate;
            this.formPeriodo.fecha_fin = todayStr;
            this.openError('La fecha de fin no puede ser pasada. Se ajustó a hoy.');
        }
        var fi = this.formPeriodo.fecha_inicio;
        if (fi && this.parseISODateLocal(newEndStr) < this.parseISODateLocal(fi)) {
            this.formPeriodo.fecha_fin = fi;
            this.openError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        }
    };
    // Abrir creación de período
    EmpresaComponent.prototype.onPrimaryPeriodo = function () {
        var _a;
        if (!this.canEdit)
            return this.openError('No tienes permisos para crear períodos');
        if (!((_a = this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio)) {
            return this.openError('Selecciona primero un ejercicio contable.');
        }
        this.modalPeriodoTitle = 'Crear período';
        this.editPeriodoId = null;
        // Reset flags de auto
        this.autoCreate = false;
        this.autoCreateTipo = 'MENSUAL';
        // Valores por defecto para modo manual
        this.formPeriodo = { tipo_periodo: 'MENSUAL', fecha_inicio: '', fecha_fin: '', esta_abierto: true };
        this.setDatesByType('MENSUAL', this.todayLocal());
        this.modalPeriodoOpen = true;
    };
    EmpresaComponent.prototype.onPeriodoAction = function (evt) {
        var _a;
        switch (evt.action) {
            case 'edit':
                if (!this.canEdit)
                    return this.openError('No tienes permisos para editar períodos');
                this.modalPeriodoTitle = 'Editar período';
                this.editPeriodoId = (_a = evt.row.id_periodo) !== null && _a !== void 0 ? _a : null;
                this.autoCreate = false; // edición siempre manual
                this.formPeriodo = __assign({}, evt.row);
                this.modalPeriodoOpen = true;
                break;
            case 'delete':
                if (!this.canDelete)
                    return this.openError('No tienes permisos para eliminar períodos');
                this.confirmTitle = 'Confirmar eliminación';
                this.confirmMessage = "\u00BFEliminar el per\u00EDodo del " + evt.row.fecha_inicio + " al " + evt.row.fecha_fin + "? Esta acci\u00F3n no se puede deshacer.";
                this.confirmKind = 'periodo-delete';
                this.confirmPayload = { id_periodo: evt.row.id_periodo };
                this.confirmOpen = true;
                break;
            default:
                this.openError("Acci\u00F3n no soportada: " + evt.action);
        }
    };
    // Cierre modal período
    EmpresaComponent.prototype.closePeriodoModal = function () { this.modalPeriodoOpen = false; };
    EmpresaComponent.prototype.cancelPeriodoModal = function () { this.modalPeriodoOpen = false; };
    // Confirmación antes de guardar período
    EmpresaComponent.prototype.confirmPeriodoModal = function () {
        var _a;
        // Flujo especial: crear automáticamente todos los periodos del ejercicio
        if (this.autoCreate && !this.editPeriodoId) {
            if (!((_a = this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio)) {
                return this.openError('Selecciona un ejercicio contable.');
            }
            this.modalPeriodoOpen = false; // cerrar el modal
            this.generatePeriodsForSelectedExercise(this.autoCreateTipo); // disparar generación
            return;
        }
        // Validación modo manual
        if (!this.formPeriodo.tipo_periodo || !this.formPeriodo.fecha_inicio || !this.formPeriodo.fecha_fin) {
            return this.openError('Completa tipo de período, fecha de inicio y fin.');
        }
        var t = this.formPeriodo.tipo_periodo;
        if (t === 'PERSONALIZADO' &&
            (this.isPast(this.formPeriodo.fecha_inicio) || this.isPast(this.formPeriodo.fecha_fin))) {
            return this.openError('Las fechas no pueden ser pasadas.');
        }
        if (this.parseISODateLocal(this.formPeriodo.fecha_fin) < this.parseISODateLocal(this.formPeriodo.fecha_inicio)) {
            return this.openError('La fecha de fin no puede ser anterior a la de inicio.');
        }
        var creando = !this.editPeriodoId;
        this.confirmTitle = creando ? 'Confirmar creación' : 'Confirmar actualización';
        this.confirmMessage = creando
            ? "\u00BFCrear el per\u00EDodo " + this.formPeriodo.tipo_periodo + " del " + this.formPeriodo.fecha_inicio + " al " + this.formPeriodo.fecha_fin + "?"
            : "\u00BFGuardar los cambios del per\u00EDodo del " + this.formPeriodo.fecha_inicio + " al " + this.formPeriodo.fecha_fin + "?";
        this.confirmKind = 'periodo-save';
        this.confirmPayload = null;
        this.confirmOpen = true;
    };
    // EJERCICIOS: lógica de almacenamiento local de selección
    EmpresaComponent.prototype.storageKey = function () {
        var idEmp = this.empresaId();
        return idEmp ? "ejercicio_seleccionado:" + idEmp : null;
    };
    EmpresaComponent.prototype.saveEjercicioSeleccionado = function (ej) {
        var key = this.storageKey();
        if (!key)
            return;
        if (ej)
            localStorage.setItem(key, JSON.stringify(ej));
        else
            localStorage.removeItem(key);
    };
    EmpresaComponent.prototype.restoreEjercicioSeleccionado = function () {
        var key = this.storageKey();
        if (!key)
            return;
        var raw = localStorage.getItem(key);
        this.ejercicioSeleccionado = raw ? JSON.parse(raw) : null;
    };
    Object.defineProperty(EmpresaComponent.prototype, "ejercicioSeleccionadoLabel", {
        get: function () {
            var ej = this.ejercicioSeleccionado;
            return ej ? "Ejercicio seleccionado: " + ej.anio : 'Sin ejercicio seleccionado';
        },
        enumerable: false,
        configurable: true
    });
    EmpresaComponent.prototype.loadEjercicios = function () {
        var _this = this;
        var idEmp = this.empresaId();
        if (!idEmp)
            return;
        this.ejerciciosService.listByEmpresa(idEmp).subscribe({
            next: function (items) { return _this.ejercicios = items !== null && items !== void 0 ? items : []; },
            error: function (err) { return _this.openError('Error al cargar los ejercicios', err); }
        });
    };
    // Abrir creación de ejercicio
    EmpresaComponent.prototype.onPrimaryEjercicio = function () {
        if (!this.canEdit)
            return this.openError('No tienes permisos para crear ejercicios');
        this.modalEjercicioTitle = 'Crear ejercicio';
        this.editEjercicioId = null;
        var y = new Date().getFullYear();
        var fi = this.toISO(this.startOfYear(new Date(y, 0, 1)));
        var ff = this.toISO(this.endOfYear(new Date(y, 0, 1)));
        this.formEjercicio = {
            anio: y,
            fecha_inicio: fi,
            fecha_fin: ff,
            esta_abierto: true,
            id_empresa: this.empresaId()
        };
        this.modalEjercicioOpen = true;
    };
    EmpresaComponent.prototype.onEjercicioAction = function (evt) {
        var _a;
        switch (evt.action) {
            case 'edit':
                if (!this.canEdit)
                    return this.openError('No tienes permisos para editar ejercicios');
                this.modalEjercicioTitle = 'Editar ejercicio';
                this.editEjercicioId = (_a = evt.row.id_ejercicio) !== null && _a !== void 0 ? _a : null;
                this.formEjercicio = __assign({}, evt.row);
                this.modalEjercicioOpen = true;
                break;
            case 'delete':
                if (!this.canDelete)
                    return this.openError('No tienes permisos para eliminar ejercicios');
                this.confirmTitle = 'Confirmar eliminación';
                this.confirmMessage = "\u00BFEliminar el ejercicio " + evt.row.anio + "? Esta acci\u00F3n no se puede deshacer.";
                this.confirmKind = 'ejercicio-delete';
                this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
                this.confirmOpen = true;
                break;
            case 'abrir':
                if (!this.canEdit)
                    return this.openError('No tienes permisos para abrir ejercicios');
                this.confirmTitle = 'Confirmar apertura';
                this.confirmMessage = "\u00BFMarcar como ABIERTO el ejercicio " + evt.row.anio + "?";
                this.confirmKind = 'ejercicio-abrir';
                this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
                this.confirmOpen = true;
                break;
            case 'cerrar':
                if (!this.canEdit)
                    return this.openError('No tienes permisos para cerrar ejercicios');
                this.confirmTitle = 'Confirmar cierre';
                this.confirmMessage = "\u00BFMarcar como CERRADO el ejercicio " + evt.row.anio + "?";
                this.confirmKind = 'ejercicio-cerrar';
                this.confirmPayload = { id_ejercicio: evt.row.id_ejercicio };
                this.confirmOpen = true;
                break;
            case 'select':
                this.setEjercicioSeleccionado(evt.row);
                this.openSuccess("Seleccionado ejercicio " + evt.row.anio + ".");
                break;
            default:
                this.openError("Acci\u00F3n no soportada: " + evt.action);
        }
    };
    EmpresaComponent.prototype.setEjercicioSeleccionado = function (ej) {
        this.ejercicioSeleccionado = ej;
        this.saveEjercicioSeleccionado(ej);
    };
    // Guardar ejercicio desde modal
    EmpresaComponent.prototype.confirmEjercicioModal = function () {
        var idEmp = this.empresaId();
        if (!idEmp)
            return this.openError('No hay empresa seleccionada.');
        var f = this.formEjercicio;
        if (!(f === null || f === void 0 ? void 0 : f.anio) || !f.fecha_inicio || !f.fecha_fin) {
            return this.openError('Completa año, fecha de inicio y fin.');
        }
        var fi = this.parseISODateLocal(f.fecha_inicio);
        var ff = this.parseISODateLocal(f.fecha_fin);
        if (ff < fi)
            return this.openError('La fecha de fin no puede ser anterior a la de inicio.');
        var creando = !this.editEjercicioId;
        this.confirmTitle = creando ? 'Confirmar creación' : 'Confirmar actualización';
        this.confirmMessage = creando
            ? "\u00BFCrear el ejercicio " + f.anio + " (" + f.fecha_inicio + " a " + f.fecha_fin + ")?"
            : "\u00BFGuardar cambios del ejercicio " + f.anio + "?";
        this.confirmKind = 'ejercicio-save';
        this.confirmPayload = null;
        this.confirmOpen = true;
    };
    // Cierre modal ejercicio
    EmpresaComponent.prototype.closeEjercicioModal = function () { this.modalEjercicioOpen = false; };
    EmpresaComponent.prototype.cancelEjercicioModal = function () { this.modalEjercicioOpen = false; };
    EmpresaComponent.prototype.closeConfirm = function () { this.confirmOpen = false; this.confirmKind = null; this.confirmPayload = null; };
    EmpresaComponent.prototype.cancelConfirm = function () { this.closeConfirm(); };
    EmpresaComponent.prototype.confirmProceed = function () {
        var _this = this;
        var _a, _b, _c, _d;
        var kind = this.confirmKind;
        var payload = this.confirmPayload;
        this.closeConfirm();
        switch (kind) {
            case 'empresa-save': {
                var id = (_a = this.formEmpresa.id_empresa) !== null && _a !== void 0 ? _a : this.formEmpresa.id;
                if (id == null)
                    return this.openError('No se encontró el identificador de la empresa');
                var _e = this.formEmpresa, _omit1 = _e.id, _omit2 = _e.id_empresa, payloadEmpresa = __rest(_e, ["id", "id_empresa"]);
                this.empresaService.updateEmpresa(id, payloadEmpresa).subscribe({
                    next: function () {
                        var _a;
                        _this.rows = [__assign(__assign({}, ((_a = _this.rows[0]) !== null && _a !== void 0 ? _a : {})), _this.formEmpresa)];
                        _this.editOpen = false;
                        _this.openSuccess('Datos de la empresa actualizados correctamente.');
                    },
                    error: function (err) { return _this.openError('No se pudo actualizar la empresa', err); }
                });
                break;
            }
            case 'periodo-save': {
                var idEmp = this.empresaId();
                if (!idEmp)
                    return this.openError('No hay empresa seleccionada.');
                var ejSel = this.ejercicioSeleccionado;
                if (!(ejSel === null || ejSel === void 0 ? void 0 : ejSel.id_ejercicio)) {
                    return this.openError('Selecciona un ejercicio contable antes de crear/editar períodos.');
                }
                var payloadPeriodo = {
                    id_empresa: idEmp,
                    id_ejercicio: ejSel.id_ejercicio,
                    tipo_periodo: this.formPeriodo.tipo_periodo,
                    fecha_inicio: this.formPeriodo.fecha_inicio,
                    fecha_fin: this.formPeriodo.fecha_fin,
                    esta_abierto: (_b = this.formPeriodo.esta_abierto) !== null && _b !== void 0 ? _b : true,
                    periodo_daterange: undefined
                };
                var req$ = this.editPeriodoId
                    ? this.periodosService.update(this.editPeriodoId, payloadPeriodo)
                    : this.periodosService.create(payloadPeriodo);
                req$.subscribe({
                    next: function (saved) {
                        _this.modalPeriodoOpen = false;
                        if (_this.editPeriodoId) {
                            _this.periodos = _this.periodos.map(function (p) { return p.id_periodo === _this.editPeriodoId ? __assign(__assign({}, p), saved) : p; });
                            _this.openSuccess('Período actualizado.');
                        }
                        else {
                            _this.periodos = __spreadArrays(_this.periodos, [saved]);
                            _this.openSuccess('Período creado.');
                        }
                    },
                    error: function (err) { return _this.openError('No se pudo guardar el período', err); }
                });
                break;
            }
            case 'periodo-delete': {
                var idp_1 = payload === null || payload === void 0 ? void 0 : payload.id_periodo;
                if (!idp_1)
                    return this.openError('No se encontró el identificador del período.');
                this.periodosService["delete"](idp_1).subscribe({
                    next: function () {
                        _this.periodos = _this.periodos.filter(function (p) { return p.id_periodo !== idp_1; });
                        _this.openSuccess('Período eliminado.');
                    },
                    error: function (err) { return _this.openError('No se pudo eliminar el período', err); }
                });
                break;
            }
            case 'ejercicio-save': {
                var idEmp = this.empresaId();
                if (!idEmp)
                    return this.openError('No hay empresa seleccionada.');
                var payloadEj = {
                    id_empresa: idEmp,
                    anio: Number(this.formEjercicio.anio),
                    fecha_inicio: this.formEjercicio.fecha_inicio,
                    fecha_fin: this.formEjercicio.fecha_fin,
                    esta_abierto: (_c = this.formEjercicio.esta_abierto) !== null && _c !== void 0 ? _c : true,
                    id_ejercicio: (_d = this.editEjercicioId) !== null && _d !== void 0 ? _d : undefined
                };
                var req$ = this.editEjercicioId
                    ? this.ejerciciosService.update(this.editEjercicioId, payloadEj)
                    : this.ejerciciosService.create(payloadEj);
                req$.subscribe({
                    next: function (saved) {
                        var _a;
                        _this.modalEjercicioOpen = false;
                        if (_this.editEjercicioId) {
                            _this.ejercicios = _this.ejercicios.map(function (e) { return e.id_ejercicio === _this.editEjercicioId ? __assign(__assign({}, e), saved) : e; });
                            if (((_a = _this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio) === _this.editEjercicioId) {
                                _this.setEjercicioSeleccionado(saved);
                            }
                            _this.openSuccess('Ejercicio actualizado.');
                        }
                        else {
                            _this.ejercicios = __spreadArrays(_this.ejercicios, [saved]);
                            _this.setEjercicioSeleccionado(saved);
                            _this.openSuccess('Ejercicio creado.');
                        }
                    },
                    error: function (err) { return _this.openError('No se pudo guardar el ejercicio', err); }
                });
                break;
            }
            case 'ejercicio-delete': {
                var id_1 = payload === null || payload === void 0 ? void 0 : payload.id_ejercicio;
                if (!id_1)
                    return this.openError('No se encontró el identificador del ejercicio.');
                this.ejerciciosService["delete"](id_1).subscribe({
                    next: function () {
                        var _a;
                        _this.ejercicios = _this.ejercicios.filter(function (e) { return e.id_ejercicio !== id_1; });
                        if (((_a = _this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio) === id_1)
                            _this.setEjercicioSeleccionado(null);
                        _this.openSuccess('Ejercicio eliminado.');
                    },
                    error: function (err) { return _this.openError('No se pudo eliminar el ejercicio', err); }
                });
                break;
            }
            case 'ejercicio-abrir': {
                var id_2 = payload === null || payload === void 0 ? void 0 : payload.id_ejercicio;
                if (!id_2)
                    return this.openError('No se encontró el identificador del ejercicio.');
                this.ejerciciosService.abrir(id_2).subscribe({
                    next: function (res) {
                        var _a;
                        _this.ejercicios = _this.ejercicios.map(function (e) { return e.id_ejercicio === id_2 ? __assign(__assign({}, e), res) : e; });
                        if (((_a = _this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio) === id_2)
                            _this.setEjercicioSeleccionado(res);
                        _this.openSuccess('Ejercicio marcado como ABIERTO.');
                    },
                    error: function (err) { return _this.openError('No se pudo abrir el ejercicio', err); }
                });
                break;
            }
            case 'ejercicio-cerrar': {
                var id_3 = payload === null || payload === void 0 ? void 0 : payload.id_ejercicio;
                if (!id_3)
                    return this.openError('No se encontró el identificador del ejercicio.');
                this.ejerciciosService.cerrar(id_3).subscribe({
                    next: function (res) {
                        var _a;
                        _this.ejercicios = _this.ejercicios.map(function (e) { return e.id_ejercicio === id_3 ? __assign(__assign({}, e), res) : e; });
                        if (((_a = _this.ejercicioSeleccionado) === null || _a === void 0 ? void 0 : _a.id_ejercicio) === id_3)
                            _this.setEjercicioSeleccionado(res);
                        _this.openSuccess('Ejercicio marcado como CERRADO.');
                    },
                    error: function (err) { return _this.openError('No se pudo cerrar el ejercicio', err); }
                });
                break;
            }
        }
    };
    EmpresaComponent.prototype.onRowAction = function (evt) {
        if (evt.action === 'edit')
            return this.onEdit(evt.row);
        this.openError("Acci\u00F3n no soportada: " + evt.action);
    };
    EmpresaComponent.prototype.onSidebarToggle = function (open) { this.sidebarOpen = open; };
    // Abrir gestor de ejercicios
    EmpresaComponent.prototype.onOpenEjercicioManager = function () {
        this.onPrimaryEjercicio();
    };
    EmpresaComponent.prototype.ensureEjercicioSeleccionado = function () {
        var ej = this.ejercicioSeleccionado;
        if (!(ej === null || ej === void 0 ? void 0 : ej.id_ejercicio)) {
            this.openError('Selecciona un ejercicio contable antes de generar períodos.');
            throw new Error('No exercise selected');
        }
        return ej;
    };
    EmpresaComponent.prototype.generatePeriodsForSelectedExercise = function (tipo) {
        if (tipo === void 0) { tipo = 'MENSUAL'; }
        return __awaiter(this, void 0, void 0, function () {
            var ej, idEmp;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    ej = this.ensureEjercicioSeleccionado();
                }
                catch (_b) {
                    return [2 /*return*/];
                }
                idEmp = this.empresaId();
                if (!idEmp) {
                    this.openError('No hay empresa seleccionada.');
                    return [2 /*return*/];
                }
                this.isGenerating = true;
                this.openSuccess("Generando per\u00EDodos " + tipo.toLowerCase() + "...");
                this.periodosService.generate(ej.id_ejercicio, tipo).subscribe({
                    next: function (periodosGenerados) {
                        _this.loadPeriodos();
                        var n = Array.isArray(periodosGenerados) ? periodosGenerados.length : undefined;
                        _this.openSuccess(n != null
                            ? "Per\u00EDodos " + tipo.toLowerCase() + " generados: " + n + "."
                            : "Per\u00EDodos " + tipo.toLowerCase() + " generados correctamente.");
                    },
                    error: function (err) {
                        _this.openError('No se pudieron generar los períodos.', err);
                    },
                    complete: function () {
                        _this.isGenerating = false;
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    EmpresaComponent.prototype.openGenerarPeriodos = function (tipo) {
        if (tipo === void 0) { tipo = 'MENSUAL'; }
        this.genTipo = tipo;
        this.generatePeriodsForSelectedExercise(tipo);
    };
    EmpresaComponent = __decorate([
        core_1.Component({
            selector: 'app-empresa',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, crud_panel_component_1.CrudPanelComponent, sidebar_component_1.SidebarComponent, modal_component_1.ModalComponent, toast_message_component_component_1.ToastMessageComponent],
            templateUrl: './empresa.component.html',
            styleUrls: ['./empresa.component.scss']
        })
    ], EmpresaComponent);
    return EmpresaComponent;
}());
exports.EmpresaComponent = EmpresaComponent;
