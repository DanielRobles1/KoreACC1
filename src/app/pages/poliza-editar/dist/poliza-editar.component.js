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
var saving_overlay_component_1 = require("@app/components/saving-overlay/saving-overlay.component");
var rxjs_1 = require("rxjs");
var PolizaEditarComponent = /** @class */ (function () {
    function PolizaEditarComponent(route, http, apiSvc, cuentasSvc, ejercicioSvc) {
        var _this = this;
        this.route = route;
        this.http = http;
        this.apiSvc = apiSvc;
        this.cuentasSvc = cuentasSvc;
        this.ejercicioSvc = ejercicioSvc;
        this.apiBase = 'http://localhost:3000/api/v1';
        this.sidebarOpen = true;
        this.loading = true;
        this.errorMsg = '';
        this.updating = false;
        this.trackByMov = function (_, m) { var _a, _b; return (_b = (_a = m.id_movimiento) !== null && _a !== void 0 ? _a : m.orden) !== null && _b !== void 0 ? _b : -1; };
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        this.saving = false;
        this.saveTotal = 0;
        this.saveDone = 0;
        this.currentUser = null;
        this.ejercicioActual = null;
        this.ejercicios = [];
        this.allPeriodos = [];
        this.periodos = [];
        this.compareById = function (a, b) { return a && b && a.id_periodo === b.id_periodo; };
        this.tiposPoliza = [];
        this.centros = [];
        this.centrosCosto = [];
        this.centrosCostoMap = new Map();
        this.poliza = { movimientos: [] };
        this.cuentas = [];
        this.cuentasParaModal = [];
        this.cuentasMap = new Map();
        this.cuentasFiltradas = [];
        this.cuentaOpenIndex = null;
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
        // Modal de centro de costo
        this.modalCentroAbierto = false;
        this.centroSeleccionadoModal = null;
        this.centrosCostoComoCuentas = [];
        this.centroMovimientoIndex = null;
        this.xmlMovimientoIndex = null;
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        this.cfdiOptions = [];
        this.lastOrderMap = new Map();
        this.confirmOpen = false;
        this.confirmTitle = 'Eliminar movimiento';
        this.confirmMessage = '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.';
        this.confirmIndex = null;
        this.deletingIndexSet = new Set();
        this.trackByEjercicioId = function (_, e) { return e === null || e === void 0 ? void 0 : e.id_ejercicio; };
        this.onToastClosed = function () { _this.toast.open = false; };
    }
    Object.defineProperty(PolizaEditarComponent.prototype, "api", {
        get: function () { return this.apiSvc; },
        enumerable: false,
        configurable: true
    });
    PolizaEditarComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.cargarCatalogosBase(); // Tipos y Centros
        this.getCentros(); // Centros de costo
        this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(this.id_poliza)) {
            this.showToast({ type: 'warning', title: 'Aviso', message: 'ID de póliza inválido.' });
            this.loading = false;
            return;
        }
        // Carga base
        this.cargarPeriodosAll();
        this.cargarEjercicioActivo();
        this.cargarUsuarioActual();
        this.cargarCfdiRecientes();
        this.cargarCuentas(function () { return _this.cargarPoliza(_this.id_poliza); });
    };
    PolizaEditarComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    PolizaEditarComponent.prototype.cargarCatalogosBase = function () {
        var _this = this;
        this.http.get(this.apiBase + "/tipo-poliza").subscribe({
            next: function (r) {
                var arr = _this.normalizeList(r);
                _this.tiposPoliza = arr.map(function (t) {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id_tipopoliza: Number((_b = (_a = t.id_tipopoliza) !== null && _a !== void 0 ? _a : t.id) !== null && _b !== void 0 ? _b : t.ID),
                        nombre: String((_e = (_d = (_c = t.nombre) !== null && _c !== void 0 ? _c : t.descripcion) !== null && _d !== void 0 ? _d : t.NOMBRE) !== null && _e !== void 0 ? _e : 'Tipo')
                    });
                });
            },
            error: function (e) { return console.error('Tipos de póliza:', e); }
        });
        this.http.get(this.apiBase + "/centros").subscribe({
            next: function (r) {
                var arr = _this.normalizeList(r);
                _this.centros = arr.map(function (c) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    var id = Number((_b = (_a = c.id_centro) !== null && _a !== void 0 ? _a : c.id) !== null && _b !== void 0 ? _b : c.ID);
                    var serie = String((_e = (_d = (_c = c.serie_venta) !== null && _c !== void 0 ? _c : c.serie) !== null && _d !== void 0 ? _d : c.codigo) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_g = (_f = c.nombre) !== null && _f !== void 0 ? _f : c.descripcion) !== null && _g !== void 0 ? _g : '').trim();
                    var etiqueta = serie && nombre ? serie + " \u2014 " + nombre : (serie || nombre || "Centro " + id);
                    return { id_centro: id, nombre: etiqueta };
                });
            },
            error: function (e) { return console.error('Centros:', e); }
        });
    };
    PolizaEditarComponent.prototype.isAbierto = function (e) {
        var _a, _b, _c;
        var v = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.esta_abierto) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.activo) !== null && _b !== void 0 ? _b : e === null || e === void 0 ? void 0 : e.activo_flag) !== null && _c !== void 0 ? _c : e === null || e === void 0 ? void 0 : e.is_open;
        if (v === true || v === 1 || v === '1')
            return true;
        if (typeof v === 'string')
            return v.trim().toLowerCase() === 'true';
        return false;
    };
    PolizaEditarComponent.prototype.cargarEjercicioActivo = function () {
        var _this = this;
        this.ejercicioSvc
            .listEjerciciosAbiertos({ esta_abierto: true })
            .subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e, _f;
                var raw = Array.isArray(res) ? res : (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res) !== null && _c !== void 0 ? _c : [];
                var hoy = new Date();
                var anioActual = hoy.getFullYear();
                var activos = raw.filter(function (e) { return _this.isAbierto(e); });
                _this.ejercicios = activos.map(function (e) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    var id = Number((_b = (_a = e.id_ejercicio) !== null && _a !== void 0 ? _a : e.id) !== null && _b !== void 0 ? _b : e.ID);
                    var fi0 = (_e = (_d = (_c = e.fecha_inicio) !== null && _c !== void 0 ? _c : e.inicio) !== null && _d !== void 0 ? _d : e.start_date) !== null && _e !== void 0 ? _e : null;
                    var ff0 = (_h = (_g = (_f = e.fecha_fin) !== null && _f !== void 0 ? _f : e.fin) !== null && _g !== void 0 ? _g : e.end_date) !== null && _h !== void 0 ? _h : null;
                    var anio = Number((_k = (_j = e.anio) !== null && _j !== void 0 ? _j : e.year) !== null && _k !== void 0 ? _k : (fi0 ? new Date(fi0).getFullYear() : NaN));
                    return {
                        id_ejercicio: id,
                        nombre: (_m = (_l = e.nombre) !== null && _l !== void 0 ? _l : e.descripcion) !== null && _m !== void 0 ? _m : null,
                        fecha_inicio: _this.fmtDate(fi0),
                        fecha_fin: _this.fmtDate(ff0),
                        activo: true,
                        anio: Number.isFinite(anio) ? anio : null
                    };
                });
                if (!_this.ejercicios.length) {
                    _this.ejercicioActual = null;
                    _this.ejercicioActualId = undefined;
                    _this.showToast({
                        type: 'info',
                        title: 'Sin ejercicios abiertos',
                        message: 'No hay ejercicios abiertos para seleccionar.'
                    });
                    _this.periodos = [];
                    return;
                }
                var elegido = (_e = (_d = _this.ejercicios.find(function (e) { return e.is_selected; })) !== null && _d !== void 0 ? _d : _this.ejercicios.find(function (e) { return e.anio === anioActual; })) !== null && _e !== void 0 ? _e : (_this.ejercicios.length === 1 ? _this.ejercicios[0] : null);
                if (!elegido) {
                    elegido = (_f = _this.ejercicios.find(function (e) {
                        var fi = e.fecha_inicio ? new Date(e.fecha_inicio) : null;
                        var ff = e.fecha_fin ? new Date(e.fecha_fin) : null;
                        if (!fi && !ff)
                            return false;
                        var t = hoy.getTime();
                        var ti = fi ? fi.getTime() : -Infinity;
                        var tf = ff ? ff.getTime() : Infinity;
                        return t >= ti && t <= tf;
                    })) !== null && _f !== void 0 ? _f : _this.ejercicios[0];
                }
                _this.ejercicioActual = elegido;
                _this.ejercicioActualId = elegido.id_ejercicio;
                _this.applyPeriodoFilter();
            },
            error: function (err) {
                console.error('❌ Error al cargar ejercicios:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los ejercicios contables.'
                });
                _this.ejercicioActual = null;
            }
        });
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
        if (typeof svc.selectEjercicio !== 'function')
            return;
        svc.selectEjercicio(id_ejercicio).subscribe({
            next: function () { return _this.showToast({
                type: 'success',
                title: 'Ejercicio actualizado',
                message: "Se guard\u00F3 el ejercicio " + id_ejercicio + " como activo."
            }); },
            error: function () {
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo actualizar el ejercicio seleccionado.' });
            }
        });
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
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                        return ({
                            id_periodo: Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID),
                            id_ejercicio: _this.toNumOrNull((_f = (_e = (_d = (_c = p.id_ejercicio) !== null && _c !== void 0 ? _c : p.ejercicio_id) !== null && _d !== void 0 ? _d : p.ejercicio) !== null && _e !== void 0 ? _e : p.idEjercicio) !== null && _f !== void 0 ? _f : p.ID_EJERCICIO),
                            fecha_inicio: _this.fmtDate((_k = (_j = (_h = (_g = p.fecha_inicio) !== null && _g !== void 0 ? _g : p.fechaInicio) !== null && _h !== void 0 ? _h : p.inicio) !== null && _j !== void 0 ? _j : p.start_date) !== null && _k !== void 0 ? _k : p.fecha_ini),
                            fecha_fin: _this.fmtDate((_p = (_o = (_m = (_l = p.fecha_fin) !== null && _l !== void 0 ? _l : p.fechaFin) !== null && _m !== void 0 ? _m : p.fin) !== null && _o !== void 0 ? _o : p.end_date) !== null && _p !== void 0 ? _p : p.fecha_fin),
                            _raw: p
                        });
                    });
                    _this.applyPeriodoFilter();
                },
                error: function () { return _this.cargarPeriodosAllHttp(); }
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
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                    return ({
                        id_periodo: Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID),
                        id_ejercicio: _this.toNumOrNull((_f = (_e = (_d = (_c = p.id_ejercicio) !== null && _c !== void 0 ? _c : p.ejercicio_id) !== null && _d !== void 0 ? _d : p.ejercicio) !== null && _e !== void 0 ? _e : p.idEjercicio) !== null && _f !== void 0 ? _f : p.ID_EJERCICIO),
                        fecha_inicio: _this.fmtDate((_k = (_j = (_h = (_g = p.fecha_inicio) !== null && _g !== void 0 ? _g : p.fechaInicio) !== null && _h !== void 0 ? _h : p.inicio) !== null && _j !== void 0 ? _j : p.start_date) !== null && _k !== void 0 ? _k : p.fecha_ini),
                        fecha_fin: _this.fmtDate((_p = (_o = (_m = (_l = p.fecha_fin) !== null && _l !== void 0 ? _l : p.fechaFin) !== null && _m !== void 0 ? _m : p.fin) !== null && _o !== void 0 ? _o : p.end_date) !== null && _p !== void 0 ? _p : p.fecha_fin),
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
    PolizaEditarComponent.prototype.cargarPoliza = function (id) {
        var _this = this;
        var ORDER_KEY = function (pid) { return "polizaOrder:" + pid; };
        var loadSavedOrder = function (pid) {
            try {
                return JSON.parse(localStorage.getItem(ORDER_KEY(pid)) || '[]');
            }
            catch (_a) {
                return [];
            }
        };
        var saveOrder = function (pid, movs) {
            var ids = movs.map(function (m) { return Number(m.id_movimiento); }).filter(function (n) { return Number.isFinite(n); });
            try {
                localStorage.setItem(ORDER_KEY(pid), JSON.stringify(ids));
            }
            catch (_a) { }
        };
        var getTime = function (m) {
            var _a, _b;
            var s = (_b = (_a = m === null || m === void 0 ? void 0 : m.created_at) !== null && _a !== void 0 ? _a : m === null || m === void 0 ? void 0 : m.fecha) !== null && _b !== void 0 ? _b : null;
            var t = s ? Date.parse(String(s)) : NaN;
            return Number.isFinite(t) ? t : NaN;
        };
        this.loading = true;
        this.http.get(this.apiBase + "/poliza/" + id + "/movimientos").subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e, _f;
                var savedOrderIds = loadSavedOrder(Number((_a = res === null || res === void 0 ? void 0 : res.id_poliza) !== null && _a !== void 0 ? _a : id));
                var savedRank = new Map(savedOrderIds.map(function (mid, i) { return [Number(mid), i]; }));
                var movs = ((_b = res === null || res === void 0 ? void 0 : res.movimientos) !== null && _b !== void 0 ? _b : []).map(function (m, idx) {
                    var _a;
                    var mm = _this.normalizeMovimiento(m);
                    mm._arrival = idx;
                    mm.orden = (typeof (m === null || m === void 0 ? void 0 : m.orden) === 'number') ? Number(m.orden) : idx;
                    var c = _this.cuentasMap.get(Number(mm.id_cuenta || 0));
                    mm._cuentaQuery = c ? c.codigo + " \u2014 " + c.nombre : ((_a = mm._cuentaQuery) !== null && _a !== void 0 ? _a : '');
                    return mm;
                });
                var rank = function (m) {
                    var idm = Number(m.id_movimiento);
                    if (Number.isFinite(idm) && savedRank.has(idm))
                        return { type: 0, v: savedRank.get(idm) };
                    var t = getTime(m);
                    if (Number.isFinite(t))
                        return { type: 1, v: t };
                    if (Number.isFinite(idm))
                        return { type: 2, v: idm };
                    return { type: 3, v: Number(m._arrival) || Number.MAX_SAFE_INTEGER };
                };
                movs.sort(function (a, b) {
                    var ra = rank(a), rb = rank(b);
                    if (ra.type !== rb.type)
                        return ra.type - rb.type;
                    if (ra.v !== rb.v)
                        return ra.v - rb.v;
                    var aa = Number(a._arrival) || 0;
                    var ab = Number(b._arrival) || 0;
                    return aa - ab;
                });
                movs.forEach(function (m, i) {
                    if (!Number.isFinite(Number(m.orden)))
                        m.orden = i;
                });
                saveOrder(Number((_c = res === null || res === void 0 ? void 0 : res.id_poliza) !== null && _c !== void 0 ? _c : id), movs);
                var idPeriodoRaw = Number(res === null || res === void 0 ? void 0 : res.id_periodo);
                var idPeriodo = Number.isFinite(idPeriodoRaw) ? idPeriodoRaw : undefined;
                _this.poliza = {
                    id_poliza: res === null || res === void 0 ? void 0 : res.id_poliza,
                    id_tipopoliza: Number(res === null || res === void 0 ? void 0 : res.id_tipopoliza),
                    id_periodo: idPeriodo,
                    id_usuario: Number(res === null || res === void 0 ? void 0 : res.id_usuario),
                    id_centro: Number(res === null || res === void 0 ? void 0 : res.id_centro),
                    folio: String((_d = res === null || res === void 0 ? void 0 : res.folio) !== null && _d !== void 0 ? _d : ''),
                    concepto: String((_e = res === null || res === void 0 ? void 0 : res.concepto) !== null && _e !== void 0 ? _e : ''),
                    movimientos: movs,
                    estado: res === null || res === void 0 ? void 0 : res.estado,
                    fecha_creacion: res === null || res === void 0 ? void 0 : res.fecha_creacion,
                    created_at: res === null || res === void 0 ? void 0 : res.created_at,
                    updated_at: res === null || res === void 0 ? void 0 : res.updated_at
                };
                _this.applyPeriodoFilter();
                _this.cuentasFiltradas = new Array(((_f = _this.poliza.movimientos) === null || _f === void 0 ? void 0 : _f.length) || 0).fill([]);
                _this.prefillCuentaQueries();
            },
            error: function (err) {
                var _a, _b;
                console.error('Poliza cargar:', err);
                _this.errorMsg = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'No se pudo cargar la póliza.';
                _this.showToast({ type: 'warning', title: 'Aviso', message: _this.errorMsg });
            },
            complete: function () { return (_this.loading = false); }
        });
    };
    PolizaEditarComponent.prototype.normalizeMovimiento = function (m) {
        var _a, _b, _c, _d, _e, _f;
        var base = __assign({ id_cuenta: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_cuenta), ref_serie_venta: (_a = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.ref_serie_venta)) !== null && _a !== void 0 ? _a : '', operacion: ((_b = m === null || m === void 0 ? void 0 : m.operacion) !== null && _b !== void 0 ? _b : '').toString(), monto: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.monto), cliente: (_c = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.cliente)) !== null && _c !== void 0 ? _c : '', fecha: (_d = this.toDateOrNull(m === null || m === void 0 ? void 0 : m.fecha)) !== null && _d !== void 0 ? _d : '', cc: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.cc), uuid: (_e = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.uuid)) !== null && _e !== void 0 ? _e : null, id_poliza: (_f = this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_poliza)) !== null && _f !== void 0 ? _f : undefined }, ((m === null || m === void 0 ? void 0 : m.id_movimiento) != null ? { id_movimiento: Number(m.id_movimiento) } : {}));
        if (typeof (m === null || m === void 0 ? void 0 : m.orden) === 'number')
            base.orden = Number(m.orden);
        return base;
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
    PolizaEditarComponent.prototype.lockBodyScroll = function (on) {
        try {
            document.body.style.overflow = on ? 'hidden' : '';
        }
        catch (_a) { }
    };
    PolizaEditarComponent.prototype.onCargoChange = function (i, value) {
        var _a, _b;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var m = movs[i];
        if (!m)
            return;
        var n = this.toNumOrNull(value);
        if (n == null || n <= 0) {
            if (String(m.operacion) === '0')
                m.monto = null;
            if (((_b = this.toNumOrNull(m.monto)) !== null && _b !== void 0 ? _b : 0) <= 0)
                m.operacion = '';
            return;
        }
        m.operacion = '0';
        m.monto = n;
    };
    PolizaEditarComponent.prototype.onAbonoChange = function (i, value) {
        var _a, _b;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var m = movs[i];
        if (!m)
            return;
        var n = this.toNumOrNull(value);
        if (n == null || n <= 0) {
            if (String(m.operacion) === '1')
                m.monto = null;
            if (((_b = this.toNumOrNull(m.monto)) !== null && _b !== void 0 ? _b : 0) <= 0)
                m.operacion = '';
            return;
        }
        m.operacion = '1';
        m.monto = n;
    };
    // ----------------- Actualizar póliza -----------------
    PolizaEditarComponent.prototype.actualizarPoliza = function () {
        var _this = this;
        var _a, _b, _c, _d;
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
        ((_b = p.movimientos) !== null && _b !== void 0 ? _b : []).forEach(function (m, idx) { m.orden = idx; });
        this.lastOrderMap.clear();
        ((_c = p.movimientos) !== null && _c !== void 0 ? _c : []).forEach(function (m, idx) {
            var _a;
            var idMov = Number((_a = m) === null || _a === void 0 ? void 0 : _a.id_movimiento);
            if (Number.isFinite(idMov))
                _this.lastOrderMap.set(idMov, idx);
        });
        var payloadHeader = {
            id_tipopoliza: this.toNumOrNull(p.id_tipopoliza),
            id_periodo: this.toNumOrNull(p.id_periodo),
            id_usuario: this.toNumOrNull(p.id_usuario),
            id_centro: this.toNumOrNull(p.id_centro),
            folio: this.toStrOrNull(p.folio),
            concepto: this.toStrOrNull(p.concepto)
        };
        var movs = ((_d = p.movimientos) !== null && _d !== void 0 ? _d : []);
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
                uuid: _this.toStrOrNull(m.uuid),
                orden: _this.toNumOrNull(m.orden)
            }).pipe(rxjs_1.tap({ next: function () { return _this.saveDone++; }, error: function () { return _this.saveDone++; } }), rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return _this.annotateError(err, { i: i, uuid: (_a = m.uuid) !== null && _a !== void 0 ? _a : null, id_mov: m.id_movimiento }); }); }));
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
                uuid: _this.toStrOrNull(m.uuid),
                orden: _this.toNumOrNull(m.orden)
            }).pipe(rxjs_1.tap({ next: function () { return _this.saveDone++; }, error: function () { return _this.saveDone++; } }), rxjs_1.catchError(function (err) { return rxjs_1.throwError(function () { var _a; return _this.annotateError(err, { i: i, uuid: (_a = m.uuid) !== null && _a !== void 0 ? _a : null, id_mov: undefined }); }); }));
        });
        var reqs = __spreadArrays(updateReqs, createReqs);
        this.saving = true;
        this.saveTotal = reqs.length;
        this.saveDone = 0;
        this.lockBodyScroll(true);
        this.apiSvc.updatePoliza(this.poliza.id_poliza, payloadHeader).pipe(rxjs_1.switchMap(function () { return reqs.length ? rxjs_1.forkJoin(reqs) : rxjs_1.of(null); }), rxjs_1.finalize(function () {
            _this.saving = false;
            _this.saveTotal = 0;
            _this.saveDone = 0;
            _this.lockBodyScroll(false);
            _this.updating = false;
        })).subscribe({
            next: function () {
                _this.showToast({ type: 'success', title: 'Listo', message: 'Póliza actualizada correctamente.' });
                if (toCreate.length > 0)
                    _this.cargarPoliza(_this.poliza.id_poliza);
            },
            error: function (err) {
                var _a;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al actualizar póliza/movimientos';
                console.error('Actualizar:', err);
                _this.showToast({ type: 'warning', title: 'Aviso', message: msg });
            }
        });
    };
    //  Cuentas 
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
    PolizaEditarComponent.prototype.cargarCuentas = function (onDone) {
        var _this = this;
        this.cuentasSvc.getCuentas().subscribe({
            next: function (arr) {
                var items = _this.normalizeList(arr);
                var nodos = (items || [])
                    .map(function (x) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                    var id = Number((_b = (_a = x.id_cuenta) !== null && _a !== void 0 ? _a : x.id) !== null && _b !== void 0 ? _b : x.ID);
                    var codigo = String((_e = (_d = (_c = x.codigo) !== null && _c !== void 0 ? _c : x.clave) !== null && _d !== void 0 ? _d : x.CODIGO) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_h = (_g = (_f = x.nombre) !== null && _f !== void 0 ? _f : x.descripcion) !== null && _g !== void 0 ? _g : x.NOMBRE) !== null && _h !== void 0 ? _h : '').trim();
                    var parentIdRaw = (_k = (_j = x.parentId) !== null && _j !== void 0 ? _j : x.parent_id) !== null && _k !== void 0 ? _k : null;
                    var parentId = parentIdRaw != null ? Number(parentIdRaw) : null;
                    var posteableRaw = (_o = (_m = (_l = x.posteable) !== null && _l !== void 0 ? _l : x.es_posteable) !== null && _m !== void 0 ? _m : x.posteable_flag) !== null && _o !== void 0 ? _o : x.posteable_indicator;
                    var ctaMayorRaw = (_r = (_q = (_p = x.ctaMayor) !== null && _p !== void 0 ? _p : x.cta_mayor) !== null && _q !== void 0 ? _q : x.es_mayor) !== null && _r !== void 0 ? _r : x.mayor_flag;
                    var posteable = posteableRaw === true || posteableRaw === 1 || posteableRaw === '1';
                    var ctaMayor = ctaMayorRaw === true || ctaMayorRaw === 1 || ctaMayorRaw === '1';
                    return { id: id, codigo: codigo, nombre: nombre, parentId: parentId, posteable: posteable, ctaMayor: ctaMayor, hijos: [] };
                })
                    .filter(function (n) { return Number.isFinite(n.id); });
                var porId = new Map();
                nodos.forEach(function (n) { return porId.set(n.id, n); });
                var raices = [];
                porId.forEach(function (nodo) {
                    if (nodo.parentId) {
                        var padre = porId.get(nodo.parentId);
                        if (padre)
                            padre.hijos.push(nodo);
                        else
                            raices.push(nodo);
                    }
                    else {
                        raices.push(nodo);
                    }
                });
                var sortTree = function (n) {
                    n.hijos.sort(function (a, b) { return a.codigo.localeCompare(b.codigo, undefined, { numeric: true }); });
                    n.hijos.forEach(function (h) { return sortTree(h); });
                };
                raices.sort(function (a, b) { return a.codigo.localeCompare(b.codigo, undefined, { numeric: true }); });
                raices.forEach(function (r) { return sortTree(r); });
                var resultado = [];
                var visitar = function (nodo, nivel) {
                    var c = {
                        id_cuenta: nodo.id,
                        codigo: nodo.codigo,
                        nombre: nodo.nombre,
                        nivel: nivel,
                        esPadre: nodo.ctaMayor && !nodo.posteable,
                        ctaMayor: nodo.ctaMayor,
                        posteable: nodo.posteable
                    };
                    resultado.push(c);
                    nodo.hijos.forEach(function (h) { return visitar(h, nivel + 1); });
                };
                raices.forEach(function (r) { return visitar(r, 0); });
                _this.cuentas = resultado;
                _this.cuentasMap.clear();
                for (var _i = 0, _a = _this.cuentas; _i < _a.length; _i++) {
                    var c = _a[_i];
                    _this.cuentasMap.set(c.id_cuenta, c);
                }
                _this.cuentasParaModal = _this.cuentas.map(function (c) { return (__assign(__assign({}, c), { _expandido: !!c.esPadre, ctaMayor: !!c.ctaMayor, posteable: _this.esPosteable(c) })); });
                _this.prefillCuentaQueries();
                if (onDone)
                    onDone();
            },
            error: function (e) {
                console.error('Cuentas (editar):', e);
                if (onDone)
                    onDone();
            }
        });
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
    PolizaEditarComponent.prototype.nextOrden = function () {
        var _a;
        var movs = (_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : [];
        return movs.reduce(function (mx, m) { var _a; return Math.max(mx, Number((_a = m === null || m === void 0 ? void 0 : m.orden) !== null && _a !== void 0 ? _a : -1)); }, -1) + 1;
    };
    PolizaEditarComponent.prototype.agregarMovimiento = function () {
        var _a;
        var nuevo = {
            id_cuenta: null, ref_serie_venta: '', operacion: '',
            monto: null, cliente: '', fecha: '', cc: null, uuid: null,
            _cuentaQuery: '', orden: this.nextOrden()
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
    PolizaEditarComponent.prototype.closeConfirm = function () { this.confirmOpen = false; this.confirmIndex = null; };
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
            var _a, _b;
            ((_a = _this.poliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
            splice(i, 1);
            _this.cuentasFiltradas.splice(i, 1);
            ((_b = _this.poliza.movimientos) !== null && _b !== void 0 ? _b : []).forEach(function (m, idx) { m.orden = idx; });
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
                _this.showToast({ type: 'warning', title: 'Aviso', message: msg });
            }
        });
    };
    PolizaEditarComponent.prototype.cargarCfdiRecientes = function () {
        var _this = this;
        var _a, _b;
        var svc = this.apiSvc;
        var fn = svc.listCfdi || svc.getCfdi || svc.getCfdiRecientes || svc.listCfdiRecientes;
        var handle = function (arr) {
            _this.cfdiOptions = (arr || [])
                .map(function (x) {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                return ({
                    uuid: String((_b = (_a = x.uuid) !== null && _a !== void 0 ? _a : x.UUID) !== null && _b !== void 0 ? _b : '').trim(),
                    folio: (_d = (_c = x.folio) !== null && _c !== void 0 ? _c : x.Folio) !== null && _d !== void 0 ? _d : null,
                    fecha: (_f = (_e = x.fecha) !== null && _e !== void 0 ? _e : x.Fecha) !== null && _f !== void 0 ? _f : null,
                    total: (_h = (_g = x.total) !== null && _g !== void 0 ? _g : x.Total) !== null && _h !== void 0 ? _h : null
                });
            })
                .filter(function (o) { return !!o.uuid; });
        };
        if (typeof fn === 'function') {
            (_b = (_a = fn.call(svc, { limit: 100 })) === null || _a === void 0 ? void 0 : _a.subscribe) === null || _b === void 0 ? void 0 : _b.call(_a, {
                next: function (r) { var _a, _b, _c, _d; return handle(Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : [])); },
                error: function () { return _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar CFDI recientes.' }); }
            });
        }
        else {
            this.http.get(this.apiBase + "/cfdis?limit=100").subscribe({
                next: function (r) { var _a, _b, _c, _d; return handle(Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : [])); },
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
    PolizaEditarComponent.prototype.onXmlPickedForMovimiento = function (event, index) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, Promise, function () {
            var file, isXml, ctx, response, uuid_1, movs, err_1, msg;
            return __generator(this, function (_k) {
                switch (_k.label) {
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
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 3, 4, 5]);
                        ctx = {
                            folio: (_c = this.poliza) === null || _c === void 0 ? void 0 : _c.folio,
                            id_periodo: Number((_d = this.poliza) === null || _d === void 0 ? void 0 : _d.id_periodo),
                            id_centro: Number((_e = this.poliza) === null || _e === void 0 ? void 0 : _e.id_centro),
                            id_tipopoliza: Number((_f = this.poliza) === null || _f === void 0 ? void 0 : _f.id_tipopoliza)
                        };
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.apiSvc.uploadCfdiXml(file, ctx))];
                    case 2:
                        response = _k.sent();
                        uuid_1 = (response === null || response === void 0 ? void 0 : response.uuid) || (response === null || response === void 0 ? void 0 : response.UUID) || null;
                        if (!uuid_1) {
                            this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
                        }
                        else {
                            movs = ((_g = this.poliza) === null || _g === void 0 ? void 0 : _g.movimientos) || [];
                            if (!movs[index])
                                ((_h = this.poliza.movimientos) !== null && _h !== void 0 ? _h : ) = [];
                            index = {}[0];
                            movs[index].uuid = uuid_1;
                            if (!this.cfdiOptions.some(function (x) { return x.uuid === uuid_1; })) {
                                this.cfdiOptions = __spreadArrays([{ uuid: uuid_1 }], this.cfdiOptions).slice(0, 100);
                            }
                            this.showToast({ title: 'XML asociado', message: "UUID " + uuid_1 + " vinculado al movimiento " + (index + 1), type: 'success' });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        err_1 = _k.sent();
                        msg = ((_j = err_1 === null || err_1 === void 0 ? void 0 : err_1.error) === null || _j === void 0 ? void 0 : _j.message) || (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || 'Error al subir el XML.';
                        this.uploadXmlError = msg;
                        this.showToast({ title: 'Aviso', message: msg, type: 'warning' });
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
    //  Centros de costo 
    PolizaEditarComponent.prototype.getCentros = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCentrosCosto ||
            svc.listCentrosCosto ||
            svc.getCentroCostos ||
            svc.listCentroCostos ||
            svc.getCentrosDeCosto ||
            svc.listCentrosDeCosto ||
            svc.getCentros;
        if (typeof fn !== 'function') {
            this.centrosCosto = [];
            this.centrosCostoMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                var crudos = (items || [])
                    .map(function (x) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                    var id = Number((_b = (_a = x.id_centro) !== null && _a !== void 0 ? _a : x.id) !== null && _b !== void 0 ? _b : x.ID);
                    var parentRaw = (_f = (_e = (_d = (_c = x.parent_id) !== null && _c !== void 0 ? _c : x.parentId) !== null && _d !== void 0 ? _d : x.id_centro_padre) !== null && _e !== void 0 ? _e : x.centro_padre) !== null && _f !== void 0 ? _f : null;
                    var parent_id = (parentRaw != null && parentRaw !== '') ? Number(parentRaw) : null;
                    var serie = String((_j = (_h = (_g = x.serie_venta) !== null && _g !== void 0 ? _g : x.serie) !== null && _h !== void 0 ? _h : x.codigo) !== null && _j !== void 0 ? _j : '').trim();
                    var nom = String((_o = (_m = (_l = (_k = x.nombre) !== null && _k !== void 0 ? _k : x.nombre_centro) !== null && _l !== void 0 ? _l : x.descripcion) !== null && _m !== void 0 ? _m : x.NOMBRE) !== null && _o !== void 0 ? _o : '').trim();
                    var clave = String((_q = (_p = x.clave) !== null && _p !== void 0 ? _p : x.codigo) !== null && _q !== void 0 ? _q : '').trim();
                    var etiqueta = serie ? serie + " \u2014 " + nom : (clave ? clave + " \u2014 " + nom : (nom || "CC " + id));
                    return {
                        id_centrocosto: id,
                        parent_id: parent_id,
                        nombre: etiqueta,
                        clave: clave,
                        serie_venta: serie
                    };
                })
                    .filter(function (cc) { return Number.isFinite(cc.id_centrocosto); });
                var porId = new Map();
                crudos.forEach(function (c) { return porId.set(c.id_centrocosto, __assign(__assign({}, c), { children: [] })); });
                var raices = [];
                porId.forEach(function (node) {
                    if (node.parent_id != null && porId.has(node.parent_id))
                        porId.get(node.parent_id).children.push(node);
                    else
                        raices.push(node);
                });
                var sortTree = function (n) {
                    n.children.sort(function (a, b) {
                        var ka = (a.serie_venta + " " + a.nombre).toLowerCase();
                        var kb = (b.serie_venta + " " + b.nombre).toLowerCase();
                        return ka.localeCompare(kb, undefined, { numeric: true });
                    });
                    n.children.forEach(function (h) { return sortTree(h); });
                };
                raices.sort(function (a, b) {
                    var ka = (a.serie_venta + " " + a.nombre).toLowerCase();
                    var kb = (b.serie_venta + " " + b.nombre).toLowerCase();
                    return ka.localeCompare(kb, undefined, { numeric: true });
                });
                raices.forEach(function (r) { return sortTree(r); });
                var resultado = [];
                var visitar = function (n, nivel) {
                    var _a;
                    var hijos = (_a = n.children) !== null && _a !== void 0 ? _a : [];
                    resultado.push({
                        id_centrocosto: n.id_centrocosto,
                        parent_id: n.parent_id,
                        nombre: n.nombre,
                        clave: n.clave,
                        serie_venta: n.serie_venta,
                        nivel: nivel,
                        esPadre: hijos.length > 0,
                        posteable: true,
                        _expandido: nivel === 0
                    });
                    hijos.forEach(function (h) { return visitar(h, nivel + 1); });
                };
                raices.forEach(function (r) { return visitar(r, 0); });
                _this.centrosCosto = resultado;
                _this.centrosCostoMap = new Map(_this.centrosCosto.map(function (cc) { return [cc.id_centrocosto, cc]; }));
                _this.centrosCostoComoCuentas = _this.centrosCosto.map(function (cc) {
                    var _a, _b, _c;
                    return ({
                        id_cuenta: cc.id_centrocosto,
                        codigo: cc.clave || cc.serie_venta || '',
                        nombre: cc.nombre,
                        nivel: (_a = cc.nivel) !== null && _a !== void 0 ? _a : 0,
                        esPadre: (_b = cc.esPadre) !== null && _b !== void 0 ? _b : false,
                        posteable: true,
                        _expandido: (_c = cc._expandido) !== null && _c !== void 0 ? _c : (cc.nivel === 0)
                    });
                });
            },
            error: function () {
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar Centros de Costo.' });
                _this.centrosCosto = [];
                _this.centrosCostoMap.clear();
            }
        });
    };
    PolizaEditarComponent.prototype.labelCentroHeader = function (id) {
        if (!id)
            return 'Seleccione…';
        var c = this.centrosCosto.find(function (x) { return Number(x.id_centrocosto) === Number(id); });
        return c ? c.nombre : 'Seleccione…';
    };
    PolizaEditarComponent.prototype.labelCentroCostoMov = function (id) {
        var ccNum = this.toNumOrNull(id);
        if (ccNum == null)
            return '';
        var c = this.centrosCostoMap.get(Number(ccNum)) || this.centrosCosto.find(function (x) { return Number(x.id_centrocosto) === Number(ccNum); });
        return c ? c.nombre : '';
    };
    PolizaEditarComponent.prototype.abrirModalCentro = function () {
        var _a, _b;
        this.centroMovimientoIndex = null; // ✅ importante
        this.modalCentroAbierto = true;
        this.centroSeleccionadoModal = (_b = (_a = this.poliza) === null || _a === void 0 ? void 0 : _a.id_centro) !== null && _b !== void 0 ? _b : null;
    };
    PolizaEditarComponent.prototype.abrirModalCentroMovimiento = function (i) {
        var _a, _b, _c, _d;
        this.centroMovimientoIndex = i;
        var movs = ((_b = (_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) !== null && _b !== void 0 ? _b : []);
        this.centroSeleccionadoModal = (_d = (_c = movs[i]) === null || _c === void 0 ? void 0 : _c.cc) !== null && _d !== void 0 ? _d : null;
        this.modalCentroAbierto = true;
    };
    PolizaEditarComponent.prototype.cerrarModalCentro = function () {
        this.modalCentroAbierto = false;
        this.centroMovimientoIndex = null; // ✅ reset
    };
    PolizaEditarComponent.prototype.onCentroSeleccionadoModal = function (cuentaCentro) {
        var _a, _b, _c, _d, _e;
        var idCentro = Number((_c = (_b = (_a = cuentaCentro === null || cuentaCentro === void 0 ? void 0 : cuentaCentro.id_cuenta) !== null && _a !== void 0 ? _a : cuentaCentro === null || cuentaCentro === void 0 ? void 0 : cuentaCentro.id_centrocosto) !== null && _b !== void 0 ? _b : cuentaCentro === null || cuentaCentro === void 0 ? void 0 : cuentaCentro.id) !== null && _c !== void 0 ? _c : null);
        if (!Number.isFinite(idCentro)) {
            this.showToast({ type: 'warning', title: 'Centro', message: 'No se pudo determinar el centro seleccionado.' });
            this.cerrarModalCentro();
            return;
        }
        if (this.centroMovimientoIndex != null) {
            var i = this.centroMovimientoIndex;
            var movs = ((_e = (_d = this.poliza) === null || _d === void 0 ? void 0 : _d.movimientos) !== null && _e !== void 0 ? _e : []);
            if (movs[i]) {
                movs[i].cc = idCentro;
                this.onMovimientoCcChange(i, idCentro);
            }
            this.cerrarModalCentro();
            return;
        }
        var oldCentro = this.toNumOrNull(this.poliza.id_centro);
        this.poliza.id_centro = idCentro;
        this.propagarCentroEnMovimientos(oldCentro, idCentro);
        this.cerrarModalCentro();
    };
    PolizaEditarComponent.prototype.propagarCentroEnMovimientos = function (oldCentroId, newCentroId) {
        var _this = this;
        var _a, _b;
        var movs = ((_b = (_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) !== null && _b !== void 0 ? _b : []);
        if (!movs.length)
            return;
        var oldSerie = oldCentroId ? this.getSerieVentaByCcId(oldCentroId) : null;
        var newSerie = this.getSerieVentaByCcId(newCentroId);
        movs.forEach(function (m) {
            var _a;
            var ccNum = _this.toNumOrNull(m.cc);
            if (!ccNum || (oldCentroId && ccNum === oldCentroId))
                m.cc = newCentroId;
            var refStr = ((_a = m.ref_serie_venta) !== null && _a !== void 0 ? _a : '').toString().trim();
            var debeActualizarSerie = !refStr || (oldSerie && refStr === oldSerie);
            if (newSerie && debeActualizarSerie)
                m.ref_serie_venta = newSerie;
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
    //  Modal cuentas 
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
    //  Totales 
    PolizaEditarComponent.prototype.getTotal = function (tipo) {
        var _a;
        var movs = Array.isArray((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) ? this.poliza.movimientos : [];
        return movs
            .filter(function (m) { return String(m.operacion) === tipo; })
            .reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
    };
    PolizaEditarComponent.prototype.getDiferencia = function () { return this.getTotal('0') - this.getTotal('1'); };
    Object.defineProperty(PolizaEditarComponent.prototype, "currentUserLabel", {
        get: function () {
            var _a;
            return (((_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.nombre) || '').toString().trim();
        },
        enumerable: false,
        configurable: true
    });
    PolizaEditarComponent.prototype.descargarBlob = function (blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    PolizaEditarComponent.prototype.xmlEscape = function (s) {
        var str = (s !== null && s !== void 0 ? s : '').toString();
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };
    PolizaEditarComponent.prototype.fmtMoney = function (v) {
        var n = Number(v !== null && v !== void 0 ? v : 0);
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);
    };
    PolizaEditarComponent.prototype.opLabel = function (op) {
        return String(op) === '1' || op === 1 ? 'Abono' : 'Cargo';
    };
    PolizaEditarComponent.prototype.safeStr = function (v) { return (v !== null && v !== void 0 ? v : '').toString(); };
    PolizaEditarComponent.prototype.buildTablaMovimientosPresentacion = function () {
        var _this = this;
        var _a, _b;
        var movs = ((_b = (_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) !== null && _b !== void 0 ? _b : []);
        return movs.map(function (m, i) {
            var _a, _b, _c, _d, _e;
            var c = _this.cuentasMap.get(Number(m.id_cuenta));
            var codigo = (_a = c === null || c === void 0 ? void 0 : c.codigo) !== null && _a !== void 0 ? _a : String((_b = m.id_cuenta) !== null && _b !== void 0 ? _b : '');
            var nombre = (_c = c === null || c === void 0 ? void 0 : c.nombre) !== null && _c !== void 0 ? _c : '';
            return {
                '#': i + 1,
                'Cuenta': nombre ? codigo + " \u2014 " + nombre : codigo,
                'Operación': _this.opLabel(m.operacion),
                'Monto': Number((_d = m.monto) !== null && _d !== void 0 ? _d : 0),
                'Cliente / Concepto': _this.safeStr(m.cliente || m.concepto),
                'Fecha': _this.fmtDate(m.fecha),
                'CC': (_e = m.cc) !== null && _e !== void 0 ? _e : '',
                'Serie Venta': _this.safeStr(m.ref_serie_venta),
                'UUID': _this.safeStr(m.uuid)
            };
        });
    };
    PolizaEditarComponent.prototype.headerPolizaProfesional = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        var p = this.poliza || {};
        return {
            'Póliza': (_b = (_a = p === null || p === void 0 ? void 0 : p.folio) !== null && _a !== void 0 ? _a : p === null || p === void 0 ? void 0 : p.id_poliza) !== null && _b !== void 0 ? _b : '',
            'Folio': (_c = p.folio) !== null && _c !== void 0 ? _c : '',
            'Tipo': (_d = p.id_tipopoliza) !== null && _d !== void 0 ? _d : '',
            'Periodo': (_e = p.id_periodo) !== null && _e !== void 0 ? _e : '',
            'Centro (id_centro)': (_f = p.id_centro) !== null && _f !== void 0 ? _f : '',
            'Usuario (id_usuario)': (_g = p.id_usuario) !== null && _g !== void 0 ? _g : '',
            'Concepto': (_h = p.concepto) !== null && _h !== void 0 ? _h : '',
            'Fecha creación': this.fmtDate(p.fecha_creacion || p.created_at || '')
        };
    };
    PolizaEditarComponent.prototype.buildHeaderPairs = function (headerObj) {
        var entries = Object.entries(headerObj).map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, String(v)];
        });
        var rows = [];
        for (var i = 0; i < entries.length; i += 2) {
            var a = entries[i];
            var b = entries[i + 1] || ['', ''];
            rows.push([a[0], a[1], b[0], b[1]]);
        }
        return rows;
    };
    PolizaEditarComponent.prototype.exportarPDFPoliza = function () {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var _f, jsPDF, autoTable, doc, left, top, line, folioTxt, hoy, headerPairs, data, startY, finalY, cargos, abonos, dif, folio, e_1;
            var _this = this;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                Promise.resolve().then(function () { return require('jspdf'); }),
                                Promise.resolve().then(function () { return require('jspdf-autotable'); }),
                            ])];
                    case 1:
                        _f = _g.sent(), jsPDF = _f[0]["default"], autoTable = _f[1];
                        doc = new jsPDF({ unit: 'pt', format: 'a4' });
                        left = 40, top = 40, line = 18;
                        folioTxt = String(((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.folio) || ((_b = this.poliza) === null || _b === void 0 ? void 0 : _b.id_poliza) || '');
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(16);
                        doc.text("P\u00F3liza " + folioTxt, left, top);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        hoy = new Date();
                        doc.text("Generado: " + new Intl.DateTimeFormat('es-MX', {
                            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        }).format(hoy), left, top + line);
                        headerPairs = this.buildHeaderPairs(this.headerPolizaProfesional());
                        autoTable["default"](doc, {
                            startY: top + line * 2,
                            head: [['Campo', 'Valor', 'Campo', 'Valor']],
                            body: headerPairs,
                            styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
                            headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: 'bold' },
                            theme: 'striped',
                            margin: { left: left, right: left }
                        });
                        data = this.buildTablaMovimientosPresentacion();
                        startY = ((_c = doc.lastAutoTable) === null || _c === void 0 ? void 0 : _c.finalY) ? doc.lastAutoTable.finalY + 18 : 160;
                        autoTable["default"](doc, {
                            startY: startY,
                            head: [['#', 'Cuenta', 'Operación', 'Monto', 'Cliente / Concepto', 'Fecha', 'CC', 'Serie Venta', 'UUID']],
                            body: data.map(function (r) { return [
                                r['#'], r['Cuenta'], r['Operación'], _this.fmtMoney(r['Monto']),
                                r['Cliente / Concepto'], r['Fecha'], r['CC'], r['Serie Venta'], r['UUID']
                            ]; }),
                            styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
                            headStyles: { fillColor: [245, 245, 245], textColor: 20, fontStyle: 'bold' },
                            theme: 'striped',
                            margin: { left: left, right: left }
                        });
                        finalY = (_e = (_d = doc.lastAutoTable) === null || _d === void 0 ? void 0 : _d.finalY) !== null && _e !== void 0 ? _e : startY;
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10);
                        cargos = this.fmtMoney(this.getTotal('0'));
                        abonos = this.fmtMoney(this.getTotal('1'));
                        dif = this.fmtMoney(this.getDiferencia());
                        doc.text("Cargos: " + cargos + "   Abonos: " + abonos + "   Diferencia: " + dif, left, finalY + 16);
                        folio = folioTxt.replace(/[^\w-]+/g, '_');
                        doc.save("Poliza-" + (folio || 'sin_folio') + ".pdf");
                        this.showToast({ type: 'success', title: 'PDF', message: 'PDF exportado correctamente.' });
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _g.sent();
                        this.showToast({ type: 'warning', title: 'Aviso', message: (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || 'No se pudo exportar PDF.' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PolizaEditarComponent.prototype.exportarExcelPoliza = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var XLSX, folio, hojaNombre, H, headerPairs, entries, i, a, b, movs, movHeader, movBody, aoa, ws, movHeaderRow, firstDataRow, lastDataRow, r, cell, cargos, abonos, dif, totalsRow, wb, XLSXMime, wbout, blob, e_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('xlsx'); })];
                    case 1:
                        XLSX = _d.sent();
                        folio = String(((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.folio) || "poliza-" + ((_c = (_b = this.poliza) === null || _b === void 0 ? void 0 : _b.id_poliza) !== null && _c !== void 0 ? _c : '')).replace(/[^\w-]+/g, '_');
                        hojaNombre = "P\u00F3liza " + (folio || 'sin_folio');
                        H = this.headerPolizaProfesional();
                        headerPairs = [['Campo', 'Valor', 'Campo', 'Valor']];
                        entries = Object.entries(H).map(function (_a) {
                            var k = _a[0], v = _a[1];
                            return [k, String(v)];
                        });
                        for (i = 0; i < entries.length; i += 2) {
                            a = entries[i];
                            b = entries[i + 1] || ['', ''];
                            headerPairs.push([a[0], a[1], b[0], b[1]]);
                        }
                        movs = this.buildTablaMovimientosPresentacion();
                        movHeader = ['#', 'Cuenta', 'Operación', 'Monto', 'Cliente / Concepto', 'Fecha', 'CC', 'Serie Venta', 'UUID'];
                        movBody = movs.map(function (r) { return [
                            r['#'], r['Cuenta'], r['Operación'], Number(r['Monto']),
                            r['Cliente / Concepto'], r['Fecha'], r['CC'], r['Serie Venta'], r['UUID']
                        ]; });
                        aoa = __spreadArrays([
                            ["P\u00F3liza " + (folio || '')],
                            []
                        ], headerPairs, [
                            [],
                            movHeader
                        ], movBody);
                        ws = XLSX.utils.aoa_to_sheet(aoa);
                        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
                        ws['!cols'] = [
                            { wch: 4 }, { wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 44 },
                            { wch: 12 }, { wch: 8 }, { wch: 16 }, { wch: 40 },
                        ];
                        movHeaderRow = headerPairs.length + 4;
                        firstDataRow = movHeaderRow + 1;
                        lastDataRow = movHeaderRow + movBody.length;
                        for (r = firstDataRow; r <= lastDataRow; r++) {
                            cell = ws["D" + r];
                            if (cell)
                                cell.z = '"$"#,##0.00';
                        }
                        if (movBody.length > 0)
                            ws['!autofilter'] = { ref: "A" + movHeaderRow + ":I" + lastDataRow };
                        ws['!freeze'] = { xSplit: 0, ySplit: movHeaderRow };
                        cargos = this.getTotal('0');
                        abonos = this.getTotal('1');
                        dif = this.getDiferencia();
                        totalsRow = lastDataRow + 2;
                        XLSX.utils.sheet_add_aoa(ws, [
                            ['Totales'],
                            ['Cargos', cargos],
                            ['Abonos', abonos],
                            ['Diferencia', dif],
                        ], { origin: "A" + totalsRow });
                        wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, hojaNombre);
                        XLSXMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                        wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                        blob = new Blob([wbout], { type: XLSXMime });
                        this.descargarBlob(blob, "Poliza-" + (folio || 'sin_folio') + ".xlsx");
                        this.showToast({ type: 'success', title: 'Excel', message: 'Excel exportado correctamente.' });
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _d.sent();
                        this.showToast({ type: 'warning', title: 'Aviso', message: (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || 'No se pudo exportar Excel.' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
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
        if (/cfdi|uuid|comprobante/i.test(msg))
            return "CFDI/UUID: " + msg;
        return msg;
    };
    PolizaEditarComponent.prototype.annotateError = function (err, ctx) {
        var normalized = new Error(this.extractHttpErrorMessage(err));
        normalized.__ctx = ctx;
        return normalized;
    };
    //  Usuario actual 
    PolizaEditarComponent.prototype.normalizeUsuario = function (u) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        if (!u || typeof u !== 'object')
            return null;
        var raw = ((_c = (_b = (_a = u.user) !== null && _a !== void 0 ? _a : u.data) !== null && _b !== void 0 ? _b : u.currentUser) !== null && _c !== void 0 ? _c : u) || {};
        var s = function (v) { return (v !== null && v !== void 0 ? v : '').toString().trim(); };
        var rawId = (_j = (_h = (_g = (_f = (_e = (_d = raw.id_usuario) !== null && _d !== void 0 ? _d : raw.idUsuario) !== null && _e !== void 0 ? _e : raw.user_id) !== null && _f !== void 0 ? _f : raw.id) !== null && _g !== void 0 ? _g : raw.ID) !== null && _h !== void 0 ? _h : raw.sub) !== null && _j !== void 0 ? _j : raw.uid;
        var idNum = Number(String(rawId !== null && rawId !== void 0 ? rawId : '').replace(/[^\d.-]/g, ''));
        var nombreBase = s((_q = (_p = (_o = (_m = (_l = (_k = raw.nombre) !== null && _k !== void 0 ? _k : raw.name) !== null && _l !== void 0 ? _l : raw.full_name) !== null && _m !== void 0 ? _m : raw.fullName) !== null && _o !== void 0 ? _o : raw.display_name) !== null && _p !== void 0 ? _p : raw.displayName) !== null && _q !== void 0 ? _q : raw.username);
        var apP = s((_v = (_u = (_t = (_s = (_r = raw.apellido_p) !== null && _r !== void 0 ? _r : raw.apellidoP) !== null && _s !== void 0 ? _s : raw.apellido) !== null && _t !== void 0 ? _t : raw.apellidos) !== null && _u !== void 0 ? _u : raw.last_name) !== null && _v !== void 0 ? _v : raw.family_name);
        var apM = s((_w = raw.apellido_m) !== null && _w !== void 0 ? _w : raw.apellidoM);
        var nombre = [nombreBase, apP, apM].filter(Boolean).join(' ').trim();
        var emailRaw = s((_y = (_x = raw.email) !== null && _x !== void 0 ? _x : raw.correo) !== null && _y !== void 0 ? _y : raw.mail);
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
        var fn = svc.getCurrentUser || svc.me || svc.getUsuarioActual || svc.getUser || svc.getUsuario;
        if (typeof fn === 'function') {
            fn.call(svc).subscribe({
                next: function (r) { _this.currentUser = _this.normalizeUsuario(r); },
                error: function () { _this.currentUser = null; }
            });
            return;
        }
        this.currentUser = null;
    };
    PolizaEditarComponent.prototype.pad2 = function (n) { return String(n).padStart(2, '0'); };
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
        var _a, _b, _c, _d, _e;
        return Array.isArray(res) ? res : ((_e = (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.result) !== null && _d !== void 0 ? _d : res) !== null && _e !== void 0 ? _e : []);
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
                saving_overlay_component_1.SavingOverlayComponent
            ],
            templateUrl: './poliza-editar.component.html',
            styleUrls: ['./poliza-editar.component.scss']
        })
    ], PolizaEditarComponent);
    return PolizaEditarComponent;
}());
exports.PolizaEditarComponent = PolizaEditarComponent;
