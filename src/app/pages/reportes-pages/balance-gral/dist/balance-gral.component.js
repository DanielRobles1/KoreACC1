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
exports.BalanceGralComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var reportes_layout_component_1 = require("@app/components/reportes-layout/reportes-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var rxjs_1 = require("rxjs");
var XLSX = require("xlsx");
var file_saver_1 = require("file-saver");
var fecha_utils_1 = require("@app/utils/fecha-utils");
var permissions_util_1 = require("@app/utils/permissions.util");
function inferTipoFromCodigo(codigo) {
    if (!codigo || codigo.length === 0)
        return null;
    var first = codigo.trim()[0];
    if (first === '1')
        return 'ACTIVO';
    if (first === '2')
        return 'PASIVO';
    if (first === '3')
        return 'CAPITAL';
    return null;
}
function isAlreadyBalanceGeneralRow(r) {
    return 'nivel' in r && ('saldo_deudor' in r || 'saldo_acreedor' in r);
}
// === Type-guard para estrechar PeriodoContableDto -> PeriodoConId
function hasPeriodoId(p) {
    return typeof p.id_periodo === 'number';
}
var BalanceGralComponent = /** @class */ (function () {
    function BalanceGralComponent(polizaService, periodoService, reportesService, auth, ws) {
        var _this = this;
        this.polizaService = polizaService;
        this.periodoService = periodoService;
        this.reportesService = reportesService;
        this.auth = auth;
        this.ws = ws;
        this.loading = false;
        this.balance = [];
        this.totalFilas = 0;
        this.ejercicioId = null;
        this.periodos = [];
        this.periodoIniId = null;
        this.periodoFinId = null;
        this.totDeudor = 0;
        this.totAcreedor = 0;
        // Permisos
        this.canGenerateReport = false;
        // --- UI/Toast
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
        this.sidebarOpen = true;
        this.miEmpresaId = 1;
        this.ejercicios = this.polizaService.getEjercicios();
        this.trackFila = function (_, r) { var _a, _b; return (_a = r.codigo) !== null && _a !== void 0 ? _a : r.nivel + "-" + ((_b = r.tipo) !== null && _b !== void 0 ? _b : 'TOTAL'); };
        this.trackPeriodo = function (_, p) { return p.id_periodo; };
        this.comparePeriodo = function (a, b) {
            return a.id_periodo - b.id_periodo;
        };
        this.searchTerm = '';
        this.reportesService.getEmpresaInfo(this.miEmpresaId).subscribe({
            next: function (emp) { return _this.empresaInfo = emp; },
            error: function () { }
        });
    }
    BalanceGralComponent.prototype.onSidebarToggle = function (v) { this.sidebarOpen = v; };
    BalanceGralComponent.prototype.showToast = function (opts) {
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
    BalanceGralComponent.prototype.onGenerarBalance = function () {
        var _this = this;
        if (!this.canGenerateReport) {
            this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
            return;
        }
        if (!this.periodoIniId || !this.periodoFinId) {
            this.showToast({ type: 'warning', title: 'Fallo', message: 'Seleccione un rango de periodos.' });
            return;
        }
        this.loading = true;
        this.resetBalanceView();
        this.reportesService
            .balanceGeneral(this.periodoIniId, this.periodoFinId)
            .pipe(rxjs_1.finalize(function () { return (_this.loading = false); }))
            .subscribe({
            next: function (resp) {
                var _a;
                if (resp === null || resp === void 0 ? void 0 : resp.ok) {
                    var rows = (_a = resp.data) !== null && _a !== void 0 ? _a : [];
                    _this.balance = _this.adaptToBalanceGeneral(rows);
                    _this.totalFilas = _this.balance.length;
                    // Totales para el pie
                    var total = _this.balance.find(function (r) { return r.nivel === 'TOTAL'; });
                    _this.totDeudor = total ? _this.toNum(total.saldo_deudor) :
                        _this.round2(_this.balance.reduce(function (s, r) { return s + _this.toNum(r.saldo_deudor); }, 0));
                    _this.totAcreedor = total ? _this.toNum(total.saldo_acreedor) :
                        _this.round2(_this.balance.reduce(function (s, r) { return s + _this.toNum(r.saldo_acreedor); }, 0));
                    _this.showToast({ type: 'success', title: 'Balance general', message: "(" + _this.totalFilas + " filas)." });
                }
                else {
                    _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo generar el balance general' });
                }
            },
            error: function () { return _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudo generar el balance general' }); }
        });
    };
    BalanceGralComponent.prototype.onEjercicioChange = function (value) {
        var _this = this;
        if (!this.canGenerateReport) {
            this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
            return;
        }
        var id = value ? Number(value) : null;
        this.ejercicioId = Number.isFinite(id) ? id : null;
        this.periodoIniId = null;
        this.periodoFinId = null;
        this.periodos = [];
        if (!this.ejercicioId)
            return;
        this.periodoService.getPeriodosByEjercicio(this.ejercicioId).subscribe({
            next: function (items) {
                _this.periodos = (items !== null && items !== void 0 ? items : [])
                    .filter(hasPeriodoId)
                    .sort(_this.comparePeriodo);
            },
            error: function (err) { return _this.showToast({ type: 'warning', title: 'Aviso', message: 'No se pudieron recuperar los periodos' }); }
        });
    };
    BalanceGralComponent.prototype.onPeriodoIniChange = function (value) {
        var id = value ? Number(value) : null;
        this.periodoIniId = Number.isFinite(id) ? id : null;
        if (this.periodoFinId && this.periodoIniId && this.periodoFinId < this.periodoIniId) {
            this.periodoFinId = null;
            this.resetBalanceView();
        }
    };
    BalanceGralComponent.prototype.onPeriodoFinChange = function (value) {
        var id = value ? Number(value) : null;
        this.periodoFinId = Number.isFinite(id) ? id : null;
    };
    // --- Helpers de UI
    BalanceGralComponent.prototype.periodosFiltradosFin = function () {
        var _this = this;
        if (!this.periodoIniId)
            return this.periodos;
        return this.periodos.filter(function (p) { return p.id_periodo >= _this.periodoIniId; });
    };
    BalanceGralComponent.prototype.getPeriodoLabel = function (p) {
        var lbl = fecha_utils_1.periodoEtiqueta(p === null || p === void 0 ? void 0 : p.fecha_inicio, p === null || p === void 0 ? void 0 : p.fecha_fin);
        return (lbl === '—' && (p === null || p === void 0 ? void 0 : p.id_periodo) != null) ? "Periodo " + p.id_periodo : lbl;
    };
    BalanceGralComponent.prototype.getRangoPeriodosLabel = function () {
        var _this = this;
        if (this.periodoIniId && this.periodoFinId) {
            var pIni = this.periodos.find(function (p) { return p.id_periodo === _this.periodoIniId; });
            var pFin = this.periodos.find(function (p) { return p.id_periodo === _this.periodoFinId; });
            if (pIni && pFin) {
                var iniLbl = this.getPeriodoLabel(pIni);
                var finLbl = this.getPeriodoLabel(pFin);
                return "Periodos: " + iniLbl + " a " + finLbl;
            }
        }
        return 'Periodos: (no especificado)';
    };
    BalanceGralComponent.prototype.resetBalanceView = function () {
        this.balance = [];
        this.totalFilas = 0;
        this.totDeudor = this.totAcreedor = 0;
    };
    BalanceGralComponent.prototype.round2 = function (n) { return Math.round((n + Number.EPSILON) * 100) / 100; };
    BalanceGralComponent.prototype.eq2 = function (a, b) { return Math.abs(a - b) < 0.005; };
    BalanceGralComponent.prototype.toNum = function (v) {
        var n = Number((v !== null && v !== void 0 ? v : '').toString().replace(/,/g, '').trim());
        return Number.isFinite(n) ? n : 0;
    };
    BalanceGralComponent.prototype.adaptToBalanceGeneral = function (data) {
        var _this = this;
        var _a;
        if (!Array.isArray(data) || data.length === 0)
            return [];
        if (isAlreadyBalanceGeneralRow(data[0])) {
            return data.map(function (d) {
                var _a, _b, _c, _d;
                return ({
                    nivel: ((_a = d.nivel) !== null && _a !== void 0 ? _a : 'DETALLE'),
                    tipo: ((_b = d.tipo) !== null && _b !== void 0 ? _b : null),
                    codigo: (_c = d.codigo) !== null && _c !== void 0 ? _c : null,
                    nombre: (_d = d.nombre) !== null && _d !== void 0 ? _d : null,
                    saldo_deudor: _this.toNum(d.saldo_deudor),
                    saldo_acreedor: _this.toNum(d.saldo_acreedor)
                });
            });
        }
        var detalle = data.map(function (d) {
            var _a, _b;
            var tipo = inferTipoFromCodigo(d.codigo);
            return {
                nivel: 'DETALLE',
                tipo: tipo,
                codigo: (_a = d.codigo) !== null && _a !== void 0 ? _a : null,
                nombre: (_b = d.nombre) !== null && _b !== void 0 ? _b : null,
                saldo_deudor: _this.toNum(d.saldo_final_deudor),
                saldo_acreedor: _this.toNum(d.saldo_final_acreedor)
            };
        });
        var grupos = {};
        for (var _i = 0, detalle_1 = detalle; _i < detalle_1.length; _i++) {
            var r = detalle_1[_i];
            var k = (_a = r.tipo) !== null && _a !== void 0 ? _a : 'OTRO';
            if (!grupos[k])
                grupos[k] = { deudor: 0, acreedor: 0 };
            grupos[k].deudor += this.toNum(r.saldo_deudor);
            grupos[k].acreedor += this.toNum(r.saldo_acreedor);
        }
        var orden = ['ACTIVO', 'PASIVO', 'CAPITAL'];
        var subtotales = orden
            .filter(function (t) { return grupos[t]; })
            .map(function (t) { return ({
            nivel: 'SUBTOTAL',
            tipo: t,
            codigo: null,
            nombre: null,
            saldo_deudor: _this.round2(grupos[t].deudor),
            saldo_acreedor: _this.round2(grupos[t].acreedor)
        }); });
        var totDeu = this.round2(detalle.reduce(function (s, r) { return s + _this.toNum(r.saldo_deudor); }, 0));
        var totAcr = this.round2(detalle.reduce(function (s, r) { return s + _this.toNum(r.saldo_acreedor); }, 0));
        var total = {
            nivel: 'TOTAL',
            tipo: null,
            codigo: null,
            nombre: null,
            saldo_deudor: totDeu,
            saldo_acreedor: totAcr
        };
        var detalleOrdenado = __spreadArrays(orden.flatMap(function (t) { return detalle.filter(function (r) { return r.tipo === t; }); }), subtotales, [
            total,
        ]);
        return detalleOrdenado;
    };
    Object.defineProperty(BalanceGralComponent.prototype, "filteredRows", {
        get: function () {
            var _a;
            var term = ((_a = this.searchTerm) !== null && _a !== void 0 ? _a : '').trim().toLowerCase();
            if (!term)
                return this.balance;
            return this.balance.filter(function (r) {
                var _a, _b, _c;
                var codigo = ((_a = r === null || r === void 0 ? void 0 : r.codigo) !== null && _a !== void 0 ? _a : '').toLowerCase();
                var nombre = ((_b = r === null || r === void 0 ? void 0 : r.nombre) !== null && _b !== void 0 ? _b : '').toLowerCase();
                var tipo = ((_c = r === null || r === void 0 ? void 0 : r.tipo) !== null && _c !== void 0 ? _c : '').toString().toLowerCase();
                return codigo.includes(term) || nombre.includes(term) || tipo.includes(term);
            });
        },
        enumerable: false,
        configurable: true
    });
    BalanceGralComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.permWatcher = new permissions_util_1.PermissionWatcher(this.auth, this.ws, {
            toastOk: function (m) { return _this.showToast({ type: 'success', message: m }); },
            toastWarn: function (m) { return _this.showToast({ type: 'warning', message: m }); },
            toastError: function (m) { return _this.showToast({ type: 'error', message: m }); }
        }, function (flags) {
            _this.canGenerateReport = !!flags.canCreate;
        }, {
            keys: { create: 'crear_reporte', edit: 'crear_reporte', "delete": 'crear_reporte' },
            socketEvent: ['permissions:changed', 'role-permissions:changed'],
            contextLabel: 'Reportes'
        });
        this.permWatcher.start();
    };
    BalanceGralComponent.prototype.ngOnDestroy = function () {
        var _a;
        (_a = this.permWatcher) === null || _a === void 0 ? void 0 : _a.stop();
    };
    BalanceGralComponent.prototype.exportToExcel = function (allRows) {
        var _this = this;
        var _a, _b, _c, _d;
        if (allRows === void 0) { allRows = false; }
        if (!this.canGenerateReport) {
            this.showToast({ type: 'warning', title: 'Permiso requerido', message: 'No tienes permiso para generar reportes.' });
            return;
        }
        var rows = (_a = (allRows ? this.balance : this.filteredRows)) !== null && _a !== void 0 ? _a : [];
        var headerRows = [];
        if (this.empresaInfo) {
            headerRows.push([(_b = this.empresaInfo.razon_social) !== null && _b !== void 0 ? _b : '']);
            headerRows.push(["RFC: " + ((_c = this.empresaInfo.rfc) !== null && _c !== void 0 ? _c : '')]);
            if (this.empresaInfo.domicilio_fiscal) {
                headerRows.push(["Domicilio: " + this.empresaInfo.domicilio_fiscal]);
            }
            var contactoParts = [];
            if (this.empresaInfo.telefono)
                contactoParts.push("Tel: " + this.empresaInfo.telefono);
            if (this.empresaInfo.correo_contacto)
                contactoParts.push("Correo: " + this.empresaInfo.correo_contacto);
            if (contactoParts.length > 0) {
                headerRows.push([contactoParts.join('   ')]);
            }
        }
        if (headerRows.length > 0) {
            headerRows.push([]);
        }
        var rangoLabel = this.getRangoPeriodosLabel();
        var fechaLabel = "Fecha de generaci\u00F3n: " + fecha_utils_1.todayISO();
        headerRows.push(['Balance general']);
        headerRows.push([rangoLabel]);
        headerRows.push([fechaLabel]);
        headerRows.push([]); // línea en blanco antes de la tabla
        var headerLines = headerRows.length;
        var HEAD = ['Tipo', 'Código', 'Nombre / Grupo', 'Deudor', 'Acreedor'];
        // === 3) CUERPO DE LA TABLA ===
        var BODY = rows.map(function (r) {
            var _a, _b, _c, _d;
            var nivel = (_a = r.nivel) !== null && _a !== void 0 ? _a : 'DETALLE';
            var tipo = (_b = r.tipo) !== null && _b !== void 0 ? _b : '';
            var codigo = nivel === 'DETALLE' ? ((_c = r.codigo) !== null && _c !== void 0 ? _c : '') : '';
            var nombre = nivel === 'SUBTOTAL' ? "Subtotal " + tipo :
                nivel === 'TOTAL' ? 'TOTAL' :
                    ((_d = r.nombre) !== null && _d !== void 0 ? _d : '');
            return [
                tipo,
                codigo,
                nombre,
                _this.toNum(r.saldo_deudor),
                _this.toNum(r.saldo_acreedor),
            ];
        });
        var totDetDeudor = this.round2(rows.filter(function (r) { return r.nivel === 'DETALLE'; })
            .reduce(function (s, r) { return s + _this.toNum(r.saldo_deudor); }, 0));
        var totDetAcreedor = this.round2(rows.filter(function (r) { return r.nivel === 'DETALLE'; })
            .reduce(function (s, r) { return s + _this.toNum(r.saldo_acreedor); }, 0));
        var totalsRow = [
            'Totales (DETALLE)',
            '',
            '',
            totDetDeudor,
            totDetAcreedor,
        ];
        var aoa = __spreadArrays(headerRows, [
            HEAD
        ], BODY, [
            totalsRow,
        ]);
        var ws = XLSX.utils.aoa_to_sheet(aoa);
        var numberFmt = '#,##0.00';
        if (ws['!ref']) {
            var range = XLSX.utils.decode_range(ws['!ref']);
            var firstDataRow = headerLines + 1 + 1;
            for (var R = firstDataRow - 1; R <= range.e.r; R++) {
                for (var C = 3; C <= 4; C++) {
                    var addr = XLSX.utils.encode_cell({ r: R, c: C });
                    var cell = ws[addr];
                    if (!cell)
                        continue;
                    if (typeof cell.v === 'number') {
                        cell.z = numberFmt;
                    }
                }
            }
            ws['!autofilter'] = {
                ref: XLSX.utils.encode_range({
                    s: { r: headerLines, c: 0 },
                    e: { r: Math.max(headerLines, range.e.r), c: 4 }
                })
            };
            ws['!freeze'] = { xSplit: 0, ySplit: headerLines + 1 };
            var rowsForWidth_1 = aoa.map(function (row) {
                return row.map(function (v) { return (v !== null && v !== void 0 ? v : '').toString(); });
            });
            var colCount = HEAD.length;
            var colWidths = Array.from({ length: colCount }).map(function (_, colIdx) {
                var maxLen = rowsForWidth_1.reduce(function (m, row) { var _a; return Math.max(m, ((_a = row[colIdx]) !== null && _a !== void 0 ? _a : '').length); }, 0);
                return { wch: Math.min(Math.max(10, maxLen + 2), 50) };
            });
            ws['!cols'] = colWidths;
            var titleRow = headerRows.findIndex(function (r) { return r[0] === 'Balance general'; });
            if (titleRow >= 0) {
                var addr = XLSX.utils.encode_cell({ r: titleRow, c: 0 });
                if (!ws[addr])
                    ws[addr] = { t: 's', v: 'Balance general' };
                ws[addr].s = {
                    font: { bold: true, sz: 16 },
                    alignment: { horizontal: 'left' }
                };
            }
            var headRowIdx = headerLines;
            for (var c = 0; c < HEAD.length; c++) {
                var addr = XLSX.utils.encode_cell({ r: headRowIdx, c: c });
                var cell = ws[addr];
                if (!cell)
                    continue;
                cell.s = {
                    font: { bold: true, sz: 11 },
                    fill: { fgColor: { rgb: 'D9E1F2' } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: 'AAAAAA' } },
                        bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
                        left: { style: 'thin', color: { rgb: 'AAAAAA' } },
                        right: { style: 'thin', color: { rgb: 'AAAAAA' } }
                    }
                };
            }
            var totalRowIdx = headerLines + 1 + BODY.length;
            for (var c = 0; c < HEAD.length; c++) {
                var addr = XLSX.utils.encode_cell({ r: totalRowIdx, c: c });
                var cell = ws[addr];
                if (!cell)
                    continue;
                cell.s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: 'F2F2F2' } },
                    alignment: { horizontal: c >= 3 ? 'right' : 'left' }
                };
            }
            for (var R = firstDataRow - 1; R <= range.e.r; R++) {
                for (var C = 3; C <= 4; C++) {
                    var addr = XLSX.utils.encode_cell({ r: R, c: C });
                    var cell = ws[addr];
                    if (!cell)
                        continue;
                    cell.s = __assign(__assign({}, cell.s), { alignment: { horizontal: 'right' } });
                }
            }
        }
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Balance');
        var rangoSlug = (this.periodoIniId && this.periodoFinId) ? "_p" + this.periodoIniId + "-p" + this.periodoFinId : '';
        var fecha = fecha_utils_1.todayISO();
        var excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var empresaSlug = ((_d = this.empresaInfo) === null || _d === void 0 ? void 0 : _d.razon_social) ? this.empresaInfo.razon_social.replace(/[^\w\d]+/g, '_')
            : 'empresa';
        file_saver_1.saveAs(blob, empresaSlug + "_BalanceGeneral" + rangoSlug + "_" + fecha + ".xlsx");
        this.showToast({
            type: 'success',
            title: 'Excel generado',
            message: "Se exportaron " + rows.length + " filas " + (allRows ? '(todas)' : '(filtradas)')
        });
    };
    BalanceGralComponent = __decorate([
        core_1.Component({
            selector: 'app-balance-gral',
            standalone: true,
            imports: [common_1.CommonModule, reportes_layout_component_1.ReportesLayoutComponent, toast_message_component_component_1.ToastMessageComponent],
            templateUrl: './balance-gral.component.html',
            styleUrl: './balance-gral.component.scss'
        })
    ], BalanceGralComponent);
    return BalanceGralComponent;
}());
exports.BalanceGralComponent = BalanceGralComponent;
