"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ImpuestoFormComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var rxjs_1 = require("rxjs");
var APLICA_EN_OPTS = ['VENTA', 'COMPRA', 'AMBOS'];
var MODO_OPTS = ['TASA', 'CUOTA', 'EXENTO'];
var TIPO_OPTS = ['IVA', 'ISR', 'IEPS', 'RETENCION', 'OTRO'];
var ImpuestoFormComponent = /** @class */ (function () {
    function ImpuestoFormComponent(fb, impuestosSrv, cuentasSrv) {
        this.fb = fb;
        this.impuestosSrv = impuestosSrv;
        this.cuentasSrv = cuentasSrv;
        this.value = null;
        this.idEmpresa = 1;
        this.submitted = new core_1.EventEmitter();
        this.canceled = new core_1.EventEmitter();
        this.isSubmitting = false;
        this.aplicaEnOpts = APLICA_EN_OPTS;
        this.modoOpts = MODO_OPTS;
        this.tipoOpts = TIPO_OPTS;
        // --- Cuentas ---
        this.cuentas$ = this.cuentasSrv.getCuentas().pipe(rxjs_1.shareReplay(1));
        this.cuentaSearch$ = new rxjs_1.BehaviorSubject('');
        this.cuentaSearch = '';
        this.cuentasFiltradas$ = rxjs_1.combineLatest([
            this.cuentas$,
            this.cuentaSearch$.pipe(rxjs_1.debounceTime(200), rxjs_1.startWith('')),
        ]).pipe(rxjs_1.map(function (_a) {
            var cuentas = _a[0], term = _a[1];
            var q = (term || '').trim().toLowerCase();
            if (!q)
                return cuentas;
            return cuentas.filter(function (c) {
                var _a, _b;
                return ((_a = c.codigo) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(q)) || ((_b = c.nombre) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(q));
            });
        }), rxjs_1.shareReplay(1));
        this.cuentasFiltradasCount$ = this.cuentasFiltradas$.pipe(rxjs_1.map(function (list) { return list.length; }));
        this.form = this.fb.nonNullable.group({
            nombre: this.fb.nonNullable.control('', [
                forms_1.Validators.required,
                forms_1.Validators.minLength(3),
            ]),
            tipo: this.fb.nonNullable.control('', [
                forms_1.Validators.required,
                forms_1.Validators.minLength(3),
            ]),
            modo: this.fb.nonNullable.control('', [forms_1.Validators.required]),
            tasa: this.fb.nonNullable.control(0, [
                forms_1.Validators.required,
                forms_1.Validators.min(0),
                forms_1.Validators.max(100),
            ]),
            aplica_en: this.fb.nonNullable.control('', [forms_1.Validators.required]),
            es_estandar: this.fb.nonNullable.control(false),
            vigencia_inicio: this.fb.nonNullable.control('', [forms_1.Validators.required]),
            id_cuenta: this.fb.control(null)
        });
    }
    ImpuestoFormComponent.prototype.ngOnInit = function () { };
    ImpuestoFormComponent.prototype.ngOnChanges = function (changes) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (changes['value'] && this.value) {
            this.form.patchValue({
                nombre: (_a = this.value.nombre) !== null && _a !== void 0 ? _a : '',
                tipo: (_b = this.value.tipo) !== null && _b !== void 0 ? _b : '',
                modo: (_c = this.value.modo) !== null && _c !== void 0 ? _c : '',
                tasa: (_d = this.value.tasa) !== null && _d !== void 0 ? _d : 0,
                aplica_en: (_e = this.value.aplica_en) !== null && _e !== void 0 ? _e : '',
                es_estandar: (_f = this.value.es_estandar) !== null && _f !== void 0 ? _f : false,
                vigencia_inicio: (_g = this.value.vigencia_inicio) !== null && _g !== void 0 ? _g : '',
                id_cuenta: (_h = this.value.id_cuenta) !== null && _h !== void 0 ? _h : null
            });
        }
        else {
            this.form.reset();
        }
    };
    Object.defineProperty(ImpuestoFormComponent.prototype, "f", {
        get: function () {
            return this.form.controls;
        },
        enumerable: false,
        configurable: true
    });
    ImpuestoFormComponent.prototype.onCuentaSearch = function (term) {
        this.cuentaSearch = term;
        this.cuentaSearch$.next(term);
    };
    ImpuestoFormComponent.prototype.submit = function () {
        var _a, _b, _c, _d, _e, _f, _g;
        if (this.form.invalid || this.isSubmitting) {
            this.form.markAllAsTouched();
            return;
        }
        this.isSubmitting = true;
        var raw = this.form.getRawValue();
        var payload = {
            id_impuesto: (_a = this.value) === null || _a === void 0 ? void 0 : _a.id_impuesto,
            id_empresa: this.idEmpresa,
            nombre: ((_b = raw.nombre) !== null && _b !== void 0 ? _b : '').trim(),
            tipo: ((_c = raw.tipo) !== null && _c !== void 0 ? _c : '').trim().toUpperCase(),
            modo: ((_d = raw.modo) !== null && _d !== void 0 ? _d : '').trim().toUpperCase(),
            tasa: Number(raw.tasa),
            aplica_en: ((_e = raw.aplica_en) !== null && _e !== void 0 ? _e : '').trim().toUpperCase(),
            es_estandar: !!raw.es_estandar,
            vigencia_inicio: ((_f = raw.vigencia_inicio) !== null && _f !== void 0 ? _f : '').trim(),
            id_cuenta: raw.id_cuenta ? Number(raw.id_cuenta) : null
        };
        if (Number.isNaN(payload.tasa)) {
            (_g = this.form.get('tasa')) === null || _g === void 0 ? void 0 : _g.setErrors({ number: true });
            this.isSubmitting = false;
            return;
        }
        this.submitted.emit(payload);
        this.isSubmitting = false;
    };
    ImpuestoFormComponent.prototype.onCancel = function () {
        this.canceled.emit();
    };
    __decorate([
        core_1.Input()
    ], ImpuestoFormComponent.prototype, "value");
    __decorate([
        core_1.Input()
    ], ImpuestoFormComponent.prototype, "idEmpresa");
    __decorate([
        core_1.Output()
    ], ImpuestoFormComponent.prototype, "submitted");
    __decorate([
        core_1.Output()
    ], ImpuestoFormComponent.prototype, "canceled");
    ImpuestoFormComponent = __decorate([
        core_1.Component({
            selector: 'app-impuesto-form',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.ReactiveFormsModule],
            templateUrl: './impuesto-form.component.html',
            styleUrls: ['./impuesto-form.component.scss']
        })
    ], ImpuestoFormComponent);
    return ImpuestoFormComponent;
}());
exports.ImpuestoFormComponent = ImpuestoFormComponent;
