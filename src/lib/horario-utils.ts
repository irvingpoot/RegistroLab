/**
 * @file horario-utils.ts
 * @description Utilidades puras para construir la grilla de horarios (time-blocking).
 * No dependen de Supabase ni de Clerk: solo transforman los datos definidos en
 * `src/data/horarios.config.ts` en estructuras fáciles de pintar en la UI.
 */

import type { RangoDisponible } from "../data/horarios.config";

function aMinutos(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function aHHMM(minutos: number): string {
    const h = Math.floor(minutos / 60).toString().padStart(2, "0");
    const m = (minutos % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
}

export function generarSlots(horaInicio = 8, horaFin = 20, pasoMin = 30): string[] {
    const slots: string[] = [];
    for (let m = horaInicio * 60; m < horaFin * 60; m += pasoMin) {
        slots.push(aHHMM(m));
    }
    return slots;
}

export function construirMapaDisponibilidad(
    disponibilidad: Record<string, RangoDisponible[]>,
    pasoMin = 30,
): Record<string, string[]> {
    const mapa: Record<string, string[]> = {};

    for (const [psicologoId, rangos] of Object.entries(disponibilidad)) {
        for (const rango of rangos) {
            const inicio = aMinutos(rango.inicio);
            const fin = aMinutos(rango.fin);

            for (let m = inicio; m < fin; m += pasoMin) {
                const key = `${rango.dia}-${aHHMM(m)}`;
                if (!mapa[key]) mapa[key] = [];
                mapa[key].push(psicologoId);
            }
        }
    }

    return mapa;
}

export function obtenerDiaHoy(): "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | null {
    const nombre = new Date().toLocaleDateString("es-MX", {
        timeZone: "America/Merida",
        weekday: "long",
    });
    const mapa: Record<string, "lunes" | "martes" | "miercoles" | "jueves" | "viernes"> = {
        lunes: "lunes",
        martes: "martes",
        "miércoles": "miercoles",
        jueves: "jueves",
        viernes: "viernes",
    };
    return mapa[nombre.toLowerCase()] ?? null;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const limpio = hex.replace("#", "");
    const full = limpio.length === 3
        ? limpio.split("").map((c) => c + c).join("")
        : limpio;
    const bigint = parseInt(full, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function rgba(hex: string, alpha: number): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface EstiloPsicologo {
    hex: string;
    tenue: string;
    overlay: string;
    pillFondo: string;
    pillBorde: string;
}

export function construirEstilosPorPsicologo(
    psicologos: { id: string; color: string }[],
): Record<string, EstiloPsicologo> {
    const estilos: Record<string, EstiloPsicologo> = {};
    for (const p of psicologos) {
        estilos[p.id] = {
            hex: p.color,
            tenue: rgba(p.color, 0.22),
            overlay: rgba(p.color, 0.5),
            pillFondo: rgba(p.color, 0.18),
            pillBorde: rgba(p.color, 0.55),
        };
    }
    return estilos;
}