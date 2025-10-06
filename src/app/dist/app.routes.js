"use strict";
exports.__esModule = true;
exports.routes = void 0;
var home_component_1 = require("./pages/home/home.component");
var usuarios_component_1 = require("./pages/usuarios/usuarios/usuarios.component");
var login_component_1 = require("./pages/login/login.component");
var recuperarcontr_component_1 = require("./pages/recuperarcontr/recuperarcontr.component");
var rolesypermisos_component_1 = require("./pages/rolesypermisos/rolesypermisos.component");
var cambiar_password_component_1 = require("./pages/cambiar-password/cambiar-password.component");
var acceso_restringido_component_1 = require("./pages/acceso-restringido/acceso-restringido.component");
var auth_guard_1 = require("./guards/auth.guard");
var permission_guard_1 = require("./guards/permission.guard");
var empresa_component_1 = require("./pages/empresa/empresa.component");
var impuestos_component_1 = require("./pages/impuestos/impuestos.component");
exports.routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: login_component_1.LoginComponent },
    { path: 'login/recuperar-password', component: recuperarcontr_component_1.RecuperarcontrComponent },
    { path: 'cambiar-password', component: cambiar_password_component_1.CambiarPasswordComponent },
    { path: 'acceso-restringido', component: acceso_restringido_component_1.AccesoRestringidoComponent, canActivate: [auth_guard_1.AuthGuard] },
    {
        path: 'home',
        component: home_component_1.HomeComponent,
        canActivate: [auth_guard_1.AuthGuard]
    },
    {
        path: 'usuarios',
        component: usuarios_component_1.UsuariosComponent,
        canActivate: [auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard],
        data: { perms: ['consultar_usuario'] }
    },
    {
        path: 'login/roles',
        component: rolesypermisos_component_1.RolesypermisosComponent,
        canActivate: [auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard],
        data: { perms: ['consultar_rol', 'editar_rol'] }
    },
    {
        path: 'empresa',
        component: empresa_component_1.EmpresaComponent,
        canActivate: [auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard],
        data: { perms: ['consultar_empresa', 'editar_empresa', 'crear_empresa', 'eliminar_empresa'] }
    },
    {
        path: 'impuestos',
        component: impuestos_component_1.ImpuestosComponent,
        canActivate: [auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard],
        data: { perms: ['consultar_empresa'] }
    },
    {
        path: 'catalogos/cuentas',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/catalogocuentas/catalogocuentas.component'); }).then(function (m) { return m.CatalogoCuentasComponent; });
        },
        canActivate: [auth_guard_1.AuthGuard, permission_guard_1.PermissionGuard],
        data: { perms: ['consultar_empresa'] }
    },
    // {
    //   path: 'centros-costo',
    //  component: CatalogCentrosComponent,
    //  canActivate: [AuthGuard, PermissionGuard],
    // data: {perms: ['consultar_empresa']}
    // },
    { path: '**', redirectTo: 'login' }
];
