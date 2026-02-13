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
exports.__esModule = true;
exports.PolizaAjusteComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var polizas_layout_component_1 = require("@app/components/polizas-layout/polizas-layout.component");
var toast_message_component_component_1 = require("@app/components/modal/toast-message-component/toast-message-component.component");
var modal_seleccion_cuenta_component_1 = require("@app/components/modal-seleccion-cuenta/modal-seleccion-cuenta.component");
var PolizaAjusteComponent = /** @class */ (function () {
    function PolizaAjusteComponent(route, router, api, fb) {
        var _a, _b;
        this.route = route;
        this.router = router;
        this.api = api;
        this.fb = fb;
        this.errorMessage = null;
        // XML por movimiento
        this.xmlMovimientoIndex = null;
        this.uploadingXml = false;
        this.selectedXmlName = '';
        this.uploadXmlError = '';
        this.sidebarOpen = true;
        this.loading = false;
        this.totalCargos = 0;
        this.totalAbonos = 0;
        this.diferencia = 0;
        this.currentUser = null;
        this.currentUserId = null; // id que intentamos sacar del token
        // Modal de cuentas
        this.modalCuentasAbierto = false;
        // Modal de centros de costo
        this.modalCentroCostoAbierto = false;
        this.indiceMovimientoSeleccionado = null;
        // Catálogo de cuentas y centros de costo
        this.cuentas = [];
        this.cuentasMap = new Map();
        this.centrosCosto = [];
        this.centrosCostoMap = new Map();
        // Toast
        this.toast = {
            open: false,
            title: '',
            message: '',
            type: 'info',
            position: 'top-right',
            autoCloseMs: 3500,
            showClose: true
        };
        // Usuario “bonito” guardado en localStorage (para mostrar nombre, etc.)
        var rawUser = localStorage.getItem('usuario');
        if (rawUser) {
            try {
                this.currentUser = JSON.parse(rawUser);
                console.log('Usuario cargado (localStorage.usuario):', this.currentUser);
            }
            catch (e) {
                console.error('No se pudo parsear usuario de localStorage', e);
            }
        }
        // Intentar sacar el id desde el JWT
        var rawToken = localStorage.getItem('token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('jwt');
        if (rawToken) {
            try {
                var parts = rawToken.split('.');
                if (parts.length === 3) {
                    var payloadB64 = parts[1];
                    var base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
                    var padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
                    var json = atob(padded);
                    var payload = JSON.parse(json);
                    // En tu login el id va normalmente en `sub`
                    this.currentUserId = (_b = (_a = payload.sub) !== null && _a !== void 0 ? _a : payload.id_usuario) !== null && _b !== void 0 ? _b : null;
                    console.log('ID de usuario desde token:', this.currentUserId, payload);
                }
                else {
                    console.warn('Token con formato inesperado:', rawToken);
                }
            }
            catch (e) {
                console.error('No se pudo decodificar el token JWT', e);
            }
        }
        else {
            console.warn('No hay token en localStorage (token/authToken/jwt)');
        }
    }
    PolizaAjusteComponent.prototype.ngOnInit = function () {
        var _this = this;
        var idParam = this.route.snapshot.paramMap.get('id');
        this.idPolizaOrigen = idParam ? Number(idParam) : NaN;
        if (isNaN(this.idPolizaOrigen)) {
            this.errorMessage = 'ID de póliza de origen inválido';
            return;
        }
        this.buildForm();
        // Recalcular totales cada vez que cambie el FormArray de movimientos
        this.movimientos.valueChanges.subscribe(function () { return _this.calcularTotales(); });
        this.loadPolizaOrigen();
        // Catálogos necesarios para labels y modales
        this.cargarCuentas();
        this.cargarCentrosCosto();
    };
    PolizaAjusteComponent.prototype.buildForm = function () {
        this.encabezadoForm = this.fb.group({
            folio: ['', forms_1.Validators.required],
            concepto: ['', forms_1.Validators.required],
            movimientos: this.fb.array([])
        });
    };
    Object.defineProperty(PolizaAjusteComponent.prototype, "movimientos", {
        get: function () {
            return this.encabezadoForm.get('movimientos');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PolizaAjusteComponent.prototype, "centroCostoOrigenLabel", {
        get: function () {
            var _a, _b, _c, _d;
            var centro = (_a = this.polizaOrigen) === null || _a === void 0 ? void 0 : _a.centro;
            if (!centro)
                return '';
            var raw = String((_b = centro.nombre_centro) !== null && _b !== void 0 ? _b : '').trim();
            // separar
            var partes = raw.split('_').filter(Boolean);
            // proteger contra casos raros
            var serie = (_c = partes[0]) !== null && _c !== void 0 ? _c : '';
            var cc = (_d = partes[partes.length - 1]) !== null && _d !== void 0 ? _d : '';
            // formar "A0-CC300"
            return serie + "-" + cc;
        },
        enumerable: false,
        configurable: true
    });
    PolizaAjusteComponent.prototype.loadPolizaOrigen = function () {
        var _this = this;
        this.api.getPolizaConMovimientos(this.idPolizaOrigen).subscribe({
            next: function (res) {
                _this.polizaOrigen = res;
                console.log('Póliza origen:', _this.polizaOrigen);
                if (!_this.polizaOrigen || !_this.polizaOrigen.movimientos) {
                    _this.errorMessage = 'La póliza de origen no contiene movimientos.';
                    return;
                }
                _this.encabezadoForm.patchValue({
                    folio: "AJ-" + _this.polizaOrigen.folio,
                    concepto: "Ajuste (reverso) a la p\u00F3liza " + _this.polizaOrigen.folio
                });
                _this.movimientos.clear();
                // LÓGICA CONTABLE CORRECTA DE AJUSTE (REVERSO):
                //   - Misma cuenta
                //   - Mismo monto en VALOR ABSOLUTO (positivo)
                //   - Operación invertida: Cargo -> Abono, Abono -> Cargo
                _this.polizaOrigen.movimientos.forEach(function (m) {
                    var _a, _b, _c, _d, _e;
                    var operacionOriginal = String(m.operacion); // '0' o '1'
                    var montoOriginal = Number(m.monto) || 0;
                    var montoAjuste = Math.abs(montoOriginal); // siempre positivo
                    _this.movimientos.push(_this.fb.group({
                        id_cuenta: [m.id_cuenta || ''],
                        operacion: [operacionOriginal === '0' ? '1' : '0'],
                        monto: [montoAjuste],
                        cliente: [(_a = m.cliente) !== null && _a !== void 0 ? _a : ''],
                        cc: [(_b = m.cc) !== null && _b !== void 0 ? _b : null],
                        fecha: [(_c = m.fecha) !== null && _c !== void 0 ? _c : new Date().toISOString().slice(0, 10)],
                        ref_serie_venta: [(_d = m.ref_serie_venta) !== null && _d !== void 0 ? _d : ''],
                        uuid: [(_e = m.uuid) !== null && _e !== void 0 ? _e : null]
                    }));
                });
                _this.calcularTotales();
            },
            error: function (err) {
                console.error(err);
                _this.errorMessage = 'Error al cargar la póliza de origen';
            }
        });
    };
    PolizaAjusteComponent.prototype.calcularTotales = function () {
        var valores = this.movimientos.value;
        this.totalCargos = valores
            .filter(function (m) { return m.operacion === '0'; }) // cargos
            .reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        this.totalAbonos = valores
            .filter(function (m) { return m.operacion === '1'; }) // abonos
            .reduce(function (s, m) { return s + (Number(m.monto) || 0); }, 0);
        this.diferencia = this.totalCargos - this.totalAbonos;
    };
    PolizaAjusteComponent.prototype.guardarAjuste = function () {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (this.encabezadoForm.invalid) {
            this.errorMessage = 'Faltan datos para crear la póliza de ajuste';
            return;
        }
        // Movimientos limpios: solo con cuenta y monto != 0
        var movimientosLimpios = this.movimientos.value
            .map(function (m) { return (__assign(__assign({}, m), { monto: Math.abs(Number(m.monto) || 0) })); })
            .filter(function (m) { return m.id_cuenta && m.monto !== 0; });
        if (!movimientosLimpios.length) {
            this.errorMessage = 'Debes capturar al menos un movimiento con monto distinto de cero.';
            return;
        }
        // Validación: debe cuadrar
        if (this.diferencia !== 0) {
            this.errorMessage = "La p\u00F3liza no est\u00E1 cuadrada, diferencia: " + this.diferencia;
            return;
        }
        var idUsuarioFinal = (_f = (_c = (_a = this.currentUserId) !== null && _a !== void 0 ? _a : (_b = this.polizaOrigen) === null || _b === void 0 ? void 0 : _b.id_usuario) !== null && _c !== void 0 ? _c : (_e = (_d = this.polizaOrigen) === null || _d === void 0 ? void 0 : _d.creador) === null || _e === void 0 ? void 0 : _e.id_usuario) !== null && _f !== void 0 ? _f : null;
        if (!idUsuarioFinal) {
            this.errorMessage = 'No se pudo determinar el usuario actual.';
            return;
        }
        this.loading = true;
        var payload = {
            id_poliza_origen: this.idPolizaOrigen,
            id_tipopoliza: 5,
            id_usuario: idUsuarioFinal,
            id_periodo: (_h = (_g = this.polizaOrigen) === null || _g === void 0 ? void 0 : _g.id_periodo) !== null && _h !== void 0 ? _h : (_k = (_j = this.polizaOrigen) === null || _j === void 0 ? void 0 : _j.periodo) === null || _k === void 0 ? void 0 : _k.id_periodo,
            id_centro: (_q = (_m = (_l = this.polizaOrigen) === null || _l === void 0 ? void 0 : _l.id_centro) !== null && _m !== void 0 ? _m : (_p = (_o = this.polizaOrigen) === null || _o === void 0 ? void 0 : _o.centro) === null || _p === void 0 ? void 0 : _p.id_centro) !== null && _q !== void 0 ? _q : null,
            folio: this.encabezadoForm.value.folio,
            concepto: this.encabezadoForm.value.concepto,
            movimientos: movimientosLimpios
        };
        console.log('Payload para crear ajuste:', payload);
        this.api.createPolizaAjuste(payload).subscribe({
            next: function () {
                _this.router.navigate(['/poliza-home']);
            },
            error: function (err) {
                var _a;
                console.error(err);
                _this.errorMessage =
                    ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Error al crear la póliza de ajuste';
            },
            complete: function () { return (_this.loading = false); }
        });
    };
    PolizaAjusteComponent.prototype.agregarMovimientoVacio = function () {
        this.movimientos.push(this.fb.group({
            id_cuenta: [null],
            operacion: ['0'],
            monto: [0],
            cliente: [''],
            cc: [null],
            fecha: [new Date().toISOString().slice(0, 10)],
            ref_serie_venta: [''],
            uuid: [null]
        }));
        this.calcularTotales();
    };
    PolizaAjusteComponent.prototype.eliminarMovimiento = function (i) {
        if (i < 0 || i >= this.movimientos.length)
            return;
        this.movimientos.removeAt(i);
        this.calcularTotales();
    };
    // ==== Catálogos (reutilizado de PolizasComponent, versión reducida) ====
    PolizaAjusteComponent.prototype.normalizeList = function (res) {
        var _a, _b, _c, _d;
        return Array.isArray(res)
            ? res
            : ((_d = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.rows) !== null && _a !== void 0 ? _a : res === null || res === void 0 ? void 0 : res.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.items) !== null && _c !== void 0 ? _c : res) !== null && _d !== void 0 ? _d : []);
    };
    PolizaAjusteComponent.prototype.cargarCuentas = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCuentas ||
            svc.listCuentas ||
            svc.getCatalogoCuentas ||
            svc.listCatalogoCuentas ||
            svc.getPlanCuentas ||
            svc.listPlanCuentas;
        if (typeof fn !== 'function') {
            console.warn('No existe método de API para Cuentas; usando vacío.');
            this.cuentas = [];
            this.cuentasMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                var parsed = (items || [])
                    .map(function (x) {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    var id = Number((_b = (_a = x.id_cuenta) !== null && _a !== void 0 ? _a : x.id) !== null && _b !== void 0 ? _b : x.ID);
                    var codigo = String((_e = (_d = (_c = x.codigo) !== null && _c !== void 0 ? _c : x.clave) !== null && _d !== void 0 ? _d : x.CODIGO) !== null && _e !== void 0 ? _e : '').trim();
                    var nombre = String((_h = (_g = (_f = x.nombre) !== null && _f !== void 0 ? _f : x.descripcion) !== null && _g !== void 0 ? _g : x.NOMBRE) !== null && _h !== void 0 ? _h : '').trim();
                    return { id_cuenta: id, codigo: codigo, nombre: nombre };
                })
                    .filter(function (c) { return Number.isFinite(c.id_cuenta); });
                parsed.sort(function (a, b) {
                    return a.codigo.localeCompare(b.codigo, undefined, { numeric: true });
                });
                _this.cuentas = parsed;
                _this.cuentasMap = new Map(parsed.map(function (c) { return [c.id_cuenta, { codigo: c.codigo, nombre: c.nombre }]; }));
            },
            error: function (err) {
                console.error('Cuentas:', err);
                _this.cuentas = [];
                _this.cuentasMap.clear();
            }
        });
    };
    PolizaAjusteComponent.prototype.cargarCentrosCosto = function () {
        var _this = this;
        var svc = this.api;
        var fn = svc.getCentrosCosto || svc.listCentrosCosto ||
            svc.getCentroCostos || svc.listCentroCostos ||
            svc.getCentrosDeCosto || svc.listCentrosDeCosto ||
            svc.getCentros;
        if (typeof fn !== 'function') {
            console.warn('No existe método de API para Centros de Costo; usando vacío.');
            this.centrosCosto = [];
            this.centrosCostoMap.clear();
            return;
        }
        fn.call(this.api).subscribe({
            next: function (r) {
                var items = _this.normalizeList(r);
                _this.centrosCosto = (items || [])
                    .map(function (x) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    var id = Number((_c = (_b = (_a = x.id_centro) !== null && _a !== void 0 ? _a : x.id_centrocosto) !== null && _b !== void 0 ? _b : x.id) !== null && _c !== void 0 ? _c : x.ID);
                    var serie = String((_f = (_e = (_d = x.serie_venta) !== null && _d !== void 0 ? _d : x.serie) !== null && _e !== void 0 ? _e : x.codigo) !== null && _f !== void 0 ? _f : '').trim();
                    var nom = String((_j = (_h = (_g = x.nombre) !== null && _g !== void 0 ? _g : x.descripcion) !== null && _h !== void 0 ? _h : x.NOMBRE) !== null && _j !== void 0 ? _j : "CC " + id).trim();
                    var etiqueta = serie
                        ? serie + " \u2014 " + nom
                        : nom;
                    return {
                        id_centrocosto: id,
                        nombre: etiqueta,
                        serie_venta: serie || null
                    };
                })
                    .filter(function (cc) { return Number.isFinite(cc.id_centrocosto); });
                _this.centrosCostoMap = new Map(_this.centrosCosto.map(function (cc) { return [cc.id_centrocosto, cc]; }));
            },
            error: function (err) {
                console.error('Centros de Costo:', err);
                _this.centrosCosto = [];
                _this.centrosCostoMap.clear();
            }
        });
    };
    // ==== Labels bonitos ====
    PolizaAjusteComponent.prototype.labelCuenta = function (id_cuenta) {
        if (!id_cuenta)
            return '—';
        var c = this.cuentasMap.get(Number(id_cuenta));
        if (!c)
            return "Cuenta " + id_cuenta;
        return c.codigo + " \u2014 " + c.nombre;
    };
    PolizaAjusteComponent.prototype.labelCentroCosto = function (ccId) {
        var _a, _b, _c;
        if (!ccId)
            return '—';
        var cc = this.centrosCostoMap.get(Number(ccId));
        if (!cc)
            return "CC " + ccId;
        // obtenemos el nombre crudo
        var raw = ((_a = cc.nombre) !== null && _a !== void 0 ? _a : '').toString().trim();
        // Formato esperado: A0_A0_CC300, A0_CC300, C1_C1_CC10, etc.
        var partes = raw.includes('_')
            ? raw.split('_').filter(Boolean)
            : [raw];
        var serie = (_b = partes[0]) !== null && _b !== void 0 ? _b : '';
        var ultimo = (_c = partes[partes.length - 1]) !== null && _c !== void 0 ? _c : '';
        // Resultado final: A0-CC300
        if (serie && ultimo) {
            return "" + serie;
        }
        return raw;
    };
    // ==== XML por movimiento ====
    PolizaAjusteComponent.prototype.triggerXmlPickerForMovimiento = function (input, index) {
        this.xmlMovimientoIndex = index;
        this.uploadXmlError = '';
        this.selectedXmlName = '';
        input.value = '';
        input.click();
    };
    PolizaAjusteComponent.prototype.onXmlPickedForMovimiento = function (event, index) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var input = event.target;
        var file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        // Validar que sea XML
        var isXml = file.type === 'text/xml' ||
            file.type === 'application/xml' ||
            /\.xml$/i.test(file.name);
        if (!isXml) {
            this.uploadXmlError = 'El archivo debe ser .xml';
            this.showToast({
                type: 'warning',
                title: 'Archivo no válido',
                message: this.uploadXmlError
            });
            input.value = '';
            return;
        }
        // Tamaño máximo 1 MB (igual que en PolizasComponent)
        if (file.size > 1 * 1024 * 1024) {
            this.uploadXmlError = 'El XML excede el tamaño permitido (1 MB).';
            this.showToast({
                type: 'warning',
                title: 'Archivo pesado',
                message: this.uploadXmlError
            });
            input.value = '';
            return;
        }
        this.uploadingXml = true;
        this.selectedXmlName = file.name;
        this.uploadXmlError = '';
        var ctx = {
            folio: this.encabezadoForm.value.folio,
            id_periodo: (_c = (_b = this.polizaOrigen) === null || _b === void 0 ? void 0 : _b.id_periodo) !== null && _c !== void 0 ? _c : (_e = (_d = this.polizaOrigen) === null || _d === void 0 ? void 0 : _d.periodo) === null || _e === void 0 ? void 0 : _e.id_periodo,
            id_centro: (_k = (_g = (_f = this.polizaOrigen) === null || _f === void 0 ? void 0 : _f.id_centro) !== null && _g !== void 0 ? _g : (_j = (_h = this.polizaOrigen) === null || _h === void 0 ? void 0 : _h.centro) === null || _j === void 0 ? void 0 : _j.id_centro) !== null && _k !== void 0 ? _k : null,
            id_tipopoliza: 5
        };
        this.api.uploadCfdiXml(file, ctx).subscribe({
            next: function (res) {
                var uuid = (res === null || res === void 0 ? void 0 : res.uuid) || (res === null || res === void 0 ? void 0 : res.UUID) || '';
                if (uuid && _this.movimientos.at(index)) {
                    _this.movimientos.at(index).patchValue({ uuid: uuid });
                    _this.showToast({
                        type: 'success',
                        title: 'XML asociado',
                        message: "UUID " + uuid + " vinculado al movimiento " + (index + 1)
                    });
                }
                else {
                    _this.showToast({
                        type: 'warning',
                        title: 'Aviso',
                        message: 'El servidor no devolvió UUID.'
                    });
                }
            },
            error: function (err) {
                var _a, _b;
                console.error('Error al subir XML:', err);
                _this.uploadXmlError = (_b = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : 'Error al subir el XML.';
                _this.showToast({
                    type: 'warning',
                    title: 'Aviso',
                    message: _this.uploadXmlError
                });
            },
            complete: function () {
                _this.uploadingXml = false;
                if (input)
                    input.value = '';
            }
        });
    };
    // ==== Modales ====
    // Modal de Selección de Cuenta
    PolizaAjusteComponent.prototype.abrirModalCuentas = function (index) {
        this.indiceMovimientoSeleccionado = index;
        this.modalCuentasAbierto = true;
    };
    PolizaAjusteComponent.prototype.cerrarModalCuentas = function () {
        this.modalCuentasAbierto = false;
        this.indiceMovimientoSeleccionado = null;
    };
    PolizaAjusteComponent.prototype.onCuentaSeleccionadaModal = function (cuenta) {
        if (this.indiceMovimientoSeleccionado !== null) {
            this.movimientos.controls[this.indiceMovimientoSeleccionado].patchValue({
                id_cuenta: cuenta.id_cuenta
            });
        }
        this.cerrarModalCuentas();
    };
    // Modal de Centro de Costo
    PolizaAjusteComponent.prototype.abrirModalCentroCosto = function (index) {
        this.indiceMovimientoSeleccionado = index;
        this.modalCentroCostoAbierto = true;
    };
    PolizaAjusteComponent.prototype.cerrarModalCentroCosto = function () {
        this.modalCentroCostoAbierto = false;
        this.indiceMovimientoSeleccionado = null;
    };
    PolizaAjusteComponent.prototype.onCentroCostoSeleccionadoModal = function (cc) {
        if (this.indiceMovimientoSeleccionado !== null) {
            this.movimientos.controls[this.indiceMovimientoSeleccionado].patchValue({
                cc: cc.id_centrocosto
            });
        }
        this.cerrarModalCentroCosto();
    };
    // ==== Toast helper ====
    PolizaAjusteComponent.prototype.showToast = function (opts) {
        var _a, _b;
        this.toast.message = opts.message;
        this.toast.type = (_a = opts.type) !== null && _a !== void 0 ? _a : 'info';
        this.toast.title = (_b = opts.title) !== null && _b !== void 0 ? _b : '';
        if (opts.autoCloseMs != null)
            this.toast.autoCloseMs = opts.autoCloseMs;
        if (opts.position)
            this.toast.position = opts.position;
        this.toast.open = true;
    };
    PolizaAjusteComponent.prototype.onToastClosed = function () {
        this.toast.open = false;
    };
    // Sidebar Toggle
    PolizaAjusteComponent.prototype.onSidebarToggle = function (v) {
        this.sidebarOpen = v;
    };
    PolizaAjusteComponent.prototype.volver = function () {
        this.router.navigate(['/poliza-home']);
    };
    PolizaAjusteComponent = __decorate([
        core_1.Component({
            selector: 'app-poliza-ajuste',
            templateUrl: './poliza-ajuste.component.html',
            styleUrls: ['./poliza-ajuste.component.scss'],
            standalone: true,
            imports: [
                common_1.CommonModule,
                forms_1.ReactiveFormsModule,
                forms_1.FormsModule,
                polizas_layout_component_1.PolizasLayoutComponent,
                toast_message_component_component_1.ToastMessageComponent,
                modal_seleccion_cuenta_component_1.ModalSeleccionCuentaComponent,
            ]
        })
    ], PolizaAjusteComponent);
    return PolizaAjusteComponent;
}());
exports.PolizaAjusteComponent = PolizaAjusteComponent;
