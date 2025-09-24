import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate, CanMatch {
    constructor(private auth: AuthService, private router: Router) { }

    private check(rolesRequeridos: UserRole[] | undefined): boolean {
        if (!rolesRequeridos?.length) return true;
        const ok = this.auth.hasAnyRole(rolesRequeridos);
        if (!ok) {
            this.router.navigate(['/acceso-restringido'], { state: { reason: 'Esta ruta requiere alguno de los roles: ' + rolesRequeridos.join(', ') } });
        }
        return ok;
    }

    canActivate(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
        const roles = route.data?.['roles'] as UserRole[] | undefined;
        return this.check(roles);
    }

    canMatch(route: Route, _segments: UrlSegment[]): boolean {
        const roles = route.data?.['roles'] as UserRole[] | undefined;
        return this.check(roles);
    }
}
