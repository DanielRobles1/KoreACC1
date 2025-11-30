"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LoginComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var ng_recaptcha_1 = require("ng-recaptcha");
var environment_1 = require("@environments/environment");
var LoginComponent = /** @class */ (function () {
    function LoginComponent(fb, router, auth, ws) {
        this.fb = fb;
        this.router = router;
        this.auth = auth;
        this.ws = ws;
        this.showPassword = false;
        this.recaptchaToken = null;
        this.loading = false;
        this.authError = null;
        this.loginForm = this.fb.group({
            username: ['', forms_1.Validators.required],
            password: [
                '',
                [
                    forms_1.Validators.required,
                    forms_1.Validators.minLength(8),
                ],
            ],
            remember: [false],
            recaptcha: ['', forms_1.Validators.required]
        });
        var savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            this.loginForm.patchValue({
                username: savedUsername,
                remember: true
            });
        }
    }
    LoginComponent.prototype.togglePassword = function () {
        this.showPassword = !this.showPassword;
    };
    LoginComponent.prototype.onRecaptchaResolved = function (token) {
        this.recaptchaToken = token;
        this.loginForm.patchValue({ recaptcha: token !== null && token !== void 0 ? token : '' });
    };
    LoginComponent.prototype.submit = function () {
        var _this = this;
        this.authError = null;
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        var _a = this.loginForm.value, username = _a.username, password = _a.password, remember = _a.remember;
        if (remember) {
            localStorage.setItem('rememberedUsername', username);
        }
        else {
            localStorage.removeItem('rememberedUsername');
        }
        this.loading = true;
        this.auth.login(username, password, this.recaptchaToken).subscribe({
            // 👇 importante: recibir la respuesta
            next: function (resp) {
                var _a, _b, _c;
                _this.loading = false;
                // === Guardar usuario con id_usuario en localStorage ===
                var user = resp === null || resp === void 0 ? void 0 : resp.user;
                if (user) {
                    var usuarioLite = {
                        id_usuario: user.id_usuario,
                        nombre: user.nombre,
                        apellido_p: user.apellido_p,
                        apellido_m: user.apellido_m,
                        apellidos: user.apellido_p + " " + user.apellido_m,
                        correo: user.correo,
                        debe_cambiar_contrasena: user.debe_cambiar_contrasena,
                        roles: (_c = (_a = user.roles) !== null && _a !== void 0 ? _a : (_b = user.Rols) === null || _b === void 0 ? void 0 : _b.map(function (r) { return r.nombre; })) !== null && _c !== void 0 ? _c : []
                    };
                    localStorage.setItem('usuario', JSON.stringify(usuarioLite));
                    console.log('Usuario guardado en localStorage:', usuarioLite);
                }
                // Conectar WS y navegar
                _this.ws.connect();
                _this.router.navigate(['/poliza-home']);
            },
            error: function (err) {
                var _a;
                _this.loading = false;
                if (err.status === 428) {
                    _this.router.navigate(['/cambiar-password'], {
                        state: { token: err.error.token, user: err.error.user }
                    });
                }
                else {
                    _this.authError = ((_a = err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Error de autenticación. Verifica tus credenciales.';
                }
            }
        });
    };
    LoginComponent.prototype.forgotPassword = function () {
        this.router.navigate(['/login/recuperar-password']);
    };
    LoginComponent = __decorate([
        core_1.Component({
            selector: 'app-login',
            standalone: true,
            templateUrl: './login.component.html',
            styleUrls: ['./login.component.scss'],
            imports: [common_1.CommonModule, forms_1.ReactiveFormsModule, router_1.RouterModule, ng_recaptcha_1.RecaptchaModule],
            providers: [
                {
                    provide: ng_recaptcha_1.RECAPTCHA_SETTINGS,
                    useValue: { siteKey: environment_1.environment.recaptchaSiteKey }
                },
            ]
        })
    ], LoginComponent);
    return LoginComponent;
}());
exports.LoginComponent = LoginComponent;
