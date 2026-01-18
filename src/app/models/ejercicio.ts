export interface EjercicioContableDto {
    id_ejercicio?: number;
    id_empresa: number;
    anio: number;
    fecha_inicio: string;
    fecha_fin: string;
    esta_abierto: boolean;
}

export interface EjercicioFilters {
    id_empresa?: number;
    anio?: number;
    esta_abierto?: boolean;
    desde?: string;
    hasta?: string;
}