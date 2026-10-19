/**
 * @file citas.service.ts
 * @description Capa de acceso a datos para citas y días inhábiles.
 * Toda consulta o mutación relacionada con estas tablas pasa por aquí.
 */

import { supabase } from "../lib/supabase";
import { getPrecioParaCita, type PrecioParaCita } from "./servicios.service";

/** Columnas de una cita que se leen para las vistas */
// Debe ser UN solo literal (sin "+" ni plantillas): así el cliente de Supabase infiere los tipos de las columnas.
const COLUMNAS_CITA =
    "id, fecha_hora, nombre, estado, referencia, sintoma, telefono, motivo, atendido_por, observaciones, registrado_por_id, servicio_id, servicio_nombre, precio_etiqueta, precio_monto" as const;

export interface Cita {
    id: number;
    nombre: string;
    fecha_hora: string;
    telefono: string | null;
    referencia: string;
    sintoma: string | null;
    observaciones: string | null;
    registrado_por_id: string | null;
    motivo: string | null;
    estado: 'pendiente' | 'completada' | 'cancelada' | null;
    atendido_por: string | null;
    servicio_id: string | null;
    servicio_nombre: string | null;
    precio_etiqueta: string | null;
    precio_monto: number | null;
}

export type CitaResumen = Pick<Cita,
    | "id"
    | "fecha_hora"
    | "nombre"
    | "estado"
    | "referencia"
    | "sintoma"
    | "telefono"
    | "motivo"
    | "atendido_por"
    | "observaciones"
    | "registrado_por_id"
    | "servicio_id"
    | "servicio_nombre"
    | "precio_etiqueta"
    | "precio_monto"
    
>;

export async function getCitasDelMes(year: number, month: number): Promise<CitaResumen[]> {
    const startDateStr = new Date(year, month, 1).toISOString();
    const endDateStr   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
        .from("citas")
        .select(COLUMNAS_CITA)
        .gte("fecha_hora", startDateStr)
        .lte("fecha_hora", endDateStr)
        .order("fecha_hora", { ascending: true });

    if (error) console.error("getCitasDelMes:", error);
    return data ?? [];
}

export async function getDiasInhabilesDelMes(year: number, month: number): Promise<Set<string>> {
    const startDate = new Date(year, month, 1).toISOString().split("T")[0];
    const endDate   = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .gte("fecha", startDate)
        .lte("fecha", endDate);

    return new Set(data?.map(d => d.fecha) ?? []);
}

async function esDiaBloqueado(fechaISO: string): Promise<boolean> {
    const { data: inhabil } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .eq("fecha", fechaISO)
        .maybeSingle();

    if (inhabil) return true;

    const { data: evento } = await supabase
        .from("eventos_dia")
        .select("fecha")
        .eq("fecha", fechaISO)
        .eq("restringe_dia", true)
        .maybeSingle();

    return !!evento;
}

export async function completarCita(citaId: number): Promise<void> {
    const { error } = await supabase
        .from("citas")
        .update({ estado: "completada" })
        .eq("id", citaId);

    if (error) throw new Error(`completarCita: ${error.message}`);
}

export async function cancelarCita(citaId: number): Promise<void> {
    const { error } = await supabase
        .from("citas")
        .update({ estado: "cancelada" })
        .eq("id", citaId);

    if (error) throw new Error(`cancelarCita: ${error.message}`);
}

export async function reagendarCita(
    citaId: number,
    nuevaFechaLocal: string,
    registradoPor: string
): Promise<void> {
    const fechaSoloDia = nuevaFechaLocal.split("T")[0];

    if (await esDiaBloqueado(fechaSoloDia)) {
        throw new Error(`El día ${fechaSoloDia} está bloqueado (es inhábil o tiene un evento de todo el día).`);
    }

    const { data: original, error: errorFetch } = await supabase
        .from("citas")
        .select("nombre, telefono, motivo, sintoma, referencia, atendido_por, observaciones, servicio_id, servicio_nombre, precio_etiqueta, precio_monto")
        .eq("id", citaId)
        .single();

    if (errorFetch || !original) throw new Error("No se encontró la cita original.");

    const fechaObj     = new Date(`${nuevaFechaLocal}-06:00`);
    const nuevaFechaISO = fechaObj.toISOString();

    const { error: insertError } = await supabase.from("citas").insert({
        nombre:            original.nombre,
        telefono:          original.telefono,
        motivo:            original.motivo,
        sintoma:           original.sintoma,
        referencia:        original.referencia,
        atendido_por:      original.atendido_por,
        observaciones:     original.observaciones,
        servicio_id:       original.servicio_id,
        servicio_nombre:   original.servicio_nombre,
        precio_etiqueta:   original.precio_etiqueta,
        precio_monto:      original.precio_monto,
        fecha_hora:        nuevaFechaISO,
        estado:            "pendiente",
        registrado_por_id: registradoPor,
    });

    if (insertError) throw new Error(`reagendarCita (insert): ${insertError.message}`);

    const fechaTexto = fechaObj.toLocaleString("es-MX", {
        timeZone: "America/Merida",
        year: "numeric", month: "numeric", day: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const nota = `\n[Cita reagendada para el: ${fechaTexto} por ${registradoPor}]`;

    const { error: updateError } = await supabase
        .from("citas")
        .update({
            estado:        "cancelada",
            observaciones: (original.observaciones ?? "") + nota,
        })
        .eq("id", citaId);

    if (updateError) throw new Error(`reagendarCita (update): ${updateError.message}`);
}

export async function toggleDiaInhabil(fecha: string, esInhabil: boolean): Promise<void> {
    if (esInhabil) {
        await supabase.from("dias_inhabiles").delete().eq("fecha", fecha);
    } else {
        await supabase.from("dias_inhabiles").insert({ fecha });
    }
}

export async function procesarPeriodoInhabil(
    fechaInicio: string,
    fechaFin: string,
    operacion: "bloquear" | "habilitar"
): Promise<void> {
    const start = new Date(`${fechaInicio}T12:00:00`);
    const end   = new Date(`${fechaFin}T12:00:00`);

    const fechas: string[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        fechas.push(d.toISOString().split("T")[0]);
    }

    if (fechas.length === 0) return;

    if (operacion === "bloquear") {
        await supabase
            .from("dias_inhabiles")
            .upsert(fechas.map(f => ({ fecha: f })), { onConflict: "fecha" });
    } else {
        await supabase.from("dias_inhabiles").delete().in("fecha", fechas);
    }
}

export async function getDiasBloqueadosDesdeHoy(): Promise<string[]> {
    const hoy = new Date().toISOString().split("T")[0];

    const [ { data: inhabiles }, { data: eventos } ] = await Promise.all([
        supabase.from("dias_inhabiles").select("fecha").gte("fecha", hoy),
        supabase.from("eventos_dia").select("fecha").gte("fecha", hoy).eq("restringe_dia", true)
    ]);
    
    const diasBloqueados = new Set<string>();
    
    inhabiles?.forEach(d => diasBloqueados.add(d.fecha));
    eventos?.forEach(e => diasBloqueados.add(e.fecha));
    
    return Array.from(diasBloqueados);
}

export async function crearCita(params: {
    nombre: string;
    telefono: string | null;
    sintoma: string | null;
    referencia: string;
    motivo: string;
    fechaLocal: string;
    observaciones: string | null;
    atendidoPor: string;
    registradoPorId: string;
    servicioId?: string | null;
    precioId?: string | null;
}): Promise<void> {
    const fechaObj = new Date(`${params.fechaLocal}-06:00`);
    const fechaISO = fechaObj.toISOString();
    const fechaSoloDia = params.fechaLocal.split("T")[0];
    
    const { data: diaBloqueado } = await supabase
        .from("dias_inhabiles")
        .select("fecha")
        .eq("fecha", fechaSoloDia)
        .maybeSingle();
    
    if (await esDiaBloqueado(fechaSoloDia)) {
        throw new Error(`⚠️ El día seleccionado (${fechaSoloDia}) está bloqueado como inhábil o por un evento. Elige otra fecha.`);
    }
    
    const { data: citaExistente } = await supabase
        .from("citas")
        .select("id")
        .eq("fecha_hora", fechaISO)
        .eq("atendido_por", params.atendidoPor)
        .neq("estado", "cancelada")
        .maybeSingle();
    
    if (citaExistente) {
        throw new Error(`⚠️ Agenda ocupada: ${params.atendidoPor} ya tiene una cita a esa hora.`);
    }
    
    let servicio: PrecioParaCita | null = null;
    if (params.servicioId || params.precioId) {
        if (!params.servicioId || !params.precioId) {
            throw new Error("⚠️ Selecciona el servicio y el precio.");
        }
        servicio = await getPrecioParaCita(params.servicioId, params.precioId);
        if (!servicio) {
            throw new Error("⚠️ El servicio o precio seleccionado ya no está disponible. Actualiza la página y elige de nuevo.");
        }
    }

    const { error } = await supabase.from("citas").insert([{
        nombre:            params.nombre,
        telefono:          params.telefono,
        sintoma:           params.sintoma,
        referencia:        params.referencia,
        motivo:            params.motivo,
        fecha_hora:        fechaISO,
        observaciones:     params.observaciones,
        estado:            "pendiente",
        registrado_por_id: params.registradoPorId,
        atendido_por:      params.atendidoPor,
        servicio_id:       servicio?.servicio_id ?? null,
        servicio_nombre:   servicio?.servicio_nombre ?? null,
        precio_etiqueta:   servicio?.precio_etiqueta ?? null,
        precio_monto:      servicio?.precio_monto ?? null,
    }]);

    if (error) throw new Error(`crearCita: ${error.message}`);
}

export interface CitaLote {
    nombre: string;
    telefono: string | null;
    sintoma: string | null;
    referencia: string;
    motivo: string;
    fechaLocal: string;          
    observaciones: string | null;
    atendidoPor: string;
    servicio: "TMS" | "NFB";     
    servicioId?: string | null;
    precioId?: string | null;
}

export interface ResultadoLote {
    index: number;               
    nombre: string;
    exito: boolean;
    error?: string;
}

export async function crearCitasEnLote(
    citas: CitaLote[],
    registradoPorId: string,
): Promise<ResultadoLote[]> {
    const resultados: ResultadoLote[] = [];

    const serviciosResueltos = new Map<string, PrecioParaCita | null>();
    const resolverServicio = async (servicioId: string, precioId: string) => {
        const clave = `${servicioId}:${precioId}`;
        if (!serviciosResueltos.has(clave)) {
            serviciosResueltos.set(clave, await getPrecioParaCita(servicioId, precioId));
        }
        return serviciosResueltos.get(clave) ?? null;
    };

    for (let i = 0; i < citas.length; i++) {
        const c = citas[i];

        try {
            let servicioCopia: PrecioParaCita | null = null;
            if (c.servicioId || c.precioId) {
                if (!c.servicioId || !c.precioId) {
                    throw new Error("Selecciona el servicio y el precio.");
                }
                servicioCopia = await resolverServicio(c.servicioId, c.precioId);
                if (!servicioCopia) {
                    throw new Error("El servicio o precio seleccionado ya no está disponible. Actualiza la página y vuelve a intentarlo.");
                }
            }

            const fechaSoloDia = c.fechaLocal.split("T")[0];

            if (await esDiaBloqueado(fechaSoloDia)) {
                throw new Error(
                    `El día ${fechaSoloDia} está bloqueado. Elige otra fecha.`
                );
            }

            const fechaObj = new Date(`${c.fechaLocal}-06:00`);
            const fechaISO = fechaObj.toISOString();

            const { data: citaExistente } = await supabase
                .from("citas")
                .select("id")
                .eq("fecha_hora", fechaISO)
                .eq("atendido_por", c.atendidoPor)
                .neq("estado", "cancelada")
                .maybeSingle();

            if (citaExistente) {
                throw new Error(
                    `Agenda ocupada: ${c.atendidoPor} ya tiene una cita a esa hora.`,
                );
            }

            const { error } = await supabase.from("citas").insert([{
                nombre:            c.nombre,
                telefono:          c.telefono,
                sintoma:           c.sintoma,
                referencia:        c.referencia,
                motivo:            c.motivo,
                fecha_hora:        fechaISO,
                observaciones:     c.observaciones
                                    ? `[${c.servicio}] ${c.observaciones}`
                                    : `[${c.servicio}]`,
                estado:            "pendiente",
                registrado_por_id: registradoPorId,
                atendido_por:      c.atendidoPor,
                servicio_id:       servicioCopia?.servicio_id ?? null,
                servicio_nombre:   servicioCopia?.servicio_nombre ?? null,
                precio_etiqueta:   servicioCopia?.precio_etiqueta ?? null,
                precio_monto:      servicioCopia?.precio_monto ?? null,
            }]);

            if (error) throw new Error(error.message);

            resultados.push({ index: i, nombre: c.nombre, exito: true });

        } catch (e) {
            resultados.push({
                index:  i,
                nombre: c.nombre,
                exito:  false,
                error:  e instanceof Error ? e.message : "Error desconocido",
            });
        }
    }

    return resultados;
}


export type EstadoCita = "pendiente" | "completada" | "cancelada";
export const ESTADOS_CITA: EstadoCita[] = ["pendiente", "completada", "cancelada"];

export type CampoBusqueda = "nombre" | "sintoma" | "telefono" | "observaciones" | "motivo";
export const CAMPOS_BUSQUEDA: CampoBusqueda[] = ["nombre", "sintoma", "telefono", "observaciones", "motivo"];

export async function getServiciosParaFiltro(): Promise<{ id: string; nombre: string }[]> {
    const { data, error } = await supabase
        .from("servicios")
        .select("id, nombre")
        .order("nombre", { ascending: true });

    if (error) {
        console.error("getServiciosParaFiltro:", error);
        return [];
    }
    return (data ?? []).map(s => ({ id: String(s.id), nombre: String(s.nombre) }));
}

export interface FiltrosBusqueda {
    q: string;
    campos: CampoBusqueda[];
    referencias: string[];
    estados: EstadoCita[];
    atendidoPor: string[];
    registradoPor: string[];
    servicios?: string[];
    offset: number;
    limit: number;
}

function patronIlike(termino: string): string {
    const literal = termino.replace(/[\\%_]/g, "\\$&");
    const patron  = `%${literal}%`;
    return `"${patron.replace(/[\\"]/g, "\\$&")}"`;
}

export async function buscarCitas(f: FiltrosBusqueda): Promise<{ citas: CitaResumen[]; total: number }> {
    let query = supabase
        .from("citas")
        .select(COLUMNAS_CITA, { count: "exact" });

    const terminos = f.q.trim().split(/\s+/).filter(Boolean).slice(0, 6);
    const campos   = f.campos.length ? f.campos : CAMPOS_BUSQUEDA;

    for (const t of terminos) {
        const patron = patronIlike(t);
        query = query.or(campos.map(c => `${c}.ilike.${patron}`).join(","));
    }

    if (f.referencias.length)   query = query.in("referencia", f.referencias);
    if (f.atendidoPor.length)   query = query.in("atendido_por", f.atendidoPor);
    if (f.registradoPor.length) query = query.in("registrado_por_id", f.registradoPor);
    if (f.servicios?.length)    query = query.in("servicio_id", f.servicios);

    if (f.estados.length && f.estados.length < ESTADOS_CITA.length) {
        const partes = f.estados.map(e => `estado.eq.${e}`);
        if (f.estados.includes("pendiente")) partes.push("estado.is.null");
        query = query.or(partes.join(","));
    }

    const { data, error, count } = await query
        .order("fecha_hora", { ascending: false })
        .order("id", { ascending: false })
        .range(f.offset, f.offset + f.limit - 1);

    if (error) throw new Error(`buscarCitas: ${error.message}`);
    return { citas: (data ?? []) as CitaResumen[], total: count ?? 0 };
}

export async function cambiarEstadoCita(citaId: number, estado: EstadoCita): Promise<void> {
    const { data, error } = await supabase
        .from("citas")
        .update({ estado })
        .eq("id", citaId)
        .select("id");

    if (error) throw new Error(`cambiarEstadoCita: ${error.message}`);
    if (!data?.length) throw new Error("No se encontró la cita.");
}

export async function eliminarCita(citaId: number): Promise<void> {
    const { data, error } = await supabase
        .from("citas")
        .delete()
        .eq("id", citaId)
        .select("id");

    if (error) throw new Error(`eliminarCita: ${error.message}`);
    if (!data?.length) throw new Error("No se encontró la cita o no tienes permiso para eliminarla.");
}