export interface BalanzaRow {
    codigo: string;
    nombre: string;
    saldo_inicial_deudor: string;
    saldo_inicial_acreedor: string;
    cargos: string;
    abonos: string;
    saldo_final_deudor: string;
    saldo_final_acreedor: string;
}

export interface BalanzaResp {
    ok: boolean;
    count: number;
    data: BalanzaRow[];
}