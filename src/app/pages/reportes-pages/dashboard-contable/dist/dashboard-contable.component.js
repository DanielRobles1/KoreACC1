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
exports.DashboardContableComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var ng2_charts_1 = require("ng2-charts");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var DashboardContableComponent = /** @class */ (function () {
    function DashboardContableComponent(svc) {
        var _this = this;
        this.svc = svc;
        this.sidebarOpen = true;
        this.loading = core_1.signal(true);
        this.errorMsg = core_1.signal(null);
        this.data = core_1.signal(null);
        // KPIs (ejemplo: total por tipo)
        this.totalIngresos = core_1.computed(function () {
            var _a, _b;
            return ((_b = (_a = _this.data()) === null || _a === void 0 ? void 0 : _a.resumen) !== null && _b !== void 0 ? _b : [])
                .filter(function (r) { return r.tipo === 'ingreso'; })
                .reduce(function (a, b) { return a + b.total_polizas; }, 0);
        });
        this.totalEgresos = core_1.computed(function () {
            var _a, _b;
            return ((_b = (_a = _this.data()) === null || _a === void 0 ? void 0 : _a.resumen) !== null && _b !== void 0 ? _b : [])
                .filter(function (r) { return r.tipo === 'egreso'; })
                .reduce(function (a, b) { return a + b.total_polizas; }, 0);
        });
        this.totalDiario = core_1.computed(function () {
            var _a, _b;
            return ((_b = (_a = _this.data()) === null || _a === void 0 ? void 0 : _a.resumen) !== null && _b !== void 0 ? _b : [])
                .filter(function (r) { return r.tipo === 'diario'; })
                .reduce(function (a, b) { return a + b.total_polizas; }, 0);
        });
        // Chart.js config
        this.lineLabels = [];
        this.lineData = { labels: [], datasets: [] };
        this.lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true }
            }
        };
    }
    DashboardContableComponent.prototype.onSidebarToggle = function (open) {
        this.sidebarOpen = open;
    };
    DashboardContableComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.svc.getResumen().subscribe({
            next: function (res) {
                _this.data.set(res);
                _this.setupChart(res);
                _this.loading.set(false);
            },
            error: function (e) {
                _this.errorMsg.set('No se pudo cargar el dashboard');
                _this.loading.set(false);
            }
        });
    };
    DashboardContableComponent.prototype.setupChart = function (res) {
        var _a;
        var movs = (_a = res.movimientos) !== null && _a !== void 0 ? _a : [];
        var labels = __spreadArrays(new Set(movs.map(function (m) { return m.mes; }))).sort();
        var ganancias = labels.map(function (l) { var _a, _b; return (_b = (_a = movs.find(function (m) { return m.mes === l; })) === null || _a === void 0 ? void 0 : _a.ganancias) !== null && _b !== void 0 ? _b : 0; });
        var perdidas = labels.map(function (l) { var _a, _b; return (_b = (_a = movs.find(function (m) { return m.mes === l; })) === null || _a === void 0 ? void 0 : _a.perdidas) !== null && _b !== void 0 ? _b : 0; });
        var utilidad = ganancias.map(function (g, i) { return g - perdidas[i]; });
        // Junta todos los valores para calcular rango
        var allValues = __spreadArrays(ganancias, perdidas, utilidad).filter(function (v) { return !isNaN(v); });
        var min = allValues.length ? Math.min.apply(Math, allValues) : 0;
        var max = allValues.length ? Math.max.apply(Math, allValues) : 0;
        // Un margen para que no queden pegadas al borde
        var padding = (max - min) === 0 ? 1 : (max - min) * 0.1;
        this.lineLabels = labels;
        this.lineData = {
            labels: labels,
            datasets: [
                {
                    label: 'Ganancias',
                    data: ganancias,
                    tension: 0.25,
                    fill: false
                },
                {
                    label: 'Pérdidas',
                    data: perdidas,
                    tension: 0.25,
                    fill: false
                },
                {
                    label: 'Utilidad neta',
                    data: utilidad,
                    tension: 0.25,
                    fill: false
                }
            ]
        };
        this.lineOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function (ctx) {
                            var _a;
                            var v = (_a = ctx.parsed.y) !== null && _a !== void 0 ? _a : 0;
                            // si quieres pesos:
                            return ctx.dataset.label + ": " + v.toLocaleString('es-MX', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            });
                        }
                    }
                }
            },
            scales: {
                y: {
                    suggestedMin: min - padding,
                    suggestedMax: max + padding
                }
            }
        };
    };
    DashboardContableComponent = __decorate([
        core_1.Component({
            selector: 'app-dashboard-contable',
            standalone: true,
            imports: [common_1.CommonModule, ng2_charts_1.BaseChartDirective, sidebar_component_1.SidebarComponent],
            templateUrl: './dashboard-contable.component.html',
            styleUrls: ['./dashboard-contable.component.scss']
        })
    ], DashboardContableComponent);
    return DashboardContableComponent;
}());
exports.DashboardContableComponent = DashboardContableComponent;
