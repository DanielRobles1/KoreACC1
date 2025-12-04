"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.EmpresaServiceTsService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var EmpresaServiceTsService = /** @class */ (function () {
    function EmpresaServiceTsService(http) {
        this.http = http;
        this.apiUrl = 'http://localhost:3000/api/v1/empresas';
    }
    // ====== EMPRESA CRUD ======
    /** Listar empresas (tu componente toma solo la primera) */
    EmpresaServiceTsService.prototype.getEmpresa = function () {
        return this.http.get(this.apiUrl);
    };
    /** Crear nueva empresa */
    EmpresaServiceTsService.prototype.createEmpresa = function (empresa) {
        return this.http.post(this.apiUrl, empresa);
    };
    /** Actualizar empresa existente */
    EmpresaServiceTsService.prototype.updateEmpresa = function (id, empresa) {
        return this.http.put(this.apiUrl + "/" + id, empresa);
    };
    /** Eliminar empresa */
    EmpresaServiceTsService.prototype.deleteEmpresa = function (id) {
        return this.http["delete"](this.apiUrl + "/" + id);
    };
    // ====== PERÍODOS (ASOCIADOS A EMPRESA) ======
    EmpresaServiceTsService.prototype.getPeriodos = function (empresaId, anio, tipo) {
        var params = new http_1.HttpParams();
        if (anio !== undefined)
            params = params.set('anio', anio);
        if (tipo)
            params = params.set('tipo', tipo);
        return this.http.get(this.apiUrl + "/" + empresaId + "/periodos", { params: params });
    };
    EmpresaServiceTsService.prototype.generarPeriodos = function (empresaId, anio, tipo) {
        return this.http
            .post(this.apiUrl + "/" + empresaId + "/periodos/generar", { anio: anio, tipo: tipo })
            .pipe(rxjs_1.map(function (res) { return (Array.isArray(res) ? res : res.periodos); }));
    };
    /** Activar un período */
    EmpresaServiceTsService.prototype.activarPeriodo = function (empresaId, periodoId) {
        return this.http.patch(this.apiUrl + "/" + empresaId + "/periodos/" + periodoId + "/activar", {});
    };
    /** Eliminar período */
    EmpresaServiceTsService.prototype.deletePeriodo = function (empresaId, periodoId) {
        return this.http["delete"](this.apiUrl + "/" + empresaId + "/periodos/" + periodoId);
    };
    EmpresaServiceTsService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], EmpresaServiceTsService);
    return EmpresaServiceTsService;
}());
exports.EmpresaServiceTsService = EmpresaServiceTsService;
