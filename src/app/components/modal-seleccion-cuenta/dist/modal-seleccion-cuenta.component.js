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
        this.noPosteablesComoTitulo = false;
        this.permitirSeleccionNoPosteables = true;
        this.cuentaConfirmada = new core_1.EventEmitter();
        this.cerrado = new core_1.EventEmitter();
        this.filtro = '';
        this.cuentasBase = [];
        this.nodosVisibles = [];
        this.normaliza = function (s) {
            return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
    }
    ModalSeleccionCuentaComponent.prototype.mapToNodo = function (c) {
        var _a;
        return {
            id_cuenta: c.id_cuenta,
            codigo: c.codigo,
            nombre: c.nombre,
            nivel: (_a = c.nivel) !== null && _a !== void 0 ? _a : 0,
            esPadre: c.esPadre,
            posteable: c.posteable,
            _expandido: !!c._expandido
        };
    };
    ModalSeleccionCuentaComponent.prototype.esPadre = function (c) {
        var v = c.esPadre;
        if (v === true || v === 1 || v === '1')
            return true;
        if (v === false || v === 0 || v === '0')
            return false;
        return false;
    };
    ModalSeleccionCuentaComponent.prototype.esPosteable = function (c) {
        var v = c.posteable;
        if (v === true || v === 1 || v === '1')
            return true;
        if (v === false || v === 0 || v === '0')
            return false;
        return true;
    };
    ModalSeleccionCuentaComponent.prototype.esGrupo = function (c) {
        return !this.esPosteable(c);
    };
    ModalSeleccionCuentaComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var _a;
        if (changes['cuentas']) {
            this.cuentasBase = ((_a = this.cuentas) !== null && _a !== void 0 ? _a : []).map(function (c) { return _this.mapToNodo(c); });
            this.rebuildTree();
        }
    };
    ModalSeleccionCuentaComponent.prototype.onFiltroChange = function () {
        this.rebuildTree();
    };
    ModalSeleccionCuentaComponent.prototype.rebuildTree = function () {
        var _this = this;
        var _a;
        var texto = this.normaliza(this.filtro);
        if (texto) {
            this.nodosVisibles = this.cuentasBase.filter(function (c) {
                return _this.normaliza(c.codigo + " " + c.nombre).includes(texto);
            });
            return;
        }
        var resultado = [];
        var expandedByLevel = new Map(); // nivel - expandido
        for (var _i = 0, _b = this.cuentasBase; _i < _b.length; _i++) {
            var c = _b[_i];
            var lvl = (_a = c.nivel) !== null && _a !== void 0 ? _a : 0;
            if (lvl === 0) {
                // raíz: siempre visible
                resultado.push(c);
                if (this.esPadre(c)) {
                    expandedByLevel.set(0, !!c._expandido);
                }
                continue;
            }
            // visible solo si TODOS  están expandido=true
            var visible = true;
            for (var l = 0; l < lvl; l++) {
                if (expandedByLevel.get(l) !== true) {
                    visible = false;
                    break;
                }
            }
            if (!visible)
                continue;
            resultado.push(c);
            if (this.esPadre(c)) {
                expandedByLevel.set(lvl, !!c._expandido);
            }
        }
        this.nodosVisibles = resultado;
    };
    ModalSeleccionCuentaComponent.prototype.toggleNodo = function (n) {
        n._expandido = !n._expandido;
        this.rebuildTree();
    };
    //  selección 
    ModalSeleccionCuentaComponent.prototype.seleccionarCuenta = function (c) {
        var _a;
        if (!this.permitirSeleccionNoPosteables && this.esGrupo(c))
            return;
        this.cuentaSeleccionada = (_a = this.cuentas.find(function (x) { return x.id_cuenta === c.id_cuenta; })) !== null && _a !== void 0 ? _a : c;
    };
    ModalSeleccionCuentaComponent.prototype.confirmar = function () {
        if (this.cuentaSeleccionada) {
            this.cuentaConfirmada.emit(this.cuentaSeleccionada);
        }
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
        core_1.Input()
    ], ModalSeleccionCuentaComponent.prototype, "noPosteablesComoTitulo");
    __decorate([
        core_1.Input()
    ], ModalSeleccionCuentaComponent.prototype, "permitirSeleccionNoPosteables");
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
