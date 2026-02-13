"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.TipopolizaComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var crud_panel_component_1 = require("@app/components/crud-panel/crud-panel.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var modal_tipopoliza_component_1 = require("@app/components/modal-tipopoliza/modal-tipopoliza.component");
var TipopolizaComponent = /** @class */ (function () {
    function TipopolizaComponent(polizasService) {
        this.polizasService = polizasService;
        // LAYOUT
        this.sidebarOpen = true;
        this.tiposPoliza = [];
        this.loading = false;
        this.modalOpen = false;
        this.tipoSeleccionado = null;
        // DELETE
        this.confirmOpen = false;
        this.confirmTitle = '';
        this.confirmPayload = null;
        // TOAST
        this.toastOpen = false;
        this.toastMessage = '';
        this.toastType = 'success';
    }
    TipopolizaComponent.prototype.ngOnInit = function () {
        this.loadTipos();
    };
    TipopolizaComponent.prototype.onSidebarToggle = function (open) {
        this.sidebarOpen = open;
    };
    TipopolizaComponent.prototype.loadTipos = function () {
        var _this = this;
        this.loading = true;
        this.polizasService.getTiposPoliza().subscribe({
            next: function (data) { return _this.tiposPoliza = data !== null && data !== void 0 ? data : []; },
            error: function (err) { return _this.openError('Error al cargar tipos', err); },
            complete: function () { return _this.loading = false; }
        });
    };
    TipopolizaComponent.prototype.openModal = function () {
        this.tipoSeleccionado = null;
        this.modalOpen = true;
    };
    TipopolizaComponent.prototype.editarDesdeTabla = function (row) {
        this.tipoSeleccionado = row;
        this.modalOpen = true;
    };
    TipopolizaComponent.prototype.confirmarEliminar = function (row) {
        this.confirmTitle = "\u00BFEliminar \"" + row.descripcion + "\"?";
        this.confirmPayload = row;
        this.confirmOpen = true;
    };
    TipopolizaComponent.prototype.confirmCancel = function () {
        this.confirmOpen = false;
        this.confirmPayload = null;
    };
    TipopolizaComponent.prototype.confirmProceed = function () {
        var _this = this;
        if (!this.confirmPayload)
            return;
        var id = this.confirmPayload.id_tipopoliza;
        this.confirmCancel();
        this.polizasService.deleteTipoPoliza(id).subscribe({
            next: function () {
                _this.tiposPoliza = _this.tiposPoliza.filter(function (t) { return t.id_tipopoliza !== id; });
                _this.openSuccess('Eliminado correctamente');
            },
            error: function (err) { return _this.openError('No se pudo eliminar', err); }
        });
    };
    TipopolizaComponent.prototype.openSuccess = function (msg) {
        this.toastType = 'success';
        this.toastMessage = msg;
        this.toastOpen = true;
    };
    TipopolizaComponent.prototype.openError = function (msg, err) {
        console.error(err);
        this.toastType = 'error';
        this.toastMessage = msg;
        this.toastOpen = true;
    };
    TipopolizaComponent = __decorate([
        core_1.Component({
            selector: 'app-tipopoliza',
            standalone: true,
            imports: [
                common_1.CommonModule,
                crud_panel_component_1.CrudPanelComponent,
                modal_component_1.ModalComponent,
                toast_message_component_component_1.ToastMessageComponent,
                sidebar_component_1.SidebarComponent,
                modal_tipopoliza_component_1.TipoPolizaModalComponent
            ],
            templateUrl: './tipopoliza.component.html',
            styleUrls: ['./tipopoliza.component.scss']
        })
    ], TipopolizaComponent);
    return TipopolizaComponent;
}());
exports.TipopolizaComponent = TipopolizaComponent;
