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
exports.PolizasComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var router_1 = require("@angular/router");
var modal_seleccion_cuenta_component_1 = require("@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component");
var rxjs_1 = require("rxjs");
var PolizasComponent = /** @class */ (function () {
    function PolizasComponent(api) {
        var _this = this;
        this.api = api;
        this.ejercicioActual = null;
        this.sidebarOpen = true;
        // --- Manejo de XML por movimiento ---
        this.xmlMovimientoIndex = null;
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        // Usuario actual y CC
        this.currentUser = null;
        this.centrosCosto = [];
        this.centrosCostoMap = new Map();
        // Listado
        this.polizas = [];
        this.cuentasQuery = '';
        this.tiposPoliza = [];
        this.periodos = [];
        this.centros = [];
        // Catálogo de cuentas (para movimientos)
        this.cuentas = [];
        this.cuentasMap = new Map();
        // Formulario de nueva póliza
        this.nuevaPoliza = { movimientos: [] };
        // CFDI importados y selección de UUID
        this.cfdiOptions = [];
        // Toast
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
        this.onToastClosed = function () { _this.toast.open = false; };
        this.toNumOrNull = function (v) {
            return (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
        };
        this.toStrOrNull = function (v) {
            return (v == null ? null : (String(v).trim() || null));
        };
        this.toDateOrNull = function (v) {
            if (!v)
                return null;
            var s = String(v);
            if (/^\d{4}-\d{2}-\d{2}$/.test(s))
                return s;
            var d = new Date(s);
            if (isNaN(d.getTime()))
                return null;
            return d.getFullYear() + "-" + _this.pad2(d.getMonth() + 1) + "-" + _this.pad2(d.getDate());
        };
        // --- defaults de modo y evento ---
        this.modoCaptura = 'manual';
        this.evento = {
            tipo_operacion: 'ingreso',
            monto_base: null,
            fecha_operacion: '',
            id_empresa: 1,
            medio_cobro_pago: 'bancos',
            id_cuenta_contrapartida: null,
            cliente: '',
            ref_serie_venta: '',
            cc: null
        };
        //  Movimientos 
        this.normalizaStr = function (s) { var _a, _b; return (_b = (_a = s.normalize) === null || _a === void 0 ? void 0 : _a.call(s, 'NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) !== null && _b !== void 0 ? _b : s.toLowerCase(); };
        this.trackByFolio = function (_, x) { var _a; return (_a = x === null || x === void 0 ? void 0 : x.folio) !== null && _a !== void 0 ? _a : _; };
    }
    PolizasComponent.prototype.volver = function () {
        this.router.navigate(['/poliza-home']);
    };
    PolizasComponent.prototype.ngOnInit = function () {
        this.cargarEjercicioActivo();
        this.initUsuarioActual(); // setea id_usuario
        this.cargarCatalogos(); // tipos/periodos/centros
        this.getCentros(); // centros de costo para tabla
        this.cargarCuentas(); // catálogo de cuentas para select
        this.cargarPolizas(); // listado
        this.cargarCfdiRecientes(); // UUIDs
        if (!this.evento.id_empresa) {
            this.evento.id_empresa = 1;
        }
        if (!this.evento.fecha_operacion) {
            this.evento.fecha_operacion = this.todayISO();
        }
    };
    PolizasComponent.prototype.abrirModalCuentas = function (index) {
        this.indiceMovimientoSeleccionado = index;
        this.modalCuentasAbierto = true;
    };
    PolizasComponent.prototype.cerrarModalCuentas = function () {
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
    };
    PolizasComponent.prototype.onCuentaSeleccionadaModal = function (cuenta) {
        if (this.indiceMovimientoSeleccionado != null) {
            this.nuevaPoliza.movimientos[this.indiceMovimientoSeleccionado].id_cuenta = cuenta.id_cuenta;
        }
        this.cerrarModalCuentas();
    };
    PolizasComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    PolizasComponent.prototype.showToast = function (opts) {
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
    PolizasComponent.prototype.normalizeList = function (res) {
        var _a, _b, _c, _d;
        return Array.isArray(res) ? res : ((_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.result) !== null && _d !== void 0 ? _d : []);
    };
    PolizasComponent.prototype.pad2 = function (n) { return String(n).padStart(2, '0'); };
    PolizasComponent.prototype.fmtDate = function (d) {
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
    PolizasComponent.prototype.N = function (v) {
        if (v === '' || v === null || v === undefined)
            return undefined;
        var n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    PolizasComponent.prototype.initUsuarioActual = function () {
        var usr = this.leerUsuarioDescompuesto() || this.leerUsuarioDesdeJwt();
        if (usr && Number.isFinite(usr.id_usuario)) {
            this.currentUser = usr;
            if (!this.nuevaPoliza.id_usuario)
                this.nuevaPoliza.id_usuario = usr.id_usuario;
        }
    };
    PolizasComponent.prototype.leerUsuarioDescompuesto = function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            var w = window;
            var candidatos = [
                w === null || w === void 0 ? void 0 : w.Usuario,
                w === null || w === void 0 ? void 0 : w.usuario,
                w === null || w === void 0 ? void 0 : w.currentUser,
                localStorage.getItem('usuario'),
                localStorage.getItem('user'),
                sessionStorage.getItem('usuario')
            ];
            for (var _i = 0, candidatos_1 = candidatos; _i < candidatos_1.length; _i++) {
                var c = candidatos_1[_i];
                if (!c)
                    continue;
                var obj = typeof c === 'string' ? JSON.parse(c) : c;
                var id = Number((_c = (_b = (_a = obj === null || obj === void 0 ? void 0 : obj.id_usuario) !== null && _a !== void 0 ? _a : obj === null || obj === void 0 ? void 0 : obj.id) !== null && _b !== void 0 ? _b : obj === null || obj === void 0 ? void 0 : obj.sub) !== null && _c !== void 0 ? _c : obj === null || obj === void 0 ? void 0 : obj.uid);
                if (Number.isFinite(id)) {
                    return __assign({ id_usuario: id, nombre: (_f = (_e = (_d = obj === null || obj === void 0 ? void 0 : obj.nombre) !== null && _d !== void 0 ? _d : obj === null || obj === void 0 ? void 0 : obj.name) !== null && _e !== void 0 ? _e : obj === null || obj === void 0 ? void 0 : obj.username) !== null && _f !== void 0 ? _f : null, email: (_h = (_g = obj === null || obj === void 0 ? void 0 : obj.email) !== null && _g !== void 0 ? _g : obj === null || obj === void 0 ? void 0 : obj.correo) !== null && _h !== void 0 ? _h : null }, obj);
                }
            }
        }
        catch (_j) { }
        return null;
    };
    PolizasComponent.prototype.leerUsuarioDesdeJwt = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var token = localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token');
        if (!token)
            return null;
        var payload = this.decodeJwt(token);
        if (!payload)
            return null;
        var id = Number((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.id_usuario) !== null && _a !== void 0 ? _a : payload === null || payload === void 0 ? void 0 : payload.sub) !== null && _b !== void 0 ? _b : payload === null || payload === void 0 ? void 0 : payload.uid);
        if (!Number.isFinite(id))
            return null;
        return __assign({ id_usuario: id, nombre: (_e = (_d = (_c = payload === null || payload === void 0 ? void 0 : payload.nombre) !== null && _c !== void 0 ? _c : payload === null || payload === void 0 ? void 0 : payload.name) !== null && _d !== void 0 ? _d : payload === null || payload === void 0 ? void 0 : payload.username) !== null && _e !== void 0 ? _e : null, email: (_g = (_f = payload === null || payload === void 0 ? void 0 : payload.email) !== null && _f !== void 0 ? _f : payload === null || payload === void 0 ? void 0 : payload.correo) !== null && _g !== void 0 ? _g : null }, payload);
    };
    PolizasComponent.prototype.decodeJwt = function (token) {
        try {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var json = decodeURIComponent(atob(base64).split('').map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join(''));
            return JSON.parse(json);
        }
        catch (_a) {
            return null;
        }
    };
    PolizasComponent.prototype.getCuentasFiltradasGlobal = function () {
        var _this = this;
        var q = this.normalizaStr(String(this.cuentasQuery || '').trim());
        if (!q)
            return this.cuentas;
        return this.cuentas.filter(function (c) {
            var cad = c.codigo + " " + c.nombre;
            return _this.normalizaStr(cad).includes(q);
        });
    };
    PolizasComponent.prototype.onCuentaSeleccionada = function (index) {
        var _a;
        var movs = ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []);
        if (!movs[index])
            return;
        // Limpia el texto del buscador cuando se selecciona una cuenta
        movs[index]._cuentaQuery = '';
    };
    PolizasComponent.prototype.onCuentaSeleccionadaGlobal = function () {
        this.cuentasQuery = ''; // limpia el buscador global
    };
    PolizasComponent.prototype.getCuentasParaFila = function (index, selectedId) {
        var base = this.getCuentasFiltradasGlobal();
        if (!selectedId)
            return base;
        // Si ya está incluida, regresamos tal cual
        if (base.some(function (c) { return c.id_cuenta === selectedId; }))
            return base;
        // Si no está, la armamos desde el mapa y la agregamos al inicio
        var sel = this.cuentasMap.get(selectedId);
        return sel
            ? __spreadArrays([{ id_cuenta: selectedId, codigo: sel.codigo, nombre: sel.nombre }], base) : base;
    };
    PolizasComponent.prototype.cargarEjercicioActivo = function () {
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
            return;
        }
        var isList = (fn === svc.listEjercicios || fn === svc.getEjercicios);
        fn.call(this.api).subscribe({
            next: function (r) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                console.log('🔍 Resultado de ejercicios:', r); // 👈 esto te dirá qué devuelve tu backend
                var items = isList ? _this.normalizeList(r) : [r];
                if (!items || !items.length) {
                    console.warn('⚠ No se encontraron ejercicios.');
                    _this.ejercicioActual = null;
                    return;
                }
                // Elige el ejercicio activo o vigente
                var elegido = (_b = (_a = items.find(function (e) { return (e === null || e === void 0 ? void 0 : e.activo) === true || (e === null || e === void 0 ? void 0 : e.activo) === 1 || (e === null || e === void 0 ? void 0 : e.activo) === '1'; })) !== null && _a !== void 0 ? _a : items.find(function (e) {
                    var _a, _b;
                    var hoy = new Date().toISOString().slice(0, 10);
                    var fi = _this.fmtDate((_a = e === null || e === void 0 ? void 0 : e.fecha_inicio) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.inicio);
                    var ff = _this.fmtDate((_b = e === null || e === void 0 ? void 0 : e.fecha_fin) !== null && _b !== void 0 ? _b : e === null || e === void 0 ? void 0 : e.fin);
                    return fi <= hoy && hoy <= ff;
                })) !== null && _b !== void 0 ? _b : items[0];
                if (!elegido) {
                    console.warn('⚠ No se encontró ejercicio activo.');
                    _this.ejercicioActual = null;
                    return;
                }
                _this.ejercicioActual = {
                    id_ejercicio: Number((_e = (_d = (_c = elegido.id_ejercicio) !== null && _c !== void 0 ? _c : elegido.id) !== null && _d !== void 0 ? _d : elegido.ID) !== null && _e !== void 0 ? _e : 0),
                    nombre: String((_j = (_h = (_g = (_f = elegido.nombre) !== null && _f !== void 0 ? _f : elegido.descripcion) !== null && _g !== void 0 ? _g : elegido.year) !== null && _h !== void 0 ? _h : elegido.ejercicio) !== null && _j !== void 0 ? _j : '').trim() || "Ejercicio " + ((_k = elegido.id_ejercicio) !== null && _k !== void 0 ? _k : ''),
                    fecha_inicio: _this.fmtDate((_l = elegido.fecha_inicio) !== null && _l !== void 0 ? _l : elegido.inicio),
                    fecha_fin: _this.fmtDate((_m = elegido.fecha_fin) !== null && _m !== void 0 ? _m : elegido.fin),
                    activo: Boolean(elegido.activo)
                };
                console.log('✅ Ejercicio elegido:', _this.ejercicioActual);
            },
            error: function (err) {
                console.error('❌ Error al cargar ejercicio:', err);
                _this.showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudo cargar el ejercicio actual.'
                });
                _this.ejercicioActual = null;
            }
        });
    };
    Object.defineProperty(PolizasComponent.prototype, "ejercicioLabel", {
        // Etiqueta legible para UI
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
    // Helper: fecha hoy en ISO (YYYY-MM-DD)
    PolizasComponent.prototype.todayISO = function () {
        var d = new Date();
        var mm = this.pad2(d.getMonth() + 1);
        var dd = this.pad2(d.getDate());
        return d.getFullYear() + "-" + mm + "-" + dd;
    };
    //Catálogos 
    PolizasComponent.prototype.cargarCatalogos = function () {
        var _this = this;
        // Tipos de póliza
        this.api.getTiposPoliza().subscribe({
            next: function (r) {
                _this.tiposPoliza = _this.normalizeList(r).map(function (t) {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id_tipopoliza: Number((_b = (_a = t.id_tipopoliza) !== null && _a !== void 0 ? _a : t.id) !== null && _b !== void 0 ? _b : t.ID),
                        nombre: String((_e = (_d = (_c = t.nombre) !== null && _c !== void 0 ? _c : t.descripcion) !== null && _d !== void 0 ? _d : t.NOMBRE) !== null && _e !== void 0 ? _e : 'Tipo')
                    });
                });
            },
            error: function (err) {
                console.error('Tipos de póliza:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los tipos de póliza.' });
            }
        });
        // Periodos
        this.api.getPeriodos().subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.periodos = items.map(function (p) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    var id = Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID);
                    var fi0 = (_f = (_e = (_d = (_c = p.fecha_inicio) !== null && _c !== void 0 ? _c : p.fechaInicio) !== null && _d !== void 0 ? _d : p.inicio) !== null && _e !== void 0 ? _e : p.start_date) !== null && _f !== void 0 ? _f : p.fecha_ini;
                    var ff0 = (_k = (_j = (_h = (_g = p.fecha_fin) !== null && _g !== void 0 ? _g : p.fechaFin) !== null && _h !== void 0 ? _h : p.fin) !== null && _j !== void 0 ? _j : p.end_date) !== null && _k !== void 0 ? _k : p.fecha_fin;
                    return { id_periodo: id, nombre: _this.fmtDate(fi0) + " \u2014 " + _this.fmtDate(ff0) };
                });
            },
            error: function (err) {
                console.error('Periodos:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los periodos.' });
            }
        });
        // Centros (encabezado)
        this.api.getCentros().subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.centros = items.map(function (c) {
                    var _a, _b, _c, _d, _e, _f, _g;
                    var id = Number((_b = (_a = c.id_centro) !== null && _a !== void 0 ? _a : c.id) !== null && _b !== void 0 ? _b : c.ID);
                    var serie = String((_e = (_d = (_c = c.serie_venta) !== null && _c !== void 0 ? _c : c.serie) !== null && _d !== void 0 ? _d : c.codigo) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_g = (_f = c.nombre_centro) !== null && _f !== void 0 ? _f : c.descripcion) !== null && _g !== void 0 ? _g : '').trim();
                    var etiqueta = serie && nombre ? serie + " \u2014 " + nombre : (serie || nombre || "Centro " + id);
                    return { id_centro: id, nombre: etiqueta };
                });
            },
            error: function (err) {
                console.error('Centros:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
            }
        });
    };
    PolizasComponent.prototype.getCentros = function () {
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
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    var id = Number((_c = (_b = (_a = x.id_centro) !== null && _a !== void 0 ? _a : x.id_centro) !== null && _b !== void 0 ? _b : x.id) !== null && _c !== void 0 ? _c : x.ID);
                    var serie = String((_f = (_e = (_d = x.serie_venta) !== null && _d !== void 0 ? _d : x.serie) !== null && _e !== void 0 ? _e : x.codigo) !== null && _f !== void 0 ? _f : '').trim();
                    var nom = String((_j = (_h = (_g = x.nombre) !== null && _g !== void 0 ? _g : x.descripcion) !== null && _h !== void 0 ? _h : x.NOMBRE) !== null && _j !== void 0 ? _j : "CC " + id).trim();
                    var clave = String((_l = (_k = x.clave) !== null && _k !== void 0 ? _k : x.codigo) !== null && _l !== void 0 ? _l : '').trim();
                    var etiqueta = serie
                        ? serie + " \u2014 " + nom
                        : (clave ? clave + " \u2014 " + nom : nom);
                    return { id_centrocosto: id, nombre: etiqueta };
                })
                    .filter(function (cc) { return Number.isFinite(cc.id_centrocosto); });
                // Map SIEMPRE por ID (número), no por serie
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
    // Catálogo de cuentas (para movimientos)  
    PolizasComponent.prototype.cargarCuentas = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCuentas || svc.listCuentas ||
            svc.getCatalogoCuentas || svc.listCatalogoCuentas ||
            svc.getPlanCuentas || svc.listPlanCuentas;
        if (typeof fn !== 'function') {
            console.warn('No existe método de API para Cuentas; usando vacío.');
            this.cuentas = [];
            this.cuentasMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                var parsed = (items || []).map(function (x) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    var id = Number((_b = (_a = x.id_cuenta) !== null && _a !== void 0 ? _a : x.id) !== null && _b !== void 0 ? _b : x.ID);
                    var codigo = String((_e = (_d = (_c = x.codigo) !== null && _c !== void 0 ? _c : x.clave) !== null && _d !== void 0 ? _d : x.CODIGO) !== null && _e !== void 0 ? _e : '').trim();
                    var posteable = (_h = (_g = (_f = x.posteable) !== null && _f !== void 0 ? _f : x.es_posteable) !== null && _g !== void 0 ? _g : x.posteable_flag) !== null && _h !== void 0 ? _h : x.posteable_indicator;
                    var nombre = String((_l = (_k = (_j = x.nombre) !== null && _j !== void 0 ? _j : x.descripcion) !== null && _k !== void 0 ? _k : x.NOMBRE) !== null && _l !== void 0 ? _l : '').trim();
                    return { id_cuenta: id, codigo: codigo, nombre: nombre, posteable: posteable };
                }).filter(function (c) { return Number.isFinite(c.id_cuenta); });
                parsed.sort(function (a, b) { return a.codigo.localeCompare(b.codigo, undefined, { numeric: true }); });
                _this.cuentas = parsed;
                _this.cuentasMap = new Map(parsed.map(function (c) { return [c.id_cuenta, { codigo: c.codigo, nombre: c.nombre }]; }));
            },
            error: function (err) {
                console.error('Cuentas:', err);
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar las cuentas.' });
                _this.cuentas = [];
                _this.cuentasMap.clear();
            }
        });
    };
    PolizasComponent.prototype.cargarPolizas = function () {
        var _this = this;
        this.api.getPolizas({
            id_tipopoliza: this.filtroTipo,
            id_periodo: this.filtroPeriodo,
            id_centro: this.filtroCentro
        }).subscribe({
            next: function (r) {
                var _a, _b;
                var list = (_a = _this.normalizeList(r)) !== null && _a !== void 0 ? _a : ((_b = r === null || r === void 0 ? void 0 : r.polizas) !== null && _b !== void 0 ? _b : []);
                _this.polizas = Array.isArray(list) ? list : [];
                if (_this.polizas.length === 0) {
                    _this.showToast({ type: 'info', message: 'No se encontraron pólizas con los filtros actuales.' });
                }
            },
            error: function (err) {
                console.error('Pólizas:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
            }
        });
    };
    //  CFDI 
    PolizasComponent.prototype.cargarCfdiRecientes = function () {
        var _this = this;
        this.api.listCfdi({ limit: 100 }).subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : []);
                _this.cfdiOptions = arr
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
            },
            error: function (err) {
                console.error('CFDI recientes:', err);
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los CFDI recientes.' });
            }
        });
    };
    PolizasComponent.prototype.onCuentaQueryChange = function (index, value) {
        var _a;
        var movs = ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []);
        if (!movs[index])
            return;
        movs[index]._cuentaQuery = value !== null && value !== void 0 ? value : '';
    };
    // Detectar cambio de centro principal
    PolizasComponent.prototype.onCentroSeleccionado = function () {
        var _a;
        var idCentro = this.nuevaPoliza.id_centro;
        // Recorre los movimientos existentes
        ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []).forEach(function (mov) {
            // Solo asignar si aún no tiene centro (para no sobrescribir cambios del usuario)
            if (!mov.cc) {
                mov.cc = idCentro;
            }
        });
    };
    PolizasComponent.prototype.getCuentasFiltradas = function (index) {
        var _this = this;
        var _a, _b, _c;
        var movs = ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []);
        var q = this.normalizaStr(String((_c = (_b = movs[index]) === null || _b === void 0 ? void 0 : _b._cuentaQuery) !== null && _c !== void 0 ? _c : '').trim());
        if (!q)
            return this.cuentas;
        return this.cuentas.filter(function (c) {
            var cad = c.codigo + " " + c.nombre;
            return _this.normalizaStr(cad).includes(q);
        });
    };
    PolizasComponent.prototype.labelCuenta = function (id_cuenta) {
        if (!id_cuenta)
            return '—';
        var c = this.cuentasMap.get(Number(id_cuenta));
        return c ? c.codigo + " \u2014 " + c.nombre : '—';
    };
    PolizasComponent.prototype.triggerXmlPickerForMovimiento = function (input, index) {
        this.xmlMovimientoIndex = index;
        input.click();
    };
    PolizasComponent.prototype.onXmlPickedForMovimiento = function (event, index) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var file, response, uuid, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
                        if (!file)
                            return [2 /*return*/];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, 4, 5]);
                        this.uploadingXml = true;
                        this.selectedXmlName = file.name;
                        this.uploadXmlError = '';
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.api.uploadCfdiXml(file, {
                                folio: this.nuevaPoliza.folio,
                                id_periodo: Number(this.nuevaPoliza.id_periodo),
                                id_centro: Number(this.nuevaPoliza.id_centro),
                                id_tipopoliza: Number(this.nuevaPoliza.id_tipopoliza)
                            }))];
                    case 2:
                        response = _c.sent();
                        uuid = (response === null || response === void 0 ? void 0 : response.uuid) || (response === null || response === void 0 ? void 0 : response.UUID) || null;
                        if (uuid) {
                            if (!this.nuevaPoliza.movimientos)
                                this.nuevaPoliza.movimientos = [];
                            if (!this.nuevaPoliza.movimientos[index])
                                this.nuevaPoliza.movimientos[index] = {};
                            // 👇 clave: asociar el UUID al movimiento específico
                            this.nuevaPoliza.movimientos[index].uuid = uuid;
                            // (opcional) mostrar el nombre del xml en la fila
                            this.nuevaPoliza.movimientos[index]._xmlName = file.name;
                            this.showToast({
                                title: 'XML asociado',
                                message: "UUID " + uuid + " vinculado al movimiento " + (index + 1),
                                type: 'success',
                                autoCloseMs: 3500
                            });
                        }
                        else {
                            this.showToast({ title: 'Aviso', message: 'El servidor no devolvió UUID.', type: 'warning' });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _c.sent();
                        console.error('Error al subir XML:', error_1);
                        this.uploadXmlError = ((_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.error) === null || _b === void 0 ? void 0 : _b.message) || 'Error al subir el XML.';
                        this.showToast({ title: 'Error', message: this.uploadXmlError, type: 'error', autoCloseMs: 4000 });
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
    PolizasComponent.prototype.agregarMovimiento = function () {
        var _a, _b;
        var defaultCc = this.centrosCosto.length ? this.centrosCosto[0].id_centrocosto : null;
        var defaultCuenta = this.cuentas.length ? this.cuentas[0].id_cuenta : null;
        var nuevo = {
            id_cuenta: null,
            ref_serie_venta: '',
            operacion: '',
            monto: null,
            cliente: '',
            fecha: this.todayISO(),
            cc: (_a = this.nuevaPoliza.id_centro) !== null && _a !== void 0 ? _a : null,
            uuid: null,
            _cuentaQuery: defaultCuenta ? this.labelCuenta(defaultCuenta) : ''
        };
        ((_b = this.nuevaPoliza.movimientos) !== null && _b !== void 0 ? _b : ) = [];
        push(nuevo);
    };
    PolizasComponent.prototype.eliminarMovimiento = function (i) {
        var _a;
        (_a = this.nuevaPoliza.movimientos) === null || _a === void 0 ? void 0 : _a.splice(i, 1);
    };
    //  Validación previa al guardado 
    PolizasComponent.prototype.canGuardar = function () {
        var _this = this;
        var _a;
        var p = this.nuevaPoliza;
        if (!p)
            return false;
        var okHeader = !!(p.folio && String(p.folio).trim()) &&
            !!(p.concepto && String(p.concepto).trim()) &&
            this.N(p.id_tipopoliza) !== undefined &&
            this.N(p.id_periodo) !== undefined &&
            this.N(p.id_centro) !== undefined &&
            this.N(p.id_usuario) !== undefined;
        if (!okHeader)
            return false;
        if (this.modoCaptura === 'motor') {
            // Validación mínima para el motor
            return !!(this.evento.monto_base && this.evento.fecha_operacion && this.evento.id_empresa && this.evento.id_cuenta_contrapartida);
        }
        // === MODO MANUAL (igual que hoy) ===
        var movs = ((_a = p.movimientos) !== null && _a !== void 0 ? _a : []).filter(function (m) {
            var _a;
            return _this.toNumOrNull(m.id_cuenta) &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        if (movs.length === 0)
            return false;
        var cargos = movs.filter(function (m) { return m.operacion === '0'; }).reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        var abonos = movs.filter(function (m) { return m.operacion === '1'; }).reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        for (var _i = 0, movs_1 = movs; _i < movs_1.length; _i++) {
            var m = movs_1[_i];
            var idCuenta = this.toNumOrNull(m.id_cuenta);
            var idCc = this.toNumOrNull(m.cc);
            if (idCuenta == null || !this.cuentasMap.has(idCuenta))
                return false;
            if (idCc != null && !this.centrosCostoMap.has(idCc))
                return false;
        }
        return true;
    };
    PolizasComponent.prototype.validarYExplicarErrores = function () {
        var _this = this;
        var _a;
        var p = this.nuevaPoliza;
        if (!p) {
            this.showToast({ type: 'warning', title: 'Faltan datos', message: 'No hay póliza en edición.' });
            return false;
        }
        // Encabezado
        var faltantes = [];
        if (!p.folio)
            faltantes.push('Folio');
        if (!p.concepto)
            faltantes.push('Concepto');
        if (!p.id_tipopoliza)
            faltantes.push('Tipo de póliza');
        if (!p.id_periodo)
            faltantes.push('Periodo');
        if (!p.id_centro)
            faltantes.push('Centro');
        if (!p.id_usuario)
            faltantes.push('Usuario');
        if (faltantes.length) {
            this.showToast({ type: 'warning', title: 'Faltan datos', message: "Completa: " + faltantes.join(', ') + "." });
            return false;
        }
        var movs = ((_a = p.movimientos) !== null && _a !== void 0 ? _a : []);
        if (movs.length === 0) {
            this.showToast({ type: 'warning', title: 'Movimientos', message: 'Agrega al menos un movimiento.' });
            return false;
        }
        // Reglas por movimiento
        for (var i = 0; i < movs.length; i++) {
            var m = movs[i];
            var idCuenta = this.toNumOrNull(m.id_cuenta);
            var op = m.operacion;
            var monto = this.toNumOrNull(m.monto);
            var idCc = this.toNumOrNull(m.cc);
            if (!idCuenta) {
                this.showToast({ type: 'warning', title: "Movimiento #" + (i + 1), message: 'Selecciona una cuenta contable.' });
                return false;
            }
            if (!this.cuentasMap.has(idCuenta)) {
                this.showToast({ type: 'warning', title: "Movimiento #" + (i + 1), message: 'La cuenta seleccionada no existe en el catálogo.' });
                return false;
            }
            if (!(op === '0' || op === '1')) {
                this.showToast({ type: 'warning', title: "Movimiento #" + (i + 1), message: 'Selecciona si es Cargo (0) o Abono (1).' });
                return false;
            }
            if (!monto || monto <= 0) {
                this.showToast({ type: 'warning', title: "Movimiento #" + (i + 1), message: 'Captura un monto mayor a 0.' });
                return false;
            }
            if (idCc != null && !this.centrosCostoMap.has(idCc)) {
                this.showToast({ type: 'warning', title: "Movimiento #" + (i + 1), message: 'El Centro de Costo seleccionado no existe.' });
                return false;
            }
        }
        // Partida doble
        var movsValidos = movs.filter(function (m) {
            var _a;
            return _this.toNumOrNull(m.id_cuenta) &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        var cargos = movsValidos.filter(function (m) { return m.operacion === '0'; }).reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        var abonos = movsValidos.filter(function (m) { return m.operacion === '1'; }).reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        if (Math.abs(cargos - abonos) > 0.001) {
            this.showToast({ type: 'warning', title: 'Partida doble', message: "No cuadra.\nCargos: " + cargos + "\nAbonos: " + abonos });
        }
        return true;
    };
    //  Guardar 
    PolizasComponent.prototype.guardarPoliza = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (this.modoCaptura === 'manual') {
            // === FLUJO MANUAL (igual que hoy) ===
            if (!this.validarYExplicarErrores())
                return;
            var p = this.nuevaPoliza;
            var payload = {
                id_tipopoliza: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_tipopoliza),
                id_periodo: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_periodo),
                id_usuario: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_usuario),
                id_centro: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_centro),
                folio: this.toStrOrNull(p === null || p === void 0 ? void 0 : p.folio),
                concepto: this.toStrOrNull(p === null || p === void 0 ? void 0 : p.concepto),
                movimientos: ((_a = p === null || p === void 0 ? void 0 : p.movimientos) !== null && _a !== void 0 ? _a : []).map(function (m) { return ({
                    id_cuenta: _this.toNumOrNull(m.id_cuenta),
                    ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                    operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
                    monto: _this.toNumOrNull(m.monto),
                    cliente: _this.toStrOrNull(m.cliente),
                    fecha: _this.toDateOrNull(m.fecha),
                    cc: _this.toNumOrNull(m.cc),
                    uuid: _this.toStrOrNull(m.uuid)
                }); })
            };
            this.api.createPoliza(payload).subscribe({
                next: function () {
                    var _a;
                    _this.nuevaPoliza = { movimientos: [], id_usuario: (_a = _this.currentUser) === null || _a === void 0 ? void 0 : _a.id_usuario };
                    _this.cargarPolizas();
                    _this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada correctamente.' });
                },
                error: function (err) {
                    var _a, _b;
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al guardar póliza';
                    console.error('Guardar póliza (manual):', err);
                    _this.showToast({ type: 'error', title: 'Error', message: msg });
                }
            });
        }
        else {
            // === FLUJO MOTOR (usa /polizas/from-evento) ===
            var okHeader = ((_b = this.nuevaPoliza) === null || _b === void 0 ? void 0 : _b.folio) && ((_c = this.nuevaPoliza) === null || _c === void 0 ? void 0 : _c.concepto) && ((_d = this.nuevaPoliza) === null || _d === void 0 ? void 0 : _d.id_tipopoliza) && ((_e = this.nuevaPoliza) === null || _e === void 0 ? void 0 : _e.id_periodo) && ((_f = this.nuevaPoliza) === null || _f === void 0 ? void 0 : _f.id_centro) && ((_g = this.nuevaPoliza) === null || _g === void 0 ? void 0 : _g.id_usuario);
            var okMotor = this.evento.monto_base != null && this.evento.monto_base > 0 &&
                !!this.evento.fecha_operacion &&
                !!this.evento.id_empresa &&
                !!this.evento.id_cuenta_contrapartida;
            if (!okHeader || !okMotor) {
                this.showToast({
                    type: 'warning',
                    title: 'Faltan datos',
                    message: 'Completa encabezado y datos del evento (monto, fecha, empresa y cuenta contrapartida).'
                });
                return;
            }
            var body = {
                id_tipopoliza: this.toNumOrNull(this.nuevaPoliza.id_tipopoliza),
                id_periodo: this.toNumOrNull(this.nuevaPoliza.id_periodo),
                id_usuario: this.toNumOrNull(this.nuevaPoliza.id_usuario),
                id_centro: this.toNumOrNull(this.nuevaPoliza.id_centro),
                folio: this.toStrOrNull(this.nuevaPoliza.folio),
                concepto: this.toStrOrNull(this.nuevaPoliza.concepto),
                // Motor:
                tipo_operacion: this.evento.tipo_operacion,
                monto_base: Number(this.evento.monto_base),
                fecha_operacion: this.toDateOrNull(this.evento.fecha_operacion),
                id_empresa: Number(this.evento.id_empresa),
                medio_cobro_pago: this.evento.medio_cobro_pago,
                id_cuenta_contrapartida: Number(this.evento.id_cuenta_contrapartida),
                // Opcionales propagados:
                cliente: (_h = this.toStrOrNull(this.evento.cliente)) !== null && _h !== void 0 ? _h : null,
                ref_serie_venta: (_j = this.toStrOrNull(this.evento.ref_serie_venta)) !== null && _j !== void 0 ? _j : null,
                cc: (_k = this.toNumOrNull(this.evento.cc)) !== null && _k !== void 0 ? _k : null
            };
            this.api.createPolizaFromEvento(body).subscribe({
                next: function () {
                    var _a;
                    // Resetea sólo lo necesario
                    _this.nuevaPoliza = { movimientos: [], id_usuario: (_a = _this.currentUser) === null || _a === void 0 ? void 0 : _a.id_usuario };
                    // Mantener datos del motor si quieres capturar varios seguidos:
                    // this.evento = { ...this.evento, monto_base: null, ref_serie_venta: '', cliente: '' };
                    _this.cargarPolizas();
                    _this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada con el motor.' });
                },
                error: function (err) {
                    var _a;
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al crear póliza con el motor';
                    console.error('Guardar póliza (motor):', err);
                    _this.showToast({ type: 'error', title: 'Error', message: msg });
                }
            });
        }
    };
    PolizasComponent.prototype.agregarEventoAPolizaExistente = function (id_poliza) {
        var _this = this;
        var _a, _b, _c;
        var okMotor = this.evento.monto_base != null && this.evento.monto_base > 0 &&
            !!this.evento.fecha_operacion &&
            !!this.evento.id_empresa &&
            !!this.evento.id_cuenta_contrapartida;
        if (!okMotor) {
            this.showToast({ type: 'warning', title: 'Faltan datos', message: 'Completa los datos del evento.' });
            return;
        }
        var body = {
            tipo_operacion: this.evento.tipo_operacion,
            monto_base: Number(this.evento.monto_base),
            fecha_operacion: this.toDateOrNull(this.evento.fecha_operacion),
            id_empresa: Number(this.evento.id_empresa),
            medio_cobro_pago: this.evento.medio_cobro_pago,
            id_cuenta_contrapartida: Number(this.evento.id_cuenta_contrapartida),
            cliente: (_a = this.toStrOrNull(this.evento.cliente)) !== null && _a !== void 0 ? _a : null,
            ref_serie_venta: (_b = this.toStrOrNull(this.evento.ref_serie_venta)) !== null && _b !== void 0 ? _b : null,
            cc: (_c = this.toNumOrNull(this.evento.cc)) !== null && _c !== void 0 ? _c : null
        };
        this.api.expandEventoEnPoliza(id_poliza, body).subscribe({
            next: function (r) {
                var _a;
                _this.showToast({ type: 'success', title: 'Agregado', message: "Se agregaron " + ((_a = r === null || r === void 0 ? void 0 : r.count) !== null && _a !== void 0 ? _a : '') + " movimientos a la p\u00F3liza " + id_poliza + "." });
                // Si la vista muestra la póliza actual, refresca:
                // this.getPolizaConMovimientos(id_poliza).subscribe(...);
            },
            error: function (err) {
                var _a;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al agregar evento';
                console.error('expand-evento:', err);
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            }
        });
    };
    //  XML 
    PolizasComponent.prototype.triggerXmlPicker = function (input) {
        this.uploadXmlError = '';
        input.value = ''; // permite re-seleccionar el mismo archivo
        input.click();
    };
    PolizasComponent.prototype.onXmlPicked = function (ev) {
        var _this = this;
        var _a;
        var input = ev.target;
        var file = (_a = input === null || input === void 0 ? void 0 : input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        var isXml = file.type === 'text/xml' ||
            file.type === 'application/xml' ||
            /\.xml$/i.test(file.name);
        if (!isXml) {
            this.uploadXmlError = 'El archivo debe ser .xml';
            this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            this.uploadXmlError = 'El XML excede el tamaño permitido (1 MB).';
            this.showToast({ type: 'warning', title: 'Archivo pesado', message: this.uploadXmlError });
            return;
        }
        this.selectedXmlName = file.name;
        this.uploadingXml = true;
        var ctx = {
            folio: this.nuevaPoliza.folio,
            id_periodo: Number(this.nuevaPoliza.id_periodo),
            id_centro: Number(this.nuevaPoliza.id_centro),
            id_tipopoliza: Number(this.nuevaPoliza.id_tipopoliza)
        };
        this.api.uploadCfdiXml(file, ctx).subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e, _f;
                var opt = {
                    uuid: (res === null || res === void 0 ? void 0 : res.uuid) || (res === null || res === void 0 ? void 0 : res.UUID) || '',
                    folio: (_b = (_a = res === null || res === void 0 ? void 0 : res.folio) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.Folio) !== null && _b !== void 0 ? _b : null,
                    fecha: (_d = (_c = res === null || res === void 0 ? void 0 : res.fecha) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.Fecha) !== null && _d !== void 0 ? _d : null,
                    total: (_f = (_e = res === null || res === void 0 ? void 0 : res.total) !== null && _e !== void 0 ? _e : res === null || res === void 0 ? void 0 : res.Total) !== null && _f !== void 0 ? _f : null
                };
                if (opt.uuid && !_this.cfdiOptions.some(function (x) { return x.uuid === opt.uuid; })) {
                    _this.cfdiOptions = __spreadArrays(_this.cfdiOptions, [opt]);
                }
                if (opt.uuid)
                    _this.uuidSeleccionado = opt.uuid;
                _this.showToast({ type: 'success', title: 'XML importado', message: 'El CFDI se importó correctamente.' });
            },
            error: function (err) {
                var _a, _b;
                console.error('Importar XML:', err);
                _this.uploadXmlError = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Error importando XML';
                _this.showToast({ type: 'error', title: 'Error', message: _this.uploadXmlError });
            },
            complete: function () { return (_this.uploadingXml = false); }
        });
    };
    //  UUID compartido 
    PolizasComponent.prototype.onUuidChange = function (uuid) {
        this.uuidSeleccionado = uuid || undefined;
    };
    PolizasComponent.prototype.aplicarUuidAlMovimiento = function (index) {
        var _a;
        if (!this.uuidSeleccionado)
            return;
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (movs[index])
            movs[index].uuid = this.uuidSeleccionado;
    };
    //  Totales 
    PolizasComponent.prototype.getTotal = function (p, tipo) {
        var movs = Array.isArray(p === null || p === void 0 ? void 0 : p.movimientos) ? p.movimientos : [];
        return movs
            .filter(function (m) { return String(m.operacion) === tipo; })
            .reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
    };
    PolizasComponent.prototype.getDiferencia = function (p) {
        return this.getTotal(p, '0') - this.getTotal(p, '1');
    };
    PolizasComponent = __decorate([
        core_1.Component({
            selector: 'app-polizas',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, polizas_layout_component_1.PolizasLayoutComponent, toast_message_component_component_1.ToastMessageComponent, router_1.RouterModule, modal_seleccion_cuenta_component_1.ModalSeleccionCuentaComponent],
            templateUrl: './polizas.component.html',
            styleUrls: ['./polizas.component.scss']
        })
    ], PolizasComponent);
    return PolizasComponent;
}());
exports.PolizasComponent = PolizasComponent;
