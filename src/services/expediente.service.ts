/**
 * @file expediente.service.ts
 * @description Acceso a datos COMPARTIDO por los expedientes (sueño y ánimo):
 * seguimiento, puntajes, TMS, consentimiento y eliminación del paciente.
 * Cada función devuelve `{ error }` (estilo Supabase); quien llama decide qué hacer con él.
 */

import { supabase } from "../lib/supabase";
import type { PuntajeExtra } from "../utils/form-data";

export type DbError = { message: string } | null;
export interface ResultadoDb {
    error: DbError;
}

export async function marcarCuestionariosVistos(pacienteId: string): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("respuestas_cuestionarios")
        .update({ visto: true })
        .eq("paciente_id", pacienteId)
        .eq("visto", false);
    return { error };
}

export async function addSeguimiento(params: {
    pacienteId: string;
    fecha: string;
    observacion: FormDataEntryValue | null;
    registradoPor: string;
}): Promise<ResultadoDb> {
    const { error } = await supabase.from("pacientes_seguimiento").insert([
        {
            paciente_id: params.pacienteId,
            fecha: params.fecha,
            observacion: params.observacion,
            registrado_por: params.registradoPor,
        },
    ]);
    return { error };
}

export async function editSeguimiento(params: {
    id: FormDataEntryValue | null;
    fecha: string;
    observacion: FormDataEntryValue | null;
}): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("pacientes_seguimiento")
        .update({ fecha: params.fecha, observacion: params.observacion })
        .eq("id", params.id);
    return { error };
}

export async function deleteSeguimiento(id: FormDataEntryValue | null): Promise<ResultadoDb> {
    const { error } = await supabase.from("pacientes_seguimiento").delete().eq("id", id);
    return { error };
}

export const ordenarSeguimientos = <T extends { fecha: string }>(notas: T[] | null | undefined): T[] =>
    (notas ?? []).slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());


export async function deletePaciente(id: string): Promise<ResultadoDb> {
    const { error } = await supabase.from("pacientes").delete().eq("id", id);
    return { error };
}


export async function updatePuntajes(
    pacienteId: string,
    puntajes: Record<string, number | null>,
): Promise<ResultadoDb> {
    const { error } = await supabase.from("pacientes").update(puntajes).eq("id", pacienteId);
    return { error };
}

export async function reemplazarPuntajesExtra(
    pacienteId: string,
    extras: PuntajeExtra[],
): Promise<ResultadoDb> {
    await supabase.from("pacientes_puntajes_extra").delete().eq("paciente_id", pacienteId);

    if (extras.length === 0) return { error: null };

    const { error } = await supabase
        .from("pacientes_puntajes_extra")
        .insert(extras.map((extra) => ({ paciente_id: pacienteId, ...extra })));
    return { error };
}

export interface SesionTmsInput {
    fecha_aplicacion: string | null;
    observaciones: string | null;
    umbral_motor: number | null;
    intensidad_tratamiento: number | null;
    total_pulsos: number | null;
    sitio_estimulacion: string | null;
    protocolo: string | null;
    frecuencia: string | null;
    frecuencia_derecha: string | null;
}

export async function habilitarTms(pacienteId: string): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("pacientes")
        .update({ tms_habilitado: true })
        .eq("id", pacienteId);
    return { error };
}

export async function crearSesionTms(
    pacienteId: string,
    sesion: SesionTmsInput,
): Promise<ResultadoDb> {
    const { error } = await supabase
        .from("tms_sesiones")
        .insert({ paciente_id: pacienteId, ...sesion });
    return { error };
}

export async function subirConsentimientoTms(pacienteId: string, archivo: File): Promise<ResultadoDb> {
    const filePath = `${pacienteId}/consentimiento_tms.pdf`;

    const { error: uploadError } = await supabase.storage
        .from("expedientes")
        .upload(filePath, archivo, { upsert: true, contentType: "application/pdf" });

    if (uploadError) return { error: uploadError };

    const { error } = await supabase
        .from("pacientes")
        .update({ tms_consentimiento_url: filePath })
        .eq("id", pacienteId);
    return { error };
}

export async function getUrlConsentimientoFirmado(
    path: string | null | undefined,
    expiraEnSegundos = 3600,
): Promise<string | null> {
    if (!path) return null;
    const { data } = await supabase.storage.from("expedientes").createSignedUrl(path, expiraEnSegundos);
    return data?.signedUrl ?? null;
}
