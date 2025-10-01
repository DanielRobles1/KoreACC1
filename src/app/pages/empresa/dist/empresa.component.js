"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.EmpresaComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var crud_panel_component_1 = require("src/app/components/crud-panel/crud-panel.component");
var sidebar_component_1 = require("@app/components/sidebar/sidebar.component");
var modal_component_1 = require("@app/components/modal/modal/modal.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var EmpresaComponent = /** @class */ (function () {
    function EmpresaComponent(empresaService, periodosService, auth, toast) {
        this.empresaService = empresaService;
        this.periodosService = periodosService;
        this.auth = auth;
        this.toast = toast;
        // ===== Layout =====
        this.sidebarOpen = true;
        // ===== Tabs =====
        this.title = 'Configuración de la Empresa';
        this.tabs = [
            { id: 'datos', label: 'Empresa', icon: 'assets/svgs/poliza.svg', iconAlt: 'Empresa', route: '/empresa' },
            { id: 'periodos', label: 'Impuestos', icon: 'assets/svgs/poliza.svg', iconAlt: 'Períodos', route: '/impuestos' },
        ];
        this.activeTabId = 'datos';
        // ===== Empresa =====
        this.primaryActionLabel = 'Editar datos';
        this.columns = [
            { key: 'id', header: '#', width: '64px' },
            { key: 'razon_social', header: 'Razón social' },
            { key: 'rfc', header: 'RFC' },
            { key: 'domicilio_fiscal', header: 'Domicilio fiscal' },
            { key: 'telefono', header: 'Teléfono' },
            { key: 'correo_contacto', header: 'Correo de contacto' },
        ];
        this.rows = [];
        this.actions = [{ id: 'edit', label: 'Editar', tooltip: 'Editar' }];
        // Permisos
        this.canEdit = false;
        this.canDelete = false;
        // Modal empresa
        this.editOpen = false;
        this.modalTitle = 'Editar Empresa';
        this.modalSize = 'md';
        this.showClose = true;
        this.formEmpresa = {
            razon_social: '',
            rfc: '',
            domicilio_fiscal: '',
            telefono: '',
            correo_contacto: ''
        };
        // ===== Períodos =====
        this.primaryActionLabel2 = 'Nuevo período';
        this.columns2 = [
            { key: 'id_periodo', header: '#', width: '72px' },
            { key: 'tipo_periodo', header: 'Tipo' },
            { key: 'fecha_inicio', header: 'Inicio' },
            { key: 'fecha_fin', header: 'Fin' },
            { key: 'esta_abierto', header: 'Abierto' },
        ];
        this.periodos = [];
        this.actions2 = [
            { id: 'edit', label: 'Editar', tooltip: 'Editar' },
            { id: 'delete', label: 'Eliminar', tooltip: 'Eliminar' },
        ];
        // Modal período
        this.modalPeriodoOpen = false;
        this.modalPeriodoTitle = 'Crear período';
        this.formPeriodo = {
            tipo_periodo: 'MENSUAL',
            fecha_inicio: '',
            fecha_fin: '',
            esta_abierto: true
        };
        this.editPeriodoId = null;
        // Modal confirm genérico
        this.confirmOpen = false;
        this.confirmTitle = 'Confirmar acción';
        this.confirmMessage = '';
        this.confirmKind = null;
        this.confirmPayload = null;
        // ===== Fechas/validación =====
        this.minDate = '';
    }
    // ===== Utils de fechas (local-safe) =====
    EmpresaComponent.prototype.pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    EmpresaComponent.prototype.toISO = function (d) {
        return d.getFullYear() + "-" + this.pad(d.getMonth() + 1) + "-" + this.pad(d.getDate());
    };
    EmpresaComponent.prototype.todayLocal = function () {
        var now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };
    EmpresaComponent.prototype.parseISODateLocal = function (iso) {
        var _a = iso.split('-').map(Number), y = _a[0], m = _a[1], d = _a[2];
        return new Date(y, (m !== null && m !== void 0 ? m : 1) - 1, d !== null && d !== void 0 ? d : 1);
    };
    EmpresaComponent.prototype.isPast = function (dateStr) {
        if (!dateStr)
            return false;
        var d = this.parseISODateLocal(dateStr);
        return d < this.todayLocal();
    };
    EmpresaComponent.prototype.startOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth(), 1); };
    EmpresaComponent.prototype.endOfMonth = function (d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); };
    EmpresaComponent.prototype.startOfYear = function (d) { return new Date(d.getFullYear(), 0, 1); };
    EmpresaComponent.prototype.endOfYear = function (d) { return new Date(d.getFullYear(), 12, 0); };
    EmpresaComponent.prototype.addDays = function (d, days) { var r = new Date(d); r.setDate(r.getDate() + days); return r; };
    // Semana Lunes-Domingo
    EmpresaComponent.prototype.startOfWeek = function (d) {
        var wd = d.getDay(); // 0=Dom, 1=Lun,...6=Sáb
        var diff = (wd === 0 ? -6 : 1 - wd); // llevar a lunes
        var res = new Date(d);
        res.setDate(d.getDate() + diff);
        return new Date(res.getFullYear(), res.getMonth(), res.getDate());
    };
    // ==== Período COMPLETO que contiene la fecha de referencia ====
    EmpresaComponent.prototype.computeCurrentPeriod = function (type, ref) {
        if (type === 'PERSONALIZADO')
            return null;
        var base = ref !== null && ref !== void 0 ? ref : this.todayLocal();
        var start;
        var end;
        switch (type) {
            case 'SEMANAL':
                start = this.startOfWeek(base);
                end = this.addDays(start, 6);
                break;
            case 'MENSUAL':
                start = this.startOfMonth(base);
                end = this.endOfMonth(base);
                break;
            case 'ANUAL':
                start = this.startOfYear(base);
                end = this.endOfYear(base);
                break;
        }
        return { start: start, end: end };
    };
    /** Establece fechas según el tipo, usando el período COMPLETO actual
     * (el que contiene la fecha de referencia; por defecto, HOY). */
    EmpresaComponent.prototype.setDatesByType = function (type, referenceDate) {
        if (type === 'PERSONALIZADO')
            return;
        var range = this.computeCurrentPeriod(type, referenceDate !== null && referenceDate !== void 0 ? referenceDate : this.todayLocal());
        if (!range)
            return;
        this.formPeriodo.fecha_inicio = this.toISO(range.start);
        this.formPeriodo.fecha_fin = this.toISO(range.end);
    };
    // ===== Ciclo de vida =====
    EmpresaComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.toast.state$.subscribe(function (s) { return _this.vm = s; });
        this.canEdit = this.auth.hasPermission('editar_empresa');
        this.canDelete = this.auth.hasPermission('eliminar_empresa');
        this.actions = __spreadArrays((this.canEdit ? [{ id: 'edit', tooltip: 'Editar Empresa' }] : []), (this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Empresa' }] : []));
        this.actions2 = __spreadArrays((this.canEdit ? [{ id: 'edit', tooltip: 'Editar Periodo' }] : []), (this.canDelete ? [{ id: 'delete', tooltip: 'Eliminar Periodo' }] : []));
        this.minDate = this.toISO(this.todayLocal());
        this.loadDataEmpresa();
    };
    EmpresaComponent.prototype.openSuccess = function (message) {
        this.toast.success(message, 'Éxito', 3000);
    };
    EmpresaComponent.prototype.openError = function (message, err) {
        if (err)
            console.error('[EmpresaComponent] Error:', err);
        this.toast.error(message, 'Error', 0);
    };
    // ===== Empresa =====
    EmpresaComponent.prototype.extractErrorMessage = function (err) {
        var _a;
        return ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || (err === null || err === void 0 ? void 0 : err.message) || (typeof err === 'string' ? err : null);
    };
    EmpresaComponent.prototype.loadDataEmpresa = function () {
        var _this = this;
        this.empresaService.getEmpresa().subscribe({
            next: function (data) {
                var one = Array.isArray(data) ? data[0] : data;
                _this.rows = one ? [one] : [];
                if (_this.rows[0])
                    _this.loadPeriodos();
            },
            error: function (err) { var _a; return _this.toast.error((_a = _this.extractErrorMessage(err)) !== null && _a !== void 0 ? _a : 'Error al cargar los datos de la empresa.', 'Error', 0); }
        });
    };
    EmpresaComponent.prototype.onTabChange = function (id) {
        if (id === 'datos' || id === 'periodos')
            this.activeTabId = id;
        if (id === 'periodos')
            this.loadPeriodos();
    };
    // Editar empresa
    EmpresaComponent.prototype.onPrimary = function () {
        if (!this.canEdit)
            return this.openError('No tienes permisos para editar la empresa');
        var empresa = this.rows[0];
        if (!empresa)
            return this.openError('No hay datos de empresa para editar');
        this.formEmpresa = __assign({}, empresa);
        this.editOpen = true;
    };
    EmpresaComponent.prototype.onEdit = function (row) {
        if (!this.canEdit)
            return this.openError('No tienes permisos para editar');
        this.formEmpresa = __assign({}, row);
        this.editOpen = true;
    };
    EmpresaComponent.prototype.closeModal = function () { this.editOpen = false; };
    EmpresaComponent.prototype.cancelModal = function () { this.editOpen = false; };
    EmpresaComponent.prototype.confirmModal = function () {
        this.confirmTitle = 'Confirmar guardado';
        this.confirmMessage = '¿Deseas guardar los cambios de la empresa?';
        this.confirmKind = 'empresa-save';
        this.confirmPayload = null;
        this.confirmOpen = true;
    };
    // ===== Períodos =====
    EmpresaComponent.prototype.empresaId = function () {
        var _a;
        var e = this.rows[0];
        var id = ((_a = e === null || e === void 0 ? void 0 : e.id_empresa) !== null && _a !== void 0 ? _a : e === null || e === void 0 ? void 0 : e.id);
        return id !== null && id !== void 0 ? id : null;
    };
    EmpresaComponent.prototype.loadPeriodos = function () {
        var _this = this;
        var idEmp = this.empresaId();
        if (!idEmp)
            return;
        this.periodosService.listByEmpresa(idEmp).subscribe({
            next: function (items) { return _this.periodos = items !== null && items !== void 0 ? items : []; },
            error: function (err) { return _this.openError('Error al cargar los períodos', err); }
        });
    };
    // Cambios de tipo/fecha en el modal de período
    EmpresaComponent.prototype.onTipoPeriodoChange = function (newType) {
        this.formPeriodo.tipo_periodo = newType;
        if (newType === 'PERSONALIZADO')
            return;
        // Si hay fecha de inicio úsala como referencia; si no, hoy.
        var ref = this.formPeriodo.fecha_inicio
            ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
            : this.todayLocal();
        this.setDatesByType(newType, this.todayLocal());
    };
    EmpresaComponent.prototype.onFechaInicioChange = function (newStartStr) {
        this.formPeriodo.fecha_inicio = newStartStr;
        var t = this.formPeriodo.tipo_periodo;
        if (t && t !== 'PERSONALIZADO') {
            // Para tipos automáticos, tomar el período COMPLETO que contiene esa fecha
            var ref = this.parseISODateLocal(newStartStr);
            this.setDatesByType(t, ref);
        }
        else {
            // PERSONALIZADO: validar no pasado y fin >= inicio
            if (this.isPast(newStartStr)) {
                var todayStr = this.minDate;
                this.formPeriodo.fecha_inicio = todayStr;
                this.openError('La fecha de inicio no puede ser pasada. Se ajustó a hoy.');
            }
            var fi = this.formPeriodo.fecha_inicio;
            var ff = this.formPeriodo.fecha_fin;
            if (ff && this.parseISODateLocal(ff) < this.parseISODateLocal(fi)) {
                this.formPeriodo.fecha_fin = fi;
            }
        }
    };
    EmpresaComponent.prototype.onFechaFinChange = function (newEndStr) {
        var t = this.formPeriodo.tipo_periodo;
        if (t && t !== 'PERSONALIZADO') {
            // En automáticos, ignoramos cambios manuales y forzamos el fin correcto
            var ref = this.formPeriodo.fecha_inicio
                ? this.parseISODateLocal(this.formPeriodo.fecha_inicio)
                : this.todayLocal();
            this.setDatesByType(t, ref);
            return;
        }
        // PERSONALIZADO: validaciones
        this.formPeriodo.fecha_fin = newEndStr;
        if (this.isPast(newEndStr)) {
            var todayStr = this.minDate;
            this.formPeriodo.fecha_fin = todayStr;
            this.openError('La fecha de fin no puede ser pasada. Se ajustó a hoy.');
        }
        var fi = this.formPeriodo.fecha_inicio;
        if (fi && this.parseISODateLocal(newEndStr) < this.parseISODateLocal(fi)) {
            this.formPeriodo.fecha_fin = fi;
            this.openError('La fecha de fin no puede ser anterior a la fecha de inicio.');
        }
    };
    // Abrir creación de período
    EmpresaComponent.prototype.onPrimaryPeriodo = function () {
        if (!this.canEdit)
            return this.openError('No tienes permisos para crear períodos');
        this.modalPeriodoTitle = 'Crear período';
        this.editPeriodoId = null;
        this.formPeriodo = { tipo_periodo: 'MENSUAL', fecha_inicio: '', fecha_fin: '', esta_abierto: true };
        // Mes ACTUAL completo (del 1 al último día)
        this.setDatesByType('MENSUAL', this.todayLocal());
        this.modalPeriodoOpen = true;
    };
    EmpresaComponent.prototype.onPeriodoAction = function (evt) {
        var _a;
        switch (evt.action) {
            case 'edit':
                if (!this.canEdit)
                    return this.openError('No tienes permisos para editar períodos');
                this.modalPeriodoTitle = 'Editar período';
                this.editPeriodoId = (_a = evt.row.id_periodo) !== null && _a !== void 0 ? _a : null;
                this.formPeriodo = __assign({}, evt.row); // respetar lo guardado
                this.modalPeriodoOpen = true;
                break;
            case 'delete':
                if (!this.canDelete)
                    return this.openError('No tienes permisos para eliminar períodos');
                this.confirmTitle = 'Confirmar eliminación';
                this.confirmMessage = "\u00BFEliminar el per\u00EDodo del " + evt.row.fecha_inicio + " al " + evt.row.fecha_fin + "? Esta acci\u00F3n no se puede deshacer.";
                this.confirmKind = 'periodo-delete';
                this.confirmPayload = { id_periodo: evt.row.id_periodo };
                this.confirmOpen = true;
                break;
            default:
                this.openError("Acci\u00F3n no soportada: " + evt.action);
        }
    };
    // Cierre modal período
    EmpresaComponent.prototype.closePeriodoModal = function () { this.modalPeriodoOpen = false; };
    EmpresaComponent.prototype.cancelPeriodoModal = function () { this.modalPeriodoOpen = false; };
    // Confirmación antes de guardar período
    EmpresaComponent.prototype.confirmPeriodoModal = function () {
        if (!this.formPeriodo.tipo_periodo || !this.formPeriodo.fecha_inicio || !this.formPeriodo.fecha_fin) {
            return this.openError('Completa tipo de período, fecha de inicio y fin.');
        }
        var t = this.formPeriodo.tipo_periodo;
        // Solo PERSONALIZADO prohíbe pasado; los demás pueden abarcar días previos del período actual.
        if (t === 'PERSONALIZADO' &&
            (this.isPast(this.formPeriodo.fecha_inicio) || this.isPast(this.formPeriodo.fecha_fin))) {
            return this.openError('Las fechas no pueden ser pasadas.');
        }
        // Orden siempre válido
        if (this.parseISODateLocal(this.formPeriodo.fecha_fin) < this.parseISODateLocal(this.formPeriodo.fecha_inicio)) {
            return this.openError('La fecha de fin no puede ser anterior a la de inicio.');
        }
        var creando = !this.editPeriodoId;
        this.confirmTitle = creando ? 'Confirmar creación' : 'Confirmar actualización';
        this.confirmMessage = creando
            ? "\u00BFCrear el per\u00EDodo " + this.formPeriodo.tipo_periodo + " del " + this.formPeriodo.fecha_inicio + " al " + this.formPeriodo.fecha_fin + "?"
            : "\u00BFGuardar los cambios del per\u00EDodo del " + this.formPeriodo.fecha_inicio + " al " + this.formPeriodo.fecha_fin + "?";
        this.confirmKind = 'periodo-save';
        this.confirmPayload = null;
        this.confirmOpen = true;
    };
    // ===== Confirmación genérica =====
    EmpresaComponent.prototype.closeConfirm = function () { this.confirmOpen = false; this.confirmKind = null; this.confirmPayload = null; };
    EmpresaComponent.prototype.cancelConfirm = function () { this.closeConfirm(); };
    EmpresaComponent.prototype.confirmProceed = function () {
        var _this = this;
        var _a, _b;
        var kind = this.confirmKind;
        var payload = this.confirmPayload;
        this.closeConfirm();
        switch (kind) {
            case 'empresa-save': {
                var id = (_a = this.formEmpresa.id_empresa) !== null && _a !== void 0 ? _a : this.formEmpresa.id;
                if (id == null)
                    return this.openError('No se encontró el identificador de la empresa');
                var _c = this.formEmpresa, _omit1 = _c.id, _omit2 = _c.id_empresa, payloadEmpresa = __rest(_c, ["id", "id_empresa"]);
                this.empresaService.updateEmpresa(id, payloadEmpresa).subscribe({
                    next: function () {
                        var _a;
                        _this.rows = [__assign(__assign({}, ((_a = _this.rows[0]) !== null && _a !== void 0 ? _a : {})), _this.formEmpresa)];
                        _this.editOpen = false;
                        _this.openSuccess('Datos de la empresa actualizados correctamente.');
                    },
                    error: function (err) { return _this.openError('No se pudo actualizar la empresa', err); }
                });
                break;
            }
            case 'periodo-save': {
                var idEmp = this.empresaId();
                if (!idEmp)
                    return this.openError('No hay empresa seleccionada.');
                var payloadPeriodo = {
                    id_empresa: idEmp,
                    tipo_periodo: this.formPeriodo.tipo_periodo,
                    fecha_inicio: this.formPeriodo.fecha_inicio,
                    fecha_fin: this.formPeriodo.fecha_fin,
                    esta_abierto: (_b = this.formPeriodo.esta_abierto) !== null && _b !== void 0 ? _b : true,
                    periodo_daterange: undefined
                };
                var req$ = this.editPeriodoId
                    ? this.periodosService.update(this.editPeriodoId, payloadPeriodo)
                    : this.periodosService.create(payloadPeriodo);
                req$.subscribe({
                    next: function (saved) {
                        _this.modalPeriodoOpen = false;
                        if (_this.editPeriodoId) {
                            _this.periodos = _this.periodos.map(function (p) { return p.id_periodo === _this.editPeriodoId ? __assign(__assign({}, p), saved) : p; });
                            _this.openSuccess('Período actualizado.');
                        }
                        else {
                            _this.periodos = __spreadArrays(_this.periodos, [saved]);
                            _this.openSuccess('Período creado.');
                        }
                    },
                    error: function (err) { return _this.openError('No se pudo guardar el período', err); }
                });
                break;
            }
            case 'periodo-delete': {
                var idp_1 = payload === null || payload === void 0 ? void 0 : payload.id_periodo;
                if (!idp_1)
                    return this.openError('No se encontró el identificador del período.');
                this.periodosService["delete"](idp_1).subscribe({
                    next: function () {
                        _this.periodos = _this.periodos.filter(function (p) { return p.id_periodo !== idp_1; });
                        _this.openSuccess('Período eliminado.');
                    },
                    error: function (err) { return _this.openError('No se pudo eliminar el período', err); }
                });
                break;
            }
        }
    };
    // ===== Común =====
    EmpresaComponent.prototype.onRowAction = function (evt) {
        if (evt.action === 'edit')
            return this.onEdit(evt.row);
        this.openError("Acci\u00F3n no soportada: " + evt.action);
    };
    EmpresaComponent.prototype.onSidebarToggle = function (open) { this.sidebarOpen = open; };
    EmpresaComponent = __decorate([
        core_1.Component({
            selector: 'app-empresa',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule, crud_panel_component_1.CrudPanelComponent, sidebar_component_1.SidebarComponent, modal_component_1.ModalComponent, toast_message_component_component_1.ToastMessageComponent],
            templateUrl: './empresa.component.html',
            styleUrls: ['./empresa.component.scss']
        })
    ], EmpresaComponent);
    return EmpresaComponent;
}());
exports.EmpresaComponent = EmpresaComponent;
