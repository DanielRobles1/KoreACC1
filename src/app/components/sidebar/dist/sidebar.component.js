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
exports.SidebarComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var operators_1 = require("rxjs/operators");
var modal_component_1 = require("../modal/modal/modal.component");
var edit_profile_modal_component_1 = require("../edit-profile-modal/edit-profile-modal.component");
var SidebarComponent = /** @class */ (function () {
    function SidebarComponent(auth, router, users, ws) {
        var _this = this;
        this.auth = auth;
        this.router = router;
        this.users = users;
        this.ws = ws;
        /*  SIDEBAR */
        this.open = true;
        this.openChange = new core_1.EventEmitter();
        this.isMobile = false;
        this.user = null;
        this.active = '';
        this.lastOpenMenu = '';
        /*  MENÚS */
        this.reportesOpen = false;
        this.configOpen = false;
        this.usuariosPermisosOpen = false;
        this.catalogosOpen = false;
        this.empresaOpen = false;
        /*   MODALES */
        this.confirmOpen = false;
        this.confirmTitle = '';
        this.confirmMessage = '';
        this.editProfileOpen = false;
        this.tempUser = {};
        this.actionToConfirm = null;
        /* RESPONSIVE */
        this.checkMobile = function () {
            _this.isMobile = window.innerWidth <= 768;
            if (_this.isMobile) {
                _this.open = false;
            }
            else {
                _this.open = true;
            }
            _this.openChange.emit(_this.open);
        };
    }
    SidebarComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.checkMobile();
        window.addEventListener('resize', this.checkMobile);
        /* RESTAURAR MENÚ */
        var saved = localStorage.getItem('sidebarMenu');
        if (saved) {
            this.restoreMenu(saved);
        }
        /* ESCUCHAR RUTAS */
        this.router.events
            .pipe(operators_1.filter(function (e) { return e instanceof router_1.NavigationEnd; }))
            .subscribe(function () {
            if (_this.lastOpenMenu) {
                _this.restoreMenu(_this.lastOpenMenu);
            }
        });
        /* USER */
        this.users.getMe().subscribe({
            next: function (data) {
                var apellidos = (data.apellidos || '').trim();
                var _a = apellidos.split(' '), apellido_p = _a[0], _b = _a[1], apellido_m = _b === void 0 ? '' : _b;
                _this.user = __assign(__assign({}, data), { apellido_p: apellido_p,
                    apellido_m: apellido_m });
            },
            error: function (err) { return console.error(err); }
        });
    };
    SidebarComponent.prototype.toggleSidebar = function () {
        this.open = !this.open;
        this.openChange.emit(this.open);
    };
    /* TOGGLES PRINCIPALES */
    SidebarComponent.prototype.toggleReportes = function () {
        var willOpen = !this.reportesOpen;
        this.closeAll();
        this.reportesOpen = willOpen;
        if (willOpen) {
            this.active = 'reportes';
            this.saveMenuState('reportes');
        }
        else {
            this.clearMenuState();
        }
    };
    SidebarComponent.prototype.toggleConfiguracion = function () {
        var willOpen = !this.configOpen;
        this.closeAll();
        this.configOpen = willOpen;
        if (willOpen) {
            this.active = 'configuracion';
            this.saveMenuState('configuracion');
        }
        else {
            this.clearMenuState();
        }
    };
    /*SUBMENÚS */
    SidebarComponent.prototype.toggleUsuariosPermisos = function () {
        var willOpen = !this.usuariosPermisosOpen;
        this.usuariosPermisosOpen = willOpen;
        this.catalogosOpen = false;
        this.empresaOpen = false;
        if (willOpen) {
            this.active = 'usuarios-permisos';
            this.saveMenuState('usuarios-permisos');
        }
        else {
            this.clearMenuState();
        }
    };
    SidebarComponent.prototype.toggleCatalogos = function () {
        var willOpen = !this.catalogosOpen;
        this.catalogosOpen = willOpen;
        this.usuariosPermisosOpen = false;
        this.empresaOpen = false;
        if (willOpen) {
            this.active = 'catalogos';
            this.saveMenuState('catalogos');
        }
        else {
            this.clearMenuState();
        }
    };
    SidebarComponent.prototype.toggleEmpresa = function () {
        var willOpen = !this.empresaOpen;
        this.empresaOpen = willOpen;
        this.usuariosPermisosOpen = false;
        this.catalogosOpen = false;
        if (willOpen) {
            this.active = 'empresa';
            this.saveMenuState('empresa');
        }
        else {
            this.clearMenuState();
        }
    };
    SidebarComponent.prototype.closeAll = function () {
        this.reportesOpen = false;
        this.configOpen = false;
        this.usuariosPermisosOpen = false;
        this.catalogosOpen = false;
        this.empresaOpen = false;
    };
    SidebarComponent.prototype.restoreMenu = function (menu) {
        this.closeAll();
        switch (menu) {
            case 'reportes':
                this.reportesOpen = true;
                break;
            case 'configuracion':
                this.configOpen = true;
                break;
            case 'usuarios-permisos':
                this.configOpen = true;
                this.usuariosPermisosOpen = true;
                break;
            case 'catalogos':
                this.configOpen = true;
                this.catalogosOpen = true;
                break;
            case 'empresa':
                this.configOpen = true;
                this.empresaOpen = true;
                break;
        }
        this.active = menu;
    };
    SidebarComponent.prototype.saveMenuState = function (menu) {
        this.lastOpenMenu = menu;
        localStorage.setItem('sidebarMenu', menu);
    };
    SidebarComponent.prototype.clearMenuState = function () {
        this.lastOpenMenu = '';
        localStorage.removeItem('sidebarMenu');
    };
    SidebarComponent.prototype.setActive = function (item) {
        this.active = item;
        if (this.isMobile) {
            this.open = false;
            this.openChange.emit(this.open);
        }
    };
    /*  LOGOUT */
    SidebarComponent.prototype.openLogoutConfirm = function () {
        var _this = this;
        this.confirmTitle = 'Cerrar sesión';
        this.confirmMessage = '¿Seguro que deseas cerrar sesión?';
        this.confirmOpen = true;
        this.actionToConfirm = function () { return _this.onLogout(); };
    };
    SidebarComponent.prototype.cancelConfirm = function () {
        this.confirmOpen = false;
        this.actionToConfirm = null;
    };
    SidebarComponent.prototype.closeConfirm = function () {
        this.cancelConfirm();
    };
    SidebarComponent.prototype.confirmProceed = function () {
        if (this.actionToConfirm) {
            this.actionToConfirm();
        }
        this.confirmOpen = false;
        this.actionToConfirm = null;
    };
    SidebarComponent.prototype.onLogout = function () {
        var _this = this;
        localStorage.clear();
        this.ws.disconnect();
        this.auth.logout().subscribe({
            next: function () { return _this.router.navigate(['/login']); },
            error: function () { return _this.router.navigate(['/login']); }
        });
    };
    /*perfil */
    SidebarComponent.prototype.openEditProfile = function () {
        if (this.user) {
            this.tempUser = __assign({}, this.user);
        }
        this.editProfileOpen = true;
    };
    SidebarComponent.prototype.saveProfile = function (updated) {
        var _this = this;
        this.users.updateMe(updated).subscribe({
            next: function (res) {
                _this.user = res.usuario;
                _this.editProfileOpen = false;
            },
            error: function (err) { return console.error(err); }
        });
    };
    SidebarComponent.prototype.closeEditProfile = function () {
        this.editProfileOpen = false;
    };
    SidebarComponent.prototype.ngOnDestroy = function () {
        window.removeEventListener('resize', this.checkMobile);
    };
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "open");
    __decorate([
        core_1.Output()
    ], SidebarComponent.prototype, "openChange");
    SidebarComponent = __decorate([
        core_1.Component({
            selector: 'app-sidebar',
            standalone: true,
            imports: [
                common_1.CommonModule,
                router_1.RouterModule,
                modal_component_1.ModalComponent,
                edit_profile_modal_component_1.EditProfileModalComponent
            ],
            templateUrl: './sidebar.component.html',
            styleUrls: ['./sidebar.component.scss']
        })
    ], SidebarComponent);
    return SidebarComponent;
}());
exports.SidebarComponent = SidebarComponent;
