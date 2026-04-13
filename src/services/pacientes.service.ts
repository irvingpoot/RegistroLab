/**
 * @file pacientes.service.ts
 * @description Capa de acceso a datos para el listado de pacientes.
 * Cubre la consulta paginada con búsqueda por nombre y filtros clínicos.
 */

import { supabase } from "../lib/supabase";

export interface PacienteListado {
    id: number;
    nombre: string;
    tipo_paciente: "sueno" | "animo" | null;
    edad: number | null;
    referencia: string | null;
    registrado_por: string | null;
    created_at: string;
    ultimo_seguimiento_por: string | null;
    fecha_ultimo_seguimiento: string | null;
}

export interface ResultadoPacientes {
    pacientes: PacienteListado[];
    count: number;
}

export async function getPacientes(params: {
    busqueda: string;
    filtroSueno: string;
    filtroAnimo: string;
    page: number;
    pageSize: number;
}): Promise<ResultadoPacientes> {
    const { busqueda, filtroSueno, filtroAnimo, page, pageSize } = params;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from("pacientes")
        .select(`
            id,
            nombre,
            tipo_paciente,
            edad,
            referencia,
            registrado_por,
            created_at,
            pacientes_seguimiento ( registrado_por, fecha, observacion )
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .order("fecha", { ascending: false, referencedTable: "pacientes_seguimiento" })
        .limit(1, { referencedTable: "pacientes_seguimiento" });

    if (busqueda) query = query.ilike("nombre", `%${busqueda}%`);
    if (filtroSueno) query = query.eq("tipo_paciente", "sueno").contains("alteracion_sueno", [filtroSueno]);
    else if (filtroAnimo) query = query.eq("tipo_paciente", "animo").contains("trastornos_animo", [filtroAnimo]);

    const { data, count, error } = await query.range(from, to);

    if (error) console.error("getPacientes:", error);

    const pacientes: PacienteListado[] = (data ?? []).map((p: any) => {
        const ultimo = p.pacientes_seguimiento?.[0] ?? null;
        return {
            ...p,
            ultimo_seguimiento_por:   ultimo?.registrado_por ?? null,
            fecha_ultimo_seguimiento: ultimo?.fecha          ?? null,
        };
    });

    return { pacientes, count: count ?? 0 };
}