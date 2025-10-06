"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.CentrosCostosService = void 0;
var core_1 = require("@angular/core");
var CentrosCostosService = /** @class */ (function () {
    function CentrosCostosService(http) {
        this.http = http;
        this.apiURL = 'http://localhost:3000/api/v1/centros';
    }
    CentrosCostosService.prototype.getCentros = function () {
        return this.http.get(this.apiURL);
    };
    CentrosCostosService.prototype.createCentro = function (data) {
        return this.http.post(this.apiURL, data);
    };
    CentrosCostosService.prototype.actualizarCentro = function (id, data) {
        return this.http.put(this.apiURL + "/" + id, data);
    };
    CentrosCostosService.prototype.deleteCentro = function (id) {
        return this.http["delete"](this.apiURL + "/" + id);
    };
    CentrosCostosService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], CentrosCostosService);
    return CentrosCostosService;
}());
exports.CentrosCostosService = CentrosCostosService;
