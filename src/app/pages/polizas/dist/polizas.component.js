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
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var fecha_utils_1 = require("@app/utils/fecha-utils");
var PolizasComponent = /** @class */ (function () {
    function PolizasComponent(api, ejercicioSvc, router) {
        var _this = this;
        this.api = api;
        this.ejercicioSvc = ejercicioSvc;
        this.router = router;
        this.modalIvaOpen = false;
        this.iva = {
            op: 'venta',
            baseTipo: 'sin',
            tasa: 0.16,
            monto: 0,
            medio: 'bancos',
            concepto: '',
            subtotal: 0,
            iva: 0,
            total: 0
        };
        this.sidebarOpen = true;
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
        this.ejercicios = [];
        this.tiposPoliza = [];
        this.periodos = [];
        this.allPeriodos = [];
        this.centros = [];
        this.cuentas = [];
        this.cuentasMap = new Map();
        // Formulario de nueva póliza
        this.nuevaPoliza = { movimientos: [] };
        // CFDI importados y selección de UUID
        this.cfdiOptions = [];
        this.conceptoSugerido = '';
        this.conceptoFueEditadoPorUsuario = false;
        // Modal de cuentas
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
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
        this.onToastClosed = function () {
            _this.toast.open = false;
        };
        this.toNumOrNull = function (v) {
            return v === '' || v == null || isNaN(Number(v)) ? null : Number(v);
        };
        this.toStrOrNull = function (v) {
            return v == null ? null : String(v).trim() || null;
        };
        this.trackByEjercicioId = function (_, e) { return e === null || e === void 0 ? void 0 : e.id_ejercicio; };
        this.compareById = function (a, b) { return Number(a) === Number(b); };
        this.normalizaStr = function (s) { var _a, _b; return (_b = (_a = s.normalize) === null || _a === void 0 ? void 0 : _a.call(s, 'NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) !== null && _b !== void 0 ? _b : s.toLowerCase(); };
        this.folioFueEditadoPorUsuario = false;
        this.trackByFolio = function (_, x) { var _a; return (_a = x === null || x === void 0 ? void 0 : x.folio) !== null && _a !== void 0 ? _a : _; };
    }
    PolizasComponent.prototype.abrirModalIva = function () {
        this.modalIvaOpen = true;
    };
    PolizasComponent.prototype.cerrarModalIva = function () {
        this.modalIvaOpen = false;
    };
    PolizasComponent.prototype.volver = function () {
        this.router.navigate(['/poliza-home']);
    };
    PolizasComponent.prototype.ngOnInit = function () {
        this.cargarEjercicioActivo();
        this.initUsuarioActual();
        this.cargarCatalogos();
        this.getCentros();
        this.cargarCuentas();
        this.cargarPolizas();
        this.cargarCfdiRecientes();
        if (!this.evento.id_empresa)
            this.evento.id_empresa = 1;
        if (!this.evento.fecha_operacion)
            this.evento.fecha_operacion = fecha_utils_1.todayISO();
    };
    //  Sidebar / Modal de cuentas 
    PolizasComponent.prototype.onSidebarToggle = function (v) {
        this.sidebarOpen = v;
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
        if (this.indiceMovimientoSeleccionado != null && this.nuevaPoliza.movimientos) {
            this.nuevaPoliza.movimientos[this.indiceMovimientoSeleccionado].id_cuenta =
                cuenta.id_cuenta;
        }
        this.cerrarModalCuentas();
    };
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
        return Array.isArray(res)
            ? res
            : (_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.result) !== null && _d !== void 0 ? _d : [];
    };
    PolizasComponent.prototype.N = function (v) {
        if (v === '' || v === null || v === undefined)
            return undefined;
        var n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    PolizasComponent.prototype.r2 = function (n) {
        return Math.round((n + Number.EPSILON) * 100) / 100;
    };
    //  Usuario actual 
    PolizasComponent.prototype.initUsuarioActual = function () {
        var usr = this.leerUsuarioDescompuesto() || this.leerUsuarioDesdeJwt();
        if (!usr)
            return;
        var resolved = this.resolveNombre(usr);
        var email = this.resolveEmail(usr);
        var fromEmail = (email
            ? email.split('@')[0].replace(/[._-]+/g, ' ').trim()
            : '') || undefined;
        var fallback = usr.id_usuario != null ? "Usuario " + usr.id_usuario : 'Usuario';
        var nombreForzado = (resolved || fromEmail || fallback).toString().trim();
        this.currentUser = __assign(__assign({}, usr), { nombre: nombreForzado });
        console.log('USUARIO', (this.currentUser = __assign(__assign({}, usr), { nombre: nombreForzado })));
        var idNum = Number(usr.id_usuario);
        if (Number.isFinite(idNum) && !this.nuevaPoliza.id_usuario) {
            this.nuevaPoliza.id_usuario = idNum;
        }
    };
    PolizasComponent.prototype.getNombreForzado = function (src) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        var nombre = (_m = (_l = (_k = (_j = (_h = (_g = (_f = (_e = (_d = (_c = (_b = (_a = src === null || src === void 0 ? void 0 : src.nombre) !== null && _a !== void 0 ? _a : src === null || src === void 0 ? void 0 : src.name) !== null && _b !== void 0 ? _b : src === null || src === void 0 ? void 0 : src.nombres) !== null && _c !== void 0 ? _c : src === null || src === void 0 ? void 0 : src.displayName) !== null && _d !== void 0 ? _d : src === null || src === void 0 ? void 0 : src.full_name) !== null && _e !== void 0 ? _e : src === null || src === void 0 ? void 0 : src.fullName) !== null && _f !== void 0 ? _f : src === null || src === void 0 ? void 0 : src.first_name) !== null && _g !== void 0 ? _g : src === null || src === void 0 ? void 0 : src.given_name) !== null && _h !== void 0 ? _h : src === null || src === void 0 ? void 0 : src.preferred_username) !== null && _j !== void 0 ? _j : src === null || src === void 0 ? void 0 : src.usuario) !== null && _k !== void 0 ? _k : src === null || src === void 0 ? void 0 : src.username) !== null && _l !== void 0 ? _l : src === null || src === void 0 ? void 0 : src.userName) !== null && _m !== void 0 ? _m : '';
        var apP = (_t = (_s = (_r = (_q = (_p = (_o = src === null || src === void 0 ? void 0 : src.apellido_p) !== null && _o !== void 0 ? _o : src === null || src === void 0 ? void 0 : src.apellidoP) !== null && _p !== void 0 ? _p : src === null || src === void 0 ? void 0 : src.apellido) !== null && _q !== void 0 ? _q : src === null || src === void 0 ? void 0 : src.apellidos) !== null && _r !== void 0 ? _r : src === null || src === void 0 ? void 0 : src.last_name) !== null && _s !== void 0 ? _s : src === null || src === void 0 ? void 0 : src.family_name) !== null && _t !== void 0 ? _t : '';
        var apM = (_v = (_u = src === null || src === void 0 ? void 0 : src.apellido_m) !== null && _u !== void 0 ? _u : src === null || src === void 0 ? void 0 : src.apellidoM) !== null && _v !== void 0 ? _v : '';
        var base = [nombre, apP, apM]
            .map(function (v) { return (v !== null && v !== void 0 ? v : '').toString().trim(); })
            .filter(Boolean)
            .join(' ');
        if (base)
            return base;
        var email = this.resolveEmail(src);
        if (email) {
            var alias = String(email)
                .split('@')[0]
                .replace(/[._-]+/g, ' ')
                .trim();
            if (alias)
                return alias;
        }
        return (src === null || src === void 0 ? void 0 : src.id_usuario) != null ? "Usuario " + src.id_usuario : 'Usuario';
    };
    PolizasComponent.prototype.leerUsuarioDescompuesto = function () {
        var _a, _b, _c, _d, _e;
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
                if (!Number.isFinite(id))
                    continue;
                return __assign({ id_usuario: id, nombre: (_d = this.resolveNombre(obj)) !== null && _d !== void 0 ? _d : undefined, email: (_e = this.resolveEmail(obj)) !== null && _e !== void 0 ? _e : undefined }, obj);
            }
        }
        catch (_f) {
            // ignore
        }
        return null;
    };
    PolizasComponent.prototype.leerUsuarioDesdeJwt = function () {
        var _a, _b, _c, _d, _e, _f;
        var token = localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token');
        if (!token)
            return null;
        var payload = this.decodeJwt(token);
        if (!payload)
            return null;
        var rawId = (_c = (_b = (_a = payload === null || payload === void 0 ? void 0 : payload.id_usuario) !== null && _a !== void 0 ? _a : payload === null || payload === void 0 ? void 0 : payload.sub) !== null && _b !== void 0 ? _b : payload === null || payload === void 0 ? void 0 : payload.uid) !== null && _c !== void 0 ? _c : null;
        var maybeNum = Number(rawId);
        var idNum = Number.isFinite(maybeNum) ? maybeNum : undefined;
        return __assign({ id_usuario: (_d = idNum) !== null && _d !== void 0 ? _d : rawId, nombre: (_e = this.resolveNombre(payload)) !== null && _e !== void 0 ? _e : undefined, email: (_f = this.resolveEmail(payload)) !== null && _f !== void 0 ? _f : undefined }, payload);
    };
    PolizasComponent.prototype.decodeJwt = function (token) {
        try {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var json = decodeURIComponent(atob(base64)
                .split('')
                .map(function (c) {
                return '%' +
                    ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
                .join(''));
            return JSON.parse(json);
        }
        catch (_a) {
            return null;
        }
    };
    PolizasComponent.prototype.resolveNombre = function (src) {
        var _a, _b, _c, _d, _e, _f;
        if (!src)
            return null;
        var cand = [
            src.nombre,
            src.name,
            src.full_name,
            src.fullName,
            src.username,
            src.userName,
            src.nombres,
            src.displayName,
            src.first_name,
            src.given_name,
            src.preferred_username,
            src.usuario,
            src.nombre_usuario,
            src.nombreCompleto
        ]
            .map(function (v) { return (v !== null && v !== void 0 ? v : '').toString().trim(); })
            .filter(Boolean);
        var ap = ((_e = (_d = (_c = (_b = (_a = src.apellido_p) !== null && _a !== void 0 ? _a : src.apellido) !== null && _b !== void 0 ? _b : src.apellidos) !== null && _c !== void 0 ? _c : src.last_name) !== null && _d !== void 0 ? _d : src.family_name) !== null && _e !== void 0 ? _e : '')
            .toString()
            .trim();
        var apm = ((_f = src.apellido_m) !== null && _f !== void 0 ? _f : '').toString().trim();
        if (cand.length && (ap || apm))
            return [cand[0], ap, apm].filter(Boolean).join(' ').trim();
        return cand[0] || null;
    };
    PolizasComponent.prototype.resolveEmail = function (src) {
        if (!src)
            return null;
        var cand = [src.email, src.correo, src.mail, src.Email, src.EMAIL]
            .map(function (v) { return (v !== null && v !== void 0 ? v : '').toString().trim(); })
            .filter(Boolean);
        return cand[0] || null;
    };
    Object.defineProperty(PolizasComponent.prototype, "currentUserLabel", {
        get: function () {
            var _a;
            return (((_a = this.currentUser) === null || _a === void 0 ? void 0 : _a.nombre) || '').toString().trim();
        },
        enumerable: false,
        configurable: true
    });
    PolizasComponent.prototype.onBaseTipoChange = function (value) {
        this.iva.baseTipo = value;
        this.iva.tasa = value === 'sin' ? 0.0 : 0.16;
        this.recalcularIVA();
    };
    PolizasComponent.prototype.onTasaChange = function (value) {
        this.iva.tasa = value;
        this.recalcularIVA();
    };
    PolizasComponent.prototype.onMontoChange = function (value) {
        var n = Number(value);
        this.iva.monto = Number.isFinite(n) ? n : 0;
        this.recalcularIVA();
    };
    PolizasComponent.prototype.onConfirmarIva = function () {
        this.agregarMovimientosDesdeIVA();
        this.cerrarModalIva();
    };
    PolizasComponent.prototype.recalcularIVA = function () {
        var _a = this.iva, baseTipo = _a.baseTipo, tasa = _a.tasa, monto = _a.monto;
        if (!monto || monto <= 0) {
            this.iva.subtotal = this.iva.iva = this.iva.total = 0;
            return;
        }
        if (tasa === 'exento') {
            this.iva.subtotal = this.r2(monto);
            this.iva.iva = 0;
            this.iva.total = this.r2(monto);
            return;
        }
        var t = tasa;
        if (baseTipo === 'sin') {
            var subtotal = monto;
            var iva = subtotal * t;
            var total = subtotal + iva;
            this.iva.subtotal = this.r2(subtotal);
            this.iva.iva = this.r2(iva);
            this.iva.total = this.r2(total);
        }
        else {
            var total = monto;
            var subtotal = total / (1 + t);
            var iva = total - subtotal;
            this.iva.subtotal = this.r2(subtotal);
            this.iva.iva = this.r2(iva);
            this.iva.total = this.r2(total);
        }
    };
    PolizasComponent.prototype.agregarMovimientosDesdeIVA = function () {
        var _this = this;
        var _a, _b;
        this.recalcularIVA();
        var _c = this.iva, op = _c.op, medio = _c.medio, tasa = _c.tasa, subtotal = _c.subtotal, iva = _c.iva, total = _c.total, concepto = _c.concepto;
        if (!this.nuevaPoliza.movimientos)
            this.nuevaPoliza.movimientos = [];
        var COD = {
            // Medios
            BANCOS: '1102010000',
            CAJA: '1101010001',
            // Clientes por tasa
            CLIENTES16: '1103010001',
            CLIENTES08: '1103010002',
            CLIENTES0: '1103010003',
            CLIENTES_EXE: '1103010004',
            // Proveedores por tasa
            PROV16: '2101010001',
            PROV08: '2101010002',
            PROV0: '2101010003',
            PROV_EXE: '2101010004',
            // IVA trasladado (ventas) por tasa
            IVA_TRAS_16: '2104010001',
            IVA_TRAS_08: '2104010002',
            // IVA acreditable (compras) por tasa
            IVA_ACRED_16: '1107010001',
            IVA_ACRED_08: '1107010002',
            // Ventas por tasa
            VENTAS_16: '4100010000',
            VENTAS_08: '4100010008',
            VENTAS_0: '4100010009',
            VENTAS_EXE: '4100010010',
            // Compras por tasa
            COMPRAS_16: '5105010001',
            COMPRAS_08: '5105010008',
            COMPRAS_0: '5105010009',
            COMPRAS_EXE: '5105010010'
        };
        var id = function (codigo) {
            return codigo ? _this.findCuentaIdByCodigo(codigo) : null;
        };
        var tasaNum = tasa === 'exento' ? 0 : Number(tasa || 0);
        var esExento = tasa === 'exento';
        var hoyISO = fecha_utils_1.todayISO();
        var refSerie = (_b = (_a = this.evento) === null || _a === void 0 ? void 0 : _a.ref_serie_venta) !== null && _b !== void 0 ? _b : null;
        var ccHeader = this.toNumOrNull(this.nuevaPoliza.id_centro);
        var serieHeader = this.getSerieVentaByCcId(ccHeader !== null && ccHeader !== void 0 ? ccHeader : null);
        var refSerieEfectiva = serieHeader !== null && serieHeader !== void 0 ? serieHeader : refSerie;
        var cuentaMedioVenta = function () {
            if (medio === 'caja')
                return id(COD.CAJA);
            if (medio === 'bancos')
                return id(COD.BANCOS);
            switch (true) {
                case esExento:
                    return id(COD.CLIENTES_EXE) || id(COD.CLIENTES16);
                case tasaNum === 0:
                    return id(COD.CLIENTES0) || id(COD.CLIENTES16);
                case tasaNum === 0.08:
                    return id(COD.CLIENTES08) || id(COD.CLIENTES16);
                default:
                    return id(COD.CLIENTES16);
            }
        };
        var cuentaMedioCompra = function () {
            if (medio === 'caja')
                return id(COD.CAJA);
            if (medio === 'bancos')
                return id(COD.BANCOS);
            switch (true) {
                case esExento:
                    return id(COD.PROV_EXE) || id(COD.PROV16);
                case tasaNum === 0:
                    return id(COD.PROV0) || id(COD.PROV16);
                case tasaNum === 0.08:
                    return id(COD.PROV08) || id(COD.PROV16);
                default:
                    return id(COD.PROV16);
            }
        };
        var cuentaVentas = function () {
            if (esExento)
                return id(COD.VENTAS_EXE) || id(COD.VENTAS_16);
            if (tasaNum === 0)
                return id(COD.VENTAS_0) || id(COD.VENTAS_16);
            if (tasaNum === 0.08)
                return id(COD.VENTAS_08) || id(COD.VENTAS_16);
            return id(COD.VENTAS_16);
        };
        var cuentaCompras = function () {
            if (esExento)
                return id(COD.COMPRAS_EXE) || id(COD.COMPRAS_16);
            if (tasaNum === 0)
                return id(COD.COMPRAS_0) || id(COD.COMPRAS_16);
            if (tasaNum === 0.08)
                return id(COD.COMPRAS_08) || id(COD.COMPRAS_16);
            return id(COD.COMPRAS_16);
        };
        var cuentaIVAtras = function () {
            if (tasaNum === 0.16)
                return id(COD.IVA_TRAS_16);
            if (tasaNum === 0.08)
                return id(COD.IVA_TRAS_08) || id(COD.IVA_TRAS_16);
            return null;
        };
        var cuentaIVAacred = function () {
            if (tasaNum === 0.16)
                return id(COD.IVA_ACRED_16);
            if (tasaNum === 0.08)
                return id(COD.IVA_ACRED_08) || id(COD.IVA_ACRED_16);
            return null;
        };
        if (op === 'venta') {
            var idMedio = cuentaMedioVenta();
            var idVentas = cuentaVentas();
            var idIVAtras = cuentaIVAtras();
            this.nuevaPoliza.movimientos.push({
                id_cuenta: idMedio,
                operacion: '0',
                monto: this.r2(total),
                cliente: concepto || 'Venta',
                fecha: hoyISO,
                cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                uuid: null,
                ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
            });
            this.nuevaPoliza.movimientos.push({
                id_cuenta: idVentas,
                operacion: '1',
                monto: this.r2(subtotal),
                cliente: concepto || 'Venta',
                fecha: hoyISO,
                cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                uuid: null,
                ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
            });
            if (!esExento && tasaNum > 0) {
                this.nuevaPoliza.movimientos.push({
                    id_cuenta: idIVAtras,
                    operacion: '1',
                    monto: this.r2(iva),
                    cliente: concepto || 'IVA Trasladado',
                    fecha: hoyISO,
                    cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                    uuid: null,
                    ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
                });
            }
        }
        else {
            var idMedio = cuentaMedioCompra();
            var idCompras = cuentaCompras();
            var idIVAacred = cuentaIVAacred();
            this.nuevaPoliza.movimientos.push({
                id_cuenta: idCompras,
                operacion: '0',
                monto: this.r2(subtotal),
                cliente: concepto || 'Compra',
                fecha: hoyISO,
                cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                uuid: null,
                ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
            });
            if (!esExento && tasaNum > 0) {
                this.nuevaPoliza.movimientos.push({
                    id_cuenta: idIVAacred,
                    operacion: '0',
                    monto: this.r2(iva),
                    cliente: concepto || 'IVA Acreditable',
                    fecha: hoyISO,
                    cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                    uuid: null,
                    ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
                });
            }
            this.nuevaPoliza.movimientos.push({
                id_cuenta: idMedio,
                operacion: '1',
                monto: this.r2(total),
                cliente: concepto || (medio === 'proveedores' ? 'Proveedor' : 'Pago'),
                fecha: hoyISO,
                cc: ccHeader !== null && ccHeader !== void 0 ? ccHeader : null,
                uuid: null,
                ref_serie_venta: refSerieEfectiva !== null && refSerieEfectiva !== void 0 ? refSerieEfectiva : null
            });
        }
    };
    PolizasComponent.prototype.getTipoPolizaLabelById = function (id) {
        var _a;
        var t = this.tiposPoliza.find(function (x) { return Number(x.id_tipopoliza) === Number(id); });
        return ((_a = t === null || t === void 0 ? void 0 : t.nombre) !== null && _a !== void 0 ? _a : '').toString().trim();
    };
    PolizasComponent.prototype.findCuentaIdByCodigo = function (codigo) {
        var _a, _b;
        var c = (_a = this.cuentas) === null || _a === void 0 ? void 0 : _a.find(function (x) { var _a; return ((_a = x.codigo) === null || _a === void 0 ? void 0 : _a.toString()) === codigo; });
        return (_b = c === null || c === void 0 ? void 0 : c.id_cuenta) !== null && _b !== void 0 ? _b : null;
    };
    PolizasComponent.prototype.getCentroLabelById = function (id) {
        var _a;
        var c = this.centros.find(function (x) { return Number(x.id_centro) === Number(id); });
        return ((_a = c === null || c === void 0 ? void 0 : c.nombre) !== null && _a !== void 0 ? _a : '').toString().trim();
    };
    PolizasComponent.prototype.getSerieVentaByCcId = function (ccId) {
        var _a, _b;
        if (ccId == null)
            return null;
        var cc = this.centrosCostoMap.get(Number(ccId));
        var serie = (_b = (_a = cc) === null || _a === void 0 ? void 0 : _a.serie_venta) !== null && _b !== void 0 ? _b : null;
        return typeof serie === 'string' && serie.trim()
            ? String(serie).trim()
            : null;
    };
    PolizasComponent.prototype.recomputarConceptoSugerido = function () {
        var tipoNombre = this.getTipoPolizaLabelById(this.nuevaPoliza.id_tipopoliza);
        var centroLbl = this.getCentroLabelById(this.nuevaPoliza.id_centro);
        if (!tipoNombre || !centroLbl) {
            this.conceptoSugerido = '';
            return;
        }
        var k = tipoNombre.trim().toLowerCase();
        var hoy = fecha_utils_1.todayISO();
        var año = fecha_utils_1.todayISO().slice(0, 4);
        var base = '';
        if (k.includes('apertura'))
            base = "APERTURA EJERCICIO " + año;
        else if (k.includes('cierre'))
            base = "CIERRE EJERCICIO " + centroLbl + " \u2014 " + hoy;
        else if (k.includes('ventas'))
            base = "P\u00F3liza de ventas " + centroLbl + " \u2014 " + hoy;
        else if (k.includes('compras'))
            base = "P\u00F3liza de compras " + centroLbl + " \u2014 " + hoy;
        else if (k.includes('diario'))
            base = "P\u00F3liza de diario " + centroLbl + " \u2014 " + hoy;
        else
            base = tipoNombre + " \u2014 " + centroLbl + " \u2014 " + hoy;
        this.conceptoSugerido = base;
        if (!this.nuevaPoliza.concepto || !this.conceptoFueEditadoPorUsuario) {
            this.nuevaPoliza.concepto = base;
        }
    };
    PolizasComponent.prototype.aplicarConceptoSugerido = function () {
        if (this.conceptoSugerido) {
            this.nuevaPoliza.concepto = this.conceptoSugerido;
            this.conceptoFueEditadoPorUsuario = true;
        }
    };
    PolizasComponent.prototype.onTipoPolizaChange = function (_id) {
        this.conceptoFueEditadoPorUsuario = !!(this.nuevaPoliza.concepto && this.nuevaPoliza.concepto.trim());
        this.recomputarConceptoSugerido();
        this.recomputarFolioSugerido();
    };
    PolizasComponent.prototype.onCentroCambiadoPropagarSerie = function () {
        var _a;
        this.conceptoFueEditadoPorUsuario = !!(this.nuevaPoliza.concepto && this.nuevaPoliza.concepto.trim());
        this.recomputarConceptoSugerido();
        var ccId = this.toNumOrNull(this.nuevaPoliza.id_centro);
        var serie = this.getSerieVentaByCcId(ccId);
        if (!serie)
            return;
        ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []).forEach(function (mov) {
            if (!mov.ref_serie_venta || !String(mov.ref_serie_venta).trim()) {
                mov.ref_serie_venta = serie;
            }
        });
    };
    //  Ejercicios / periodos 
    PolizasComponent.prototype.isAbierto = function (e) {
        var _a, _b, _c;
        var v = (_c = (_b = (_a = e === null || e === void 0 ? void 0 : e.esta_abierto) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.activo) !== null && _b !== void 0 ? _b : e === null || e === void 0 ? void 0 : e.activo_flag) !== null && _c !== void 0 ? _c : e === null || e === void 0 ? void 0 : e.is_open;
        if (v === true || v === 1 || v === '1')
            return true;
        if (typeof v === 'string')
            return v.trim().toLowerCase() === 'true';
        return false;
    };
    PolizasComponent.prototype.cargarEjercicioActivo = function () {
        var _this = this;
        this.ejercicioSvc
            .listEjerciciosAbiertos({ esta_abierto: true })
            .subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e, _f;
                var raw = Array.isArray(res)
                    ? res
                    : (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res) !== null && _c !== void 0 ? _c : [];
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
                        fecha_inicio: fecha_utils_1.fmtDate(fi0),
                        fecha_fin: fecha_utils_1.fmtDate(ff0),
                        activo: true,
                        anio: Number.isFinite(anio) ? anio : null
                    };
                });
                if (!_this.ejercicios.length) {
                    console.warn('⚠ No se encontraron ejercicios activos.');
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
                console.log(' Ejercicio elegido (nueva póliza):', _this.ejercicioActual);
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
    PolizasComponent.prototype.onEjercicioSeleccionado = function (id) {
        var ejercicioId = Number(id);
        if (!Number.isFinite(ejercicioId) || ejercicioId === this.ejercicioActualId)
            return;
        var seleccionado = this.ejercicios.find(function (e) { return Number(e.id_ejercicio) === ejercicioId; });
        if (!seleccionado)
            return;
        this.ejercicioActual = __assign({}, seleccionado);
        this.ejercicioActualId = ejercicioId;
        this.guardarEjercicioSeleccionado(ejercicioId);
        this.applyPeriodoFilter();
    };
    PolizasComponent.prototype.guardarEjercicioSeleccionado = function (id_ejercicio) {
        var _this = this;
        if (!this.api.selectEjercicio) {
            console.warn('⚠ No hay método API para guardar ejercicio seleccionado');
            this.showToast({
                type: 'warning',
                title: 'Aviso',
                message: 'El servicio no expone selectEjercicio().'
            });
            return;
        }
        this.api.selectEjercicio(id_ejercicio).subscribe({
            next: function () {
                console.log('Ejercicio seleccionado guardado en BD:', id_ejercicio);
                _this.showToast({
                    type: 'success',
                    title: 'Ejercicio actualizado',
                    message: "Se guard\u00F3 el ejercicio " + id_ejercicio + " como activo."
                });
            },
            error: function (err) {
                console.error('❌ Error al guardar ejercicio seleccionado:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudo actualizar el ejercicio seleccionado.'
                });
            }
        });
    };
    Object.defineProperty(PolizasComponent.prototype, "ejercicioLabel", {
        get: function () {
            var e = this.ejercicioActual;
            if (!e)
                return '—';
            var nombre = e.nombre && e.nombre !== '—'
                ? e.nombre
                : e.fecha_inicio && e.fecha_fin
                    ? e.fecha_inicio + " \u2014 " + e.fecha_fin
                    : '';
            return nombre || '—';
        },
        enumerable: false,
        configurable: true
    });
    PolizasComponent.prototype.applyPeriodoFilter = function () {
        var _a, _b;
        if (!Array.isArray(this.allPeriodos) || this.allPeriodos.length === 0) {
            this.periodos = [];
            return;
        }
        var ej = this.ejercicioActual;
        if (!ej) {
            this.periodos = this.allPeriodos.map(function (p) { return ({
                id_periodo: p.id_periodo,
                nombre: fecha_utils_1.periodoEtiqueta(p.fecha_inicio, p.fecha_fin)
            }); });
            return;
        }
        var idEj = Number(ej.id_ejercicio);
        var ejIni = fecha_utils_1.fmtDate((_a = ej.fecha_inicio) !== null && _a !== void 0 ? _a : ej.inicio);
        var ejFin = fecha_utils_1.fmtDate((_b = ej.fecha_fin) !== null && _b !== void 0 ? _b : ej.fin);
        var filtrados = this.allPeriodos.filter(function (p) { return Number.isFinite(p.id_ejercicio) && p.id_ejercicio === idEj; });
        if (filtrados.length === 0 && ejIni && ejFin) {
            filtrados = this.allPeriodos.filter(function (p) {
                var pi = p.fecha_inicio, pf = p.fecha_fin;
                if (!pi || !pf)
                    return false;
                return pi <= ejFin && pf >= ejIni; // solapamiento
            });
        }
        this.periodos = filtrados.map(function (p) { return ({
            id_periodo: p.id_periodo,
            nombre: fecha_utils_1.periodoEtiqueta(p.fecha_inicio, p.fecha_fin)
        }); });
    };
    //  Catálogos 
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
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los tipos de póliza.'
                });
            }
        });
        this.api.getPeriodos().subscribe({
            next: function (r) {
                var _a;
                var items = (_a = _this.normalizeList(r)) !== null && _a !== void 0 ? _a : [];
                _this.allPeriodos = items.map(function (p) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
                    return ({
                        id_periodo: Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID),
                        id_ejercicio: Number((_g = (_f = (_e = (_d = (_c = p.id_ejercicio) !== null && _c !== void 0 ? _c : p.ejercicio_id) !== null && _d !== void 0 ? _d : p.ejercicio) !== null && _e !== void 0 ? _e : p.idEjercicio) !== null && _f !== void 0 ? _f : p.ID_EJERCICIO) !== null && _g !== void 0 ? _g : NaN),
                        fecha_inicio: fecha_utils_1.fmtDate((_l = (_k = (_j = (_h = p.fecha_inicio) !== null && _h !== void 0 ? _h : p.fechaInicio) !== null && _j !== void 0 ? _j : p.inicio) !== null && _k !== void 0 ? _k : p.start_date) !== null && _l !== void 0 ? _l : p.fecha_ini),
                        fecha_fin: fecha_utils_1.fmtDate((_q = (_p = (_o = (_m = p.fecha_fin) !== null && _m !== void 0 ? _m : p.fechaFin) !== null && _o !== void 0 ? _o : p.fin) !== null && _p !== void 0 ? _p : p.end_date) !== null && _q !== void 0 ? _q : p.fecha_fin),
                        _raw: p
                    });
                });
                _this.applyPeriodoFilter();
            },
            error: function (err) {
                console.error('Periodos:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los periodos.'
                });
            }
        });
        // Centros (encabezado)
        this.api.getCentros().subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.centros = items.map(function (c) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    var id = Number((_b = (_a = c.id_centro) !== null && _a !== void 0 ? _a : c.id) !== null && _b !== void 0 ? _b : c.ID);
                    var serie = String((_e = (_d = (_c = c.serie_venta) !== null && _c !== void 0 ? _c : c.serie) !== null && _d !== void 0 ? _d : c.codigo) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_j = (_h = (_g = (_f = c.nombre) !== null && _f !== void 0 ? _f : c.nombre_centro) !== null && _g !== void 0 ? _g : c.descripcion) !== null && _h !== void 0 ? _h : c.NOMBRE) !== null && _j !== void 0 ? _j : '').trim();
                    var etiqueta = serie && nombre
                        ? serie + " \u2014 " + nombre
                        : serie || nombre || "Centro " + id;
                    return { id_centro: id, nombre: etiqueta };
                });
            },
            error: function (err) {
                console.error('Centros:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los centros.'
                });
            }
        });
    };
    PolizasComponent.prototype.getCentros = function () {
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
                        : clave
                            ? clave + " \u2014 " + nom
                            : nom;
                    return {
                        id_centrocosto: id,
                        nombre: etiqueta,
                        clave: clave,
                        serie_venta: serie
                    };
                })
                    .filter(function (cc) {
                    return Number.isFinite(cc.id_centrocosto);
                });
                _this.centrosCostoMap = new Map(_this.centrosCosto.map(function (cc) { return [cc.id_centrocosto, cc]; }));
            },
            error: function (err) {
                console.error('Centros de Costo:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar Centros de Costo.'
                });
                _this.centrosCosto = [];
                _this.centrosCostoMap.clear();
            }
        });
    };
    //  Cuentas 
    PolizasComponent.prototype.cargarCuentas = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCuentas ||
            svc.listCuentas ||
            svc.getCatalogoCuentas ||
            svc.listCatalogoCuentas ||
            svc.getPlanCuentas ||
            svc.listPlanCuentas;
        if (typeof fn !== 'function') {
            console.warn('No existe método de API para Cuentas; usando vacío.');
            this.cuentas = [];
            this.cuentasMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
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
                    var posteable = posteableRaw === true ||
                        posteableRaw === 1 ||
                        posteableRaw === '1';
                    var ctaMayor = ctaMayorRaw === true ||
                        ctaMayorRaw === 1 ||
                        ctaMayorRaw === '1';
                    return {
                        id: id,
                        codigo: codigo,
                        nombre: nombre,
                        parentId: parentId,
                        posteable: posteable,
                        ctaMayor: ctaMayor,
                        hijos: []
                    };
                })
                    .filter(function (n) { return Number.isFinite(n.id); });
                var porId = new Map();
                nodos.forEach(function (n) { return porId.set(n.id, n); });
                var raices = [];
                porId.forEach(function (nodo) {
                    if (nodo.parentId) {
                        var padre = porId.get(nodo.parentId);
                        if (padre) {
                            padre.hijos.push(nodo);
                        }
                        else {
                            raices.push(nodo);
                        }
                    }
                    else {
                        raices.push(nodo);
                    }
                });
                var sortTree = function (n) {
                    n.hijos.sort(function (a, b) {
                        return a.codigo.localeCompare(b.codigo, undefined, {
                            numeric: true
                        });
                    });
                    n.hijos.forEach(function (h) { return sortTree(h); });
                };
                raices.sort(function (a, b) {
                    return a.codigo.localeCompare(b.codigo, undefined, {
                        numeric: true
                    });
                });
                raices.forEach(function (r) { return sortTree(r); });
                var resultado = [];
                var visitar = function (nodo, nivel) {
                    resultado.push({
                        id_cuenta: nodo.id,
                        codigo: nodo.codigo,
                        nombre: nodo.nombre,
                        nivel: nivel,
                        esPadre: nodo.ctaMayor && !nodo.posteable,
                        posteable: nodo.posteable
                    });
                    nodo.hijos.forEach(function (h) { return visitar(h, nivel + 1); });
                };
                raices.forEach(function (r) { return visitar(r, 0); });
                _this.cuentas = resultado;
                _this.cuentasMap = new Map(resultado.map(function (c) { return [c.id_cuenta, { codigo: c.codigo, nombre: c.nombre }]; }));
                console.log(' Plan de cuentas (árbol aplanado con nivel):', _this.cuentas);
            },
            error: function (err) {
                console.error('Cuentas:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar las cuentas.'
                });
                _this.cuentas = [];
                _this.cuentasMap.clear();
            }
        });
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
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (!movs[index])
            return;
        movs[index]._cuentaQuery = '';
    };
    PolizasComponent.prototype.onCuentaSeleccionadaGlobal = function () {
        this.cuentasQuery = '';
    };
    PolizasComponent.prototype.getCuentasParaFila = function (index, selectedId) {
        var base = this.getCuentasFiltradasGlobal();
        if (!selectedId)
            return base;
        if (base.some(function (c) { return c.id_cuenta === selectedId; }))
            return base;
        var sel = this.cuentasMap.get(selectedId);
        return sel
            ? __spreadArrays([{ id_cuenta: selectedId, codigo: sel.codigo, nombre: sel.nombre }], base) : base;
    };
    PolizasComponent.prototype.getCuentasFiltradas = function (index) {
        var _this = this;
        var _a, _b, _c;
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        var q = this.normalizaStr(String((_c = (_b = movs[index]) === null || _b === void 0 ? void 0 : _b._cuentaQuery) !== null && _c !== void 0 ? _c : '').trim());
        if (!q)
            return this.cuentas;
        return this.cuentas.filter(function (c) {
            var cad = c.codigo + " " + c.nombre;
            return _this.normalizaStr(cad).includes(q);
        });
    };
    PolizasComponent.prototype.labelCuenta = function (id_cuenta) {
        var _a;
        if (!id_cuenta)
            return '—';
        var c = this.cuentas.find(function (x) { return x.id_cuenta === Number(id_cuenta); });
        if (!c)
            return '—';
        var nivel = (_a = c.nivel) !== null && _a !== void 0 ? _a : 0;
        var indent = nivel > 0 ? ' '.repeat((nivel - 1) * 2) + '↳ ' : '';
        return "" + indent + c.codigo + " \u2014 " + c.nombre;
    };
    //  Pólizas 
    PolizasComponent.prototype.cargarPolizas = function () {
        var _this = this;
        this.api
            .getPolizas({
            id_tipopoliza: this.filtroTipo,
            id_periodo: this.filtroPeriodo,
            id_centro: this.filtroCentro
        })
            .subscribe({
            next: function (r) {
                var _a, _b;
                var list = (_b = (_a = _this.normalizeList(r)) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.polizas) !== null && _b !== void 0 ? _b : [];
                _this.polizas = Array.isArray(list) ? list : [];
                if (_this.polizas.length === 0) {
                    _this.showToast({
                        type: 'info',
                        message: 'No se encontraron pólizas con los filtros actuales.'
                    });
                }
            },
            error: function (err) {
                console.error('Pólizas:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar las pólizas.'
                });
            }
        });
    };
    PolizasComponent.prototype.onMovimientoCcChange = function (index, ccId) {
        var _a;
        var serie = this.getSerieVentaByCcId(this.toNumOrNull(ccId));
        if (!((_a = this.nuevaPoliza.movimientos) === null || _a === void 0 ? void 0 : _a[index]))
            return;
        if (serie &&
            (!this.nuevaPoliza.movimientos[index].ref_serie_venta ||
                !String(this.nuevaPoliza.movimientos[index].ref_serie_venta).trim())) {
            this.nuevaPoliza.movimientos[index].ref_serie_venta = serie;
        }
    };
    //  CFDI / XML 
    PolizasComponent.prototype.cargarCfdiRecientes = function () {
        var _this = this;
        this.api.listCfdi({ limit: 100 }).subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var arr = Array.isArray(r)
                    ? r
                    : (_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r) !== null && _d !== void 0 ? _d : [];
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
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los CFDI recientes.'
                });
            }
        });
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
                            this.nuevaPoliza.movimientos[index].uuid = uuid;
                            this.nuevaPoliza.movimientos[index]._xmlName = file.name;
                            this.showToast({
                                title: 'XML asociado',
                                message: "UUID " + uuid + " vinculado al movimiento " + (index + 1),
                                type: 'success',
                                autoCloseMs: 3500
                            });
                        }
                        else {
                            this.showToast({
                                title: 'Aviso',
                                message: 'El servidor no devolvió UUID.',
                                type: 'warning'
                            });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _c.sent();
                        console.error('Error al subir XML:', error_1);
                        this.uploadXmlError =
                            ((_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.error) === null || _b === void 0 ? void 0 : _b.message) || 'Error al subir el XML.';
                        this.showToast({
                            title: 'Error',
                            message: this.uploadXmlError,
                            type: 'error',
                            autoCloseMs: 4000
                        });
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
    PolizasComponent.prototype.triggerXmlPicker = function (input) {
        this.uploadXmlError = '';
        input.value = '';
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
            this.showToast({
                type: 'warning',
                title: 'Archivo no válido',
                message: this.uploadXmlError
            });
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            this.uploadXmlError =
                'El XML excede el tamaño permitido (1 MB).';
            this.showToast({
                type: 'warning',
                title: 'Archivo pesado',
                message: this.uploadXmlError
            });
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
                if (opt.uuid &&
                    !_this.cfdiOptions.some(function (x) { return x.uuid === opt.uuid; })) {
                    _this.cfdiOptions = __spreadArrays(_this.cfdiOptions, [opt]);
                }
                if (opt.uuid)
                    _this.uuidSeleccionado = opt.uuid;
                _this.showToast({
                    type: 'success',
                    title: 'XML importado',
                    message: 'El CFDI se importó correctamente.'
                });
            },
            error: function (err) {
                var _a, _b;
                console.error('Importar XML:', err);
                _this.uploadXmlError = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Error importando XML';
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: _this.uploadXmlError
                });
            },
            complete: function () { return (_this.uploadingXml = false); }
        });
    };
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
    //  Movimientos 
    PolizasComponent.prototype.onCuentaQueryChange = function (index, value) {
        var _a;
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (!movs[index])
            return;
        movs[index]._cuentaQuery = value !== null && value !== void 0 ? value : '';
    };
    PolizasComponent.prototype.onCentroSeleccionado = function () {
        var _a;
        var idCentro = this.nuevaPoliza.id_centro;
        ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : []).forEach(function (mov) {
            if (!mov.cc)
                mov.cc = idCentro;
        });
    };
    // NUEVOS MÉTODOS PARA CARGO / ABONO
    PolizasComponent.prototype.onCargoChange = function (index, value) {
        var _a;
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (!movs[index])
            return;
        var monto = this.toNumOrNull(value);
        movs[index].monto = monto;
        if (monto != null && monto > 0) {
            movs[index].operacion = '0'; // Cargo
        }
        else if (movs[index].operacion === '0') {
            movs[index].operacion = '';
        }
    };
    PolizasComponent.prototype.onAbonoChange = function (index, value) {
        var _a;
        var movs = (_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : [];
        if (!movs[index])
            return;
        var monto = this.toNumOrNull(value);
        movs[index].monto = monto;
        if (monto != null && monto > 0) {
            movs[index].operacion = '1'; // Abono
        }
        else if (movs[index].operacion === '1') {
            movs[index].operacion = '';
        }
    };
    PolizasComponent.prototype.agregarMovimiento = function () {
        var _a, _b, _c;
        var defaultCuenta = this.cuentas.length
            ? this.cuentas[0].id_cuenta
            : null;
        var ccId = (_a = this.nuevaPoliza.id_centro) !== null && _a !== void 0 ? _a : null;
        var serie = this.getSerieVentaByCcId(this.toNumOrNull(ccId));
        var nuevo = {
            id_cuenta: null,
            ref_serie_venta: serie !== null && serie !== void 0 ? serie : '',
            operacion: '',
            monto: null,
            cliente: '',
            fecha: fecha_utils_1.todayISO(),
            cc: (_b = this.nuevaPoliza.id_centro) !== null && _b !== void 0 ? _b : null,
            uuid: null,
            _cuentaQuery: defaultCuenta
                ? this.labelCuenta(defaultCuenta)
                : ''
        };
        ((_c = this.nuevaPoliza.movimientos) !== null && _c !== void 0 ? _c : ) = [];
        push(nuevo);
    };
    PolizasComponent.prototype.eliminarMovimiento = function (i) {
        var _a;
        (_a = this.nuevaPoliza.movimientos) === null || _a === void 0 ? void 0 : _a.splice(i, 1);
    };
    //  Validación / guardado 
    PolizasComponent.prototype.validarYExplicarErrores = function () {
        var _this = this;
        var _a;
        var p = this.nuevaPoliza;
        if (!p) {
            this.showToast({
                type: 'warning',
                title: 'Faltan datos',
                message: 'No hay póliza en edición.'
            });
            return false;
        }
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
            this.showToast({
                type: 'warning',
                title: 'Faltan datos',
                message: "Completa: " + faltantes.join(', ') + "."
            });
            return false;
        }
        var movs = (_a = p.movimientos) !== null && _a !== void 0 ? _a : [];
        if (movs.length === 0) {
            this.showToast({
                type: 'warning',
                title: 'Movimientos',
                message: 'Agrega al menos un movimiento.'
            });
            return false;
        }
        for (var i = 0; i < movs.length; i++) {
            var m = movs[i];
            var idCuenta = this.toNumOrNull(m.id_cuenta);
            var op = m.operacion;
            var monto = this.toNumOrNull(m.monto);
            var idCc = this.toNumOrNull(m.cc);
            if (!idCuenta) {
                this.showToast({
                    type: 'warning',
                    title: "Movimiento #" + (i + 1),
                    message: 'Selecciona una cuenta contable.'
                });
                return false;
            }
            if (!this.cuentasMap.has(idCuenta)) {
                this.showToast({
                    type: 'warning',
                    title: "Movimiento #" + (i + 1),
                    message: 'La cuenta seleccionada no existe en el catálogo.'
                });
                return false;
            }
            if (!(op === '0' || op === '1')) {
                this.showToast({
                    type: 'warning',
                    title: "Movimiento #" + (i + 1),
                    message: 'Selecciona si es Cargo (0) o Abono (1).'
                });
                return false;
            }
            if (!monto || monto <= 0) {
                this.showToast({
                    type: 'warning',
                    title: "Movimiento #" + (i + 1),
                    message: 'Captura un monto mayor a 0.'
                });
                return false;
            }
            if (idCc != null && !this.centrosCostoMap.has(idCc)) {
                this.showToast({
                    type: 'warning',
                    title: "Movimiento #" + (i + 1),
                    message: 'El Centro de Costo seleccionado no existe.'
                });
                return false;
            }
        }
        var movsValidos = movs.filter(function (m) {
            var _a;
            return _this.toNumOrNull(m.id_cuenta) &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        var cargos = movsValidos
            .filter(function (m) { return m.operacion === '0'; })
            .reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        var abonos = movsValidos
            .filter(function (m) { return m.operacion === '1'; })
            .reduce(function (s, m) { return s + (_this.toNumOrNull(m.monto) || 0); }, 0);
        if (Math.abs(cargos - abonos) > 0.001) {
            this.showToast({
                type: 'warning',
                title: 'Partida doble',
                message: "No cuadra.\nCargos: " + cargos + "\nAbonos: " + abonos
            });
        }
        return true;
    };
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
            return !!(this.evento.monto_base &&
                this.evento.fecha_operacion &&
                this.evento.id_empresa &&
                this.evento.id_cuenta_contrapartida);
        }
        var movs = ((_a = p.movimientos) !== null && _a !== void 0 ? _a : []).filter(function (m) {
            var _a;
            return _this.toNumOrNull(m.id_cuenta) &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        if (movs.length === 0)
            return false;
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
    PolizasComponent.prototype.guardarPoliza = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (this.modoCaptura === 'manual') {
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
                    operacion: m.operacion === '0' || m.operacion === '1'
                        ? m.operacion
                        : null,
                    monto: _this.toNumOrNull(m.monto),
                    cliente: _this.toStrOrNull(m.cliente),
                    fecha: fecha_utils_1.toDateOrNull(m.fecha),
                    cc: _this.toNumOrNull(m.cc),
                    uuid: _this.toStrOrNull(m.uuid)
                }); })
            };
            this.api.createPoliza(payload).subscribe({
                next: function () {
                    var _a;
                    _this.nuevaPoliza = {
                        movimientos: [],
                        id_usuario: (_a = _this.currentUser) === null || _a === void 0 ? void 0 : _a.id_usuario
                    };
                    _this.cargarPolizas();
                    _this.showToast({
                        type: 'success',
                        title: 'Guardado',
                        message: 'Póliza creada correctamente.'
                    });
                },
                error: function (err) {
                    var _a, _b;
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || (err === null || err === void 0 ? void 0 : err.message) ||
                        'Error al guardar póliza';
                    console.error('Guardar póliza (manual):', err);
                    _this.showToast({
                        type: 'warning',
                        title: 'Aviso',
                        message: msg
                    });
                }
            });
        }
        else {
            var okHeader = ((_b = this.nuevaPoliza) === null || _b === void 0 ? void 0 : _b.folio) && ((_c = this.nuevaPoliza) === null || _c === void 0 ? void 0 : _c.concepto) && ((_d = this.nuevaPoliza) === null || _d === void 0 ? void 0 : _d.id_tipopoliza) && ((_e = this.nuevaPoliza) === null || _e === void 0 ? void 0 : _e.id_periodo) && ((_f = this.nuevaPoliza) === null || _f === void 0 ? void 0 : _f.id_centro) && ((_g = this.nuevaPoliza) === null || _g === void 0 ? void 0 : _g.id_usuario);
            var okMotor = this.evento.monto_base != null &&
                this.evento.monto_base > 0 &&
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
                tipo_operacion: this.evento.tipo_operacion,
                monto_base: Number(this.evento.monto_base),
                fecha_operacion: fecha_utils_1.toDateOrNull(this.evento.fecha_operacion),
                id_empresa: Number(this.evento.id_empresa),
                medio_cobro_pago: this.evento.medio_cobro_pago,
                id_cuenta_contrapartida: Number(this.evento.id_cuenta_contrapartida),
                cliente: (_h = this.toStrOrNull(this.evento.cliente)) !== null && _h !== void 0 ? _h : null,
                ref_serie_venta: (_j = this.toStrOrNull(this.evento.ref_serie_venta)) !== null && _j !== void 0 ? _j : null,
                cc: (_k = this.toNumOrNull(this.evento.cc)) !== null && _k !== void 0 ? _k : null
            };
            this.api.createPolizaFromEvento(body).subscribe({
                next: function () {
                    var _a;
                    _this.nuevaPoliza = {
                        movimientos: [],
                        id_usuario: (_a = _this.currentUser) === null || _a === void 0 ? void 0 : _a.id_usuario
                    };
                    _this.cargarPolizas();
                    _this.showToast({
                        type: 'success',
                        title: 'Guardado',
                        message: 'Póliza creada con el motor.'
                    });
                },
                error: function (err) {
                    var _a;
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) ||
                        'Error al crear póliza con el motor';
                    console.error('Guardar póliza (motor):', err);
                    _this.showToast({
                        type: 'warning',
                        title: 'Aviso',
                        message: msg
                    });
                }
            });
        }
    };
    PolizasComponent.prototype.agregarEventoAPolizaExistente = function (id_poliza) {
        var _this = this;
        var _a, _b, _c;
        var okMotor = this.evento.monto_base != null &&
            this.evento.monto_base > 0 &&
            !!this.evento.fecha_operacion &&
            !!this.evento.id_empresa &&
            !!this.evento.id_cuenta_contrapartida;
        if (!okMotor) {
            this.showToast({
                type: 'warning',
                title: 'Faltan datos',
                message: 'Completa los datos del evento.'
            });
            return;
        }
        var body = {
            tipo_operacion: this.evento.tipo_operacion,
            monto_base: Number(this.evento.monto_base),
            fecha_operacion: fecha_utils_1.toDateOrNull(this.evento.fecha_operacion),
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
                _this.showToast({
                    type: 'success',
                    title: 'Agregado',
                    message: "Se agregaron " + ((_a = r === null || r === void 0 ? void 0 : r.count) !== null && _a !== void 0 ? _a : '') + " movimientos a la p\u00F3liza " + id_poliza + "."
                });
            },
            error: function (err) {
                var _a;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) ||
                    'Error al agregar evento';
                console.error('expand-evento:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: msg
                });
            }
        });
    };
    PolizasComponent.prototype.recomputarFolioSugerido = function () {
        return __awaiter(this, void 0, Promise, function () {
            var id_tipopoliza, id_periodo, id_centro, r, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id_tipopoliza = this.toNumOrNull(this.nuevaPoliza.id_tipopoliza);
                        id_periodo = this.toNumOrNull(this.nuevaPoliza.id_periodo);
                        id_centro = this.toNumOrNull(this.nuevaPoliza.id_centro);
                        if (!id_tipopoliza || !id_periodo || !id_centro)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.api.getFolioSiguiente({
                                id_tipopoliza: id_tipopoliza,
                                id_periodo: id_periodo,
                                id_centro: id_centro !== null && id_centro !== void 0 ? id_centro : undefined
                            }))];
                    case 2:
                        r = _a.sent();
                        if (!this.folioFueEditadoPorUsuario) {
                            this.nuevaPoliza.folio = (r === null || r === void 0 ? void 0 : r.folio) || this.nuevaPoliza.folio;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.warn('No se pudo obtener folio sugerido', e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PolizasComponent.prototype.onPeriodoChange = function (_id) {
        var _a;
        if (!((_a = this.nuevaPoliza) === null || _a === void 0 ? void 0 : _a.folio))
            this.folioFueEditadoPorUsuario = false;
        this.recomputarFolioSugerido();
    };
    PolizasComponent.prototype.onCentroChange = function (_id) {
        var _a;
        if (!((_a = this.nuevaPoliza) === null || _a === void 0 ? void 0 : _a.folio))
            this.folioFueEditadoPorUsuario = false;
        this.recomputarFolioSugerido();
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
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                polizas_layout_component_1.PolizasLayoutComponent,
                toast_message_component_component_1.ToastMessageComponent,
                router_1.RouterModule,
                modal_seleccion_cuenta_component_1.ModalSeleccionCuentaComponent,
                modal_component_1.ModalComponent
            ],
            templateUrl: './polizas.component.html',
            styleUrls: ['./polizas.component.scss']
        })
    ], PolizasComponent);
    return PolizasComponent;
}());
exports.PolizasComponent = PolizasComponent;
