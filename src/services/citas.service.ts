/**
 * @file citas.service.ts
 * @description Capa de acceso a datos para citas y días inhábiles.
 * Toda consulta o mutación relacionada con estas tablas pasa por aquí.
 */

import { supabase } from "../lib/supabase";

export interface Cita {
    id: number;
    nombre: string;
    fecha_hora: string;
    telefono: string | null;
    referencia: string;
    sintoma: string | null;
    observaciones: string | null;
    registrado_por_id: string | null;
    motivo: string | null;
    estado: 'pendiente' | 'completada' | 'cancelada' | null;
    atendido_por: string | null;
}

export type CitaResumen = Pick<Cita,
    | "id"
    | "fecha_hora"
    | "nombre"
    | "estado"
    | "referencia"
    | "sintoma"
    | "telefono"
    | "motivo"
    | "atendido_por"
    | "observaciones"
    | "registrado_por_id"
    
>;

export async function getCitasDelMes(year: number, month: number): Promise<CitaResumen[]> {
    const startDateStr = new Date(year, month, 1).toISOString();
    const endDateStr   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
        .from("citas")
        .select("id, fecha_hora, nombre, estado, referencia, sintoma, telefono, motivo, atendido_por, observaciones, registrado_por_id")
        .gte("fecha_hora", startDateStr)
        .lte("fecha_hora", endDateStr)
        .order("fecha_hora", { ascending: true });

    if (error) console.error("getCitasDelMes:", error);
    return data ?? [];
}

export async function getDiasInhabilesDelMes(year: number, month: number): Promise<Set<string>> {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate   = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .gte("fecha", startDate)
        .lte("fecha", endDate);

    return new Set(data?.map(d => d.fecha) ?? []);
}

async function esDiaInhabil(fechaISO: string): Promise<boolean> {
    const { data } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .eq("fecha", fechaISO)
        .single();

    return !!data;
}

export async function completarCita(citaId: number): Promise<void> {
    const { error } = await supabase
        .from("citas")
        .update({ estado: "completada" })
        .eq("id", citaId);

    if (error) throw new Error(`completarCita: ${error.message}`);
}

export async function cancelarCita(citaId: number): Promise<void> {
    const { error } = await supabase
        .from("citas")
        .update({ estado: "cancelada" })
        .eq("id", citaId);

    if (error) throw new Error(`cancelarCita: ${error.message}`);
}

export async function reagendarCita(
    citaId: number,
    nuevaFechaLocal: string,
    registradoPor: string
): Promise<void> {
    const fechaSoloDia = nuevaFechaLocal.split("T")[0];

    if (await esDiaInhabil(fechaSoloDia)) {
        throw new Error(`El día ${fechaSoloDia} está marcado como inhábil.`);
    }

    const { data: original, error: errorFetch } = await supabase
        .from("citas")
        .select("nombre, telefono, motivo, sintoma, referencia, atendido_por, observaciones")
        .eq("id", citaId)
        .single();

    if (errorFetch || !original) throw new Error("No se encontró la cita original.");

    const fechaObj     = new Date(`${nuevaFechaLocal}-06:00`);
    const nuevaFechaISO = fechaObj.toISOString();

    const { error: insertError } = await supabase.from("citas").insert({
        nombre:            original.nombre,
        telefono:          original.telefono,
        motivo:            original.motivo,
        sintoma:           original.sintoma,
        referencia:        original.referencia,
        atendido_por:      original.atendido_por,
        observaciones:     original.observaciones,
        fecha_hora:        nuevaFechaISO,
        estado:            "pendiente",
        registrado_por_id: registradoPor,
    });

    if (insertError) throw new Error(`reagendarCita (insert): ${insertError.message}`);

    const fechaTexto = fechaObj.toLocaleString("es-MX", {
        timeZone: "America/Merida",
        year: "numeric", month: "numeric", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const nota = `\n[Cita reagendada para el: ${fechaTexto} por ${registradoPor}]`;

    const { error: updateError } = await supabase
        .from("citas")
        .update({
            estado:        "cancelada",
            observaciones: (original.observaciones ?? "") + nota,
        })
        .eq("id", citaId);

    if (updateError) throw new Error(`reagendarCita (update): ${updateError.message}`);
}

export async function toggleDiaInhabil(fecha: string, esInhabil: boolean): Promise<void> {
    if (esInhabil) {
        await supabase.from("dias_inhabiles").delete().eq("fecha", fecha);
    } else {
        await supabase.from("dias_inhabiles").insert({ fecha });
    }
}

export async function procesarPeriodoInhabil(
    fechaInicio: string,
    fechaFin: string,
    operacion: "bloquear" | "habilitar"
): Promise<void> {
    const start = new Date(`${fechaInicio}T12:00:00`);
    const end   = new Date(`${fechaFin}T12:00:00`);

    const fechas: string[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        fechas.push(d.toISOString().split("T")[0]);
    }

    if (fechas.length === 0) return;

    if (operacion === "bloquear") {
        await supabase
            .from("dias_inhabiles")
            .upsert(fechas.map(f => ({ fecha: f })), { onConflict: "fecha" });
    } else {
        await supabase.from("dias_inhabiles").delete().in("fecha", fechas);
    }
}

export async function getInhabilesDesdeHoy(): Promise<string[]> {
    const { data } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .gte("fecha", new Date().toISOString().split("T")[0]);
    
    return data?.map(d => d.fecha) ?? [];
}

export async function crearCita(params: {
    nombre: string;
    telefono: string | null;
    sintoma: string | null;
    referencia: string;
    motivo: string;
    fechaLocal: string;
    observaciones: string | null;
    atendidoPor: string;
    registradoPorId: string;
}): Promise<void> {
    const fechaObj = new Date(`${params.fechaLocal}-06:00`);
    const fechaISO = fechaObj.toISOString();
    const fechaSoloDia = params.fechaLocal.split("T")[0];
    
    const { data: diaBloqueado } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .eq("fecha", fechaSoloDia)
        .maybeSingle();
    
    if (diaBloqueado) {
        throw new Error(`⚠️ El día seleccionado (${fechaSoloDia}) está bloqueado como inhábil. Elige otra fecha.`);
    }
    
    const { data: citaExistente } = await supabase
        .from("citas")
        .select("id")
        .eq("fecha_hora", fechaISO)
        .eq("atendido_por", params.atendidoPor)
        .neq("estado", "cancelada")
        .maybeSingle();
    
    if (citaExistente) {
        throw new Error(`⚠️ Agenda ocupada: ${params.atendidoPor} ya tiene una cita a esa hora.`);
    }
    
    const { error } = await supabase.from("citas").insert([{
        nombre:            params.nombre,
        telefono:          params.telefono,
        sintoma:           params.sintoma,
        referencia:        params.referencia,
        motivo:            params.motivo,
        fecha_hora:        fechaISO,
        observaciones:     params.observaciones,
        estado:            "pendiente",
        registrado_por_id: params.registradoPorId,
        atendido_por:      params.atendidoPor,
    }]);

    if (error) throw new Error(`crearCita: ${error.message}`);
}