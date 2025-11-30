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
exports.PolizaHomeComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var PolizaHomeComponent = /** @class */ (function () {
    function PolizaHomeComponent(location, router, api, ejercicioSvc, onboarding) {
        var _this = this;
        this.location = location;
        this.router = router;
        this.api = api;
        this.ejercicioSvc = ejercicioSvc;
        this.onboarding = onboarding;
        this.sidebarOpen = true;
        this.polizaSeleccionada = null; // Para almacenar la póliza seleccionada
        this.ejercicios = [];
        this.selectedEjercicioId = null;
        this.Math = Math;
        this.confirmModal = {
            open: false,
            title: 'Confirmar eliminación',
            message: '¿Deseas eliminar esta póliza?',
            onConfirm: (function () { })
        };
        this.approveModal = {
            open: false,
            title: 'Confirmar aprobación',
            message: '¿Deseas marcar esta póliza como Aprobada?',
            onConfirm: (function () { })
        };
        this.polizas = [];
        this.polizasFiltradas = [];
        this.tiposPoliza = [];
        this.periodos = [];
        this.centros = [];
        this.mapTipos = new Map();
        this.mapPeriodos = new Map();
        this.mapCentros = new Map();
        this.cuentasMap = new Map();
        this.q = '';
        this.nuevaPoliza = { movimientos: [] };
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        this.cfdiOptions = [];
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
        this.loadingId = null;
        this.expandedId = null;
        this.movsLoadingId = null;
        this.movsLoaded = {};
        // Este es el listado de todas las pólizas
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalPolizas = 0;
        // Listado de movimientos por póliza
        this.movsPageByPoliza = {};
        this.movsTotalByPoliza = {};
        this.movsPageSize = 10;
        this.MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this.nombreCentro = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapCentros.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        this.nombreTipo = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapTipos.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        this.nombrePeriodo = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapPeriodos.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        this.trackByFolio = function (_, p) { var _a, _b; return (_b = (_a = p === null || p === void 0 ? void 0 : p.id_poliza) !== null && _a !== void 0 ? _a : p === null || p === void 0 ? void 0 : p.folio) !== null && _b !== void 0 ? _b : _; };
        this.filtros = {
            folio: '',
            concepto: '',
            centro: '',
            tipo: '',
            periodo: '',
            estado: ''
        };
        this.showFilter = {
            folio: false,
            concepto: false,
            centro: false,
            tipo: false,
            periodo: false,
            estado: false
        };
    }
    PolizaHomeComponent.prototype.seleccionarPoliza = function (p) {
        this.polizaSeleccionada = p;
    };
    // Método para navegar al formulario de ajuste
    PolizaHomeComponent.prototype.irACrearAjuste = function () {
        // Verificar si la póliza seleccionada existe
        if (!this.polizaSeleccionada) {
            this.showToast({
                type: 'warning',
                title: 'Póliza no seleccionada',
                message: 'Por favor, selecciona una póliza antes de crear el ajuste.'
            });
            return; // No redirige si no hay póliza seleccionada
        }
        // Verifica si el ID de la póliza seleccionada existe
        var idPoliza = this.polizaSeleccionada.id_poliza;
        if (!idPoliza) {
            this.showToast({
                type: 'error',
                title: 'ID de póliza inválido',
                message: 'No se ha encontrado el ID de la póliza seleccionada.'
            });
            return; // No redirige si el ID de la póliza es inválido
        }
        // Redirige a la página de ajuste con el ID de la póliza seleccionada
        this.router.navigate(['/poliza/ajuste', idPoliza]);
    };
    PolizaHomeComponent.prototype.ngOnInit = function () {
        //this.onboarding.maybeStartGlobalTour();  
        this.cargarCatalogos();
        this.cargarCfdiRecientes();
        this.cargarCuentas();
        this.cargarEjercicios();
    };
    PolizaHomeComponent.prototype.volver = function () { this.location.back(); };
    PolizaHomeComponent.prototype.abrirConfirmModal = function (message, onConfirm, title) {
        if (title === void 0) { title = 'Confirmar eliminación'; }
        this.confirmModal.title = title;
        this.confirmModal.message = message;
        this.confirmModal.onConfirm = onConfirm;
        this.confirmModal.open = true;
    };
    PolizaHomeComponent.prototype.cerrarConfirmModal = function () { this.confirmModal.open = false; this.confirmModal.onConfirm = function () { }; };
    PolizaHomeComponent.prototype.confirmarConfirmModal = function () { var _a, _b; try {
        (_b = (_a = this.confirmModal).onConfirm) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    finally {
        this.cerrarConfirmModal();
    } };
    /** Abrir modal de aprobar , pero primero checa si esta cuadrada la poliza */
    PolizaHomeComponent.prototype.abrirApproveModal = function (p) {
        var _this = this;
        var id = this.getIdPoliza(p);
        if (!id) {
            this.showToast({ type: 'warning', title: 'Sin ID', message: 'No se puede aprobar: falta id_poliza.' });
            return;
        }
        this.verificarCuadrada(p, function (ok) {
            if (!ok) {
                _this.showToast({
                    type: 'warning',
                    title: 'No cuadrada',
                    message: 'La póliza no está cuadrada. No se puede marcar como Aprobada.'
                });
                return;
            }
            _this.approveModal.title = 'Confirmar aprobación';
            _this.approveModal.message = "Vas a marcar la p\u00F3liza " + id + " como Aprobada. \u00BFContinuar?";
            _this.approveModal.onConfirm = function () {
                _this.loadingId = id;
                _this._hacerCambioEstado(id, p, 'Aprobada');
            };
            _this.approveModal.open = true;
        });
    };
    PolizaHomeComponent.prototype.cerrarApproveModal = function () { this.approveModal.open = false; this.approveModal.onConfirm = function () { }; };
    PolizaHomeComponent.prototype.confirmarApproveModal = function () { var _a, _b; try {
        (_b = (_a = this.approveModal).onConfirm) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    finally {
        this.cerrarApproveModal();
    } };
    PolizaHomeComponent.prototype.onModalConfirmed = function () { this.confirmarConfirmModal(); };
    PolizaHomeComponent.prototype.onModalCanceled = function () { this.cerrarConfirmModal(); };
    PolizaHomeComponent.prototype.onModalClosed = function () { this.cerrarConfirmModal(); };
    // Helpers para el template
    PolizaHomeComponent.prototype.getIdPolizaSafe = function (p) {
        var id = this.getIdPoliza(p);
        return id != null ? id : 0;
    };
    PolizaHomeComponent.prototype.movsTotalFor = function (p) {
        var _a;
        var id = this.getIdPolizaSafe(p);
        return (_a = this.movsTotalByPoliza[id]) !== null && _a !== void 0 ? _a : 0;
    };
    PolizaHomeComponent.prototype.movsPageFor = function (p) {
        var _a;
        var id = this.getIdPolizaSafe(p);
        return (_a = this.movsPageByPoliza[id]) !== null && _a !== void 0 ? _a : 1;
    };
    PolizaHomeComponent.prototype.lastMovsPageFor = function (p) {
        var total = this.movsTotalFor(p);
        return total > 0 ? Math.ceil(total / this.movsPageSize) : 1;
    };
    PolizaHomeComponent.prototype.toDate = function (v) {
        if (!v)
            return null;
        var s = String(v).trim();
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
        if (m) {
            var y = Number(m[1]), mo = Number(m[2]), d_1 = Number(m[3]);
            return new Date(Date.UTC(y, mo - 1, d_1));
        }
        var d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
    };
    PolizaHomeComponent.prototype.periodoEtiqueta = function (ini, fin) {
        var di = this.toDate(ini);
        var df = this.toDate(fin);
        if (di && df) {
            var yi = di.getUTCFullYear();
            var yf = df.getUTCFullYear();
            var mi = di.getUTCMonth();
            var mf = df.getUTCMonth();
            return (yi === yf)
                ? this.MESES_CORTOS[mi] + "\u2013" + this.MESES_CORTOS[mf] + " " + yi
                : this.MESES_CORTOS[mi] + " " + yi + " \u2014 " + this.MESES_CORTOS[mf] + " " + yf;
        }
        if (di)
            return this.MESES_CORTOS[di.getUTCMonth()] + " " + di.getUTCFullYear();
        if (df)
            return this.MESES_CORTOS[df.getUTCMonth()] + " " + df.getUTCFullYear();
        return '—';
    };
    PolizaHomeComponent.prototype.normalizeList = function (res) {
        var _a, _b, _c, _d;
        return Array.isArray(res) ? res : ((_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res === null || res === void 0 ? void 0 : res.result) !== null && _d !== void 0 ? _d : []);
    };
    PolizaHomeComponent.prototype.pad2 = function (n) { return String(n).padStart(2, '0'); };
    PolizaHomeComponent.prototype.fmtDate = function (d) {
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
    PolizaHomeComponent.prototype.showToast = function (opts) {
        var _a, _b;
        this.toast.type = (_a = opts.type) !== null && _a !== void 0 ? _a : 'info';
        this.toast.title = (_b = opts.title) !== null && _b !== void 0 ? _b : '';
        this.toast.message = opts.message;
        if (opts.autoCloseMs != null)
            this.toast.autoCloseMs = opts.autoCloseMs;
        if (opts.position)
            this.toast.position = opts.position;
        this.toast.open = true;
    };
    PolizaHomeComponent.prototype.cargarCatalogos = function () {
        var _this = this;
        this.api.getTiposPoliza().subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.tiposPoliza = items.map(function (t) {
                    var _a, _b, _c, _d, _e;
                    var id_tipopoliza = Number((_b = (_a = t.id_tipopoliza) !== null && _a !== void 0 ? _a : t.id) !== null && _b !== void 0 ? _b : t.ID);
                    var nombre = String((_e = (_d = (_c = t.nombre) !== null && _c !== void 0 ? _c : t.descripcion) !== null && _d !== void 0 ? _d : t.NOMBRE) !== null && _e !== void 0 ? _e : 'Tipo');
                    return { id_tipopoliza: id_tipopoliza, nombre: nombre };
                });
                _this.mapTipos.clear();
                for (var _i = 0, _a = _this.tiposPoliza; _i < _a.length; _i++) {
                    var t = _a[_i];
                    _this.mapTipos.set(t.id_tipopoliza, t.nombre);
                }
            },
            error: function (err) {
                console.error('Tipos de póliza:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los tipos de póliza.' });
            }
        });
        this.api.getPeriodos().subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.periodos = items.map(function (p) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    var id = Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID);
                    var fi0 = (_f = (_e = (_d = (_c = p.fecha_inicio) !== null && _c !== void 0 ? _c : p.fechaInicio) !== null && _d !== void 0 ? _d : p.inicio) !== null && _e !== void 0 ? _e : p.start_date) !== null && _f !== void 0 ? _f : p.fecha_ini;
                    var ff0 = (_k = (_j = (_h = (_g = p.fecha_fin) !== null && _g !== void 0 ? _g : p.fechaFin) !== null && _h !== void 0 ? _h : p.fin) !== null && _j !== void 0 ? _j : p.end_date) !== null && _k !== void 0 ? _k : p.fecha_fin;
                    return { id_periodo: id, nombre: _this.periodoEtiqueta(fi0, ff0) };
                });
                _this.mapPeriodos.clear();
                for (var _i = 0, _a = _this.periodos; _i < _a.length; _i++) {
                    var p = _a[_i];
                    _this.mapPeriodos.set(p.id_periodo, p.nombre);
                }
            },
            error: function (err) {
                console.error('Periodos:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los periodos.' });
            }
        });
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
                _this.mapCentros.clear();
                for (var _i = 0, _a = _this.centros; _i < _a.length; _i++) {
                    var c = _a[_i];
                    _this.mapCentros.set(c.id_centro, c.nombre);
                }
            },
            error: function (err) {
                console.error('Centros:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
            }
        });
    };
    PolizaHomeComponent.prototype.cargarCuentas = function () {
        var _this = this;
        this.api.getCuentas().subscribe({
            next: function (r) {
                var _a, _b, _c, _d, _e, _f, _g;
                var arr = _this.normalizeList(r);
                _this.cuentasMap.clear();
                for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                    var c = arr_1[_i];
                    var id = Number((_b = (_a = c.id_cuenta) !== null && _a !== void 0 ? _a : c.id) !== null && _b !== void 0 ? _b : c.ID);
                    var codigo = String((_e = (_d = (_c = c.codigo) !== null && _c !== void 0 ? _c : c.clave) !== null && _d !== void 0 ? _d : c.code) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_g = (_f = c.nombre) !== null && _f !== void 0 ? _f : c.descripcion) !== null && _g !== void 0 ? _g : '').trim();
                    if (!Number.isNaN(id))
                        _this.cuentasMap.set(id, { codigo: codigo, nombre: nombre });
                }
            },
            error: function (e) { return console.error('Cuentas:', e); }
        });
    };
    PolizaHomeComponent.prototype.cargarEjercicios = function () {
        var _this = this;
        this.ejercicioSvc.listEjercicios().subscribe({
            next: function (res) {
                var _a, _b, _c;
                var arr = Array.isArray(res) ? res : ((_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res) !== null && _c !== void 0 ? _c : []);
                _this.ejercicios = arr.map(function (e) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    var id = Number((_b = (_a = e.id_ejercicio) !== null && _a !== void 0 ? _a : e.id) !== null && _b !== void 0 ? _b : e.ID);
                    var anio = (_d = (_c = e.anio) !== null && _c !== void 0 ? _c : e.year) !== null && _d !== void 0 ? _d : null;
                    var fi = (_g = (_f = (_e = e.fecha_inicio) !== null && _e !== void 0 ? _e : e.inicio) !== null && _f !== void 0 ? _f : e.start_date) !== null && _g !== void 0 ? _g : null;
                    var ff = (_k = (_j = (_h = e.fecha_fin) !== null && _h !== void 0 ? _h : e.fin) !== null && _j !== void 0 ? _j : e.end_date) !== null && _k !== void 0 ? _k : null;
                    var etiqueta = '';
                    if (anio != null)
                        etiqueta = "Ejercicio " + anio;
                    else if (fi || ff)
                        etiqueta = _this.fmtDate(fi) + " \u2014 " + _this.fmtDate(ff);
                    else
                        etiqueta = "Ejercicio " + id;
                    return { id_ejercicio: id, etiqueta: etiqueta };
                });
            },
            error: function (err) {
                console.error('Ejercicios contables:', err);
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: 'No se pudieron cargar los ejercicios contables.'
                });
            }
        });
    };
    PolizaHomeComponent.prototype.cargarMovimientosPagina = function (p, page) {
        var _this = this;
        var id = this.getIdPoliza(p);
        if (!id)
            return;
        this.movsLoadingId = id;
        this.api.listPolizaConMovimientos(id, page, this.movsPageSize).subscribe({
            next: function (res) {
                var _a, _b, _c, _d, _e;
                p.movimientos = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.rows) !== null && _b !== void 0 ? _b : [];
                _this.movsPageByPoliza[id] = (_c = res === null || res === void 0 ? void 0 : res.page) !== null && _c !== void 0 ? _c : page;
                _this.movsTotalByPoliza[id] = (_e = (_d = res === null || res === void 0 ? void 0 : res.total) !== null && _d !== void 0 ? _d : p.movimientos.length) !== null && _e !== void 0 ? _e : 0;
                console.log(p);
            },
            error: function (err) {
                console.error('getPolizaConMovimientos:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los movimientos.' });
            },
            complete: function () { return (_this.movsLoadingId = null); }
        });
    };
    PolizaHomeComponent.prototype.cambiarPaginaMovimientos = function (p, delta) {
        var id = this.getIdPoliza(p);
        if (!id)
            return;
        var current = this.movsPageByPoliza[id] || 1;
        var total = this.movsTotalByPoliza[id] || 0;
        var lastPage = Math.max(1, Math.ceil(total / this.movsPageSize));
        var next = Math.min(Math.max(1, current + delta), lastPage);
        if (next === current)
            return;
        this.cargarMovimientosPagina(p, next);
    };
    PolizaHomeComponent.prototype.onEjercicioChange = function (id) {
        this.selectedEjercicioId = id;
        this.currentPage = 1;
        this.cargarPolizas();
    };
    PolizaHomeComponent.prototype.cuentaEtiqueta = function (id, m) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (id == null) {
            var cod_1 = (_b = (_a = m === null || m === void 0 ? void 0 : m.cuenta_codigo) !== null && _a !== void 0 ? _a : m === null || m === void 0 ? void 0 : m.codigo) !== null && _b !== void 0 ? _b : '';
            var nom_1 = (_d = (_c = m === null || m === void 0 ? void 0 : m.cuenta_nombre) !== null && _c !== void 0 ? _c : m === null || m === void 0 ? void 0 : m.nombre) !== null && _d !== void 0 ? _d : '';
            return (cod_1 || nom_1) ? "" + cod_1 + (cod_1 && nom_1 ? ' — ' : '') + nom_1 : '—';
        }
        var info = this.cuentasMap.get(Number(id));
        if (info && (info.codigo || info.nombre)) {
            return "" + info.codigo + (info.codigo && info.nombre ? ' — ' : '') + info.nombre;
        }
        var cod = (_f = (_e = m === null || m === void 0 ? void 0 : m.cuenta_codigo) !== null && _e !== void 0 ? _e : m === null || m === void 0 ? void 0 : m.codigo) !== null && _f !== void 0 ? _f : '';
        var nom = (_h = (_g = m === null || m === void 0 ? void 0 : m.cuenta_nombre) !== null && _g !== void 0 ? _g : m === null || m === void 0 ? void 0 : m.nombre) !== null && _h !== void 0 ? _h : '';
        if (cod || nom)
            return "" + cod + (cod && nom ? ' — ' : '') + nom;
        return String(id);
    };
    PolizaHomeComponent.prototype.getIdPoliza = function (p) {
        var _a, _b, _c;
        var id = (_b = (_a = p) === null || _a === void 0 ? void 0 : _a.id_poliza) !== null && _b !== void 0 ? _b : (_c = p) === null || _c === void 0 ? void 0 : _c.id;
        return (id == null ? null : Number(id));
    };
    /** true si (cargos - abonos) ≈ 0 " */
    PolizaHomeComponent.prototype.isPolizaCuadrada = function (p) {
        var estado = (this.getEstado(p) || '').toLowerCase();
        if (estado.includes('cuadra') || estado.includes('aprob'))
            return true;
        var movs = Array.isArray(p.movimientos) ? p.movimientos : [];
        if (!movs.length)
            return false; // sólo podemos concluir cuadrada si hay datos
        var cargos = movs.filter(function (m) { return String(m.operacion) === '0'; }).reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        var abonos = movs.filter(function (m) { return String(m.operacion) === '1'; }).reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        return Math.abs(cargos - abonos) < 0.0001;
    };
    /** Si no hay movimientos cargados, los trae y evalúa si está cuadrada */
    PolizaHomeComponent.prototype.verificarCuadrada = function (p, done) {
        var _this = this;
        var id = this.getIdPoliza(p);
        if (!id)
            return done(false);
        if (Array.isArray(p.movimientos) && p.movimientos.length > 0) {
            return done(this.isPolizaCuadrada(p));
        }
        this.api.getPolizaConMovimientos(id).subscribe({
            next: function (res) {
                var _a;
                p.movimientos = (_a = res === null || res === void 0 ? void 0 : res.movimientos) !== null && _a !== void 0 ? _a : [];
                done(_this.isPolizaCuadrada(p));
            },
            error: function () { return done(false); }
        });
    };
    PolizaHomeComponent.prototype.canAprobar = function (p) {
        return this.canMarcarRevisada(p);
    };
    PolizaHomeComponent.prototype.toggleVerMas = function (p) {
        var _a;
        var id = this.getIdPoliza(p);
        if (!id)
            return;
        if (this.expandedId === id) {
            this.expandedId = null;
            return;
        }
        this.expandedId = id;
        var page = (_a = this.movsPageByPoliza[id]) !== null && _a !== void 0 ? _a : 1;
        this.cargarMovimientosPagina(p, page);
    };
    PolizaHomeComponent.prototype.cargarPolizas = function () {
        var _this = this;
        if (!this.selectedEjercicioId) {
            this.polizas = [];
            this.polizasFiltradas = [];
            this.totalPolizas = 0;
            return;
        }
        var obs$ = this.api.getPolizaByEjercicio(this.selectedEjercicioId, {
            page: this.currentPage,
            pageSize: this.pageSize
        });
        obs$.subscribe({
            next: function (r) {
                var _a, _b, _c;
                var list = (_b = _this.normalizeList((_a = r === null || r === void 0 ? void 0 : r.data) !== null && _a !== void 0 ? _a : r)) !== null && _b !== void 0 ? _b : [];
                _this.polizas = Array.isArray(list) ? list : [];
                _this.totalPolizas = (_c = r === null || r === void 0 ? void 0 : r.total) !== null && _c !== void 0 ? _c : 0;
                _this.aplicarFiltroLocal();
                for (var _i = 0, _d = _this.polizas; _i < _d.length; _i++) {
                    var p = _d[_i];
                    _this.periodoLabelFromRow(p);
                }
                if (_this.polizas.length === 0) {
                    _this.showToast({
                        type: 'info',
                        message: 'No hay pólizas registradas para este ejercicio.'
                    });
                }
            },
            error: function (err) {
                console.error('Pólizas:', err);
                _this.showToast({
                    type: 'error',
                    title: 'Error',
                    message: 'No se pudieron cargar las pólizas del ejercicio seleccionado.'
                });
            }
        });
    };
    PolizaHomeComponent.prototype.cambiarPagina = function (pagina) {
        this.currentPage = pagina;
        this.cargarPolizas();
    };
    PolizaHomeComponent.prototype.cambiarTamanioPagina = function (nuevoTamanio) {
        this.pageSize = nuevoTamanio;
        this.currentPage = 1;
        this.cargarPolizas();
    };
    PolizaHomeComponent.prototype.onBuscarChange = function (_) {
        var _this = this;
        if (this.buscarTimer)
            clearTimeout(this.buscarTimer);
        this.buscarTimer = setTimeout(function () {
            _this.currentPage = 1;
            _this.cargarPolizas();
        }, 250);
    };
    PolizaHomeComponent.prototype.aplicarFiltroLocal = function () {
        var _this = this;
        var term = (this.q || '').trim().toLowerCase();
        if (!term) {
            this.polizasFiltradas = this.polizas.slice();
            return;
        }
        this.polizasFiltradas = this.polizas.filter(function (p) {
            var _a, _b;
            var folio = String((_a = p.folio) !== null && _a !== void 0 ? _a : '').toLowerCase();
            var concepto = String((_b = p.concepto) !== null && _b !== void 0 ? _b : '').toLowerCase();
            var centro = _this.nombreCentro(p.id_centro).toLowerCase();
            var tipo = _this.nombreTipo(p.id_tipopoliza).toLowerCase();
            var periodo = _this.periodoLabelFromRow(p).toLowerCase();
            var movMatch = Array.isArray(p.movimientos) && p.movimientos.some(function (m) {
                var _a, _b, _c, _d, _e, _f;
                var uuid = String((_b = (_a = m) === null || _a === void 0 ? void 0 : _a.uuid) !== null && _b !== void 0 ? _b : '').toLowerCase();
                var cliente = String((_d = (_c = m) === null || _c === void 0 ? void 0 : _c.cliente) !== null && _d !== void 0 ? _d : '').toLowerCase();
                var ref = String((_f = (_e = m) === null || _e === void 0 ? void 0 : _e.ref_serie_venta) !== null && _f !== void 0 ? _f : '').toLowerCase();
                return uuid.includes(term) || cliente.includes(term) || ref.includes(term);
            });
            return folio.includes(term) || concepto.includes(term) || centro.includes(term) ||
                tipo.includes(term) || periodo.includes(term) || movMatch;
        });
    };
    PolizaHomeComponent.prototype.periodoLabelFromRow = function (p) {
        var _a, _b, _c, _d, _e;
        var id = Number((_a = p === null || p === void 0 ? void 0 : p.id_periodo) !== null && _a !== void 0 ? _a : p === null || p === void 0 ? void 0 : p.periodo_id);
        var enMapa = this.mapPeriodos.get(id);
        if (enMapa)
            return enMapa;
        var ini = (_c = (_b = p === null || p === void 0 ? void 0 : p.periodo_inicio) !== null && _b !== void 0 ? _b : p === null || p === void 0 ? void 0 : p.fecha_inicio) !== null && _c !== void 0 ? _c : p === null || p === void 0 ? void 0 : p.inicio;
        var fin = (_e = (_d = p === null || p === void 0 ? void 0 : p.periodo_fin) !== null && _d !== void 0 ? _d : p === null || p === void 0 ? void 0 : p.fecha_fin) !== null && _e !== void 0 ? _e : p === null || p === void 0 ? void 0 : p.fin;
        var etiqueta = this.periodoEtiqueta(ini, fin);
        if (!Number.isNaN(id))
            this.mapPeriodos.set(id, etiqueta);
        return etiqueta;
    };
    PolizaHomeComponent.prototype.getEstado = function (p) {
        var _a, _b, _c, _d;
        var raw = ((_d = (_c = (_b = (_a = p.estado) !== null && _a !== void 0 ? _a : p.estatus) !== null && _b !== void 0 ? _b : p.status) !== null && _c !== void 0 ? _c : p.state) !== null && _d !== void 0 ? _d : '').toString().trim();
        if (raw)
            return raw;
        var movs = Array.isArray(p === null || p === void 0 ? void 0 : p.movimientos) ? p.movimientos : [];
        if (!movs.length)
            return 'Borrador';
        var cargos = movs.filter(function (m) { return String(m.operacion) === '0'; }).reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        var abonos = movs.filter(function (m) { return String(m.operacion) === '1'; }).reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        return Math.abs(cargos - abonos) < 0.0001 ? 'Cuadrada' : 'Descuadrada';
    };
    PolizaHomeComponent.prototype.estadoClass = function (p) {
        var e = this.getEstado(p).toLowerCase();
        if (e.includes('cuadra'))
            return 'estado ok';
        if (e.includes('cerr'))
            return 'estado ok';
        if (e.includes('activa'))
            return 'estado ok';
        if (e.includes('aprob'))
            return 'estado ok';
        if (e.includes('pend'))
            return 'estado warn';
        if (e.includes('borr'))
            return 'estado warn';
        if (e.includes('canc'))
            return 'estado bad';
        return 'estado warn';
    };
    PolizaHomeComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    PolizaHomeComponent.prototype.editarPoliza = function (p) {
        var _a, _b, _c;
        var id = (_b = (_a = p) === null || _a === void 0 ? void 0 : _a.id_poliza) !== null && _b !== void 0 ? _b : (_c = p) === null || _c === void 0 ? void 0 : _c.id;
        if (!id) {
            console.warn('No se encontró id_poliza en la fila seleccionada');
            return;
        }
        this.router.navigate(['/polizas', 'editar', String(id)]);
    };
    PolizaHomeComponent.prototype.eliminarPolizaDeFila = function (p) {
        var id = this.getIdPoliza(p);
        if (!id) {
            this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' });
            return;
        }
        this.eliminarPoliza(id);
    };
    PolizaHomeComponent.prototype.aplicarFiltros = function () {
        var _this = this;
        this.polizasFiltradas = this.polizas.filter(function (p) {
            var folio = (p.folio || '').toString().toLowerCase();
            var concepto = (p.concepto || '').toLowerCase();
            var centro = _this.nombreCentro(p.id_centro).toLowerCase();
            var tipo = _this.nombreTipo(p.id_tipopoliza).toLowerCase();
            var periodo = _this.periodoLabelFromRow(p).toLowerCase();
            var estado = _this.getEstado(p).toLowerCase();
            return (folio.includes(_this.filtros.folio.toLowerCase()) &&
                concepto.includes(_this.filtros.concepto.toLowerCase()) &&
                centro.includes(_this.filtros.centro.toLowerCase()) &&
                tipo.includes(_this.filtros.tipo.toLowerCase()) &&
                periodo.includes(_this.filtros.periodo.toLowerCase()) &&
                estado.includes(_this.filtros.estado.toLowerCase()));
        });
    };
    PolizaHomeComponent.prototype.toggleFilter = function (col) {
        for (var key in this.showFilter) {
            if (key !== col)
                this.showFilter[key] = false;
        }
        this.showFilter[col] = !this.showFilter[col];
    };
    PolizaHomeComponent.prototype.eliminarPoliza = function (id_poliza) {
        var _this = this;
        if (id_poliza == null) {
            this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' });
            return;
        }
        this.abrirConfirmModal('¿Deseas eliminar esta póliza?', function () {
            _this.api.deletePoliza(id_poliza).subscribe({
                next: function () {
                    _this.cargarPolizas();
                    _this.showToast({ type: 'success', title: 'Listo', message: 'Póliza eliminada correctamente.' });
                },
                error: function (err) {
                    var _a;
                    console.error('Error al eliminar póliza:', err);
                    var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || 'No se pudo eliminar la póliza.';
                    _this.showToast({ type: 'error', title: 'Error', message: msg });
                }
            });
        });
    };
    PolizaHomeComponent.prototype.irANueva = function () { this.router.navigate(['/polizas', 'nueva']); };
    PolizaHomeComponent.prototype.isAllowedEstadoUI = function (e) {
        return e === 'Por revisar' || e === 'Revisada' || e === 'Aprobada' || e === 'Contabilizada';
    };
    /** Habilitar botón "Revisada/Aprobada" solo si cuadra */
    PolizaHomeComponent.prototype.canMarcarRevisada = function (p) {
        var e = (this.getEstado(p) || '').toLowerCase();
        // Estados que sí bloquean el botón
        if (e.includes('aprob') || e.includes('contab') || e.includes('cance') || e.includes('cerr'))
            return false;
        var tieneMovs = Array.isArray(p.movimientos) && p.movimientos.length > 0;
        return tieneMovs ? this.isPolizaCuadrada(p) : true;
    };
    PolizaHomeComponent.prototype.canMarcarContabilizada = function (p) {
        var e = (this.getEstado(p) || '').toLowerCase();
        return e.includes('aprob') || e.includes('revis') || e.includes('cuadra');
    };
    PolizaHomeComponent.prototype.cambiarEstadoPoliza = function (p, nuevo) {
        var _this = this;
        if (!this.isAllowedEstadoUI(nuevo)) {
            this.showToast({ type: 'warning', title: 'Estado inválido', message: 'Solo: Por revisar, Revisada, Aprobada, Contabilizada.' });
            return;
        }
        var id = this.getIdPoliza(p);
        if (!id) {
            this.showToast({ type: 'warning', title: 'Sin ID', message: 'No se puede cambiar el estado: falta id_poliza.' });
            return;
        }
        // Si es Aprobada o Revisada, exigir cuadrada
        if (nuevo === 'Aprobada' || nuevo === 'Revisada') {
            this.verificarCuadrada(p, function (ok) {
                if (!ok) {
                    _this.showToast({
                        type: 'warning',
                        title: 'No cuadrada',
                        message: 'La póliza no está cuadrada. No se puede marcar como Aprobada/Revisada.'
                    });
                    return;
                }
                var destinoApi = (nuevo === 'Revisada') ? 'Aprobada' : 'Aprobada';
                _this.loadingId = id;
                _this._hacerCambioEstado(id, p, destinoApi);
            });
            return;
        }
        // Otros estados sin restricción de cuadrada
        this.loadingId = id;
        var destinoApi = nuevo; // aquí 'nuevo' no es 'Revisada'
        this._hacerCambioEstado(id, p, destinoApi);
    };
    PolizaHomeComponent.prototype._hacerCambioEstado = function (id, p, nuevo) {
        var _this = this;
        this.api.changeEstadoPoliza(id, nuevo).subscribe({
            next: function (res) {
                var _a;
                p.estado = (_a = res === null || res === void 0 ? void 0 : res.estado) !== null && _a !== void 0 ? _a : nuevo;
                _this.showToast({
                    type: 'success',
                    title: 'Estado actualizado',
                    message: "La p\u00F3liza " + id + " ahora est\u00E1: " + p.estado + "."
                });
            },
            error: function (err) {
                var _a;
                console.error('changeEstadoPoliza:', err);
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || 'No se pudo cambiar el estado.';
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            },
            complete: function () { return (_this.loadingId = null); }
        });
    };
    //  XML 
    PolizaHomeComponent.prototype.triggerXmlPicker = function (input) {
        this.uploadXmlError = '';
        input.value = '';
        input.click();
    };
    PolizaHomeComponent.prototype.onXmlPicked = function (ev) {
        var _this = this;
        var _a;
        var input = ev.target;
        var file = (_a = input === null || input === void 0 ? void 0 : input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        var isXml = file.type === 'text/xml' || file.type === 'application/xml' || /\.xml$/i.test(file.name);
        if (!isXml) {
            this.uploadXmlError = 'El archivo debe ser .xml';
            this.showToast({ type: 'warning', title: 'Archivo no válido', message: this.uploadXmlError });
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            this.uploadXmlError = 'El XML excede 1 MB';
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
                _this.showToast({ type: 'success', title: 'XML cargado', message: 'Se importó el CFDI correctamente.' });
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
    PolizaHomeComponent.prototype.cargarCfdiRecientes = function () {
        var _this = this;
        var svc = this.api;
        if (typeof svc.listCfdi !== 'function')
            return;
        svc.listCfdi({ limit: 100 }).subscribe({
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
            error: function (e) {
                console.error('CFDI recientes:', (e === null || e === void 0 ? void 0 : e.message) || e);
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar CFDI recientes.' });
            }
        });
    };
    PolizaHomeComponent = __decorate([
        core_1.Component({
            selector: 'app-poliza-home',
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                router_1.RouterModule,
                polizas_layout_component_1.PolizasLayoutComponent,
                common_1.CurrencyPipe,
                toast_message_component_component_1.ToastMessageComponent,
                modal_component_1.ModalComponent
            ],
            templateUrl: './poliza-home.component.html',
            styleUrls: ['./poliza-home.component.scss']
        })
    ], PolizaHomeComponent);
    return PolizaHomeComponent;
}());
exports.PolizaHomeComponent = PolizaHomeComponent;
