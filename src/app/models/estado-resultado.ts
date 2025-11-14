export interface EstadoResultadosResponse {
    ok: boolean;
    data: EstadoResultadosData;
}

export interface EstadoResultadosData {
    resumen: EstadoResultadosResumen;
    detalle: EstadoResultadosDetalleItem[];
}

export interface EstadoResultadosResumen {
    ingresos: number;
    costos: number;
    utilidad_bruta: number;
    gastos_operacion: number;
    utilidad_neta: number;
}

export interface EstadoResultadosDetalleItem {
    codigo: string;
    nombre: string;
    tipo_er: 'INGRESO' | 'COSTO' | 'GASTO' | 'OTRO';
    naturaleza: 'DEUDORA' | 'ACREEDORA';
    cargos_per: number | string;
    abonos_per: number | string;
    importe: number | string;
}
