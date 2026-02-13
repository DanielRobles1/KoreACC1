export type PeriodoTipo =
    | 'SEMANAL'
    | 'QUINCENAL'
    | 'MENSUAL'
    | 'BIMESTRAL'
    | 'TRIMESTRAL'
    | 'SEMESTRAL'
    | 'ANUAL'
    | 'PERSONALIZADO';

export interface UiPeriodo {
    id: number;
    anio: number;
    etiqueta: string;
    tipo_periodo: PeriodoTipo;
    fecha_inicio: string;
    fecha_fin: string;
    estado?: string;
    activo?: boolean;
}

export type ApiPeriodo = UiPeriodo;

export interface GenerarResponse {
    created: number;
    total: number;
    periodos: ApiPeriodo[];
}

export interface PeriodoContableDto {
    id_periodo?: number;
    id_empresa: number;
    id_ejercicio: number;
    tipo_periodo: PeriodoTipo;
    fecha_inicio: string;
    fecha_fin: string;
    periodo_daterange?: any;
    esta_abierto?: boolean;
    etiqueta?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PeriodoQuery {
    id_empresa?: number;
    id_ejercicio?: number;
    tipo_periodo?: PeriodoTipo;
    esta_abierto?: boolean;
    desde?: string;
    hasta?: string;
}