/**
 * @file horarios-db.ts
 * @description Acceso a Supabase para el módulo de horarios.
 *
 * Ajusta el import de `supabase` de abajo a donde tengas tu cliente
 * (el mismo que usas en el resto de Lab-Somno, con la service role key,
 * ya que aquí no se usa Supabase Auth: el control de acceso pasa por
 * Clerk en las rutas de /api/horario/*).
 */

import { supabase } from "./supabase";
import type { Dia, Psicologo, RangoDisponible } from "../data/horarios.config";

export interface BloqueDB {
    id: string;
    psicologo_id: string;
    dia: Dia;
    hora_inicio: string;
}

export interface HorariosCompletos {
    psicologos: Psicologo[];
    bloquesPorPsicologo: Record<string, string[]>;
}

function normalizarHora(hora: string): string {
    return hora.slice(0, 5);
}

export async function obtenerHorariosCompletos(): Promise<HorariosCompletos> {
    const [{ data: psicologosRaw, error: errPsicologos }, { data: bloquesRaw, error: errBloques }] =
        await Promise.all([
            supabase
                .from("psicologos_horario")
                .select("id, nombre, color, clerk_user_id, orden")
                .order("orden", { ascending: true }),
            supabase.from("horario_bloques").select("id, psicologo_id, dia, hora_inicio"),
        ]);

    if (errPsicologos) throw new Error(`Error leyendo psicologos_horario: ${errPsicologos.message}`);
    if (errBloques) throw new Error(`Error leyendo horario_bloques: ${errBloques.message}`);

    const psicologos: Psicologo[] = (psicologosRaw ?? []).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        color: p.color,
        clerkUserId: p.clerk_user_id,
    }));

    const bloquesPorPsicologo: Record<string, string[]> = {};
    for (const p of psicologos) bloquesPorPsicologo[p.id] = [];

    for (const b of (bloquesRaw as BloqueDB[]) ?? []) {
        const key = `${b.dia}-${normalizarHora(b.hora_inicio)}`;
        void key;
        if (!bloquesPorPsicologo[b.psicologo_id]) bloquesPorPsicologo[b.psicologo_id] = [];
        bloquesPorPsicologo[b.psicologo_id].push(`${b.dia}|${normalizarHora(b.hora_inicio)}`);
    }

    return { psicologos, bloquesPorPsicologo };
}

export async function obtenerPsicologoPorClerkId(clerkUserId: string): Promise<Psicologo | null> {
    const { data, error } = await supabase
        .from("psicologos_horario")
        .select("id, nombre, color, clerk_user_id")
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

    if (error) throw new Error(`Error buscando psicólogo por clerk_user_id: ${error.message}`);
    if (!data) return null;

    return { id: data.id, nombre: data.nombre, color: data.color, clerkUserId: data.clerk_user_id };
}

export async function crearPsicologo(input: {
    id: string;
    nombre: string;
    color: string;
    clerkUserId?: string | null;
}) {
    const { error } = await supabase.from("psicologos_horario").insert({
        id: input.id,
        nombre: input.nombre,
        color: input.color,
        clerk_user_id: input.clerkUserId ?? null,
    });
    if (error) {
        if (error.code === "23505" && input.clerkUserId) {
            throw new Error("Esa persona ya está vinculada a otro horario.");
        }
        throw new Error(`Error creando psicólogo: ${error.message}`);
    }
}

export async function vincularClerkUserId(psicologoId: string, clerkUserId: string | null) {
    const { error } = await supabase
        .from("psicologos_horario")
        .update({ clerk_user_id: clerkUserId })
        .eq("id", psicologoId);

    if (error) {
        if (error.code === "23505") {
            throw new Error("Esa persona ya está vinculada a otro horario.");
        }
        throw new Error(`Error vinculando cuenta de Clerk: ${error.message}`);
    }
}

export async function actualizarColorPsicologo(psicologoId: string, colorHex: string) {
    const { error } = await supabase
        .from("psicologos_horario")
        .update({ color: colorHex })
        .eq("id", psicologoId);
    if (error) throw new Error(`Error actualizando color: ${error.message}`);
}

export async function eliminarPsicologo(psicologoId: string) {
    const { error } = await supabase.from("psicologos_horario").delete().eq("id", psicologoId);
    if (error) throw new Error(`Error eliminando psicólogo: ${error.message}`);
}
export async function agregarBloque(psicologoId: string, dia: Dia, horaInicio: string) {
    const { error } = await supabase
        .from("horario_bloques")
        .upsert(
            { psicologo_id: psicologoId, dia, hora_inicio: horaInicio },
            { onConflict: "psicologo_id,dia,hora_inicio", ignoreDuplicates: true },
        );
    if (error) throw new Error(`Error agregando bloque: ${error.message}`);
}

export async function eliminarBloque(psicologoId: string, dia: Dia, horaInicio: string) {
    const { error } = await supabase
        .from("horario_bloques")
        .delete()
        .match({ psicologo_id: psicologoId, dia, hora_inicio: horaInicio });
    if (error) throw new Error(`Error eliminando bloque: ${error.message}`);
}

export async function reemplazarBloques(
    psicologoId: string,
    bloques: { dia: Dia; horaInicio: string }[],
) {
    const { error: errDelete } = await supabase
        .from("horario_bloques")
        .delete()
        .eq("psicologo_id", psicologoId);
    if (errDelete) throw new Error(`Error limpiando bloques previos: ${errDelete.message}`);

    if (bloques.length === 0) return;

    const { error: errInsert } = await supabase.from("horario_bloques").insert(
        bloques.map((b) => ({
            psicologo_id: psicologoId,
            dia: b.dia,
            hora_inicio: b.horaInicio,
        })),
    );
    if (errInsert) throw new Error(`Error guardando bloques nuevos: ${errInsert.message}`);
}

export function bloquesARangos(bloquesPlanos: string[]): RangoDisponible[] {
    const porDia = new Map<Dia, string[]>();
    for (const b of bloquesPlanos) {
        const [dia, hora] = b.split("|") as [Dia, string];
        if (!porDia.has(dia)) porDia.set(dia, []);
        porDia.get(dia)!.push(hora);
    }

    const rangos: RangoDisponible[] = [];
    for (const [dia, horas] of porDia) {
        const ordenadas = [...horas].sort();
        let inicioActual: string | null = null;
        let anteriorMin = -1;

        const aMin = (hhmm: string) => {
            const [h, m] = hhmm.split(":").map(Number);
            return h * 60 + m;
        };
        const aHHMM = (min: number) =>
            `${Math.floor(min / 60).toString().padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`;

        for (const hora of ordenadas) {
            const min = aMin(hora);
            if (inicioActual === null) {
                inicioActual = hora;
            } else if (min !== anteriorMin + 30) {
                rangos.push({ dia, inicio: inicioActual, fin: aHHMM(anteriorMin + 30) });
                inicioActual = hora;
            }
            anteriorMin = min;
        }
        if (inicioActual !== null) {
            rangos.push({ dia, inicio: inicioActual, fin: aHHMM(anteriorMin + 30) });
        }
    }
    return rangos;
}