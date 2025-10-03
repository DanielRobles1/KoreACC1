"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.EjercicioContableService = void 0;
// services/ejercicio-contable.service.ts
var core_1 = require("@angular/core");
var EjercicioContableService = /** @class */ (function () {
    function EjercicioContableService(http) {
        this.http = http;
        this.baseUrl = 'http://localhost:3000/api/v1/ejercicios';
    }
    EjercicioContableService.prototype.listByEmpresa = function (id_empresa) {
        return this.http.get(this.baseUrl + "?id_empresa=" + id_empresa);
    };
    EjercicioContableService.prototype.create = function (payload) {
        return this.http.post(this.baseUrl, payload);
    };
    EjercicioContableService.prototype.update = function (id, payload) {
        return this.http.put(this.baseUrl + "/" + id, payload);
    };
    EjercicioContableService.prototype["delete"] = function (id) {
        return this.http["delete"](this.baseUrl + "/" + id);
    };
    EjercicioContableService.prototype.abrir = function (id) {
        return this.http.post(this.baseUrl + "/" + id + "/abrir", {});
    };
    EjercicioContableService.prototype.cerrar = function (id) {
        return this.http.post(this.baseUrl + "/" + id + "/cerrar", {});
    };
    EjercicioContableService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], EjercicioContableService);
    return EjercicioContableService;
}());
exports.EjercicioContableService = EjercicioContableService;
