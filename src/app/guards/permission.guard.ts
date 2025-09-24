import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate, CanMatch {
    constructor(private auth: AuthService, private router: Router) { }

    private check(permsRequeridos: string[] | undefined): boolean {
        if (!permsRequeridos?.length) return true;
        const ok = this.auth.hasAnyPermission(permsRequeridos);
        if (!ok) {
            this.router.navigate(['/acceso-restringido'], { state: { reason: 'Esta ruta requiere alguno de los permisos: ' + permsRequeridos.join(', ') } });
        }
        return ok;
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
        const perms = route.data?.['perms'] as string[] | undefined;
        return this.check(perms);
    }

    canMatch(route: Route, _segments: UrlSegment[]): boolean {
        const perms = route.data?.['perms'] as string[] | undefined;
        return this.check(perms);
    }
}
