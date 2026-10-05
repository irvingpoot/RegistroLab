/**
 * @file horarios.config.ts
 * @description Tipos y constantes estáticas del módulo de horarios.
 *
 * Desde la migración a Supabase, los psicólogos, su color y su
 * disponibilidad YA NO se definen aquí: viven en las tablas
 * `psicologos_horario` y `horario_bloques` (ver migrations/001_horarios_supabase.sql
 * y src/lib/horarios-db.ts). Este archivo solo conserva lo que sigue siendo
 * fijo en código: los tipos compartidos y los días de la semana.
 *
 * Reglas que se mantienen (ahora validadas también con CHECK constraints
 * en la base de datos):
 * - Los días válidos son de lunes a viernes.
 * - Los bloques van en incrementos de 30 minutos, dentro del rango 08:00–20:00.
 * - `color` es cualquier hexadecimal válido (ej. "#3b82f6").
 */

export interface Psicologo {
    id: string;
    nombre: string;
    color: string;
    clerkUserId: string | null;
}

export type Dia = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

export interface RangoDisponible {
    dia: Dia;
    inicio: string;
    fin: string;
}

export const DIAS: { id: Dia; label: string }[] = [
    { id: "lunes", label: "Lunes" },
    { id: "martes", label: "Martes" },
    { id: "miercoles", label: "Miércoles" },
    { id: "jueves", label: "Jueves" },
    { id: "viernes", label: "Viernes" },
];

export const PASO_MIN = 30;
export const HORA_INICIO_GRID = 8;
export const HORA_FIN_GRID = 20;