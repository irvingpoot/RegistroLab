/**
 * @file estadisticas.service.ts
 * @description Acceso a datos de la página /estadisticas.
 * Una sola llamada RPC; los cálculos viven en public.estadisticas_citas.
 */

import { supabase } from "../lib/supabase";

export interface EstadisticasData {
    mes: string;
    dias_mes: number;
    kpis: {
        ingresos: number;
        proyectado: number;
        citas: number;
        completadas: number;
        pendientes: number;
        canceladas: number;
        pacientes: number;
        ticket: number;
        sin_precio: number;
    };
    prev: { ingresos: number; citas: number; completadas: number };
    por_dia: { d: number; ingresos: number; citas: number }[];
    servicios: { nombre: string; citas: number; ingresos: number }[];
    heatmap: { dow: number; h: number; n: number }[];
    tendencia: { mes: string; ingresos: number; citas: number }[];
    referencias: { nombre: string; citas: number }[];
    atendidos: { nombre: string; citas: number; ingresos: number }[];
}

/** @param mes "YYYY-MM" (opcional; por defecto el mes actual en America/Merida) */
export async function getEstadisticas(mes?: string): Promise<EstadisticasData> {
    const { data, error } = await supabase.rpc("estadisticas_citas", {
        p_mes: mes ? `${mes}-01` : null,
    });
    if (error) throw error;
    return data as EstadisticasData;
}