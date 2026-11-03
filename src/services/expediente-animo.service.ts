/**
 * @file expediente-animo.service.ts
 * @description Acceso a datos EXCLUSIVO del expediente de estado de ánimo: carga del expediente.
 * Las escrituras (seguimiento, puntajes, TMS, consentimiento, eliminar) son las compartidas de
 * expediente.service.ts / expediente.actions.ts.
 */

import { supabase } from "../lib/supabase";
import { getUrlConsentimientoFirmado, ordenarSeguimientos } from "./expediente.service";


export interface PacienteAnimo {
    id: number;
    created_at: string;
    nombre: string;
    registrado_por: string | null;
    fecha_nacimiento: string | null;
    edad: number | null;
    tms_habilitado: boolean;
    tms_consentimiento_url: string | null;
    trastornos_animo: string[] | null;
    farmacos_nombres: string[] | null;
    pacientes_sintomas: any[];
    pacientes_puntajes_extra: any[];
    pacientes_seguimiento: any[];
    tms_sesiones: any[];
    [campo: string]: any;
}

export interface ExpedienteAnimo {
    paciente: PacienteAnimo;
    sesionesTms: any[];
    ultimaConfigTms: Record<string, any>;
    urlConsentimientoFirmado: string | null;
}

export async function getExpedienteAnimo(id: string): Promise<ExpedienteAnimo | null> {
    const { data, error } = await supabase
        .from("pacientes")
        .select(
            `
            id, created_at, nombre, registrado_por, fecha_nacimiento, edad, telefono, genero, ocupacion, escolaridad, referencia,
            acompanante_nombre, acompanante_telefono, acompanante_parentesco,
            referido_por_nombre, referido_por_telefono, referido_por_correo,
            motivo, antecedentes,
            ejercicio, horas_ejercicio, alcohol, cervezas_semana, fuma, cigarros_semana, cafe, tazas_cafe_semana,
            ideacion_suicida, ideacion_suicida_desc, planeacion_suicida, planeacion_suicida_desc, intento_suicida, intento_suicida_desc,
            trastornos_animo,
            farmacos_nombres, farmacos_dosis, farmacos_motivos, farmacos_frecuencias, farmacos_tiempos,
            tms_habilitado, tms_consentimiento_url,
            hamilton_d_pre, hamilton_d_inter, hamilton_d_post,
            hamilton_a_pre, hamilton_a_inter, hamilton_a_post,
            isi_pre, isi_inter, isi_post,
            beck_pre, beck_inter, beck_post,
            banfe_pre, banfe_inter, banfe_post,
            bai_pre, bai_inter, bai_post,
            pacientes_sintomas(*),
            pacientes_puntajes_extra(*),
            pacientes_seguimiento(*),
            tms_sesiones(*)
        `,
        )
        .eq("id", id)
        .order("created_at", { referencedTable: "tms_sesiones", ascending: false })
        .single();

    if (error || !data) return null;

    const paciente = data as unknown as PacienteAnimo;
    paciente.pacientes_seguimiento = ordenarSeguimientos(paciente.pacientes_seguimiento);

    const sesionesTms = paciente.tms_sesiones ?? [];

    return {
        paciente,
        sesionesTms,
        ultimaConfigTms: sesionesTms[0] ?? {},
        urlConsentimientoFirmado: await getUrlConsentimientoFirmado(paciente.tms_consentimiento_url),
    };
}
