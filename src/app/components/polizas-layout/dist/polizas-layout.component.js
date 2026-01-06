"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PolizasLayoutComponent = void 0;
var core_1 = require("@angular/core");
var sidebar_component_1 = require("../sidebar/sidebar.component");
var PolizasLayoutComponent = /** @class */ (function () {
    function PolizasLayoutComponent() {
        /** controla apertura del sidebar desde el padre */
        this.open = true;
        /** propaga cambios al padre */
        this.openChange = new core_1.EventEmitter();
    }
    PolizasLayoutComponent.prototype.onToggle = function (v) {
        this.open = v;
        this.openChange.emit(v);
    };
    __decorate([
        core_1.Input()
    ], PolizasLayoutComponent.prototype, "open");
    __decorate([
        core_1.Output()
    ], PolizasLayoutComponent.prototype, "openChange");
    PolizasLayoutComponent = __decorate([
        core_1.Component({
            selector: 'app-polizas-layout',
            standalone: true,
            imports: [sidebar_component_1.SidebarComponent],
            templateUrl: './polizas-layout.component.html',
            styleUrl: './polizas-layout.component.scss'
        })
    ], PolizasLayoutComponent);
    return PolizasLayoutComponent;
}());
exports.PolizasLayoutComponent = PolizasLayoutComponent;
