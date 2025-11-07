"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TipoPolizaModalComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var rxjs_1 = require("rxjs");
var modal_component_1 = require("../modal/modal/modal.component");
var NATURALEZAS = ['ingreso', 'egreso', 'diario'];
var TipoPolizaModalComponent = /** @class */ (function () {
    function TipoPolizaModalComponent(fb, polizas) {
        this.fb = fb;
        this.polizas = polizas;
        this.open = false;
        this.openChange = new core_1.EventEmitter();
        this.saved = new core_1.EventEmitter();
        this.loading = false;
        this.submitted = false;
        this.naturalezas = __spreadArrays(NATURALEZAS);
        this.tipos = [];
        //  ESTADO DE EDICIÓN 
        this.editing = false;
        this.editingId = null;
        this.tipoEditando = null;
        //  ELIMINAR (modal confirmaciom) 
        this.showDeleteModal = false;
        this.tipoAEliminar = null;
        this.form = this.fb.group({
            naturaleza: ['', forms_1.Validators.required],
            descripcion: ['', [forms_1.Validators.required, forms_1.Validators.maxLength(255)]]
        });
    }
    TipoPolizaModalComponent.prototype.ngOnChanges = function (changes) {
        var _a;
        if (((_a = changes['open']) === null || _a === void 0 ? void 0 : _a.currentValue) === true) {
            this.loadTipos();
        }
    };
    // Cargar lista
    TipoPolizaModalComponent.prototype.loadTipos = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        this.loading = true;
                        _a = this;
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.polizas.getTiposPoliza())];
                    case 1:
                        _a.tipos = _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _b.sent();
                        this.tipos = [];
                        return [3 /*break*/, 4];
                    case 3:
                        this.loading = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // INICIAR EDICIÓN
    TipoPolizaModalComponent.prototype.startEdit = function (t) {
        this.editing = true;
        this.editingId = t.id_tipopoliza;
        this.tipoEditando = t;
        this.form.patchValue({
            naturaleza: t.naturaleza,
            descripcion: t.descripcion
        });
    };
    TipoPolizaModalComponent.prototype.cancelEdit = function () {
        this.editing = false;
        this.editingId = null;
        this.tipoEditando = null;
        this.form.reset();
        this.submitted = false;
    };
    // CONFIRMAR ELIMINAR
    TipoPolizaModalComponent.prototype.confirmarEliminar = function (tipo) {
        this.tipoAEliminar = tipo;
        this.showDeleteModal = true;
    };
    TipoPolizaModalComponent.prototype.cancelarEliminar = function () {
        this.tipoAEliminar = null;
        this.showDeleteModal = false;
    };
    TipoPolizaModalComponent.prototype.eliminarDefinitivo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.tipoAEliminar)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 5]);
                        this.loading = true;
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.polizas.deleteTipoPoliza(this.tipoAEliminar.id_tipopoliza))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.loadTipos()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        this.loading = false;
                        this.cancelarEliminar();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // CERRAR MODAL PRINCIPAL
    TipoPolizaModalComponent.prototype.close = function () {
        this.open = false;
        this.openChange.emit(false);
        this.cancelEdit();
    };
    TipoPolizaModalComponent.prototype.onEsc = function () { if (this.open && !this.loading)
        this.close(); };
    // CREAR / ACTUALIZAR
    TipoPolizaModalComponent.prototype.onSubmit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.submitted = true;
                        if (this.form.invalid || this.loading)
                            return [2 /*return*/];
                        payload = {
                            naturaleza: this.form.value.naturaleza,
                            descripcion: this.form.value.descripcion.trim()
                        };
                        this.loading = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 7, 8]);
                        if (!(this.editing && this.editingId != null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.polizas.updateTipoPoliza(this.editingId, payload))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, rxjs_1.firstValueFrom(this.polizas.createTipoPoliza(payload))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.loadTipos()];
                    case 6:
                        _a.sent();
                        this.saved.emit(true);
                        this.cancelEdit();
                        return [3 /*break*/, 8];
                    case 7:
                        this.loading = false;
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        core_1.Input()
    ], TipoPolizaModalComponent.prototype, "open");
    __decorate([
        core_1.Output()
    ], TipoPolizaModalComponent.prototype, "openChange");
    __decorate([
        core_1.Output()
    ], TipoPolizaModalComponent.prototype, "saved");
    __decorate([
        core_1.HostListener('document:keydown.escape')
    ], TipoPolizaModalComponent.prototype, "onEsc");
    TipoPolizaModalComponent = __decorate([
        core_1.Component({
            selector: 'app-modal-tipopoliza',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.ReactiveFormsModule, modal_component_1.ModalComponent],
            templateUrl: './modal-tipopoliza.component.html',
            styleUrls: ['./modal-tipopoliza.component.scss']
        })
    ], TipoPolizaModalComponent);
    return TipoPolizaModalComponent;
}());
exports.TipoPolizaModalComponent = TipoPolizaModalComponent;
