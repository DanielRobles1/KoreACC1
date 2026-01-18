export interface Cuenta {
    id: number;
    codigo: string;
    nombre: string;
    ctaMayor: boolean;
    parentId: number | null;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;

    padreCodigo?: string | null;
    padreNombre?: string | null;
    icon?: string;
}