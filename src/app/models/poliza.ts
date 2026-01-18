export interface Movimiento {
    id_cuenta: number | null;
    ref_serie_venta?: string;
    operacion?: number | string; 
    monto?: null | number;
    cliente?: string;
    fecha?: string;
    cc?: number | null;
    uuid?: null | string;
    id_poliza?: number;
    includeMovimientos?: boolean;
}

export interface Poliza {
    id_poliza: number;
    id_tipopoliza: number;
    id_periodo: number;
    id_usuario: number;
    id_centro: number;
    folio: string;
    concepto: string;
    movimientos: Movimiento[];
}

export interface CfdiRow {
    uuid: string;
    folio?: string | null;
    fecha?: string | null;
    total?: number | string | null;
}

/** ===== Tipos para Tipo de Póliza ===== */
export type NaturalezaTP = 'ingreso' | 'egreso' | 'diario' | 'apertura' | 'cierre';

export interface TipoPolizaCreate {
    naturaleza: NaturalezaTP;
    descripcion: string;
}

export interface TipoPoliza {
    id_tipopoliza: number;
    naturaleza: NaturalezaTP;
    descripcion: string;
    created_at?: string;
    updated_at?: string;
}