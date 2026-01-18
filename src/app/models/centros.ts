export type UiCentro = {
    id_centro?: number;
    parent_id?: number | null;
    serie_venta: string;
    nombre_centro: string;
    calle: string;
    num_ext: string;
    num_int: string;
    cp: string;
    region: string;
    telefono: string;
    correo: string;
    activo: boolean;
}