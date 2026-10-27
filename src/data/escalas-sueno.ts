/**
 * @file data/escalas-sueno.ts
 * @description Escalas de puntaje del expediente de sueño.
 * Cada escala tiene columnas `<escala>_pre`, `<escala>_inter` y `<escala>_post` en `pacientes`.
 */

import type { Fase } from "./fases";

export const ESCALAS_SUENO = [
    "epworth",
    "dbi",
    "hamilton_d",
    "hamilton_a",
    "isi",
    "psqi",
    "stop_bang",
    "berlin",
    "cuestionario_insomnio",
] as const;

export type EscalaSueno = (typeof ESCALAS_SUENO)[number];

export const nombreEscala = (escala: string) => escala.replace(/_/g, " ");

export const columnaPuntaje = (escala: string, fase: Fase) => `${escala}_${fase}`;
