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
var PolizaHomeComponent = /** @class */ (function () {
    function PolizaHomeComponent(router, api) {
        var _this = this;
        this.router = router;
        this.api = api;
        this.sidebarOpen = true;
        //  Listado 
        this.polizas = [];
        this.polizasFiltradas = []; // se muestra en la tabla
        this.tiposPoliza = [];
        this.periodos = [];
        this.centros = [];
        this.mapTipos = new Map();
        this.mapPeriodos = new Map();
        this.mapCentros = new Map();
        //  Buscador 
        this.q = '';
        this.nuevaPoliza = { movimientos: [] };
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        this.cfdiOptions = [];
        //  TOAST (estado
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        this.toNumOrNull = function (v) { return (v === '' || v == null || isNaN(Number(v)) ? null : Number(v)); };
        this.toStrOrNull = function (v) { return (v == null ? null : String(v).trim() || null); };
        this.onToastClosed = function () { _this.toast.open = false; };
        this.nombreCentro = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapCentros.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        this.nombreTipo = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapTipos.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        this.nombrePeriodo = function (id) { var _a; return (id == null ? '' : ((_a = _this.mapPeriodos.get(id)) !== null && _a !== void 0 ? _a : String(id))); };
        //  Acciones 
        this.trackByFolio = function (_, p) { var _a, _b; return (_b = (_a = p === null || p === void 0 ? void 0 : p.id_poliza) !== null && _a !== void 0 ? _a : p === null || p === void 0 ? void 0 : p.folio) !== null && _b !== void 0 ? _b : _; };
    }
    PolizaHomeComponent.prototype.ngOnInit = function () {
        this.cargarCatalogos();
        this.cargarPolizas();
        this.cargarCfdiRecientes();
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
        // Tipos
        this.api.getTiposPoliza().subscribe({
            next: function (r) {
                _this.tiposPoliza = _this.normalizeList(r).map(function (t) {
                    var _a, _b, _c, _d, _e;
                    return ({
                        id_tipopoliza: Number((_b = (_a = t.id_tipopoliza) !== null && _a !== void 0 ? _a : t.id) !== null && _b !== void 0 ? _b : t.ID),
                        nombre: String((_e = (_d = (_c = t.nombre) !== null && _c !== void 0 ? _c : t.descripcion) !== null && _d !== void 0 ? _d : t.NOMBRE) !== null && _e !== void 0 ? _e : 'Tipo')
                    });
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
        // Periodos -> "YYYY-MM-DD — YYYY-MM-DD"
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
        // Centros -> "SERIE — Nombre"
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
    //  Listado 
    PolizaHomeComponent.prototype.cargarPolizas = function () {
        var _this = this;
        this.api.getPolizas({
            id_tipopoliza: this.filtroTipo,
            id_periodo: this.filtroPeriodo
        }).subscribe({
            next: function (r) {
                var _a, _b;
                var list = (_a = _this.normalizeList(r)) !== null && _a !== void 0 ? _a : ((_b = r === null || r === void 0 ? void 0 : r.polizas) !== null && _b !== void 0 ? _b : []);
                _this.polizas = Array.isArray(list) ? list : [];
                _this.aplicarFiltroLocal(); // filtra con this.q
                // Mensaje informativo si no hay resultados
                if (_this.polizas.length === 0) {
                    _this.showToast({ type: 'info', message: 'No se encontraron pólizas para los filtros/búsqueda actuales.' });
                }
            },
            error: function (err) {
                console.error('Pólizas:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
            }
        });
    };
    //  Buscador 
    PolizaHomeComponent.prototype.onBuscarChange = function (_) {
        var _this = this;
        if (this.buscarTimer)
            clearTimeout(this.buscarTimer);
        this.buscarTimer = setTimeout(function () {
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
            var periodo = _this.nombrePeriodo(p.id_periodo).toLowerCase();
            var movMatch = Array.isArray(p.movimientos) && p.movimientos.some(function (m) {
                var _a, _b, _c, _d, _e, _f;
                var uuid = String((_b = (_a = m) === null || _a === void 0 ? void 0 : _a.uuid) !== null && _b !== void 0 ? _b : '').toLowerCase();
                var cliente = String((_d = (_c = m) === null || _c === void 0 ? void 0 : _c.cliente) !== null && _d !== void 0 ? _d : '').toLowerCase();
                var ref = String((_f = (_e = m) === null || _e === void 0 ? void 0 : _e.ref_serie_venta) !== null && _f !== void 0 ? _f : '').toLowerCase();
                return uuid.includes(term) || cliente.includes(term) || ref.includes(term);
            });
            return (folio.includes(term) ||
                concepto.includes(term) ||
                centro.includes(term) ||
                tipo.includes(term) ||
                periodo.includes(term) ||
                movMatch);
        });
    };
    //  Estado 
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
        this.router.navigate(['/polizas', 'editar', String(p.folio)], {
            state: { poliza: JSON.parse(JSON.stringify(p)) }
        });
    };
    PolizaHomeComponent.prototype.eliminarPoliza = function (id_poliza) {
        var _this = this;
        if (id_poliza == null) {
            this.showToast({ type: 'warning', title: 'Atención', message: 'ID de póliza inválido.' });
            return;
        }
        if (!confirm('¿Deseas eliminar esta póliza?'))
            return;
        this.api.deletePoliza(id_poliza).subscribe({
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
    };
    PolizaHomeComponent.prototype.irANueva = function () {
        this.router.navigate(['/polizas', 'nueva']);
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
    //  CFDI recientes (GET /cfdi) 
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
                toast_message_component_component_1.ToastMessageComponent
            ],
            templateUrl: './poliza-home.component.html',
            styleUrls: ['./poliza-home.component.scss']
        })
    ], PolizaHomeComponent);
    return PolizaHomeComponent;
}());
exports.PolizaHomeComponent = PolizaHomeComponent;
