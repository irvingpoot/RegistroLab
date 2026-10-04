/**
 * @file horario-utils.ts
 * @description Utilidades puras para construir la grilla de horarios (time-blocking).
 * No dependen de Supabase ni de Clerk: solo transforman los datos que ya
 * trajo `obtenerHorariosCompletos()` (horarios-db.ts) en estructuras fáciles
 * de pintar en la UI.
 */

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

/**
 * Construye el mapa `"dia-HH:MM" -> [psicologoId, ...]` que usa la grilla.
 *
 * @param bloquesPorPsicologo viene directo de `obtenerHorariosCompletos()`:
 *   cada psicólogo mapea a una lista de bloques planos `"dia|HH:MM"`.
 */
export function construirMapaDisponibilidad(
    bloquesPorPsicologo: Record<string, string[]>,
): Record<string, string[]> {
    const mapa: Record<string, string[]> = {};

    for (const [psicologoId, bloques] of Object.entries(bloquesPorPsicologo)) {
        for (const bloque of bloques) {
            const [dia, hora] = bloque.split("|");
            const key = `${dia}-${hora}`;
            if (!mapa[key]) mapa[key] = [];
            mapa[key].push(psicologoId);
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

export function esHexValido(hex: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(hex);
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