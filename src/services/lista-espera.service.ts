/**
 * @file lista-espera.service.ts
 * @description Acceso a datos de la lista de espera.
 *
 * El turno (`posicion`) lo gestiona la base de datos (ver supabase/lista-espera.sql):
 *   - al insertar, el paciente recibe el último turno;
 *   - al eliminar, los demás suben solos (trigger);
 *   - al reordenar, una sola llamada RPC reescribe todos los turnos.
 * Por eso aquí NUNCA se renumera a mano.
 */

import { supabase } from "../lib/supabase";

export type OrigenEspera = "manual" | "formulario";

export interface PacienteEspera {
    id: string;
    nombre: string;
    telefono: string;
    motivo: string;
    posicion: number;
    origen: OrigenEspera;
    created_at: string;
}

export interface DatosEspera {
    nombre: string;
    telefono: string;
    motivo: string;
}

const TABLA = "lista_espera";

function limpiar(d: DatosEspera): DatosEspera {
    const datos = {
        nombre: d.nombre?.trim() ?? "",
        telefono: d.telefono?.trim() ?? "",
        motivo: d.motivo?.trim() ?? "",
    };
    if (!datos.nombre || !datos.telefono || !datos.motivo) {
        throw new Error("Nombre, número y motivo de consulta son obligatorios.");
    }
    return datos;
}

export async function getListaEspera(): Promise<PacienteEspera[]> {
    const { data, error } = await supabase
        .from(TABLA)
        .select("id, nombre, telefono, motivo, posicion, origen, created_at")
        .order("posicion", { ascending: true });

    if (error) throw new Error(`No se pudo cargar la lista de espera: ${error.message}`);
    return data ?? [];
}

export async function agregarAEspera(datos: DatosEspera): Promise<void> {
    const { error } = await supabase.from(TABLA).insert(limpiar(datos));
    if (error) throw new Error(`No se pudo agregar al paciente: ${error.message}`);
}

export async function editarEnEspera(id: string, datos: DatosEspera): Promise<void> {
    const { error } = await supabase.from(TABLA).update(limpiar(datos)).eq("id", id);
    if (error) throw new Error(`No se pudo guardar los cambios: ${error.message}`);
}

export async function eliminarDeEspera(id: string): Promise<void> {
    const { error } = await supabase.from(TABLA).delete().eq("id", id);
    if (error) throw new Error(`No se pudo eliminar al paciente: ${error.message}`);
}

export async function reordenarEspera(idsEnOrden: string[]): Promise<void> {
    const { error } = await supabase.rpc("reordenar_lista_espera", { p_ids: idsEnOrden });
    if (error) throw new Error(`No se pudo reordenar la lista: ${error.message}`);
}

export async function registrarDesdeFormulario(
    datos: DatosEspera,
    token: string,
): Promise<"creado" | "duplicado"> {
    const { error } = await supabase
        .from(TABLA)
        .insert({ ...limpiar(datos), origen: "formulario", token_envio: token });

    if (!error) return "creado";
    if (error.code === "23505") return "duplicado";
    throw new Error(`No se pudo registrar el envío: ${error.message}`);
}

export async function contarEnviosRecientesFormulario(minutos: number): Promise<number> {
    const desde = new Date(Date.now() - minutos * 60_000).toISOString();
    const { count, error } = await supabase
        .from(TABLA)
        .select("id", { count: "exact", head: true })
        .eq("origen", "formulario")
        .gte("created_at", desde);

    if (error) throw new Error(`No se pudo verificar el tope de envíos: ${error.message}`);
    return count ?? 0;
}