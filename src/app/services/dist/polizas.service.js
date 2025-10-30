"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PolizasService = void 0;
// src/app/services/polizas.service.ts
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var PolizasService = /** @class */ (function () {
    function PolizasService() {
        this.http = core_1.inject(http_1.HttpClient);
        this.api = 'http://localhost:3000/api/v1';
        this.cfdiImportUrl = this.api + "/cfdi/import";
    }
    /** GET /api/v1/tipo-poliza */
    PolizasService.prototype.getTiposPoliza = function () {
        return this.http.get(this.api + "/tipo-poliza");
    };
    /** GET /api/v1/periodos */
    PolizasService.prototype.getPeriodos = function () {
        return this.http.get(this.api + "/periodos");
    };
    /** GET /api/v1/centros */
    PolizasService.prototype.getCentros = function () {
        return this.http.get(this.api + "/centros");
    };
    // Pólizas 
    /** GET /api/v1/poliza */
    PolizasService.prototype.getPolizas = function (params) {
        var p = new http_1.HttpParams();
        if ((params === null || params === void 0 ? void 0 : params.id_tipopoliza) != null)
            p = p.set('id_tipopoliza', String(params.id_tipopoliza));
        if ((params === null || params === void 0 ? void 0 : params.id_periodo) != null)
            p = p.set('id_periodo', String(params.id_periodo));
        if ((params === null || params === void 0 ? void 0 : params.id_centro) != null)
            p = p.set('id_centro', String(params.id_centro));
        return this.http.get(this.api + "/poliza", { params: p });
    };
    /** POST /api/v1/poliza */
    PolizasService.prototype.createPoliza = function (body) {
        return this.http.post(this.api + "/poliza", body);
    };
    /** GET /api/v1/poliza/:id/movimientos */
    PolizasService.prototype.getPolizaConMovimientos = function (id) {
        return this.http.get(this.api + "/poliza/" + id + "/movimientos");
    };
    /** PUT /api/v1/poliza/:id */
    PolizasService.prototype.updatePoliza = function (id, body) {
        return this.http.put(this.api + "/poliza/" + id, body);
    };
    /** POST /api/v1/movimiento-poliza */
    PolizasService.prototype.createMovPoliza = function (body) {
        return this.http.post(this.api + "/movimiento-poliza", body);
    };
    /** PUT /api/v1/movimiento-poliza/:id */
    PolizasService.prototype.updateMovPoliza = function (id, body) {
        return this.http.put(this.api + "/movimiento-poliza/" + id, body);
    };
    /** DELETE /api/v1/movimiento-poliza/:id */
    PolizasService.prototype.deleteMovPoliza = function (id) {
        return this.http["delete"](this.api + "/movimiento-poliza/" + id);
    };
    /** DELETE /api/v1/poliza/:ID */
    PolizasService.prototype.deletePoliza = function (id) {
        return this.http["delete"](this.api + "/poliza/" + id);
    };
    PolizasService.prototype.getCuentas = function () {
        return this.http.get(this.api + "/cuentas");
    };
    //  Cargar centros de costo
    PolizasService.prototype.getCentrosCosto = function () {
        return this.http.get(this.api + "/centros");
    };
    // CFDI 
    /** POST /api/v1/cfdi/import (subir XML) */
    PolizasService.prototype.uploadCfdiXml = function (file, ctx) {
        var form = new FormData();
        // nombre del campo que espera multer 
        form.append('file', file);
        if (ctx === null || ctx === void 0 ? void 0 : ctx.folio)
            form.append('folio', ctx.folio);
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_periodo) != null)
            form.append('id_periodo', String(ctx.id_periodo));
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_centro) != null)
            form.append('id_centro', String(ctx.id_centro));
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_tipopoliza) != null)
            form.append('id_tipopoliza', String(ctx.id_tipopoliza));
        // Angular setea el boundary automáticamente con FormData
        return this.http.post(this.cfdiImportUrl, form);
    };
    /** Vincular UUID a movimientos */
    PolizasService.prototype.linkUuidToMovimientos = function (polizaId, uuid, movimientoIds) {
        return this.http.post(this.api + "/cfdi/polizas/" + polizaId + "/movimientos/link-uuid", {
            uuid: uuid,
            movimiento_ids: movimientoIds
        });
    };
    PolizasService.prototype.getEjercicios = function () {
        return this.http.get(this.api + "/ejercicios");
    };
    /** GET /api/v1/cfdi */
    PolizasService.prototype.listCfdi = function (params) {
        var httpParams = new http_1.HttpParams();
        if ((params === null || params === void 0 ? void 0 : params.limit) != null)
            httpParams = httpParams.set('limit', String(params.limit));
        if (params === null || params === void 0 ? void 0 : params.q)
            httpParams = httpParams.set('q', params.q);
        return this.http.get(this.api + "/cfdi", { params: httpParams });
    };
    // en polizas.service.ts 
    PolizasService.prototype.getMe = function () {
        return this.http.get('/api/me');
    };
    // polizas.service.ts
    PolizasService.prototype.changeEstadoPoliza = function (id_poliza, estado) {
        return this.http.patch(this.api + "/poliza/" + id_poliza, { estado: estado });
    };
    /** POST /api/v1/polizas/from-evento  (crea póliza con el motor) */
    PolizasService.prototype.createPolizaFromEvento = function (body) {
        return this.http.post(this.api + "/poliza/from-evento", body);
    };
    /** POST /api/v1/polizas/:id/expand-evento  (agrega movimientos generados a una póliza existente) */
    PolizasService.prototype.expandEventoEnPoliza = function (polizaId, body) {
        return this.http.post(this.api + "/poliza/" + polizaId + "/expand-evento", body);
    };
    PolizasService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], PolizasService);
    return PolizasService;
}());
exports.PolizasService = PolizasService;
