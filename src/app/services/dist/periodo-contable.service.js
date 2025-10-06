"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PeriodoContableService = void 0;
// src/app/services/periodo-contable.service.ts
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var PeriodoContableService = /** @class */ (function () {
    function PeriodoContableService(http) {
        this.http = http;
        this.baseUrl = 'http://localhost:3000/api/v1/periodos';
    }
    PeriodoContableService.prototype.list = function (query) {
        if (query === void 0) { query = {}; }
        var params = new http_1.HttpParams();
        Object.entries(query).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            if (v !== undefined && v !== null && v !== '') {
                params = params.set(k, String(v));
            }
        });
        return this.http.get(this.baseUrl, { params: params });
    };
    // Ahora soporta opcionalmente id_ejercicio
    PeriodoContableService.prototype.listByEmpresa = function (idEmpresa, idEjercicio) {
        var q = { id_empresa: idEmpresa };
        if (typeof idEjercicio === 'number')
            q.id_ejercicio = idEjercicio;
        return this.list(q);
    };
    PeriodoContableService.prototype.get = function (id_periodo) {
        return this.http.get(this.baseUrl + "/" + id_periodo);
    };
    PeriodoContableService.prototype.create = function (payload) {
        return this.http.post(this.baseUrl, payload);
    };
    PeriodoContableService.prototype.generate = function (id_ejercicio, frecuencia) {
        var url = this.baseUrl + "/generar";
        return this.http.post(url, { id_ejercicio: id_ejercicio, frecuencia: frecuencia });
    };
    PeriodoContableService.prototype.update = function (id_periodo, payload) {
        return this.http.put(this.baseUrl + "/" + id_periodo, payload);
    };
    PeriodoContableService.prototype["delete"] = function (id_periodo) {
        return this.http["delete"](this.baseUrl + "/" + id_periodo);
    };
    // Si tu backend acepta PATCH para cambiar solo 'esta_abierto'
    PeriodoContableService.prototype.setAbierto = function (id_periodo, esta_abierto) {
        return this.http.patch(this.baseUrl + "/" + id_periodo, { esta_abierto: esta_abierto });
    };
    PeriodoContableService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], PeriodoContableService);
    return PeriodoContableService;
}());
exports.PeriodoContableService = PeriodoContableService;
