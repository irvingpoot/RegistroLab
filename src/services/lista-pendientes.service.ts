/**
 * @file pendientes.service.ts
 * @description Capa de acceso a datos para el módulo de tareas pendientes.
 * Cubre lectura de tareas, creación, y marcado como completada.
 * La lista de personal se obtiene de Clerk desde la página, ya que requiere
 * el contexto de Astro.
 */

import { supabase } from "../lib/supabase";

export interface Tarea {
    id: string;
    titulo: string;
    descripcion: string | null;
    responsable: string;
    creado_por: string | null;
    creado_el: string;
    estado: "pendiente" | "completada" | null;
    completado_por: string | null;
    completado_el: string | null;
}

export async function getTareasDeUsuario(responsable: string): Promise<Tarea[]> {
    const { data, error } = await supabase
        .from("tareas_pendientes")
        .select("id, titulo, descripcion, creado_el")
        .eq("estado", "pendiente")
        .eq("responsable", responsable)
        .order("creado_el", { ascending: false });

    if (error) console.error("getTareasDeUsuario:", error);
    return (data ?? []) as Tarea[];
}

export async function getTareasPendientes(): Promise<Tarea[]> {
    const { data, error } = await supabase
        .from("tareas_pendientes")
        .select("*")
        .eq("estado", "pendiente")
        .order("creado_el", { ascending: false });

    if (error) console.error("getTareasPendientes:", error);
    return (data ?? []) as Tarea[];
}

export async function crearTarea(params: {
    titulo: string;
    descripcion: string;
    responsable: string;
    creadoPor: string;
}): Promise<void> {
    const { error } = await supabase.from("tareas_pendientes").insert({
        titulo:      params.titulo,
        descripcion: params.descripcion,
        responsable: params.responsable,
        creado_por:  params.creadoPor,
        estado:      "pendiente",
    });

    if (error) throw new Error(`crearTarea: ${error.message}`);
}

export async function completarTarea(idTarea: string, completadoPor: string): Promise<void> {
    const { error } = await supabase
        .from("tareas_pendientes")
        .update({
            estado:         "completada",
            completado_por: completadoPor,
            completado_el:  new Date().toISOString(),
        })
        .eq("id", idTarea);

    if (error) throw new Error(`completarTarea: ${error.message}`);
}