/**
 * @file expediente-sueno.service.ts
 * @description Acceso a datos EXCLUSIVO del expediente de sueño:
 * carga del expediente, noches de poligrafía y PSQI con horas del estudio.
 */

import { supabase } from "../lib/supabase";
import { calcularpsqi } from "../utils/calculos";
import { esFase, type Fase } from "../data/fases";
import {
    getUrlConsentimientoFirmado,
    ordenarSeguimientos,
    type DbError,
    type ResultadoDb,
} from "./expediente.service";

export interface NocheSueno {
    id: number;
    created_at: string;
    fase: Fase;
    duracion_registro: string | null;
    duracion_evaluacion: string | null;
    [campo: string]: any;
}

export interface RespuestaResumen {
    id: number;
    cuestionario: string;
    fase: Fase;
    updated_at: string | null;
}

export interface PacienteSueno {
    id: number;
    nombre: string;
    created_at: string;
    registrado_por: string | null;
    fecha_nacimiento: string | null;
    edad: number | null;
    token_cuestionarios: string;
    tms_habilitado: boolean;
    tms_consentimiento_url: string | null;
    pacientes_sintomas: any[];
    pacientes_puntajes_extra: any[];
    pacientes_seguimiento: any[];
    respuestas_cuestionarios: RespuestaResumen[];
    tms_sesiones: any[];
    pacientes_reportes_sueno: NocheSueno[];
    [campo: string]: any;
}

export interface ExpedienteSueno {
    paciente: PacienteSueno;
    reportesNoches: NocheSueno[];
    sesionesTms: any[];
    ultimaConfigTms: Record<string, any>;
    urlConsentimientoFirmado: string | null;
}

export async function getExpedienteSueno(id: string): Promise<ExpedienteSueno | null> {
    const { data, error } = await supabase
        .from("pacientes")
        .select(
            "*, pacientes_sintomas(*), pacientes_puntajes_extra(*), pacientes_seguimiento(*), respuestas_cuestionarios(id, cuestionario, fase, updated_at), tms_sesiones(*), pacientes_reportes_sueno(*)",
        )
        .eq("id", id)
        .order("fecha_aplicacion", { referencedTable: "tms_sesiones", ascending: false })
        .single();

    if (error || !data) return null;

    const paciente = data as PacienteSueno;
    paciente.pacientes_seguimiento = ordenarSeguimientos(paciente.pacientes_seguimiento);

    const reportesNoches = (paciente.pacientes_reportes_sueno ?? [])
        .slice()
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const sesionesTms = paciente.tms_sesiones ?? [];

    return {
        paciente,
        reportesNoches,
        sesionesTms,
        ultimaConfigTms: sesionesTms[0] ?? {},
        urlConsentimientoFirmado: await getUrlConsentimientoFirmado(paciente.tms_consentimiento_url),
    };
}


export interface RespuestaCuestionario {
    updated_at: string | null;
    datos: Record<string, any>;
}

export async function getRespuestaCuestionario(params: {
    pacienteId: string;
    cuestionario: string;
    fase: Fase;
}): Promise<{ respuesta: RespuestaCuestionario | null; error: DbError }> {
    const { data, error } = await supabase
        .from("respuestas_cuestionarios")
        .select("updated_at, datos")
        .eq("paciente_id", params.pacienteId)
        .eq("cuestionario", params.cuestionario)
        .eq("fase", params.fase)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    return { respuesta: (data as RespuestaCuestionario | null) ?? null, error };
}


export type CamposNoche = Record<string, number | string | null>;

export async function registrarNoche(pacienteId: string, campos: CamposNoche): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("pacientes_reportes_sueno")
        .insert({ paciente_id: pacienteId, ...campos });
    return { error };
}

export async function editarNoche(idNoche: string, campos: CamposNoche): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("pacientes_reportes_sueno")
        .update(campos)
        .eq("id", idNoche);
    return { error };
}

export async function eliminarNoche(idNoche: string): Promise<ResultadoDb> {
    const { error } = await supabase.from("pacientes_reportes_sueno").delete().eq("id", idNoche);
    return { error };
}

export async function updatePsqiEstudio(params: {
    pacienteId: string;
    fase: string;
    horas: number;
}): Promise<void> {
    const { pacienteId, fase, horas } = params;

    if (!esFase(fase)) throw new Error("Fase inválida.");

    const { data: resp, error: findError } = await supabase
        .from("respuestas_cuestionarios")
        .select("*")
        .eq("paciente_id", pacienteId)
        .eq("cuestionario", "psqi")
        .eq("fase", fase)
        .single();

    if (findError || !resp) {
        throw new Error("El paciente aún no ha contestado el cuestionario para esta fase.");
    }

    const datos = resp.datos;
    datos.horas_sueno_estudio = horas;

    const resultado = calcularpsqi(datos);
    datos.puntaje = resultado.puntaje;
    Object.assign(datos, resultado.extraData);

    const { error: updateJsonError } = await supabase
        .from("respuestas_cuestionarios")
        .update({ datos })
        .eq("id", resp.id);
    if (updateJsonError) throw updateJsonError;

    const { error: updateScoreError } = await supabase
        .from("pacientes")
        .update({ [`psqi_${fase}`]: resultado.puntaje })
        .eq("id", pacienteId);
    if (updateScoreError) throw updateScoreError;
}