/**
 * @file dashboard.service.ts
 * @description Capa de acceso a datos para el panel de control.
 * Cubre tres fuentes: citas del día (Supabase), notificaciones de
 * cuestionarios respondidos (Supabase) y usuarios recientes (Clerk).
 */

import { clerkClient } from "@clerk/astro/server";
import { supabase } from "../lib/supabase";

export interface CitaResumen {
    id: number;
    fecha_hora: string;
    nombre: string;
    estado: "pendiente" | "completada" | "cancelada" | null;
    /** Hora "HH:mm" (24 h) en America/Merida, calculada una sola vez aquí. */
    hora24: string;
}

export interface PacienteRelacion {
    id: number;
    nombre: string;
    tipo_paciente: string;
}

export interface Notificacion {
    id: number;
    cuestionario: string;
    updated_at: string;
    pacientes: PacienteRelacion | null;
}

export interface ResumenAgenda {
    citasHoy: CitaResumen[];
    totalCitasHoy: number;
    cantidadPendientes: number;
    estadoAgenda: "vacio" | "pendiente" | "completado";
    proximaHora: string;
    proximaHora12: string;
    proximaNombre: string;
}

const ZONA_MERIDA = "America/Merida";

const FORMATO_HORA_MINUTO = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: ZONA_MERIDA,
});

function horasMerida(iso: string): { hora24: string; hora12: string } {
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return { hora24: "--:--", hora12: "--:--" };

    const partes = FORMATO_HORA_MINUTO.formatToParts(fecha);
    const h = Number(partes.find((p) => p.type === "hour")?.value ?? 0) % 24;
    const m = partes.find((p) => p.type === "minute")?.value ?? "00";

    return {
        hora24: `${String(h).padStart(2, "0")}:${m}`,
        hora12: `${h % 12 || 12}:${m}\u00A0${h < 12 ? "a. m." : "p. m."}`,
    };
}

function getRangoHoy(): { inicioDia: string; finDia: string } {
    const now = new Date();
    const offsetMerida = 6 * 60 * 60 * 1000;
    const nowMerida = new Date(now.getTime() - offsetMerida);

    const year  = nowMerida.getUTCFullYear();
    const month = String(nowMerida.getUTCMonth() + 1).padStart(2, "0");
    const day   = String(nowMerida.getUTCDate()).padStart(2, "0");
    const fecha = `${year}-${month}-${day}`;

    return {
        inicioDia: `${fecha}T00:00:00-06:00`,
        finDia:    `${fecha}T23:59:59-06:00`,
    };
}

export async function getCitasHoy(): Promise<ResumenAgenda> {
    const { inicioDia, finDia } = getRangoHoy();

    const { data, error } = await supabase
        .from("citas")
        .select("id, fecha_hora, nombre, estado")
        .gte("fecha_hora", inicioDia)
        .lte("fecha_hora", finDia)
        .order("fecha_hora", { ascending: true });

    if (error) console.error("getCitasHoy:", error);

    const citasHoy: CitaResumen[] = ((data ?? []) as Omit<CitaResumen, "hora24">[]).map((c) => ({
        ...c,
        hora24: horasMerida(c.fecha_hora).hora24,
    }));
    const totalCitasHoy     = citasHoy.length;
    const citasPendientes   = citasHoy.filter(c => c.estado === "pendiente");
    const cantidadPendientes = citasPendientes.length;

    let estadoAgenda: ResumenAgenda["estadoAgenda"] = "vacio";
    let proximaHora   = "--:--";
    let proximaHora12 = "--:--";
    let proximaNombre = "";

    if (cantidadPendientes > 0) {
        estadoAgenda  = "pendiente";
        const siguiente = citasPendientes[0];
        proximaNombre = siguiente.nombre || "Paciente";
        proximaHora   = siguiente.hora24;
        proximaHora12 = horasMerida(siguiente.fecha_hora).hora12;
    } else if (totalCitasHoy > 0) {
        estadoAgenda  = "completado";
        proximaNombre = "Todas las citas finalizadas";
    }

    return { citasHoy, totalCitasHoy, cantidadPendientes, estadoAgenda, proximaHora, proximaHora12, proximaNombre };
}

const SELECT_NOTIFICACIONES = `
    id,
    cuestionario,
    updated_at,
    pacientes ( id, nombre, tipo_paciente )
`;

function normalizarNotificaciones(data: any[] | null): Notificacion[] {
    const normalizado = (data ?? []).map((row) => ({
        ...row,
        pacientes: Array.isArray(row.pacientes)
            ? (row.pacientes[0] ?? null)
            : row.pacientes,
    }));
    return normalizado as unknown as Notificacion[];
}

export async function getNotificaciones(): Promise<Notificacion[]> {
    const { data, error } = await supabase
        .from("respuestas_cuestionarios")
        .select(SELECT_NOTIFICACIONES)
        .eq("visto", false)
        .order("updated_at", { ascending: false })
        .limit(10);

    if (error) console.error("getNotificaciones:", error);
    return normalizarNotificaciones(data);
}

export async function getResumenNotificaciones(): Promise<{ items: Notificacion[]; total: number }> {
    const { data, error, count } = await supabase
        .from("respuestas_cuestionarios")
        .select(SELECT_NOTIFICACIONES, { count: "exact" })
        .eq("visto", false)
        .order("updated_at", { ascending: false })
        .limit(10);

    if (error) console.error("getResumenNotificaciones:", error);
    const items = normalizarNotificaciones(data);
    return { items, total: count ?? items.length };
}

export async function getUsuariosRecientes(astroContext: Parameters<typeof clerkClient>[0]) {
    try {
        const client   = clerkClient(astroContext);
        const response = await client.users.getUserList({
            limit:   10,
            orderBy: "-last_active_at",
        });
        return Array.isArray(response) ? response : (response.data ?? []);
    } catch (e) {
        console.error("getUsuariosRecientes:", e);
        return [];
    }
}

export async function marcarTodasLeidas(): Promise<void> {
    const { error } = await supabase
        .from("respuestas_cuestionarios")
        .update({ visto: true })
        .eq("visto", false);

    if (error) throw new Error(`marcarTodasLeidas: ${error.message}`);
}