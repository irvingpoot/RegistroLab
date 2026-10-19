/**
 * @file servicios.service.ts
 * @description Acceso a datos del catálogo de servicios y precios del laboratorio.
 *
 * SOLO SERVIDOR: usa la service role key, que se salta RLS. Nunca importar
 * este archivo desde componentes o scripts que corran en el navegador.
 */

import { createClient } from "@supabase/supabase-js";
import { dangerouslyDeleteByTag } from "@vercel/functions";

export interface PrecioPublico {
    id: string;
    etiqueta: string;
    monto: number;
}

export interface ServicioPublico {
    id: string;
    nombre: string;
    descripcion: string | null;
    precios: PrecioPublico[];
}

export interface ServicioAdmin extends ServicioPublico {
    activo: boolean;
}

export interface ServicioEntrada {
    id?: string;
    nombre: string;
    descripcion?: string | null;
    activo?: boolean;
    precios: { id?: string; etiqueta: string; monto: number }[];
}

export interface PrecioParaCita {
    servicio_id: string;
    servicio_nombre: string;
    precio_etiqueta: string;
    precio_monto: number;
}

export const CACHE_TAG_CATALOGO = "catalogo-servicios";

const supabaseUrl =
    import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL;
const serviceKey = import.meta.env.SUPABASE_KEY;

let _db: ReturnType<typeof createClient> | null = null;

function db() {
    if (!supabaseUrl || !serviceKey) {
        throw new Error(
            "Faltan SUPABASE_URL (o PUBLIC_SUPABASE_URL) y/o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor.",
        );
    }
    _db ??= createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return _db;
}

const TTL_MEMORIA_MS = 60_000;
let cacheMemoria: { datos: ServicioPublico[]; expira: number } | null = null;

type FilaServicio = {
    id: string;
    nombre: string;
    descripcion: string | null;
    activo?: boolean;
    servicio_precios: { id: string; etiqueta: string; monto: number | string; orden: number }[] | null;
};

function mapear(fila: FilaServicio): ServicioPublico {
    const precios = [...(fila.servicio_precios ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((p) => ({ id: p.id, etiqueta: p.etiqueta, monto: Number(p.monto) }));

    return {
        id: fila.id,
        nombre: fila.nombre,
        descripcion: fila.descripcion,
        precios,
    };
}

export async function getCatalogoPublico(): Promise<ServicioPublico[]> {
    if (cacheMemoria && cacheMemoria.expira > Date.now()) {
        return cacheMemoria.datos;
    }

    const { data, error } = await db()
        .from("servicios")
        .select("id, nombre, descripcion, servicio_precios(id, etiqueta, monto, orden)")
        .eq("activo", true)
        .order("nombre", { ascending: true });

    if (error) throw error;

    const datos = ((data ?? []) as unknown as FilaServicio[]).map(mapear);
    cacheMemoria = { datos, expira: Date.now() + TTL_MEMORIA_MS };
    return datos;
}

export async function getServiciosAdmin(): Promise<ServicioAdmin[]> {
    const { data, error } = await db()
        .from("servicios")
        .select("id, nombre, descripcion, activo, servicio_precios(id, etiqueta, monto, orden)")
        .order("nombre", { ascending: true });

    if (error) throw error;

    return ((data ?? []) as unknown as FilaServicio[]).map((fila) => ({
        ...mapear(fila),
        activo: fila.activo ?? true,
    }));
}

export async function guardarServicio(entrada: ServicioEntrada): Promise<string> {
    const { data, error } = await db().rpc("guardar_servicio", {
        p_id: entrada.id ?? null,
        p_nombre: entrada.nombre,
        p_descripcion: entrada.descripcion ?? null,
        p_activo: entrada.activo ?? true,
        p_precios: entrada.precios,
    } as never);

    if (error) throw error;
    return data as unknown as string;
}

export async function cambiarEstadoServicio(id: string, activo: boolean): Promise<void> {
    const { data, error } = await db()
        .from("servicios")
        .update({ activo } as never)
        .eq("id", id)
        .select("id");

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("servicio_no_encontrado");
}

export async function eliminarServicio(id: string): Promise<void> {
    const { data, error } = await db()
        .from("servicios")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("servicio_no_encontrado");
}

export async function getPrecioParaCita(
    servicioId: string,
    precioId: string,
): Promise<PrecioParaCita | null> {
    const { data, error } = await db()
        .from("servicio_precios")
        .select("id, etiqueta, monto, servicios!inner(id, nombre, activo)")
        .eq("id", precioId)
        .eq("servicio_id", servicioId)
        .eq("servicios.activo", true)
        .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const fila = data as unknown as {
        etiqueta: string;
        monto: number | string;
        servicios: { id: string; nombre: string };
    };

    return {
        servicio_id: fila.servicios.id,
        servicio_nombre: fila.servicios.nombre,
        precio_etiqueta: fila.etiqueta,
        precio_monto: Number(fila.monto),
    };
}

export async function purgarCacheCatalogo(): Promise<void> {
    cacheMemoria = null;

    if (!process.env.VERCEL) return;

    try {
        await dangerouslyDeleteByTag(CACHE_TAG_CATALOGO);
    } catch (e) {
        console.error("No se pudo purgar la caché del catálogo (se renovará por TTL):", e);
    }
}