"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DashboardContableService = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var DashboardContableService = /** @class */ (function () {
    function DashboardContableService(http) {
        this.http = http;
        this.base = 'http://localhost:3000/api/v1/dashboard-contable';
    }
    DashboardContableService.prototype.getResumen = function () {
        return this.http.get(this.base).pipe(rxjs_1.map(function (r) {
            var _a;
            console.log('API dashboard:', r);
            return {
                resumen: r.resumen,
                movimientos: ((_a = r.movimientos) !== null && _a !== void 0 ? _a : []).map(function (m) {
                    var _a, _b;
                    return ({
                        // normaliza el mes a YYYY-MM
                        mes: (m.mes || '').slice(0, 7),
                        ganancias: (_a = m.ganancias) !== null && _a !== void 0 ? _a : 0,
                        perdidas: (_b = m.perdidas) !== null && _b !== void 0 ? _b : 0
                    });
                })
            };
        }));
    };
    DashboardContableService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], DashboardContableService);
    return DashboardContableService;
}());
exports.DashboardContableService = DashboardContableService;
