export type BalanceNivel = 'DETALLE' | 'SUBTOTAL' | 'TOTAL';

export interface BalanceRow {
    nivel: BalanceNivel;
    tipo: 'ACTIVO' | 'PASIVO' | 'CAPITAL' | null;
    codigo: string | null; 
    nombre: string | null;  
    saldo_deudor: string | number; 
    saldo_acreedor: string | number;
}

export interface BalanceResp {
    ok: boolean;
    count: number;
    data: BalanceRow[];
}