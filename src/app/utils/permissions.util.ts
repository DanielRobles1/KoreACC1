import { Subscription } from 'rxjs';

export type PermFlags = {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
};

export type PermKeys = {
    create: string;
    edit: string;
    delete: string;
};

export type ToastLike = {
    toastOk: (msg: string) => void;
    toastWarn: (msg: string) => void;
    toastError: (msg: string, err?: any) => void;
};

export type AuthLike = {
    hasPermission: (p: string) => boolean;
    permissionsChanged$?: any;
};

export type WsLike = {
    on: (event: string, cb: (...args: any[]) => void) => (() => void) | { unsubscribe: () => void };
};

export type PermissionWatcherOptions = {
    keys: PermKeys;
    socketEvent?: string | string[];
    contextLabel?: string;
};


export class PermissionWatcher {
    private subs: Subscription[] = [];
    private socketUnsub: (() => void) | { unsubscribe: () => void } | null = null;
    private last: PermFlags | null = null;

    constructor(
        private auth: AuthLike,
        private ws: WsLike | null,
        private toast: ToastLike,
        private apply: (flags: PermFlags) => void,
        private opts: PermissionWatcherOptions
    ) { }

    start() {
        const now = this.compute();
        this.last = now;
        this.apply(now);

        if (this.auth.permissionsChanged$?.subscribe) {
            const s = this.auth.permissionsChanged$.subscribe(() => this.handleChange('Permisos actualizados'));
            this.subs.push(s);
        }

        const evs = this.opts.socketEvent ?? 'permissions:changed';
        if (this.ws) {
            const list = Array.isArray(evs) ? evs : [evs];
            const unsubs: Array<(() => void) | { unsubscribe: () => void }> = [];
            const handler = () => this.handleChange('Permisos actualizados (socket)');

            for (const ev of list) {
                const u = this.ws.on(ev, handler);
                unsubs.push(u);
            }
            this.socketUnsub = () => {
                for (const u of unsubs) {
                    if (typeof u === 'function') u();
                    else if ('unsubscribe' in u) u.unsubscribe();
                }
            };
        }
    }

    stop() {
        this.subs.forEach(s => s.unsubscribe());
        this.subs = [];
        if (this.socketUnsub) {
            if (typeof this.socketUnsub === 'function') this.socketUnsub();
            else if ('unsubscribe' in this.socketUnsub) this.socketUnsub.unsubscribe();
            this.socketUnsub = null;
        }
    }

    private handleChange(origin: string) {
        const prev = this.last ?? { canCreate: false, canEdit: false, canDelete: false };
        const next = this.compute();
        this.last = next;
        this.apply(next);

        const diffMsg = this.diffPerms(prev, next);
        if (diffMsg) {
            const label = this.opts.contextLabel || 'Permisos';
            this.toast.toastOk(`${label}: ${diffMsg}`);
        }
    }

    private compute(): PermFlags {
        const k = this.opts.keys;
        return {
            canCreate: !!this.auth.hasPermission(k.create),
            canEdit: !!this.auth.hasPermission(k.edit),
            canDelete: !!this.auth.hasPermission(k.delete),
        };
    }

    private diffPerms(prev: PermFlags, next: PermFlags): string {
        const parts: string[] = [];
        const fmt = (name: string, p: boolean, n: boolean) => {
            if (p === n) return;
            parts.push(`${name}: ${n ? 'habilitado' : 'deshabilitado'}`);
        };
        fmt('Crear', prev.canCreate, next.canCreate);
        fmt('Editar', prev.canEdit, next.canEdit);
        fmt('Eliminar', prev.canDelete, next.canDelete);
        return parts.join(' · ');
    }
}
