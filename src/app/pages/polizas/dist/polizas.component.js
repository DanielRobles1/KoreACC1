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
exports.PolizasComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var PolizasComponent = /** @class */ (function () {
    function PolizasComponent(api) {
        var _this = this;
        this.api = api;
        this.sidebarOpen = true;
        // Listado
        this.polizas = [];
        // Catálogos para selects
        this.tiposPoliza = [];
        this.periodos = [];
        this.centros = [];
        // Formulario de nueva póliza
        this.nuevaPoliza = { movimientos: [] };
        // Estado de importación de XML
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        // CFDI importados y selección de UUID
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
        this.trackByFolio = function (_, x) { var _a; return (_a = x === null || x === void 0 ? void 0 : x.folio) !== null && _a !== void 0 ? _a : _; };
    }
    PolizasComponent.prototype.ngOnInit = function () {
        this.cargarCatalogos();
        this.cargarPolizas();
        this.cargarCfdiRecientes();
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
                console.error('Error cargando tipos de póliza:', err);
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
                    return { id_periodo: id, nombre: _this.fmtDate(fi0) + " \u2014 " + _this.fmtDate(ff0) };
                });
            },
            error: function (err) {
                console.error('Error cargando periodos:', err);
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
            },
            error: function (err) {
                console.error('Error cargando centros:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar los centros.' });
            }
        });
    };
    //  Pólizas 
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
                console.error('Error al cargar pólizas:', err);
                _this.showToast({ type: 'error', title: 'Error', message: 'No se pudieron cargar las pólizas.' });
            }
        });
    };
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
                console.error('Error cargando CFDI:', err);
                _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron cargar los CFDI recientes.' });
            }
        });
    };
    //  Movimientos 
    PolizasComponent.prototype.agregarMovimiento = function () {
        var _a;
        var nuevo = {
            id_cuenta: null,
            ref_serie_venta: '',
            operacion: '',
            monto: null,
            cliente: '',
            fecha: '',
            cc: null,
            uuid: null
        };
        ((_a = this.nuevaPoliza.movimientos) !== null && _a !== void 0 ? _a : ) = [];
        push(nuevo);
    };
    PolizasComponent.prototype.eliminarMovimiento = function (i) {
        var _a;
        (_a = this.nuevaPoliza.movimientos) === null || _a === void 0 ? void 0 : _a.splice(i, 1);
    };
    PolizasComponent.prototype.canGuardar = function () {
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
        var temp = { movimientos: ((_a = p.movimientos) !== null && _a !== void 0 ? _a : []) };
        var cargos = this.getTotal(temp, '0');
        var abonos = this.getTotal(temp, '1');
        return cargos === abonos && cargos > 0;
    };
    //  Guardar 
    PolizasComponent.prototype.guardarPoliza = function () {
        var _this = this;
        var _a, _b;
        var p = this.nuevaPoliza;
        // Validación front de partida doble para evitar 400 del back
        var movsValidos = ((_a = p === null || p === void 0 ? void 0 : p.movimientos) !== null && _a !== void 0 ? _a : []).filter(function (m) {
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
            return;
        }
        var payload = {
            id_tipopoliza: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_tipopoliza),
            id_periodo: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_periodo),
            id_usuario: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_usuario),
            id_centro: this.toNumOrNull(p === null || p === void 0 ? void 0 : p.id_centro),
            folio: this.toStrOrNull(p === null || p === void 0 ? void 0 : p.folio),
            concepto: this.toStrOrNull(p === null || p === void 0 ? void 0 : p.concepto),
            movimientos: ((_b = p === null || p === void 0 ? void 0 : p.movimientos) !== null && _b !== void 0 ? _b : []).map(function (m) {
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
                _this.nuevaPoliza = { movimientos: [] };
                _this.cargarPolizas();
                _this.showToast({ type: 'success', title: 'Guardado', message: 'Póliza creada correctamente.' });
            },
            error: function (err) {
                var _a, _b;
                var msg = ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.error) || (err === null || err === void 0 ? void 0 : err.message) || 'Error al guardar póliza';
                console.error('Error al guardar póliza:', err);
                _this.showToast({ type: 'error', title: 'Error', message: msg });
            }
        });
    };
    //  Importar XML (CFDI)  /cfdi/import
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
                console.error('Error importando XML:', err);
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
            imports: [common_1.CommonModule, forms_1.FormsModule, polizas_layout_component_1.PolizasLayoutComponent, toast_message_component_component_1.ToastMessageComponent],
            templateUrl: './polizas.component.html',
            styleUrls: ['./polizas.component.scss']
        })
    ], PolizasComponent);
    return PolizasComponent;
}());
exports.PolizasComponent = PolizasComponent;
