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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PolizaEditarComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var modal_seleccion_cuenta_component_1 = require("@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component");
var rxjs_1 = require("rxjs");
var PolizaEditarComponent = /** @class */ (function () {
    function PolizaEditarComponent(route, http, apiSvc, cuentasSvc) {
        var _this = this;
        this.route = route;
        this.http = http;
        this.apiSvc = apiSvc;
        this.cuentasSvc = cuentasSvc;
        // ===== Config/API =====
        this.apiBase = 'http://localhost:3000/api/v1';
        // ===== Estado general =====
        this.sidebarOpen = true;
        this.loading = true;
        this.errorMsg = '';
        this.updating = false;
        // ===== UI/Toast =====
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        // ===== Usuario =====
        this.currentUser = null;
        // ===== Ejercicios/Periodos =====
        this.ejercicioActual = null;
        this.ejercicios = [];
        this.allPeriodos = [];
        this.periodos = [];
        this.compareById = function (a, b) { return a && b && a.id_periodo === b.id_periodo; };
        // ===== Catálogos =====
        this.tiposPoliza = [];
        this.centros = [];
        // ===== Centros de costo =====
        this.centrosCosto = [];
        this.centrosCostoMap = new Map();
        // ===== Póliza =====
        this.poliza = { movimientos: [] };
        // ===== Cuentas (typeahead por fila) =====
        this.cuentas = [];
        this.cuentasMap = new Map();
        this.cuentasFiltradas = [];
        this.cuentaOpenIndex = null;
        // ===== Modal de selección de cuenta =====
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
        // ===== CFDI =====
        this.xmlMovimientoIndex = null;
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        this.cfdiOptions = [];
        this.cuentasOrdenadas = [];
        this.nivelById = new Map();
        // madal de confirmacion para eliminar movimiento
        this.confirmOpen = false;
        this.confirmTitle = 'Eliminar movimiento';
        this.confirmMessage = '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.';
        this.confirmIndex = null;
        this.deletingIndexSet = new Set();
        this.onToastClosed = function () { _this.toast.open = false; };
    }
    Object.defineProperty(PolizaEditarComponent.prototype, "api", {
        get: function () { return this.apiSvc; },
        enumerable: false,
        configurable: true
    });
    // =========================================================
    // Init
    // =========================================================
    PolizaEditarComponent.prototype.ngOnInit = function () {
        this.cargarCatalogosBase(); // Tipos y Centros
        this.getCentros(); // Centros de costo
        this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(this.id_poliza)) {
            this.showToast({ type: 'error', title: 'Error', message: 'ID de póliza inválido.' });
            this.loading = false;
            return;
        }
        // Orden recomendado: periodos -> ejercicio -> póliza -> cuentas/usuario -> CFDI
        this.cargarPeriodosAll();
        this.cargarEjercicioActivo();
        this.cargarPoliza(this.id_poliza);
        this.cargarCuentas();
        this.cargarUsuarioActual();
        this.cargarCfdiRecientes();
    };
    PolizaEditarComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    // =========================================================
    // Catálogos base
    // =========================================================
    PolizaEditarComponent.prototype.cargarCatalogosBase = function () {
        var _this = this;
        // Tipos de póliza
        this.http.get(this.apiBase + "/tipo-poliza").subscribe({
            next: function (r) {
                var arr = _this.normalizeList(r);
                _this.tiposPoliza = arr.map(function (t) {
                    var _a, _b, _c, _d, _f;
                    return ({
                        id_tipopoliza: Number((_b = (_a = t.id_tipopoliza) !== null && _a !== void 0 ? _a : t.id) !== null && _b !== void 0 ? _b : t.ID),
                        nombre: String((_f = (_d = (_c = t.nombre) !== null && _c !== void 0 ? _c : t.descripcion) !== null && _d !== void 0 ? _d : t.NOMBRE) !== null && _f !== void 0 ? _f : 'Tipo')
                    });
                });
            },
            error: function (e) { return console.error('Tipos de póliza:', e); }
        });
        // Centros
        this.http.get(this.apiBase + "/centros").subscribe({
            next: function (r) {
                var arr = _this.normalizeList(r);
                _this.centros = arr.map(function (c) {
                    var _a, _b, _c, _d, _f, _g, _h;
                    var id = Number((_b = (_a = c.id_centro) !== null && _a !== void 0 ? _a : c.id) !== null && _b !== void 0 ? _b : c.ID);
                    var serie = String((_f = (_d = (_c = c.serie_venta) !== null && _c !== void 0 ? _c : c.serie) !== null && _d !== void 0 ? _d : c.codigo) !== null && _f !== void 0 ? _f : '').trim();
                    var nombre = String((_h = (_g = c.nombre) !== null && _g !== void 0 ? _g : c.descripcion) !== null && _h !== void 0 ? _h : '').trim();
                    var etiqueta = serie && nombre ? serie + " \u2014 " + nombre : (serie || nombre || "Centro " + id);
                    return { id_centro: id, nombre: etiqueta };
                });
            },
            error: function (e) { return console.error('Centros:', e); }
        });
    };
    // =========================================================
    // Ejercicio / Periodos
    // =========================================================
    PolizaEditarComponent.prototype.cargarEjercicioActivo = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getEjercicioActivo ||
            svc.fetchEjercicioActivo ||
            svc.getEjercicio ||
            svc.fetchEjercicio ||
            svc.listEjercicios ||
            svc.getEjercicios;
        if (typeof fn !== 'function') {
            console.warn('⚠ No existe método de API para Ejercicio.');
            this.ejercicioActual = null;
            this.ejercicios = [];
            return;
        }
        var isList = (fn === svc.listEjercicios || fn === svc.getEjercicios);
        fn.call(svc).subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var items = isList ? _this.normalizeList(r) : [r];
                _this.ejercicios = items
                    .map(function (e) { return _this.normalizeEjercicio(e); })
                    .filter(function (e) { return !!e; })
                    .filter(function (e) {
                    var activoFlag = e.activo === true || e.activo === 1 || e.activo === '1';
                    var hoy = _this.todayISO();
                    var fi = _this.fmtDate(e.fecha_inicio);
                    var ff = _this.fmtDate(e.fecha_fin);
                    var dentroDeFechas = !!(fi && ff && fi <= hoy && hoy <= ff && fi !== '—' && ff !== '—');
                    return activoFlag || dentroDeFechas;
                });
                var elegido = (_b = (_a = items.find(function (x) { return x === null || x === void 0 ? void 0 : x.is_selected; })) !== null && _a !== void 0 ? _a : items.find(function (x) {
                    var _a, _b;
                    var fi = _this.fmtDate((_a = x === null || x === void 0 ? void 0 : x.fecha_inicio) !== null && _a !== void 0 ? _a : x === null || x === void 0 ? void 0 : x.inicio);
                    var ff = _this.fmtDate((_b = x === null || x === void 0 ? void 0 : x.fecha_fin) !== null && _b !== void 0 ? _b : x === null || x === void 0 ? void 0 : x.fin);
                    var hoy = _this.todayISO();
                    return fi && ff && fi !== '—' && ff !== '—' && fi <= hoy && hoy <= ff;
                })) !== null && _b !== void 0 ? _b : items[0];
                _this.ejercicioActual = _this.normalizeEjercicio(elegido);
                _this.ejercicioActualId = Number((_d = (_c = _this.ejercicioActual) === null || _c === void 0 ? void 0 : _c.id_ejercicio) !== null && _d !== void 0 ? _d : NaN);
                _this.applyPeriodoFilter();
            },
            error: function (err) {
                console.error('❌ Error al cargar ejercicio:', err);
                _this.ejercicioActual = null;
                _this.ejercicios = [];
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudo cargar el ejercicio actual.' });
            }
        });
    };
    PolizaEditarComponent.prototype.esPosteable = function (c) {
        var v = c === null || c === void 0 ? void 0 : c.posteable;
        if (typeof v === 'boolean')
            return v;
        if (typeof v === 'number')
            return v === 1;
        if (typeof v === 'string')
            return v === '1' || v.toLowerCase() === 'true';
        return false;
    };
    PolizaEditarComponent.prototype.onEjercicioSeleccionado = function (id) {
        var ejercicioId = Number(id);
        var seleccionado = this.ejercicios.find(function (e) { return Number(e.id_ejercicio) === ejercicioId; });
        if (seleccionado) {
            this.ejercicioActual = seleccionado;
            this.ejercicioActualId = ejercicioId;
            this.guardarEjercicioSeleccionado(ejercicioId);
            this.applyPeriodoFilter();
        }
    };
    PolizaEditarComponent.prototype.guardarEjercicioSeleccionado = function (id_ejercicio) {
        var _this = this;
        var svc = this.api;
        if (typeof svc.selectEjercicio !== 'function') {
            console.warn('⚠ No hay método API selectEjercicio(). Se continúa sin persistir selección.');
        }
        else {
            svc.selectEjercicio(id_ejercicio).subscribe({
                next: function () { return _this.showToast({
                    type: 'success',
                    title: 'Ejercicio actualizado',
                    message: "Se guard\u00F3 el ejercicio " + id_ejercicio + " como activo."
                }); },
                error: function (err) {
                    console.error('❌ Error al guardar ejercicio seleccionado:', err);
                    _this.showToast({ type: 'error', title: 'Error', message: 'No se pudo actualizar el ejercicio seleccionado.' });
                }
            });
        }
    };
    PolizaEditarComponent.prototype.cargarPeriodosAll = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getPeriodos || svc.listPeriodos || null;
        if (typeof fn === 'function') {
            fn.call(svc).subscribe({
                next: function (r) {
                    var items = _this.normalizeList(r);
                    _this.allPeriodos = items.map(function (p) {
                        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                        return ({
                            id_periodo: Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID),
                            id_ejercicio: _this.toNumOrNull((_g = (_f = (_d = (_c = p.id_ejercicio) !== null && _c !== void 0 ? _c : p.ejercicio_id) !== null && _d !== void 0 ? _d : p.ejercicio) !== null && _f !== void 0 ? _f : p.idEjercicio) !== null && _g !== void 0 ? _g : p.ID_EJERCICIO),
                            fecha_inicio: _this.fmtDate((_l = (_k = (_j = (_h = p.fecha_inicio) !== null && _h !== void 0 ? _h : p.fechaInicio) !== null && _j !== void 0 ? _j : p.inicio) !== null && _k !== void 0 ? _k : p.start_date) !== null && _l !== void 0 ? _l : p.fecha_ini),
                            fecha_fin: _this.fmtDate((_q = (_p = (_o = (_m = p.fecha_fin) !== null && _m !== void 0 ? _m : p.fechaFin) !== null && _o !== void 0 ? _o : p.fin) !== null && _p !== void 0 ? _p : p.end_date) !== null && _q !== void 0 ? _q : p.fecha_fin),
                            _raw: p
                        });
                    });
                    _this.applyPeriodoFilter();
                },
                error: function (err) {
                    console.error('Periodos(svc):', err);
                    _this.cargarPeriodosAllHttp();
                }
            });
            return;
        }
        this.cargarPeriodosAllHttp();
    };
    PolizaEditarComponent.prototype.cargarPeriodosAllHttp = function () {
        var _this = this;
        this.http.get(this.apiBase + "/periodos").subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.allPeriodos = items.map(function (p) {
                    var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                    return ({
                        id_periodo: Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID),
                        id_ejercicio: _this.toNumOrNull((_g = (_f = (_d = (_c = p.id_ejercicio) !== null && _c !== void 0 ? _c : p.ejercicio_id) !== null && _d !== void 0 ? _d : p.ejercicio) !== null && _f !== void 0 ? _f : p.idEjercicio) !== null && _g !== void 0 ? _g : p.ID_EJERCICIO),
                        fecha_inicio: _this.fmtDate((_l = (_k = (_j = (_h = p.fecha_inicio) !== null && _h !== void 0 ? _h : p.fechaInicio) !== null && _j !== void 0 ? _j : p.inicio) !== null && _k !== void 0 ? _k : p.start_date) !== null && _l !== void 0 ? _l : p.fecha_ini),
                        fecha_fin: _this.fmtDate((_q = (_p = (_o = (_m = p.fecha_fin) !== null && _m !== void 0 ? _m : p.fechaFin) !== null && _o !== void 0 ? _o : p.fin) !== null && _p !== void 0 ? _p : p.end_date) !== null && _q !== void 0 ? _q : p.fecha_fin),
                        _raw: p
                    });
                });
                _this.applyPeriodoFilter();
            },
            error: function (e) { return console.error('Periodos(http):', e); }
        });
    };
    PolizaEditarComponent.prototype.applyPeriodoFilter = function () {
        var _a, _b, _c;
        if (!Array.isArray(this.allPeriodos) || this.allPeriodos.length === 0) {
            this.periodos = [];
            return;
        }
        var ej = this.ejercicioActual;
        var filtrados = [];
        if (!ej) {
            filtrados = this.allPeriodos.slice();
        }
        else {
            var idEj_1 = Number(ej.id_ejercicio);
            var ejIni_1 = this.fmtDate((_a = ej.fecha_inicio) !== null && _a !== void 0 ? _a : null);
            var ejFin_1 = this.fmtDate((_b = ej.fecha_fin) !== null && _b !== void 0 ? _b : null);
            filtrados = this.allPeriodos.filter(function (p) { return Number.isFinite(p.id_ejercicio) && p.id_ejercicio === idEj_1; });
            if (filtrados.length === 0 && ejIni_1 && ejFin_1 && ejIni_1 !== '—' && ejFin_1 !== '—') {
                filtrados = this.allPeriodos.filter(function (p) {
                    var pi = p.fecha_inicio, pf = p.fecha_fin;
                    if (!pi || !pf || pi === '—' || pf === '—')
                        return false;
                    return (pi <= ejFin_1) && (pf >= ejIni_1);
                });
            }
        }
        // Garantiza que el periodo de la póliza esté presente en el select
        var selId = Number((_c = this.poliza) === null || _c === void 0 ? void 0 : _c.id_periodo);
        if (Number.isFinite(selId) && !filtrados.some(function (p) { return Number(p.id_periodo) === selId; })) {
            var found = this.allPeriodos.find(function (p) { return Number(p.id_periodo) === selId; });
            if (found)
                filtrados = __spreadArrays([found], filtrados);
        }
        this.periodos = filtrados.map(function (p) {
            var _a, _b;
            return ({
                id_periodo: Number(p.id_periodo),
                nombre: ((_a = p.fecha_inicio) !== null && _a !== void 0 ? _a : '—') + " \u2014 " + ((_b = p.fecha_fin) !== null && _b !== void 0 ? _b : '—')
            });
        });
    };
    Object.defineProperty(PolizaEditarComponent.prototype, "ejercicioLabel", {
        get: function () {
            var e = this.ejercicioActual;
            if (!e)
                return '—';
            var nombre = (e.nombre && e.nombre !== '—') ? e.nombre : (e.fecha_inicio && e.fecha_fin ? e.fecha_inicio + " \u2014 " + e.fecha_fin : '');
            return nombre || '—';
        },
        enumerable: false,
        configurable: true
    });
    // =========================================================
    // Póliza + movimientos
    // =========================================================
    PolizaEditarComponent.prototype.cargarPoliza = function (id) {
        var _this = this;
        this.loading = true;
        this.http.get(this.apiBase + "/poliza/" + id + "/movimientos").subscribe({
            next: function (res) {
                var _a, _b, _c, _d;
                var movs = ((_a = res === null || res === void 0 ? void 0 : res.movimientos) !== null && _a !== void 0 ? _a : []).map(function (m) {
                    var _a;
                    var mm = _this.normalizeMovimiento(m);
                    var c = _this.cuentasMap.get(Number(mm.id_cuenta || 0));
                    mm._cuentaQuery = c ? c.codigo + " \u2014 " + c.nombre : ((_a = mm._cuentaQuery) !== null && _a !== void 0 ? _a : '');
                    return mm;
                });
                // Asegura id_periodo numérico (para evitar TS2322) y lo reinyecta al select si hiciera falta
                var idPeriodoRaw = Number(res === null || res === void 0 ? void 0 : res.id_periodo);
                var idPeriodo = Number.isFinite(idPeriodoRaw) ? idPeriodoRaw : undefined;
                _this.poliza = {
                    id_poliza: res === null || res === void 0 ? void 0 : res.id_poliza,
                    id_tipopoliza: Number(res === null || res === void 0 ? void 0 : res.id_tipopoliza),
                    id_periodo: idPeriodo,
                    id_usuario: Number(res === null || res === void 0 ? void 0 : res.id_usuario),
                    id_centro: Number(res === null || res === void 0 ? void 0 : res.id_centro),
                    folio: String((_b = res === null || res === void 0 ? void 0 : res.folio) !== null && _b !== void 0 ? _b : ''),
                    concepto: String((_c = res === null || res === void 0 ? void 0 : res.concepto) !== null && _c !== void 0 ? _c : ''),
                    movimientos: movs,
                    estado: res === null || res === void 0 ? void 0 : res.estado,
                    fecha_creacion: res === null || res === void 0 ? void 0 : res.fecha_creacion,
                    created_at: res === null || res === void 0 ? void 0 : res.created_at,
                    updated_at: res === null || res === void 0 ? void 0 : res.updated_at
                };
                // Reaplica filtro para reflejar el periodo actual en el select
                _this.applyPeriodoFilter();
                _this.cuentasFiltradas = new Array(((_d = _this.poliza.movimientos) === null || _d === void 0 ? void 0 : _d.length) || 0).fill([]);
                _this.prefillCuentaQueries();
            },
            error: function (err) {
                var _a, _b;
                console.error('Poliza cargar:', err);
                _this.errorMsg = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'No se pudo cargar la póliza.';
                _this.showToast({ type: 'error', title: 'Error', message: _this.errorMsg });
            },
            complete: function () { return (_this.loading = false); }
        });
    };
    PolizaEditarComponent.prototype.normalizeMovimiento = function (m) {
        var _a, _b, _c, _d, _f, _g;
        return __assign({ id_cuenta: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_cuenta), ref_serie_venta: (_a = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.ref_serie_venta)) !== null && _a !== void 0 ? _a : '', operacion: ((_b = m === null || m === void 0 ? void 0 : m.operacion) !== null && _b !== void 0 ? _b : '').toString(), monto: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.monto), cliente: (_c = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.cliente)) !== null && _c !== void 0 ? _c : '', fecha: (_d = this.toDateOrNull(m === null || m === void 0 ? void 0 : m.fecha)) !== null && _d !== void 0 ? _d : '', cc: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.cc), uuid: (_f = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.uuid)) !== null && _f !== void 0 ? _f : null, id_poliza: (_g = this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_poliza)) !== null && _g !== void 0 ? _g : undefined }, ((m === null || m === void 0 ? void 0 : m.id_movimiento) != null ? { id_movimiento: Number(m.id_movimiento) } : {}));
    };
    PolizaEditarComponent.prototype.puedeActualizar = function () {
        var _this = this;
        var p = this.poliza || {};
        var okHeader = !!(p.folio && String(p.folio).trim()) &&
            Number.isFinite(Number(p.id_tipopoliza)) &&
            Number.isFinite(Number(p.id_periodo)) &&
            Number.isFinite(Number(p.id_centro)) &&
            Number.isFinite(Number(p.id_usuario));
        var movs = Array.isArray(p.movimientos) ? p.movimientos : [];
        var validos = movs.filter(function (m) {
            var _a;
            return _this.toNumOrNull(m.id_cuenta) &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        return okHeader && validos.length > 0;
    };
    PolizaEditarComponent.prototype.actualizarPoliza = function () {
        var _this = this;
        var _a, _b;
        if (!((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.id_poliza)) {
            this.showToast({ type: 'warning', title: 'Aviso', message: 'No se encontró el ID de la póliza.' });
            return;
        }
        var cargos = this.getTotal('0');
        var abonos = this.getTotal('1');
        if (Math.abs(cargos - abonos) > 0.001) {
            this.showToast({ type: 'warning', title: 'Partida doble', message: "No cuadra.\nCargos: " + cargos + "\nAbonos: " + abonos });
            return;
        }
        var p = this.poliza;
        var payloadHeader = {
            id_tipopoliza: this.toNumOrNull(p.id_tipopoliza),
            id_periodo: this.toNumOrNull(p.id_periodo),
            id_usuario: this.toNumOrNull(p.id_usuario),
            id_centro: this.toNumOrNull(p.id_centro),
            folio: this.toStrOrNull(p.folio),
            concepto: this.toStrOrNull(p.concepto)
        };
        console.log('Periodo seleccionado:', payloadHeader.id_periodo);
        var movs = ((_b = p.movimientos) !== null && _b !== void 0 ? _b : []);
        var toUpdate = movs.filter(function (m) {
            var _a;
            return m.id_movimiento != null &&
                _this.toNumOrNull(m.id_cuenta) != null &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        var toCreate = movs.filter(function (m) {
            var _a;
            return m.id_movimiento == null &&
                _this.toNumOrNull(m.id_cuenta) != null &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        this.updating = true;
        var updateReqs = toUpdate.map(function (m, i) {
            return _this.apiSvc.updateMovPoliza(m.id_movimiento, {
                id_cuenta: _this.toNumOrNull(m.id_cuenta),
                ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
                monto: _this.toNumOrNull(m.monto),
                cliente: _this.toStrOrNull(m.cliente),
                fecha: _this.toDateOrNull(m.fecha),
                cc: _this.toNumOrNull(m.cc),
                uuid: _this.toStrOrNull(m.uuid) // <-- CFDI UUID
            }).pipe(rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () {
                var _a;
                return _this.annotateError(err, {
                    i: i, uuid: (_a = m.uuid) !== null && _a !== void 0 ? _a : null,
                    id_mov: m.id_movimiento
                });
            }); }));
        });
        var createReqs = toCreate.map(function (m, i) {
            return _this.apiSvc.createMovPoliza({
                id_poliza: _this.poliza.id_poliza,
                id_cuenta: _this.toNumOrNull(m.id_cuenta),
                ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
                monto: _this.toNumOrNull(m.monto),
                cliente: _this.toStrOrNull(m.cliente),
                fecha: _this.toDateOrNull(m.fecha),
                cc: _this.toNumOrNull(m.cc),
                uuid: _this.toStrOrNull(m.uuid) // <-- CFDI UUID
            }).pipe(rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () {
                var _a;
                return _this.annotateError(err, {
                    i: i, uuid: (_a = m.uuid) !== null && _a !== void 0 ? _a : null,
                    id_mov: undefined
                });
            }); }));
        });
        this.apiSvc.updatePoliza(this.poliza.id_poliza, payloadHeader).pipe(rxjs_1.switchMap(function () {
            var reqs = __spreadArrays(updateReqs, createReqs);
            return reqs.length ? rxjs_1.forkJoin(reqs) : rxjs_1.of(null);
        })).subscribe({
            next: function () {
                var msg = [
                    "P\u00F3liza actualizada.",
                    toUpdate.length ? " Movs actualizados: " + toUpdate.length + "." : '',
                    toCreate.length ? " Movs creados: " + toCreate.length + "." : ''
                ].join('');
                _this.showToast({ type: 'success', title: 'Listo', message: msg.trim() });
                _this.cargarPoliza(_this.poliza.id_poliza);
            },
            error: function (err) {
                var _a, _b;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al actualizar póliza/movimientos';
                console.error('Actualizar:', err);
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            },
            complete: function () { _this.updating = false; }
        });
    };
    // =========================================================
    // Cuentas
    // =========================================================
    PolizaEditarComponent.prototype.cargarCuentas = function () {
        var _this = this;
        this.cuentasSvc.getCuentas().subscribe({
            next: function (arr) {
                var todas = Array.isArray(arr) ? arr : [];
                // Mantén TODAS (posteables y no posteables) para que el modal vea la jerarquía completa
                _this.cuentas = todas;
                // 🔽 Ordenar por jerarquía padre→hijo
                var _a = _this.ordenarYNivelarCuentas(_this.cuentas), list = _a.list, niveles = _a.niveles;
                _this.cuentasOrdenadas = list;
                _this.nivelById = niveles;
                // Map para búsquedas por id (usa todas)
                _this.cuentasMap.clear();
                for (var _i = 0, _b = _this.cuentas; _i < _b.length; _i++) {
                    var c = _b[_i];
                    _this.cuentasMap.set(c.id, c);
                }
                _this.prefillCuentaQueries();
            },
            error: function (e) { return console.error('Cuentas:', e); }
        });
    };
    /** Clave de orden: normaliza segmentos numéricos para 1,2,10 => 01,02,10 */
    PolizaEditarComponent.prototype.keyCodigo = function (codigo) {
        var s = (codigo !== null && codigo !== void 0 ? codigo : '').toString();
        return s
            .split(/(\d+)/g)
            .map(function (seg) { return (/^\d+$/.test(seg) ? seg.padStart(8, '0') : seg.toLowerCase()); })
            .join('');
    };
    /** Ordena por jerarquía padre→hijos y devuelve lista aplanada + niveles */
    PolizaEditarComponent.prototype.ordenarYNivelarCuentas = function (todas) {
        var _this = this;
        var _a, _b;
        var byId = new Map();
        for (var _i = 0, todas_1 = todas; _i < todas_1.length; _i++) {
            var c = todas_1[_i];
            byId.set(c.id, c);
        }
        // Agrupar hijos por parentId
        var children = new Map();
        for (var _c = 0, todas_2 = todas; _c < todas_2.length; _c++) {
            var c = todas_2[_c];
            var pid = (_a = c.parentId) !== null && _a !== void 0 ? _a : null;
            if (pid != null && byId.has(pid)) {
                var arr = (_b = children.get(pid)) !== null && _b !== void 0 ? _b : [];
                arr.push(c);
                children.set(pid, arr);
            }
        }
        // Raíces: sin parentId o con parentId no encontrado
        var roots = todas.filter(function (c) { return c.parentId == null || !byId.has(c.parentId); });
        // Orden por código amigable
        var sortFn = function (a, b) {
            return _this.keyCodigo(a.codigo).localeCompare(_this.keyCodigo(b.codigo));
        };
        roots.sort(sortFn);
        for (var _d = 0, children_1 = children; _d < children_1.length; _d++) {
            var _f = children_1[_d], pid = _f[0], arr = _f[1];
            arr.sort(sortFn);
        }
        var out = [];
        var niveles = new Map();
        var dfs = function (n, nivel) {
            var _a;
            out.push(n);
            niveles.set(n.id, nivel);
            var kids = (_a = children.get(n.id)) !== null && _a !== void 0 ? _a : [];
            for (var _i = 0, kids_1 = kids; _i < kids_1.length; _i++) {
                var k = kids_1[_i];
                dfs(k, nivel + 1);
            }
        };
        for (var _g = 0, roots_1 = roots; _g < roots_1.length; _g++) {
            var r = roots_1[_g];
            dfs(r, 0);
        }
        return { list: out, niveles: niveles };
    };
    PolizaEditarComponent.prototype.prefillCuentaQueries = function () {
        var _this = this;
        var _a;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        if (!movs.length || this.cuentasMap.size === 0)
            return;
        movs.forEach(function (m) {
            if (m.id_cuenta && !m._cuentaQuery) {
                var c = _this.cuentasMap.get(Number(m.id_cuenta));
                if (c)
                    m._cuentaQuery = c.codigo + " \u2014 " + c.nombre;
            }
        });
    };
    PolizaEditarComponent.prototype.agregarMovimiento = function () {
        var _a;
        var nuevo = {
            id_cuenta: null,
            ref_serie_venta: '',
            operacion: '',
            monto: null,
            cliente: '',
            fecha: '',
            cc: null,
            uuid: null,
            _cuentaQuery: ''
        };
        ((_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
        push(nuevo);
        this.cuentasFiltradas.push([]);
    };
    PolizaEditarComponent.prototype.openConfirm = function (index) {
        var _a;
        (_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : ;
        [];
        if (index < 0 || index >= this.poliza.movimientos.length)
            return;
        this.confirmIndex = index;
        this.confirmOpen = true;
    };
    PolizaEditarComponent.prototype.closeConfirm = function () {
        this.confirmOpen = false;
        this.confirmIndex = null;
    };
    PolizaEditarComponent.prototype.cancelConfirm = function () { this.closeConfirm(); };
    PolizaEditarComponent.prototype.confirmProceed = function () {
        var _this = this;
        var _a, _b;
        if (this.confirmIndex == null)
            return;
        var i = this.confirmIndex;
        this.closeConfirm();
        var movs = (_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (i < 0 || i >= movs.length)
            return;
        var mov = movs[i];
        var idMov = (_b = mov) === null || _b === void 0 ? void 0 : _b.id_movimiento;
        this.deletingIndexSet.add(i);
        var finish = function () {
            var _a;
            ((_a = _this.poliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
            splice(i, 1);
            _this.cuentasFiltradas.splice(i, 1);
            _this.deletingIndexSet["delete"](i);
        };
        if (!idMov) {
            finish();
            this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
            return;
        }
        this.apiSvc.deleteMovPoliza(idMov).subscribe({
            next: function () {
                finish();
                _this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
            },
            error: function (err) {
                var _a, _b;
                _this.deletingIndexSet["delete"](i);
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || 'No se pudo eliminar el movimiento.';
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            }
        });
    };
    //cfdi recientesm
    PolizaEditarComponent.prototype.cargarCfdiRecientes = function () {
        var _this = this;
        var _a, _b;
        var svc = this.apiSvc;
        var fn = svc.listCfdi || svc.getCfdi || svc.getCfdiRecientes || svc.listCfdiRecientes;
        var handle = function (arr) {
            _this.cfdiOptions = (arr || [])
                .map(function (x) {
                var _a, _b, _c, _d, _f, _g, _h, _j;
                return ({
                    uuid: String((_b = (_a = x.uuid) !== null && _a !== void 0 ? _a : x.UUID) !== null && _b !== void 0 ? _b : '').trim(),
                    folio: (_d = (_c = x.folio) !== null && _c !== void 0 ? _c : x.Folio) !== null && _d !== void 0 ? _d : null,
                    fecha: (_g = (_f = x.fecha) !== null && _f !== void 0 ? _f : x.Fecha) !== null && _g !== void 0 ? _g : null,
                    total: (_j = (_h = x.total) !== null && _h !== void 0 ? _h : x.Total) !== null && _j !== void 0 ? _j : null
                });
            })
                .filter(function (o) { return !!o.uuid; });
        };
        if (typeof fn === 'function') {
            (_b = (_a = fn.call(svc, { limit: 100 })) === null || _a === void 0 ? void 0 : _a.subscribe) === null || _b === void 0 ? void 0 : _b.call(_a, {
                next: function (r) {
                    var _a, _b, _c, _d;
                    var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : []);
                    handle(arr);
                },
                error: function (err) {
                    console.warn('CFDI recientes:', err);
                    _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar CFDI recientes.' });
                }
            });
        }
        else {
            // FIX: quitar el guion accidental y consultar al endpoint correcto
            this.http.get(this.apiBase + "/cfdis?limit=100").subscribe({
                next: function (r) {
                    var _a, _b, _c, _d;
                    var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : []);
                    handle(arr);
                },
                error: function () { }
            });
        }
    };
    PolizaEditarComponent.prototype.triggerXmlPickerForMovimiento = function (input, index) {
        this.xmlMovimientoIndex = index;
        this.uploadXmlError = '';
        this.selectedXmlName = '';
        input.value = '';
        input.click();
    };
    // Usa tu servicio: uploadCfdiXml(file, { folio, id_periodo, id_centro, id_tipopoliza })
    PolizaEditarComponent.prototype.onXmlPickedForMovimiento = function (event, index) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, Promise, function () {
            var file, isXml, ctx, response, uuid_1, movs, err_1, msg;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        file = (_b = (_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
                        if (!file)
                            return [2 /*return*/];
                        isXml = file.type === 'text/xml' || file.type === 'application/xml' || /\.xml$/i.test(file.name);
                        if (!isXml) {
                            this.uploadXmlError = 'El archivo debe ser .xml';
                            this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
                            event.target.value = '';
                            return [2 /*return*/];
                        }
                        if (file.size > 1 * 1024 * 1024) {
                            this.uploadXmlError = 'El XML excede 1 MB.';
                            this.showToast({ type: 'warning', title: 'Archivo pesado', message: this.uploadXmlError });
                            event.target.value = '';
                            return [2 /*return*/];
                        }
                        this.uploadingXml = true;
                        this.selectedXmlName = file.name;
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, 3, 4, 5]);
                        ctx = {
                            folio: (_c = this.poliza) === null || _c === void 0 ? void 0 : _c.folio,
                            id_periodo: Number((_d = this.poliza) === null || _d === void 0 ? void 0 : _d.id_periodo),
                            id_centro: Number((_f = this.poliza) === null || _f === void 0 ? void 0 : _f.id_centro),
                            id_tipopoliza: Number((_g = this.poliza) === null || _g === void 0 ? void 0 : _g.id_tipopoliza)
                        };
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.apiSvc.uploadCfdiXml(file, ctx))];
                    case 2:
                        response = _l.sent();
                        uuid_1 = (response === null || response === void 0 ? void 0 : response.uuid) || (response === null || response === void 0 ? void 0 : response.UUID) || null;
                        if (!uuid_1) {
                            this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
                        }
                        else {
                            movs = ((_h = this.poliza) === null || _h === void 0 ? void 0 : _h.movimientos) || [];
                            if (!movs[index]) {
                                ((_j = this.poliza.movimientos) !== null && _j !== void 0 ? _j : ) = [];
                                index = {}[0];
                            }
                            movs[index].uuid = uuid_1;
                            // Mantén catálogo de recientes en UI
                            if (!this.cfdiOptions.some(function (x) { return x.uuid === uuid_1; })) {
                                this.cfdiOptions = __spreadArrays([{ uuid: uuid_1 }], this.cfdiOptions).slice(0, 100);
                            }
                            this.showToast({ title: 'XML asociado', message: "UUID " + uuid_1 + " vinculado al movimiento " + (index + 1), type: 'success' });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _l.sent();
                        msg = ((_k = err_1 === null || err_1 === void 0 ? void 0 : err_1.error) === null || _k === void 0 ? void 0 : _k.message) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Error al subir el XML.';
                        this.uploadXmlError = msg;
                        this.showToast({ title: 'Error', message: msg, type: 'error' });
                        return [3 /*break*/, 5];
                    case 4:
                        this.uploadingXml = false;
                        event.target.value = '';
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PolizaEditarComponent.prototype.onUuidChange = function (uuid) {
        this.uuidSeleccionado = uuid || undefined;
    };
    PolizaEditarComponent.prototype.aplicarUuidAlMovimiento = function (index) {
        var _this = this;
        var _a, _b;
        if (!this.uuidSeleccionado)
            return;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var mov = movs[index];
        if (!mov)
            return;
        var uuid = this.uuidSeleccionado;
        mov.uuid = uuid;
        // Si ya está persistido, vincula en servidor
        var idMov = Number(mov === null || mov === void 0 ? void 0 : mov.id_movimiento);
        if (Number.isFinite(idMov) && ((_b = this.poliza) === null || _b === void 0 ? void 0 : _b.id_poliza)) {
            this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, [idMov]).subscribe({
                next: function () {
                    _this.showToast({ type: 'success', title: 'UUID aplicado', message: "Se aplic\u00F3 " + uuid + " al movimiento #" + (index + 1) + "." });
                },
                error: function (err) {
                    var _a;
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'No se pudo vincular el UUID en servidor.';
                    _this.showToast({ type: 'error', title: 'Error', message: msg });
                }
            });
        }
        else {
            // Si no existe en BD, se enviará en el próximo create/update
            this.showToast({ type: 'info', title: 'UUID aplicado', message: "Se aplic\u00F3 " + uuid + ". Se guardar\u00E1 al actualizar la p\u00F3liza." });
        }
    };
    PolizaEditarComponent.prototype.vincularUuidAMovimientosExistentes = function (uuid, movimientoIds) {
        var _this = this;
        var _a;
        if (!((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.id_poliza) || !uuid || !(movimientoIds === null || movimientoIds === void 0 ? void 0 : movimientoIds.length))
            return;
        this.apiSvc.linkUuidToMovimientos(this.poliza.id_poliza, uuid, movimientoIds).subscribe({
            next: function () { return _this.showToast({ type: 'success', title: 'UUID vinculado', message: "Se vincul\u00F3 " + uuid + " a " + movimientoIds.length + " movimientos." }); },
            error: function (err) {
                var _a;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'No se pudo vincular el UUID en servidor.';
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            }
        });
    };
    // =========================================================
    // Centros de costo
    // =========================================================
    PolizaEditarComponent.prototype.getCentros = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCentrosCosto || svc.listCentrosCosto ||
            svc.getCentroCostos || svc.listCentroCostos ||
            svc.getCentrosDeCosto || svc.listCentrosDeCosto ||
            svc.getCentros;
        if (typeof fn !== 'function') {
            console.warn('No existe método de API para Centros de Costo; usando vacío.');
            this.centrosCosto = [];
            this.centrosCostoMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.centrosCosto = (items || [])
                    .map(function (x) {
                    var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m;
                    var id = Number((_c = (_b = (_a = x.id_centrocosto) !== null && _a !== void 0 ? _a : x.id_centro) !== null && _b !== void 0 ? _b : x.id) !== null && _c !== void 0 ? _c : x.ID);
                    var serie = String((_g = (_f = (_d = x.serie_venta) !== null && _d !== void 0 ? _d : x.serie) !== null && _f !== void 0 ? _f : x.codigo) !== null && _g !== void 0 ? _g : '').trim();
                    var nom = String((_k = (_j = (_h = x.nombre) !== null && _h !== void 0 ? _h : x.descripcion) !== null && _j !== void 0 ? _j : x.NOMBRE) !== null && _k !== void 0 ? _k : "CC " + id).trim();
                    var clave = String((_m = (_l = x.clave) !== null && _l !== void 0 ? _l : x.codigo) !== null && _m !== void 0 ? _m : '').trim();
                    var etiqueta = serie ? serie + " \u2014 " + nom : (clave ? clave + " \u2014 " + nom : nom);
                    return { id_centrocosto: id, nombre: etiqueta, clave: clave, serie_venta: serie };
                })
                    .filter(function (cc) { return Number.isFinite(cc.id_centrocosto); });
                _this.centrosCostoMap = new Map(_this.centrosCosto.map(function (cc) { return [cc.id_centrocosto, cc]; }));
            },
            error: function (err) {
                console.error('Centros de Costo:', err);
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar Centros de Costo.' });
                _this.centrosCosto = [];
                _this.centrosCostoMap.clear();
            }
        });
    };
    PolizaEditarComponent.prototype.getSerieVentaByCcId = function (ccId) {
        var _a, _b;
        if (ccId == null)
            return null;
        var cc = this.centrosCostoMap.get(Number(ccId));
        var serie = (_b = (_a = cc) === null || _a === void 0 ? void 0 : _a.serie_venta) !== null && _b !== void 0 ? _b : null;
        return (typeof serie === 'string' && serie.trim()) ? String(serie).trim() : null;
    };
    // ⬇️ Helpers de error
    PolizaEditarComponent.prototype.extractHttpErrorMessage = function (err) {
        var _a, _b, _c;
        var e = err || {};
        var tryPaths = [
            (_a = e.error) === null || _a === void 0 ? void 0 : _a.message,
            (_b = e.error) === null || _b === void 0 ? void 0 : _b.error,
            (_c = e.error) === null || _c === void 0 ? void 0 : _c.details,
            e.message,
            (typeof e.error === 'string' ? e.error : ''),
            (typeof e === 'string' ? e : '')
        ].filter(Boolean);
        var msg = tryPaths.find(Boolean) || 'Error desconocido.';
        if (typeof msg !== 'string')
            msg = JSON.stringify(msg);
        if (/cfdi|uuid|comprobante/i.test(msg)) {
            return "CFDI/UUID: " + msg;
        }
        return msg;
    };
    /** Crea un error anotado con contexto del movimiento (índice/uuid/id_movimiento) */
    PolizaEditarComponent.prototype.annotateError = function (err, ctx) {
        var normalized = new Error(this.extractHttpErrorMessage(err));
        normalized.__ctx = ctx;
        return normalized;
    };
    PolizaEditarComponent.prototype.onMovimientoCcChange = function (index, ccId) {
        var _a;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        if (!movs[index])
            return;
        var ccNum = this.toNumOrNull(ccId);
        movs[index].cc = ccNum;
        var serie = this.getSerieVentaByCcId(ccNum !== null && ccNum !== void 0 ? ccNum : undefined);
        if (serie && (!movs[index].ref_serie_venta || !String(movs[index].ref_serie_venta).trim())) {
            movs[index].ref_serie_venta = serie;
        }
    };
    Object.defineProperty(PolizaEditarComponent.prototype, "cuentasParaModal", {
        get: function () {
            var _this = this;
            var fuente = this.cuentasOrdenadas.length ? this.cuentasOrdenadas : this.cuentas;
            return (fuente || []).map(function (c) {
                var _a;
                return ({
                    id_cuenta: c.id,
                    codigo: c.codigo,
                    nombre: c.nombre,
                    posteable: _this.esPosteable(c),
                    nivel: (_a = _this.nivelById.get(c.id)) !== null && _a !== void 0 ? _a : 0
                });
            });
        },
        enumerable: false,
        configurable: true
    });
    PolizaEditarComponent.prototype.abrirModalCuentas = function (index) {
        this.indiceMovimientoSeleccionado = index;
        this.modalCuentasAbierto = true;
    };
    PolizaEditarComponent.prototype.cerrarModalCuentas = function () {
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
    };
    PolizaEditarComponent.prototype.onCuentaSeleccionadaModal = function (cuenta) {
        var _a;
        if (this.indiceMovimientoSeleccionado == null)
            return;
        var movs = (((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || []);
        var i = this.indiceMovimientoSeleccionado;
        if (!movs[i])
            return;
        movs[i].id_cuenta = Number(cuenta.id_cuenta);
        movs[i]._cuentaQuery = cuenta.codigo + " \u2014 " + cuenta.nombre;
        this.cerrarModalCuentas();
    };
    PolizaEditarComponent.prototype.labelCuenta = function (id) {
        if (!Number.isFinite(Number(id)))
            return '';
        var c = this.cuentasMap.get(Number(id));
        return c ? c.codigo + " \u2014 " + c.nombre : '';
    };
    PolizaEditarComponent.prototype.onCuentaQueryChange = function (i) {
        var _a, _b;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var q = (((_b = movs[i]) === null || _b === void 0 ? void 0 : _b._cuentaQuery) || '').trim().toLowerCase();
        if (!q) {
            this.cuentasFiltradas[i] = this.cuentas.slice(0, 20);
            return;
        }
        var hits = this.cuentas.filter(function (c) {
            return (c.codigo && c.codigo.toLowerCase().includes(q)) ||
                (c.nombre && c.nombre.toLowerCase().includes(q));
        });
        var starts = hits.filter(function (c) { var _a; return (_a = c.codigo) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(q); });
        var rest = hits.filter(function (c) { var _a; return !((_a = c.codigo) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(q)); });
        this.cuentasFiltradas[i] = __spreadArrays(starts, rest).slice(0, 50);
    };
    PolizaEditarComponent.prototype.openCuenta = function (i) {
        this.cuentaOpenIndex = i;
        this.onCuentaQueryChange(i);
    };
    PolizaEditarComponent.prototype.closeCuenta = function (i) {
        var _this = this;
        setTimeout(function () {
            if (_this.cuentaOpenIndex === i)
                _this.cuentaOpenIndex = null;
        }, 120);
    };
    PolizaEditarComponent.prototype.selectCuenta = function (i, c) {
        var _a;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var m = movs[i];
        if (!m)
            return;
        m.id_cuenta = Number(c.id);
        m._cuentaQuery = c.codigo + " \u2014 " + c.nombre;
        this.cuentasFiltradas[i] = [];
        this.cuentaOpenIndex = null;
    };
    // =========================================================
    // Helpers
    // =========================================================
    PolizaEditarComponent.prototype.getTotal = function (tipo) {
        var _a;
        var movs = Array.isArray((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) ? this.poliza.movimientos : [];
        return movs
            .filter(function (m) { return String(m.operacion) === tipo; })
            .reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
    };
    PolizaEditarComponent.prototype.getDiferencia = function () { return this.getTotal('0') - this.getTotal('1'); };
    PolizaEditarComponent.prototype.canGuardarEstilo = function () {
        var dif = Math.abs(this.getDiferencia());
        if (this.getTotal('0') === 0 && this.getTotal('1') === 0)
            return 'warn';
        if (dif < 0.0001)
            return 'ok';
        return 'bad';
    };
    Object.defineProperty(PolizaEditarComponent.prototype, "currentUserLabel", {
        get: function () {
            var _a;
            return (((_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.nombre) || '').toString().trim();
        },
        enumerable: false,
        configurable: true
    });
    PolizaEditarComponent.prototype.pad2 = function (n) { return String(n).padStart(2, '0'); };
    PolizaEditarComponent.prototype.todayISO = function () {
        var d = new Date();
        return d.getFullYear() + "-" + this.pad2(d.getMonth() + 1) + "-" + this.pad2(d.getDate());
    };
    PolizaEditarComponent.prototype.fmtDate = function (d) {
        if (!d)
            return '—';
        var s = String(d);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s))
            return s;
        var dt = new Date(s);
        if (isNaN(dt.getTime()))
            return s;
        return dt.getFullYear() + "-" + this.pad2(dt.getMonth() + 1) + "-" + this.pad2(dt.getDate());
    };
    PolizaEditarComponent.prototype.toNumOrNull = function (v) {
        return (v === '' || v == null || isNaN(Number(v))) ? null : Number(v);
    };
    PolizaEditarComponent.prototype.toStrOrNull = function (v) {
        return v == null ? null : (String(v).trim() || null);
    };
    PolizaEditarComponent.prototype.toDateOrNull = function (v) {
        if (!v)
            return null;
        var s = String(v);
        if (/^\d{4}-\d{2}-\d{2}$/.test(s))
            return s;
        var d = new Date(s);
        if (isNaN(d.getTime()))
            return null;
        return d.getFullYear() + "-" + this.pad2(d.getMonth() + 1) + "-" + this.pad2(d.getDate());
    };
    PolizaEditarComponent.prototype.normalizeList = function (res) {
        var _a, _b, _c, _d, _f;
        return Array.isArray(res) ? res : ((_f = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.result) !== null && _d !== void 0 ? _d : res) !== null && _f !== void 0 ? _f : []);
    };
    PolizaEditarComponent.prototype.normalizeEjercicio = function (e) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m;
        if (!e)
            return null;
        var id = Number((_b = (_a = e.id_ejercicio) !== null && _a !== void 0 ? _a : e.id) !== null && _b !== void 0 ? _b : e.ID);
        if (!Number.isFinite(id))
            return null;
        var nombre = String((_g = (_f = (_d = (_c = e.nombre) !== null && _c !== void 0 ? _c : e.descripcion) !== null && _d !== void 0 ? _d : e.year) !== null && _f !== void 0 ? _f : e.ejercicio) !== null && _g !== void 0 ? _g : '').trim();
        return {
            id_ejercicio: id,
            nombre: nombre || undefined,
            fecha_inicio: this.fmtDate((_j = (_h = e.fecha_inicio) !== null && _h !== void 0 ? _h : e.inicio) !== null && _j !== void 0 ? _j : e.fechaInicio),
            fecha_fin: this.fmtDate((_l = (_k = e.fecha_fin) !== null && _k !== void 0 ? _k : e.fin) !== null && _l !== void 0 ? _l : e.fechaFin),
            activo: Boolean((_m = e.activo) !== null && _m !== void 0 ? _m : e.esta_abierto)
        };
    };
    PolizaEditarComponent.prototype.showToast = function (opts) {
        var _a, _b;
        this.toast.message = opts.message;
        this.toast.type = (_a = opts.type) !== null && _a !== void 0 ? _a : 'info';
        this.toast.title = (_b = opts.title) !== null && _b !== void 0 ? _b : '';
        if (opts.autoCloseMs != null)
            this.toast.autoCloseMs = opts.autoCloseMs;
        if (opts.position)
            this.toast.position = opts.position;
        this.toast.open = true;
    };
    // =========================================================
    // Usuario actual
    // =========================================================
    PolizaEditarComponent.prototype.normalizeUsuario = function (u) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
        if (!u || typeof u !== 'object')
            return null;
        var raw = ((_c = (_b = (_a = u.user) !== null && _a !== void 0 ? _a : u.data) !== null && _b !== void 0 ? _b : u.currentUser) !== null && _c !== void 0 ? _c : u) || {};
        var s = function (v) { return (v !== null && v !== void 0 ? v : '').toString().trim(); };
        var rawId = (_k = (_j = (_h = (_g = (_f = (_d = raw.id_usuario) !== null && _d !== void 0 ? _d : raw.idUsuario) !== null && _f !== void 0 ? _f : raw.user_id) !== null && _g !== void 0 ? _g : raw.id) !== null && _h !== void 0 ? _h : raw.ID) !== null && _j !== void 0 ? _j : raw.sub) !== null && _k !== void 0 ? _k : raw.uid;
        var toNum = function (v) {
            if (typeof v === 'number')
                return v;
            if (v == null)
                return NaN;
            var n = Number(String(v).replace(/[^\d.-]/g, ''));
            return n;
        };
        var idNum = toNum(rawId);
        var nombreBase = s((_v = (_u = (_t = (_s = (_r = (_q = (_p = (_o = (_m = (_l = raw.nombre) !== null && _l !== void 0 ? _l : raw.name) !== null && _m !== void 0 ? _m : raw.full_name) !== null && _o !== void 0 ? _o : raw.fullName) !== null && _p !== void 0 ? _p : raw.display_name) !== null && _q !== void 0 ? _q : raw.displayName) !== null && _r !== void 0 ? _r : raw.username) !== null && _s !== void 0 ? _s : raw.preferred_username) !== null && _t !== void 0 ? _t : raw.nombres) !== null && _u !== void 0 ? _u : raw.given_name) !== null && _v !== void 0 ? _v : raw.first_name);
        var apP = s((_0 = (_z = (_y = (_x = (_w = raw.apellido_p) !== null && _w !== void 0 ? _w : raw.apellidoP) !== null && _x !== void 0 ? _x : raw.apellido) !== null && _y !== void 0 ? _y : raw.apellidos) !== null && _z !== void 0 ? _z : raw.last_name) !== null && _0 !== void 0 ? _0 : raw.family_name);
        var apM = s((_1 = raw.apellido_m) !== null && _1 !== void 0 ? _1 : raw.apellidoM);
        var nombre = [nombreBase, apP, apM].filter(Boolean).join(' ').trim();
        var emailRaw = s((_3 = (_2 = raw.email) !== null && _2 !== void 0 ? _2 : raw.correo) !== null && _3 !== void 0 ? _3 : raw.mail);
        var email = emailRaw ? emailRaw.toLowerCase() : undefined;
        if (!nombre) {
            var alias = email ? email.split('@')[0].replace(/[._-]+/g, ' ').trim() : '';
            if (alias)
                nombre = alias;
        }
        if (!nombre && Number.isFinite(idNum))
            nombre = "Usuario " + idNum;
        if (!nombre)
            nombre = 'Usuario';
        var out = __assign(__assign({}, raw), { nombre: nombre, email: email });
        if (Number.isFinite(idNum))
            out.id_usuario = idNum;
        return out;
    };
    PolizaEditarComponent.prototype.cargarUsuarioActual = function () {
        var _this = this;
        var svc = this.apiSvc;
        var fn = svc.getCurrentUser ||
            svc.me ||
            svc.getUsuarioActual ||
            svc.getUser ||
            svc.getUsuario;
        if (typeof fn === 'function') {
            fn.call(svc).subscribe({
                next: function (r) { _this.currentUser = _this.normalizeUsuario(r); },
                error: function (_e) { _this.cargarUsuarioPorFallback(); }
            });
            return;
        }
        this.cargarUsuarioPorFallback();
    };
    PolizaEditarComponent.prototype.cargarUsuarioPorFallback = function () {
        var _this = this;
        var base = this.apiBase;
        var candidates = [
            base + "/usuarios/me",
            base + "/users/me",
            base + "/me",
        ];
        var opts = {};
        var onResolved = function (r) {
            var _a;
            var user = _this.normalizeUsuario(r);
            if (user) {
                _this.currentUser = user;
                var idNum = Number(user.id_usuario);
                if (Number.isFinite(idNum) && !((_a = _this.poliza) === null || _a === void 0 ? void 0 : _a.id_usuario)) {
                    _this.poliza.id_usuario = idNum;
                }
            }
        };
        var tryNext = function (i) {
            var _a;
            if (i >= candidates.length) {
                var uid = _this.toNumOrNull((_a = _this.poliza) === null || _a === void 0 ? void 0 : _a.id_usuario);
                if (uid) {
                    _this.http.get(base + "/usuarios/" + uid, opts).subscribe({
                        next: onResolved,
                        error: function () { }
                    });
                }
                return;
            }
            _this.http.get(candidates[i], opts).subscribe({
                next: onResolved,
                error: function () { return tryNext(i + 1); }
            });
        };
        tryNext(0);
    };
    PolizaEditarComponent = __decorate([
        core_1.Component({
            selector: 'app-poliza-editar',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                polizas_layout_component_1.PolizasLayoutComponent,
                toast_message_component_component_1.ToastMessageComponent,
                modal_component_1.ModalComponent,
                modal_seleccion_cuenta_component_1.ModalSeleccionCuentaComponent,
            ],
            templateUrl: './poliza-editar.component.html',
            styleUrls: ['./poliza-editar.component.scss']
        })
    ], PolizaEditarComponent);
    return PolizaEditarComponent;
}());
exports.PolizaEditarComponent = PolizaEditarComponent;
