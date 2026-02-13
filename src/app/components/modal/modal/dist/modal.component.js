"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ModalComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var ModalComponent = /** @class */ (function () {
    function ModalComponent(el) {
        this.el = el;
        this.open = false;
        this.title = '';
        this.size = 'lg';
        this.showClose = true;
        this.closeOnBackdrop = true;
        this.closed = new core_1.EventEmitter();
        this.confirmed = new core_1.EventEmitter();
        this.canceled = new core_1.EventEmitter();
    }
    // Cierra con ESC
    ModalComponent.prototype.onEsc = function (e) {
        if (this.open)
            this.close();
    };
    ModalComponent.prototype.onBackdropClick = function (e) {
        if (!this.closeOnBackdrop)
            return;
        // si se hace click fuera del diálogo, cerramos
        var dialog = this.el.nativeElement.querySelector('.modal__dialog');
        if (dialog && !dialog.contains(e.target))
            this.close();
    };
    ModalComponent.prototype.close = function () { this.closed.emit(); };
    ModalComponent.prototype.cancel = function () { this.canceled.emit(); };
    ModalComponent.prototype.confirm = function () { this.confirmed.emit(); };
    __decorate([
        core_1.Input()
    ], ModalComponent.prototype, "open");
    __decorate([
        core_1.Input()
    ], ModalComponent.prototype, "title");
    __decorate([
        core_1.Input()
    ], ModalComponent.prototype, "size");
    __decorate([
        core_1.Input()
    ], ModalComponent.prototype, "showClose");
    __decorate([
        core_1.Input()
    ], ModalComponent.prototype, "closeOnBackdrop");
    __decorate([
        core_1.Output()
    ], ModalComponent.prototype, "closed");
    __decorate([
        core_1.Output()
    ], ModalComponent.prototype, "confirmed");
    __decorate([
        core_1.Output()
    ], ModalComponent.prototype, "canceled");
    __decorate([
        core_1.HostListener('document:keydown.escape', ['$event'])
    ], ModalComponent.prototype, "onEsc");
    ModalComponent = __decorate([
        core_1.Component({
            selector: 'app-modal',
            standalone: true,
            imports: [common_1.CommonModule],
            templateUrl: './modal.component.html',
            styleUrls: ['./modal.component.scss']
        })
    ], ModalComponent);
    return ModalComponent;
}());
exports.ModalComponent = ModalComponent;
