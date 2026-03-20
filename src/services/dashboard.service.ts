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
    proximaNombre: string;
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

    const citasHoy          = (data ?? []) as CitaResumen[];
    const totalCitasHoy     = citasHoy.length;
    const citasPendientes   = citasHoy.filter(c => c.estado === "pendiente");
    const cantidadPendientes = citasPendientes.length;

    let estadoAgenda: ResumenAgenda["estadoAgenda"] = "vacio";
    let proximaHora   = "--:--";
    let proximaNombre = "";

    if (cantidadPendientes > 0) {
        estadoAgenda  = "pendiente";
        const siguiente = citasPendientes[0];
        proximaNombre = siguiente.nombre || "Paciente";
        proximaHora   = new Date(siguiente.fecha_hora).toLocaleTimeString("es-MX", {
            hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Merida",
        });
    } else if (totalCitasHoy > 0) {
        estadoAgenda  = "completado";
        proximaNombre = "Todas las citas finalizadas";
    }

    return { citasHoy, totalCitasHoy, cantidadPendientes, estadoAgenda, proximaHora, proximaNombre };
}

export async function getNotificaciones(): Promise<Notificacion[]> {
    const { data, error } = await supabase
        .from("respuestas_cuestionarios")
        .select(`
            id,
            cuestionario,
            updated_at,
            pacientes ( id, nombre, tipo_paciente )
        `)
        .eq("visto", false)
        .order("updated_at", { ascending: false })
        .limit(10);

    if (error) console.error("getNotificaciones:", error);
    const normalizado = (data ?? []).map(row => ({
        ...row,
        pacientes: Array.isArray(row.pacientes)
            ? (row.pacientes[0] ?? null)
            : row.pacientes,
    }));
    return normalizado as unknown as Notificacion[];
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