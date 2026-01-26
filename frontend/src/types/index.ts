// Common Types
export interface PaginationParams {
    limit?: number;
    offset?: number;
}

export interface ApiResponse<T> {
    items: T[];
    hasMore: boolean;
    limit: number;
    offset: number;
    count: number;
    links: Array<{ rel: string; href: string }>;
}

export interface AuditableEntity {
    fecha_creacion?: string;
    creado_por?: string;
    fecha_modificacion?: string;
    modificado_por?: string;
    activo?: string; // 'S' | 'N'
}

// Patient Types
export interface Paciente extends AuditableEntity {
    paciente_id: number;
    numero_historia: string;
    nombre: string;
    apellido: string;
    documento_tipo: string;
    documento_numero: string;
    fecha_nacimiento: string;
    genero: string; // 'M' | 'F' | 'O'
    grupo_sanguineo?: string;
    email?: string;
    telefono_principal?: string;
    telefono_secundario?: string;
    direccion_calle?: string;
    direccion_ciudad?: string;
    codigo_postal?: string;

    // Emergency Contact
    contacto_emergencia_nombre?: string;
    contacto_emergencia_telefono?: string;
    contacto_emergencia_relacion?: string;

    // Medical Info
    alergias?: string;
    medicamentos_actuales?: string;
    enfermedades_cronicas?: string;

    // Location FKs
    departamento_id?: number;
    ciudad_id?: number;
    barrio_id?: number;
    empresa_id?: number;
}

// Form Types (Creating/Updating)
export type PacienteFormData = Omit<Paciente, 'paciente_id' | keyof AuditableEntity>;
