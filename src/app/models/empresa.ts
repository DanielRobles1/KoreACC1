export interface Empresa {
    id_empresa: number;
    razon_social: string;
    rfc: string; 
    domicilio_fiscal: string;
    telefono: string;
    correo_contacto: string;
    created_at?: string;
    updated_at?: string;
}