export type JwtPayloadBase = {
    exp?: number;
    iat?: number;
    sub?: string;
    [k: string]: any;
};

export type UsuarioSesion = {
    id_usuario: number;
    nombre?: string | null;
    email?: string | null;
    roles?: string[] | null;
    perms?: string[] | null;
    raw?: any;
    [k: string]: any;
};

export type AuthSession = {
    token: string;
    user: UsuarioSesion;
};
