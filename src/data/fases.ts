/**
 * @file data/fases.ts
 * @description Fases del tratamiento (Pre / Inter / Post) y sus estilos visuales.
 * Las clases de Tailwind están escritas COMPLETAS a propósito: Tailwind solo
 * genera clases que aparecen literalmente en el código (no sirve `bg-${color}-500`).
 */

export const FASES_PUNTAJE = ["pre", "inter", "post"] as const;
export type Fase = (typeof FASES_PUNTAJE)[number];

export const FASE_DEFAULT: Fase = "pre";

export const esFase = (valor: unknown): valor is Fase =>
    typeof valor === "string" && (FASES_PUNTAJE as readonly string[]).includes(valor);

export const FASES: Record<Fase, { label: string; badge: string }> = {
    pre: {
        label: "Pre-Tratamiento",
        badge: "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    inter: {
        label: "Intermedio",
        badge: "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    post: {
        label: "Post-Tratamiento",
        badge: "text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
};

export const BTN_FASE_ACTIVO =
    "px-4 py-1.5 rounded-md text-sm font-medium transition-all bg-blue-600 text-white shadow";
export const BTN_FASE_INACTIVO =
    "px-4 py-1.5 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white";
