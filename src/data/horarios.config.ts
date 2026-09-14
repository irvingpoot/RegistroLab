/**
 * @file horarios.config.ts
 * @description Fuente única de verdad para el horario de psicólogos.
 *
 * No hay tabla en Supabase para esto a propósito: los psicólogos, su color
 * y su disponibilidad se definen aquí mismo, en código. Para agregar o
 * modificar un horario, edita los arreglos de abajo y despliega.
 *
 * Reglas:
 * - Los días válidos son de lunes a viernes.
 * - `inicio`/`fin` van en formato "HH:MM", en múltiplos de 30 minutos,
 *   dentro del rango 08:00–20:00. `fin` es exclusivo.
 * - `color` es cualquier hexadecimal válido (ej. "#3b82f6").
 */

export interface Psicologo {
    id: string;
    nombre: string;
    color: string;
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

export const PSICOLOGOS: Psicologo[] = [
    { id: "jesus-moo", nombre: "Jesús Moo", color: "#bf9cfc" },
    { id: "frida-flores", nombre: "Frida Flores", color: "#FFB7CE" },
    { id: "jacqui-ravell", nombre: "Jacqui Ravell", color: "#ff81e3" },
    { id: "soraya-shurair", nombre: "Soraya Shurair", color: "#ff6568" },
    { id: "alejandro-caballero", nombre: "Alejandro Caballero", color: "#ff62b4" },
];

export const DISPONIBILIDAD: Record<string, RangoDisponible[]> = {
    "jesus-moo": [
        { dia: "lunes", inicio: "09:30", fin: "14:00" },
        { dia: "martes", inicio: "09:30", fin: "14:00" },
        { dia: "miercoles", inicio: "09:30", fin: "14:00" },
        { dia: "jueves", inicio: "09:30", fin: "14:00" },
        { dia: "viernes", inicio: "11:00", fin: "14:00" },
    ],
    "frida-flores": [
        { dia: "lunes", inicio: "09:30", fin: "14:00" },
        { dia: "martes", inicio: "09:30", fin: "14:00" },
        { dia: "miercoles", inicio: "09:30", fin: "14:00" },
        { dia: "jueves", inicio: "09:30", fin: "14:00" },
        { dia: "viernes", inicio: "11:00", fin: "14:00" },
    ],
    "jacqui-ravell": [
        { dia: "lunes", inicio: "10:00", fin: "14:00" },
        { dia: "miercoles", inicio: "10:00", fin: "14:00" },
        { dia: "viernes", inicio: "10:00", fin: "14:00" },
    ],
    "soraya-shurair": [
        { dia: "lunes", inicio: "10:00", fin: "12:00" },
        { dia: "martes", inicio: "12:00", fin: "14:00" },
        { dia: "miercoles", inicio: "10:00", fin: "13:00" },
        { dia: "jueves", inicio: "10:00", fin: "14:00" },
        { dia: "viernes", inicio: "10:00", fin: "12:00" },
    ],
    "alejandro-caballero": [
        { dia: "lunes", inicio: "10:00", fin: "12:00" },
        { dia: "martes", inicio: "12:00", fin: "14:00" },
        { dia: "miercoles", inicio: "10:00", fin: "13:00" },
        { dia: "jueves", inicio: "10:00", fin: "14:00" },
        { dia: "viernes", inicio: "10:00", fin: "12:00" },
    ],
};