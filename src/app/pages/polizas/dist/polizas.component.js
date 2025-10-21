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
exports.PolizasComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var router_1 = require("@angular/router");
var PolizasComponent = /** @class */ (function () {
    function PolizasComponent(api) {
        var _this = this;
        this.api = api;
        this.sidebarOpen = true;
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
        // XML
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
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
        //  Movimientos 
        this.normalizaStr = function (s) { var _a, _b; return (_b = (_a = s.normalize) === null || _a === void 0 ? void 0 : _a.call(s, 'NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) !== null && _b !== void 0 ? _b : s.toLowerCase(); };
        this.trackByFolio = function (_, x) { var _a; return (_a = x === null || x === void 0 ? void 0 : x.folio) !== null && _a !== void 0 ? _a : _; };
    }
    PolizasComponent.prototype.volver = function () {
        this.router.navigate(['/poliza-home']);
    };
    PolizasComponent.prototype.ngOnInit = function () {
        this.initUsuarioActual(); // setea id_usuario
        this.cargarCatalogos(); // tipos/periodos/centros
        this.getCentros(); // centros de costo para tabla
        this.cargarCuentas(); // catálogo de cuentas para select
        this.cargarPolizas(); // listado
        this.cargarCfdiRecientes(); // UUIDs
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
                    var nombre = String((_g = (_f = c.nombre) !== null && _f !== void 0 ? _f : c.descripcion) !== null && _g !== void 0 ? _g : '').trim();
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
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var id = Number((_b = (_a = x.id_cuenta) !== null && _a !== void 0 ? _a : x.id) !== null && _b !== void 0 ? _b : x.ID);
                    var codigo = String((_e = (_d = (_c = x.codigo) !== null && _c !== void 0 ? _c : x.clave) !== null && _d !== void 0 ? _d : x.CODIGO) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_h = (_g = (_f = x.nombre) !== null && _f !== void 0 ? _f : x.descripcion) !== null && _g !== void 0 ? _g : x.NOMBRE) !== null && _h !== void 0 ? _h : '').trim();
                    return { id_cuenta: id, codigo: codigo, nombre: nombre };
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
    PolizasComponent.prototype.agregarMovimiento = function () {
        var _a;
        var defaultCc = this.centrosCosto.length ? this.centrosCosto[0].id_centrocosto : null;
        var defaultCuenta = this.cuentas.length ? this.cuentas[0].id_cuenta : null;
        var nuevo = {
            id_cuenta: null,
            ref_serie_venta: '',
            operacion: '',
            monto: null,
            cliente: '',
            fecha: '',
            cc: defaultCc,
            uuid: null,
            _cuentaQuery: defaultCuenta ? this.labelCuenta(defaultCuenta) : ''
        };
        ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
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
        // Validación de movimientos con saldo y operación
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
        if (!(Math.abs(cargos - abonos) <= 0.001 && cargos > 0))
            return false;
        //  valida que las cuentas y centros de costo existan en los catálogos
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
            return false;
        }
        return true;
    };
    //  Guardar 
    PolizasComponent.prototype.guardarPoliza = function () {
        var _this = this;
        var _a;
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
            movimientos: ((_a = p === null || p === void 0 ? void 0 : p.movimientos) !== null && _a !== void 0 ? _a : []).map(function (m) {
                var _a, _b;
                var op = (m.operacion === '0' || m.operacion === '1') ? m.operacion : null;
                var uuidFinal = (_b = (_a = _this.toStrOrNull(m.uuid)) !== null && _a !== void 0 ? _a : _this.toStrOrNull(_this.uuidSeleccionado)) !== null && _b !== void 0 ? _b : null;
                return {
                    id_cuenta: _this.toNumOrNull(m.id_cuenta),
                    ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                    operacion: op,
                    monto: _this.toNumOrNull(m.monto),
                    cliente: _this.toStrOrNull(m.cliente),
                    fecha: _this.toDateOrNull(m.fecha),
                    cc: _this.toNumOrNull(m.cc),
                    uuid: uuidFinal
                };
            })
        };
        this.api.createPoliza(payload).subscribe({
            next: function () {
                var _a;
                _this.nuevaPoliza = { movimientos: [], id_usuario: (_a = _this.currentUser) === null || _a === void 0 ? void 0 : _a.id_usuario }; // deja el usuario seteado
                _this.cargarPolizas();
                _this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada correctamente.' });
            },
            error: function (err) {
                var _a, _b;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al guardar póliza';
                console.error('Guardar póliza:', err);
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
            imports: [common_1.CommonModule, forms_1.FormsModule, polizas_layout_component_1.PolizasLayoutComponent, toast_message_component_component_1.ToastMessageComponent, router_1.RouterModule],
            templateUrl: './polizas.component.html',
            styleUrls: ['./polizas.component.scss']
        })
    ], PolizasComponent);
    return PolizasComponent;
}());
exports.PolizasComponent = PolizasComponent;
