"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PolizasService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var PolizasService = /** @class */ (function () {
    function PolizasService() {
        this.http = core_1.inject(http_1.HttpClient);
        this.apiUrl = 'http://localhost:3000/api/v1/usuarios';
        this.api = 'http://localhost:3000/api/v1';
        this.basePoliza = this.api + "/poliza";
        this.cfdiImportUrl = this.api + "/cfdi/import";
    }
    PolizasService.prototype.getAuthHeaders = function () {
        var token = localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            sessionStorage.getItem('token') ||
            '';
        return new http_1.HttpHeaders(token ? { Authorization: "Bearer " + token } : {});
    };
    /** ---------------- TIPOS DE PÓLIZA (CRUD) ---------------- */
    /** GET /api/v1/tipo-poliza */
    PolizasService.prototype.getTiposPoliza = function () {
        return this.http.get(this.api + "/tipo-poliza", {
            headers: this.getAuthHeaders()
        }).pipe(operators_1.map(function (res) {
            if (Array.isArray(res))
                return res;
            if (Array.isArray(res === null || res === void 0 ? void 0 : res.data))
                return res.data;
            if (Array.isArray(res === null || res === void 0 ? void 0 : res.rows))
                return res.rows;
            if (Array.isArray(res === null || res === void 0 ? void 0 : res.results))
                return res.results;
            return [];
        }));
    };
    /** POST /api/v1/tipo-poliza */
    PolizasService.prototype.createTipoPoliza = function (payload) {
        return this.http.post(this.api + "/tipo-poliza", payload, {
            headers: this.getAuthHeaders()
        });
    };
    /** PUT /api/v1/tipo-poliza/:id */
    PolizasService.prototype.updateTipoPoliza = function (id_tipopoliza, payload) {
        return this.http.put(this.api + "/tipo-poliza/" + id_tipopoliza, payload, {
            headers: this.getAuthHeaders()
        });
    };
    /** DELETE /api/v1/tipo-poliza/:id */
    PolizasService.prototype.deleteTipoPoliza = function (id_tipopoliza) {
        return this.http["delete"](this.api + "/tipo-poliza/" + id_tipopoliza, {
            headers: this.getAuthHeaders()
        });
    };
    /** ---------------- PERÍODOS / CENTROS (catálogos) ---------------- */
    /** GET /api/v1/periodos */
    PolizasService.prototype.getPeriodos = function () {
        return this.http.get(this.api + "/periodos", {
            headers: this.getAuthHeaders()
        });
    };
    /** GET /api/v1/centros */
    PolizasService.prototype.getCentros = function () {
        return this.http.get(this.api + "/centros", {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- PÓLIZAS ----------------
    /** GET /api/v1/poliza */
    PolizasService.prototype.getPolizas = function (params) {
        var p = new http_1.HttpParams();
        if ((params === null || params === void 0 ? void 0 : params.id_tipopoliza) != null)
            p = p.set('id_tipopoliza', String(params.id_tipopoliza));
        if ((params === null || params === void 0 ? void 0 : params.id_periodo) != null)
            p = p.set('id_periodo', String(params.id_periodo));
        if ((params === null || params === void 0 ? void 0 : params.id_centro) != null)
            p = p.set('id_centro', String(params.id_centro));
        return this.http.get(this.basePoliza, {
            params: p,
            headers: this.getAuthHeaders()
        });
    };
    /** POST /api/v1/poliza */
    PolizasService.prototype.createPoliza = function (body) {
        return this.http.post(this.basePoliza, body, {
            headers: this.getAuthHeaders()
        });
    };
    /** GET /api/v1/poliza/:id/movimientos */
    PolizasService.prototype.getPolizaConMovimientos = function (id) {
        return this.http.get(this.basePoliza + "/" + id + "/movimientos", {
            headers: this.getAuthHeaders()
        });
    };
    /** PUT /api/v1/poliza/:id */
    PolizasService.prototype.updatePoliza = function (id, body) {
        return this.http.put(this.basePoliza + "/" + id, body, {
            headers: this.getAuthHeaders()
        });
    };
    /** GET /api/v1/poliza/folio-siguiente */
    PolizasService.prototype.getFolioSiguiente = function (params) {
        var p = new http_1.HttpParams()
            .set('id_tipopoliza', String(params.id_tipopoliza))
            .set('id_periodo', String(params.id_periodo));
        if (params.id_centro != null)
            p = p.set('id_centro', String(params.id_centro));
        return this.http.get(this.basePoliza + "/folio-siguiente", {
            params: p,
            headers: this.getAuthHeaders()
        });
    };
    /** DELETE /api/v1/poliza/:id */
    PolizasService.prototype.deletePoliza = function (id) {
        return this.http["delete"](this.basePoliza + "/" + id, {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- MOVIMIENTOS ----------------
    /** POST /api/v1/movimiento-poliza */
    PolizasService.prototype.createMovPoliza = function (body) {
        return this.http.post(this.api + "/movimiento-poliza", body, {
            headers: this.getAuthHeaders()
        });
    };
    /** PUT /api/v1/movimiento-poliza/:id */
    PolizasService.prototype.updateMovPoliza = function (id, body) {
        return this.http.put(this.api + "/movimiento-poliza/" + id, body, {
            headers: this.getAuthHeaders()
        });
    };
    /** DELETE /api/v1/movimiento-poliza/:id */
    PolizasService.prototype.deleteMovPoliza = function (id) {
        return this.http["delete"](this.api + "/movimiento-poliza/" + id, {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- CATÁLOGOS ----------------
    PolizasService.prototype.getCuentas = function () {
        return this.http.get(this.api + "/cuentas", {
            headers: this.getAuthHeaders()
        });
    };
    PolizasService.prototype.getCentrosCosto = function () {
        return this.http.get(this.api + "/centros", {
            headers: this.getAuthHeaders()
        });
    };
    PolizasService.prototype.getEjercicios = function () {
        return this.http.get(this.api + "/ejercicios", {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- CFDI ----------------
    /** POST /api/v1/cfdi/import (subir XML) */
    PolizasService.prototype.uploadCfdiXml = function (file, ctx) {
        var form = new FormData();
        form.append('file', file); // nombre del campo que espera multer
        if (ctx === null || ctx === void 0 ? void 0 : ctx.folio)
            form.append('folio', ctx.folio);
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_periodo) != null)
            form.append('id_periodo', String(ctx.id_periodo));
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_centro) != null)
            form.append('id_centro', String(ctx.id_centro));
        if ((ctx === null || ctx === void 0 ? void 0 : ctx.id_tipopoliza) != null)
            form.append('id_tipopoliza', String(ctx.id_tipopoliza));
        return this.http.post(this.cfdiImportUrl, form, {
            headers: this.getAuthHeaders()
        });
    };
    /** Vincular UUID a movimientos */
    PolizasService.prototype.linkUuidToMovimientos = function (polizaId, uuid, movimientoIds) {
        return this.http.post(this.api + "/cfdi/polizas/" + polizaId + "/movimientos/link-uuid", {
            uuid: uuid,
            movimiento_ids: movimientoIds
        }, {
            headers: this.getAuthHeaders()
        });
    };
    /** GET /api/v1/cfdi */
    PolizasService.prototype.listCfdi = function (params) {
        var httpParams = new http_1.HttpParams();
        if ((params === null || params === void 0 ? void 0 : params.limit) != null)
            httpParams = httpParams.set('limit', String(params.limit));
        if (params === null || params === void 0 ? void 0 : params.q)
            httpParams = httpParams.set('q', params.q);
        return this.http.get(this.api + "/cfdi", {
            params: httpParams,
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- USUARIO ----------------
    PolizasService.prototype.getMeq = function () {
        return this.http.get(this.api + "/me", {
            headers: this.getAuthHeaders()
        });
    };
    PolizasService.prototype.getMe = function () {
        return this.http.get(this.apiUrl + "/me", {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- ESTADO PÓLIZA ----------------
    // Usa el endpoint correcto del router: PATCH /poliza/:id/estado
    PolizasService.prototype.changeEstadoPoliza = function (id_poliza, estado) {
        return this.http.patch(this.basePoliza + "/" + id_poliza + "/estado", { estado: estado }, {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- MOTOR (EVENTO → MOVIMIENTOS) ----------------
    /** POST /api/v1/poliza/from-evento  (crea póliza con el motor) */
    PolizasService.prototype.createPolizaFromEvento = function (body) {
        return this.http.post(this.basePoliza + "/from-evento", body, {
            headers: this.getAuthHeaders()
        });
    };
    /** POST /api/v1/poliza/:id/expand-evento  (agrega movimientos generados a una póliza existente) */
    PolizasService.prototype.expandEventoEnPoliza = function (polizaId, body) {
        return this.http.post(this.basePoliza + "/" + polizaId + "/expand-evento", body, {
            headers: this.getAuthHeaders()
        });
    };
    // ---------------- EJERCICIO ----------------
    PolizasService.prototype.selectEjercicio = function (id_ejercicio) {
        return this.http.put(this.api + "/ejercicios/" + id_ejercicio + "/select", {}, {
            headers: this.getAuthHeaders()
        });
    };
    PolizasService = __decorate([
        core_1.Injectable({ providedIn: 'root' })
    ], PolizasService);
    return PolizasService;
}());
exports.PolizasService = PolizasService;
