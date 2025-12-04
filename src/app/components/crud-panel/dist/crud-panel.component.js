"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.CrudPanelComponent = void 0;
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var sidebar_component_1 = require("../sidebar/sidebar.component");
var CrudPanelComponent = /** @class */ (function () {
    function CrudPanelComponent() {
        /** Header */
        this.title = '';
        this.disablePrimary = false;
        this.hidePrimary = false;
        // Emite la fila seleccionada cuando cambia el radio
        this.selection = new core_1.EventEmitter();
        this.selectionMode = 'none'; // opt-in
        this.idKey = 'id'; // pk genérica
        this.selectedRowId = null;
        /** Tabs (Usuarios / Roles y permisos / etc.) */
        this.tabs = [];
        this.tabChange = new core_1.EventEmitter();
        /** Search */
        this.showSearch = true;
        this.placeholderSearch = 'Buscar...';
        this.search = new core_1.EventEmitter();
        this.innerSearch = '';
        this.primaryActionLabel = 'Nuevo';
        this.primaryAction = new core_1.EventEmitter();
        /** Tabla */
        this.columns = [];
        this.data = [];
        /** Acciones por fila */
        this.actions = [
            { id: 'edit', label: 'Editar' },
            { id: 'delete', label: 'Eliminar' },
        ];
        this.action = new core_1.EventEmitter();
        this.edit = new core_1.EventEmitter();
        this.remove = new core_1.EventEmitter();
        /** Paginación */
        this.page = 1;
        this.totalPages = 1;
        this.pageChange = new core_1.EventEmitter();
    }
    CrudPanelComponent.prototype.onRadioChange = function (row) {
        this.selectedRowId = row.id;
        this.selection.emit(row);
    };
    CrudPanelComponent.prototype.onTabClick = function (id) { this.tabChange.emit(id); };
    CrudPanelComponent.prototype.onPrimary = function () { this.primaryAction.emit(); };
    CrudPanelComponent.prototype.onSearchChange = function (v) { this.search.emit(v); };
    CrudPanelComponent.prototype.onActionClick = function (id, row) {
        this.action.emit({ action: id, row: row });
        if (id === 'edit')
            this.edit.emit(row);
        if (id === 'delete')
            this.remove.emit(row);
    };
    CrudPanelComponent.prototype.goPage = function (p) {
        if (p < 1 || p > this.totalPages)
            return;
        this.page = p;
        this.pageChange.emit(this.page);
    };
    CrudPanelComponent.prototype.trackByIndex = function (i) { return i; };
    Object.defineProperty(CrudPanelComponent.prototype, "visiblePages", {
        get: function () {
            var _this = this;
            var set = new Set([1, this.page - 1, this.page, this.page + 1, this.totalPages]);
            var arr = __spreadArrays(set).filter(function (n) { return n >= 1 && n <= _this.totalPages; }).sort(function (a, b) { return a - b; });
            var out = [];
            for (var i = 0; i < arr.length; i++) {
                out.push(arr[i]);
                if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1)
                    out.push('…');
            }
            return out;
        },
        enumerable: false,
        configurable: true
    });
    CrudPanelComponent.prototype.onRowClick = function (row) {
        if (this.selectionMode !== 'single')
            return;
        // si el host controla selectedRowId, solo emite; el host actualizará el input
        this.selection.emit(row);
    };
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "title");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "disablePrimary");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "hidePrimary");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "selection");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "selectionMode");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "idKey");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "selectedRowId");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "tabs");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "activeTabId");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "tabChange");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "showSearch");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "placeholderSearch");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "search");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "primaryActionLabel");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "primaryAction");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "columns");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "data");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "actions");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "action");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "edit");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "remove");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "page");
    __decorate([
        core_1.Input()
    ], CrudPanelComponent.prototype, "totalPages");
    __decorate([
        core_1.Output()
    ], CrudPanelComponent.prototype, "pageChange");
    CrudPanelComponent = __decorate([
        core_1.Component({
            selector: 'app-crud-panel',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, sidebar_component_1.SidebarComponent, router_1.RouterModule],
            templateUrl: './crud-panel.component.html',
            styleUrls: ['./crud-panel.component.scss']
        })
    ], CrudPanelComponent);
    return CrudPanelComponent;
}());
exports.CrudPanelComponent = CrudPanelComponent;
