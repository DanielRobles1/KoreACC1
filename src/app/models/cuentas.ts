export type CuentaTipo = 'ACTIVO' | 'PASIVO' | 'CAPITAL' | 'INGRESO' | 'GASTO';
export type Naturaleza = 'DEUDORA' | 'ACREEDORA';

export interface Cuenta {
    id: number;
    codigo: string;
    nombre: string;
    ctaMayor: boolean;
    posteable: boolean;
    tipo: CuentaTipo;
    naturaleza: Naturaleza;
    parentId: number | null;
    deleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    padreCodigo?: string | null;
    padreNombre?: string | null;
    icon?: string;
}

export interface CuentaNode {
    data: Cuenta;
    children: CuentaNode[];
    expanded: boolean;
}