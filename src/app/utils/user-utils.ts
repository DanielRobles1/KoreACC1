import { UsuarioSesion } from "@app/models/auth";

export function toUserId(u: any): number | null {
    const v = u?.id_usuario ?? u?.id ?? u?.userId;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export function normalizeUser(u: any): UsuarioSesion | null {
    const id = toUserId(u);
    if (!id) return null;
    return {
        ...u,
        id_usuario: id,
        nombre: u?.nombre ?? u?.name ?? null,
        email: u?.email ?? null,
    };
}