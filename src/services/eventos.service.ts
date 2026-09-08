/**
 * @file eventos.service.ts
 * @description Capa de acceso a datos para eventos marcados sobre un día del calendario.
 * Un evento es distinto de un día inhábil: no bloquea agendar citas por sí mismo
 * (eso se decide aparte con "restringe_dia"), solo se muestra como un cartel sobre el día.
 */

import { supabase } from "../lib/supabase";

export type ColorEvento = "azul" | "verde" | "purpura" | "rosa" | "ambar" | "rojo";

export const COLORES_EVENTO_LISTA: ColorEvento[] = ["azul", "verde", "purpura", "rosa", "ambar", "rojo"];

export const COLORES_EVENTO: Record<ColorEvento, {
    bg: string;
    bgFuerte: string;
    border: string;
    text: string;
    dot: string;
    hex: string;
    bgBase: string;
    bgHeader: string;
    bgFooter: string;
    borderFuerte: string;
    borderSuave: string;
}> = {
    azul:    { bg: "bg-blue-600/10",    bgFuerte: "bg-blue-600/25",    border: "border-blue-500/40",    text: "text-blue-300",    dot: "bg-blue-500",    hex: "#3b82f6", bgBase: "bg-blue-950",    bgHeader: "bg-blue-900/40",    bgFooter: "bg-blue-950/70",    borderFuerte: "border-blue-800/60",    borderSuave: "border-blue-800/40" },
    verde:   { bg: "bg-emerald-600/10", bgFuerte: "bg-emerald-600/25", border: "border-emerald-500/40", text: "text-emerald-300", dot: "bg-emerald-500", hex: "#10b981", bgBase: "bg-emerald-950", bgHeader: "bg-emerald-900/40", bgFooter: "bg-emerald-950/70", borderFuerte: "border-emerald-800/60", borderSuave: "border-emerald-800/40" },
    purpura: { bg: "bg-purple-600/10",  bgFuerte: "bg-purple-600/25",  border: "border-purple-500/40",  text: "text-purple-300",  dot: "bg-purple-500",  hex: "#a855f7", bgBase: "bg-purple-950",  bgHeader: "bg-purple-900/40",  bgFooter: "bg-purple-950/70",  borderFuerte: "border-purple-800/60",  borderSuave: "border-purple-800/40" },
    rosa:    { bg: "bg-pink-600/10",    bgFuerte: "bg-pink-600/25",    border: "border-pink-500/40",    text: "text-pink-300",    dot: "bg-pink-500",    hex: "#ec4899", bgBase: "bg-pink-950",    bgHeader: "bg-pink-900/40",    bgFooter: "bg-pink-950/70",    borderFuerte: "border-pink-800/60",    borderSuave: "border-pink-800/40" },
    ambar:   { bg: "bg-amber-600/10",   bgFuerte: "bg-amber-600/25",   border: "border-amber-500/40",   text: "text-amber-300",   dot: "bg-amber-500",   hex: "#f59e0b", bgBase: "bg-amber-950",   bgHeader: "bg-amber-900/40",   bgFooter: "bg-amber-950/70",   borderFuerte: "border-amber-800/60",   borderSuave: "border-amber-800/40" },
    rojo:    { bg: "bg-red-600/10",     bgFuerte: "bg-red-600/25",     border: "border-red-500/40",     text: "text-red-300",     dot: "bg-red-500",     hex: "#ef4444", bgBase: "bg-red-950",     bgHeader: "bg-red-900/40",     bgFooter: "bg-red-950/70",     borderFuerte: "border-red-800/60",     borderSuave: "border-red-800/40" },
};

export interface EventoDia {
    id: string;
    fecha: string;
    hora_inicio: string;       
    titulo: string;
    descripcion: string | null;
    color: ColorEvento;
    restringe_dia: boolean;
}

export async function getEventosDelMes(year: number, month: number): Promise<Map<string, EventoDia>> {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate   = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("eventos_dia")
        .select("*")
        .gte("fecha", startDate)
        .lte("fecha", endDate);

    if (error) console.error("getEventosDelMes:", error);

    const mapa = new Map<string, EventoDia>();
    (data ?? []).forEach((ev) => mapa.set(ev.fecha, ev as EventoDia));
    return mapa;
}

export async function guardarEvento(params: {
    fecha: string;
    horaInicio: string;
    titulo: string;
    descripcion: string | null;
    color: ColorEvento;
    restringeDia: boolean;
}): Promise<void> {
    const { error } = await supabase.from("eventos_dia").upsert(
        {
            fecha:         params.fecha,
            hora_inicio:   params.horaInicio,
            titulo:        params.titulo,
            descripcion:   params.descripcion,
            color:         params.color,
            restringe_dia: params.restringeDia,
        },
        { onConflict: "fecha" },
    );

    if (error) throw new Error(`guardarEvento: ${error.message}`);
}

export async function eliminarEvento(fecha: string): Promise<void> {
    const { error } = await supabase.from("eventos_dia").delete().eq("fecha", fecha);
    if (error) throw new Error(`eliminarEvento: ${error.message}`);
}