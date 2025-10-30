"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ModalSeleccionCuentaComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var ModalSeleccionCuentaComponent = /** @class */ (function () {
    function ModalSeleccionCuentaComponent() {
        this.open = false;
        this.cuentas = [];
        this.cuentaSeleccionada = null;
        this.cuentaConfirmada = new core_1.EventEmitter();
        this.cerrado = new core_1.EventEmitter();
        this.filtro = '';
        this.normaliza = function (s) {
            return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
    }
    Object.defineProperty(ModalSeleccionCuentaComponent.prototype, "cuentasFiltradas", {
        get: function () {
            var _this = this;
            var q = this.normaliza(this.filtro);
            var src = Array.isArray(this.cuentas) ? this.cuentas : [];
            if (!q)
                return src;
            return src.filter(function (c) { return _this.normaliza(c.codigo + " " + c.nombre).includes(q); });
        },
        enumerable: false,
        configurable: true
    });
    /** True si la cuenta es posteable (seleccionable). */
    ModalSeleccionCuentaComponent.prototype.esPosteable = function (c) {
        var v = c === null || c === void 0 ? void 0 : c.posteable;
        // Normaliza a boolean: true si 1/'1'/true; false si 0/'0'/false; default true si viene undefined
        if (v === true || v === 1 || v === '1')
            return true;
        if (v === false || v === 0 || v === '0')
            return false;
        return true; // si no viene el campo, asumimos posteable
    };
    /** True si es "grupo" (no posteable) => se pone en negritas y se bloquea. */
    ModalSeleccionCuentaComponent.prototype.esGrupo = function (c) {
        return !this.esPosteable(c);
    };
    ModalSeleccionCuentaComponent.prototype.seleccionarCuenta = function (c) {
        if (this.esGrupo(c))
            return; // no permitir seleccionar grupos
        this.cuentaSeleccionada = c;
    };
    ModalSeleccionCuentaComponent.prototype.confirmar = function () {
        if (this.cuentaSeleccionada)
            this.cuentaConfirmada.emit(this.cuentaSeleccionada);
    };
    ModalSeleccionCuentaComponent.prototype.cerrar = function () {
        this.cerrado.emit();
    };
    __decorate([
        core_1.Input()
    ], ModalSeleccionCuentaComponent.prototype, "open");
    __decorate([
        core_1.Input()
    ], ModalSeleccionCuentaComponent.prototype, "cuentas");
    __decorate([
        core_1.Input()
    ], ModalSeleccionCuentaComponent.prototype, "cuentaSeleccionada");
    __decorate([
        core_1.Output()
    ], ModalSeleccionCuentaComponent.prototype, "cuentaConfirmada");
    __decorate([
        core_1.Output()
    ], ModalSeleccionCuentaComponent.prototype, "cerrado");
    ModalSeleccionCuentaComponent = __decorate([
        core_1.Component({
            selector: 'app-modal-seleccion-cuenta',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            templateUrl: './modal-seleccion-cuenta.component.html',
            styleUrls: ['./modal-seleccion-cuenta.component.scss']
        })
    ], ModalSeleccionCuentaComponent);
    return ModalSeleccionCuentaComponent;
}());
exports.ModalSeleccionCuentaComponent = ModalSeleccionCuentaComponent;
