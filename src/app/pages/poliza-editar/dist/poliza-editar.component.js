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
exports.PolizaEditarComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var rxjs_1 = require("rxjs");
var PolizaEditarComponent = /** @class */ (function () {
    function PolizaEditarComponent(route, http, apiSvc, cuentasSvc) {
        var _this = this;
        this.route = route;
        this.http = http;
        this.apiSvc = apiSvc;
        this.cuentasSvc = cuentasSvc;
        this.sidebarOpen = true;
        // Encabezado + movimientos (mismo shape que usas en "crear")
        this.poliza = { movimientos: [] };
        // Catálogos para selects (se cargan igual que en crear)
        this.tiposPoliza = [];
        this.periodos = [];
        this.centros = [];
        // UI
        this.loading = true;
        this.errorMsg = '';
        // Catálogo de cuentas
        this.cuentas = [];
        this.cuentasMap = new Map();
        this.cuentasFiltradas = []; // por índice de fila
        this.cuentaOpenIndex = null;
        this.updating = false;
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        // --------------------- Data loaders ---------------------
        this.apiBase = 'http://localhost:3000/api/v1';
        // --- Confirm modal state ---
        this.confirmOpen = false;
        this.confirmTitle = 'Eliminar movimiento';
        this.confirmMessage = '¿Seguro que deseas eliminar este movimiento? Esta acción no se puede deshacer.';
        this.confirmIndex = null;
        // para evitar doble clic en eliminar por fila
        this.deletingIndexSet = new Set();
        this.onToastClosed = function () { _this.toast.open = false; };
    }
    PolizaEditarComponent.prototype.ngOnInit = function () {
        this.id_poliza = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(this.id_poliza)) {
            this.showToast({ type: 'error', title: 'Error', message: 'ID de póliza inválido.' });
            this.loading = false;
            return;
        }
        // Carga paralela: catálogos y póliza
        this.cargarCatalogos();
        this.cargarPoliza(this.id_poliza);
        this.cargarCuentas();
    };
    PolizaEditarComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    PolizaEditarComponent.prototype.cargarPoliza = function (id) {
        var _this = this;
        this.loading = true;
        this.http.get(this.apiBase + "/poliza/" + id + "/movimientos").subscribe({
            next: function (res) {
                var _a, _b, _c, _d;
                var movs = ((_a = res === null || res === void 0 ? void 0 : res.movimientos) !== null && _a !== void 0 ? _a : []).map(function (m) {
                    var _a;
                    var mm = _this.normalizeMovimiento(m);
                    // Prellena _cuentaQuery si ya tenemos cuentas cargadas
                    var c = _this.cuentasMap.get(Number(mm.id_cuenta || 0));
                    mm._cuentaQuery = c ? c.codigo + " \u2014 " + c.nombre : ((_a = mm._cuentaQuery) !== null && _a !== void 0 ? _a : '');
                    return mm;
                });
                _this.poliza = {
                    id_poliza: res === null || res === void 0 ? void 0 : res.id_poliza,
                    id_tipopoliza: Number(res === null || res === void 0 ? void 0 : res.id_tipopoliza),
                    id_periodo: Number(res === null || res === void 0 ? void 0 : res.id_periodo),
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
                // Sincroniza filtros por fila
                _this.cuentasFiltradas = new Array(((_d = _this.poliza.movimientos) === null || _d === void 0 ? void 0 : _d.length) || 0).fill([]);
                _this.prefillCuentaQueries(); // si las cuentas llegaron después
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
        var _a, _b, _c, _d, _e, _f;
        return __assign({ id_cuenta: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_cuenta), ref_serie_venta: (_a = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.ref_serie_venta)) !== null && _a !== void 0 ? _a : '', operacion: ((_b = m === null || m === void 0 ? void 0 : m.operacion) !== null && _b !== void 0 ? _b : '').toString(), monto: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.monto), cliente: (_c = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.cliente)) !== null && _c !== void 0 ? _c : '', fecha: (_d = this.toDateOrNull(m === null || m === void 0 ? void 0 : m.fecha)) !== null && _d !== void 0 ? _d : '', cc: this.toNumOrNull(m === null || m === void 0 ? void 0 : m.cc), uuid: (_e = this.toStrOrNull(m === null || m === void 0 ? void 0 : m.uuid)) !== null && _e !== void 0 ? _e : null, id_poliza: (_f = this.toNumOrNull(m === null || m === void 0 ? void 0 : m.id_poliza)) !== null && _f !== void 0 ? _f : undefined }, ((m === null || m === void 0 ? void 0 : m.id_movimiento) != null ? { id_movimiento: Number(m.id_movimiento) } : {}));
    };
    // Habilita el botón cuando hay encabezado completo y al menos un movimiento válido
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
        // Partida doble del lado cliente (mensaje amigable si no cuadra)
        var cargos = this.getTotal('0');
        var abonos = this.getTotal('1');
        if (Math.abs(cargos - abonos) > 0.001) {
            this.showToast({ type: 'warning', title: 'Partida doble', message: "No cuadra.\nCargos: " + cargos + "\nAbonos: " + abonos });
            return;
        }
        var p = this.poliza;
        // ---- Payload encabezado (igual que ya tenías)
        var payloadHeader = {
            id_tipopoliza: this.toNumOrNull(p.id_tipopoliza),
            id_periodo: this.toNumOrNull(p.id_periodo),
            id_usuario: this.toNumOrNull(p.id_usuario),
            id_centro: this.toNumOrNull(p.id_centro),
            folio: this.toStrOrNull(p.folio),
            concepto: this.toStrOrNull(p.concepto)
        };
        // Separa movimientos a actualizar vs crear
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
            return m.id_movimiento == null && // nuevos
                _this.toNumOrNull(m.id_cuenta) != null &&
                (m.operacion === '0' || m.operacion === '1') &&
                ((_a = _this.toNumOrNull(m.monto)) !== null && _a !== void 0 ? _a : 0) > 0;
        });
        // Requests de actualización
        var updateReqs = toUpdate.map(function (m) {
            return _this.apiSvc.updateMovPoliza(m.id_movimiento, {
                id_cuenta: _this.toNumOrNull(m.id_cuenta),
                ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
                monto: _this.toNumOrNull(m.monto),
                cliente: _this.toStrOrNull(m.cliente),
                fecha: _this.toDateOrNull(m.fecha),
                cc: _this.toNumOrNull(m.cc),
                uuid: _this.toStrOrNull(m.uuid)
            });
        });
        // Requests de creación (incluye id_poliza)
        var createReqs = toCreate.map(function (m) {
            return _this.apiSvc.createMovPoliza({
                id_poliza: _this.poliza.id_poliza,
                id_cuenta: _this.toNumOrNull(m.id_cuenta),
                ref_serie_venta: _this.toStrOrNull(m.ref_serie_venta),
                operacion: (m.operacion === '0' || m.operacion === '1') ? m.operacion : null,
                monto: _this.toNumOrNull(m.monto),
                cliente: _this.toStrOrNull(m.cliente),
                fecha: _this.toDateOrNull(m.fecha),
                cc: _this.toNumOrNull(m.cc),
                uuid: _this.toStrOrNull(m.uuid)
            });
        });
        this.updating = true;
        // 1) PUT encabezado -> 2) forkJoin( updates + creates )
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
                _this.cargarPoliza(_this.poliza.id_poliza); // refresca ids/estado
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
    PolizaEditarComponent.prototype.cargarCuentas = function () {
        var _this = this;
        this.cuentasSvc.getCuentas().subscribe({
            next: function (arr) {
                _this.cuentas = Array.isArray(arr) ? arr : [];
                _this.cuentasMap.clear();
                for (var _i = 0, _a = _this.cuentas; _i < _a.length; _i++) {
                    var c = _a[_i];
                    _this.cuentasMap.set(c.id, c);
                }
                // Prefill etiquetas si ya hay id_cuenta en los movimientos cargados
                _this.prefillCuentaQueries();
            },
            error: function (e) { return console.error('Cuentas:', e); }
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
            _cuentaQuery: '' // <-- listo para typeahead
        };
        ((_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
        push(nuevo);
        this.cuentasFiltradas.push([]);
    };
    PolizaEditarComponent.prototype.cargarCatalogos = function () {
        var _this = this;
        // GET tipos
        this.http.get(this.apiBase + "/tipo-poliza").subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r === null || r === void 0 ? void 0 : r.result) !== null && _d !== void 0 ? _d : []);
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
        // GET periodos
        this.http.get(this.apiBase + "/periodos").subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r === null || r === void 0 ? void 0 : r.result) !== null && _d !== void 0 ? _d : []);
                _this.periodos = arr.map(function (p) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    var id = Number((_b = (_a = p.id_periodo) !== null && _a !== void 0 ? _a : p.id) !== null && _b !== void 0 ? _b : p.ID);
                    var fi0 = (_f = (_e = (_d = (_c = p.fecha_inicio) !== null && _c !== void 0 ? _c : p.fechaInicio) !== null && _d !== void 0 ? _d : p.inicio) !== null && _e !== void 0 ? _e : p.start_date) !== null && _f !== void 0 ? _f : p.fecha_ini;
                    var ff0 = (_k = (_j = (_h = (_g = p.fecha_fin) !== null && _g !== void 0 ? _g : p.fechaFin) !== null && _h !== void 0 ? _h : p.fin) !== null && _j !== void 0 ? _j : p.end_date) !== null && _k !== void 0 ? _k : p.fecha_fin;
                    return { id_periodo: id, nombre: _this.fmtDate(fi0) + " \u2014 " + _this.fmtDate(ff0) };
                });
            },
            error: function (e) { return console.error('Periodos:', e); }
        });
        // GET centros
        this.http.get(this.apiBase + "/centros").subscribe({
            next: function (r) {
                var _a, _b, _c, _d;
                var arr = Array.isArray(r) ? r : ((_d = (_c = (_b = (_a = r === null || r === void 0 ? void 0 : r.rows) !== null && _a !== void 0 ? _a : r === null || r === void 0 ? void 0 : r.data) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.items) !== null && _c !== void 0 ? _c : r === null || r === void 0 ? void 0 : r.result) !== null && _d !== void 0 ? _d : []);
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
    PolizaEditarComponent.prototype.openConfirm = function (index) {
        var _a;
        // Asegura arreglo existente
        (_a = this.poliza.movimientos) !== null && _a !== void 0 ? _a : ;
        [];
        // rango válido
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
        // si no tiene id_movimiento => solo elimino en UI
        var idMov = (_b = mov) === null || _b === void 0 ? void 0 : _b.id_movimiento;
        // marca la fila mientras elimina
        this.deletingIndexSet.add(i);
        var finish = function () {
            var _a;
            // quita del arreglo local
            ((_a = _this.poliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
            splice(i, 1);
            // ajusta cuentas filtradas si las usas por fila
            _this.cuentasFiltradas.splice(i, 1);
            // recalcula totales visuales (opcional, ya lo hace Angular)
            _this.deletingIndexSet["delete"](i);
        };
        if (!idMov) {
            // movimiento aún no persistido
            finish();
            this.showToast({ type: 'success', title: 'Eliminado', message: 'Movimiento eliminado.' });
            return;
        }
        // DELETE backend y luego remueve localmente
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
    // --------------------- Helpers/UI ---------------------
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
    // Conversión utilitaria
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
    // === Typeahead de cuentas (por fila) ===
    PolizaEditarComponent.prototype.onCuentaQueryChange = function (i) {
        var _a, _b;
        var movs = ((_a = this.poliza) === null || _a === void 0 ? void 0 : _a.movimientos) || [];
        var q = (((_b = movs[i]) === null || _b === void 0 ? void 0 : _b._cuentaQuery) || '').trim().toLowerCase();
        if (!q) {
            this.cuentasFiltradas[i] = this.cuentas.slice(0, 20);
            return;
        }
        // Prioriza coincidencias por código, luego por nombre
        var hits = this.cuentas.filter(function (c) {
            return (c.codigo && c.codigo.toLowerCase().includes(q)) ||
                (c.nombre && c.nombre.toLowerCase().includes(q));
        });
        // Opcional: ordenar resultados (primero por empieza-con)
        var starts = hits.filter(function (c) { var _a; return (_a = c.codigo) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(q); });
        var rest = hits.filter(function (c) { var _a; return !((_a = c.codigo) === null || _a === void 0 ? void 0 : _a.toLowerCase().startsWith(q)); });
        this.cuentasFiltradas[i] = __spreadArrays(starts, rest).slice(0, 50);
    };
    PolizaEditarComponent.prototype.openCuenta = function (i) {
        this.cuentaOpenIndex = i;
        // Inicializa con primeras cuentas si no hay query
        this.onCuentaQueryChange(i);
    };
    PolizaEditarComponent.prototype.closeCuenta = function (i) {
        var _this = this;
        // Cierra con un pequeño delay para permitir click en item
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
            imports: [common_1.CommonModule, forms_1.FormsModule, router_1.RouterModule, polizas_layout_component_1.PolizasLayoutComponent, toast_message_component_component_1.ToastMessageComponent, modal_component_1.ModalComponent],
            templateUrl: './poliza-editar.component.html',
            styleUrls: ['./poliza-editar.component.scss']
        })
    ], PolizaEditarComponent);
    return PolizaEditarComponent;
}());
exports.PolizaEditarComponent = PolizaEditarComponent;
