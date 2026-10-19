/**
 * @file api/servicios/admin.ts
 * @description Escritura del catálogo de servicios (crear, editar, activar/desactivar, eliminar).
 *
 * Protección (sin depender de Supabase para autorizar):
 *   1. Solo JSON (Content-Type: application/json) y Origin del mismo sitio.
 *   2. Sesión de Clerk.
 *   3. Rol con acceso a /servicios (misma regla que usa el dashboard).
 *   4. Validación del cuerpo antes de tocar la base de datos.
 * La escritura usa la service role key del servidor (ver servicios.service.ts).
 */

import type { APIRoute, APIContext } from "astro";
import { tieneAccesoRuta } from "../../../lib/permisos";
import {
    guardarServicio,
    cambiarEstadoServicio,
    eliminarServicio,
    purgarCacheCatalogo,
    type ServicioEntrada,
} from "../../../services/servicios.service";

export const prerender = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PRECIOS = 10;

const json = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });


function autorizar({ request, locals }: APIContext): Response | null {
    const tipo = request.headers.get("content-type") ?? "";
    if (!tipo.toLowerCase().startsWith("application/json")) {
        return json({ error: "Tipo de contenido no permitido" }, 415);
    }

    const origen = request.headers.get("origin");
    if (origen && origen !== new URL(request.url).origin) {
        return json({ error: "Origen no permitido" }, 403);
    }

    const { userId } = locals.auth();
    if (!userId) {
        return json({ error: "Sesión requerida" }, 401);
    }

    if (!tieneAccesoRuta(locals.userRole, "/servicios")) {
        return json({ error: "No tienes permiso para administrar servicios" }, 403);
    }

    return null;
}

async function leerJson(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const cuerpo = await request.json();
        return cuerpo && typeof cuerpo === "object" && !Array.isArray(cuerpo)
            ? (cuerpo as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
}

function validarServicio(
    cuerpo: Record<string, unknown>,
): { ok: true; datos: ServicioEntrada } | { ok: false; error: string } {
    const nombre = typeof cuerpo.nombre === "string" ? cuerpo.nombre.trim() : "";
    if (nombre.length < 2 || nombre.length > 120) {
        return { ok: false, error: "El nombre debe tener entre 2 y 120 caracteres" };
    }

    let descripcion: string | null = null;
    if (cuerpo.descripcion != null) {
        if (typeof cuerpo.descripcion !== "string") {
            return { ok: false, error: "La descripción no es válida" };
        }
        descripcion = cuerpo.descripcion.trim() || null;
        if (descripcion && descripcion.length > 300) {
            return { ok: false, error: "La descripción no puede pasar de 300 caracteres" };
        }
    }

    let id: string | undefined;
    if (cuerpo.id != null) {
        if (typeof cuerpo.id !== "string" || !UUID.test(cuerpo.id)) {
            return { ok: false, error: "Identificador de servicio no válido" };
        }
        id = cuerpo.id;
    }

    if (cuerpo.activo != null && typeof cuerpo.activo !== "boolean") {
        return { ok: false, error: "El estado no es válido" };
    }

    if (!Array.isArray(cuerpo.precios) || cuerpo.precios.length < 1) {
        return { ok: false, error: "Agrega al menos un precio" };
    }
    if (cuerpo.precios.length > MAX_PRECIOS) {
        return { ok: false, error: `Un servicio puede tener máximo ${MAX_PRECIOS} precios` };
    }

    const etiquetasVistas = new Set<string>();
    const precios: ServicioEntrada["precios"] = [];

    for (const bruto of cuerpo.precios) {
        if (!bruto || typeof bruto !== "object") {
            return { ok: false, error: "Hay un precio con formato no válido" };
        }
        const p = bruto as Record<string, unknown>;

        const etiqueta = typeof p.etiqueta === "string" ? p.etiqueta.trim() : "";
        if (etiqueta.length < 1 || etiqueta.length > 40) {
            return { ok: false, error: "Cada precio necesita una etiqueta de hasta 40 caracteres" };
        }
        const clave = etiqueta.toLowerCase();
        if (etiquetasVistas.has(clave)) {
            return { ok: false, error: `La etiqueta "${etiqueta}" está repetida en este servicio` };
        }
        etiquetasVistas.add(clave);

        const monto = typeof p.monto === "number" ? p.monto : Number.NaN;
        const centavosValidos = Number.isFinite(monto) && Math.abs(monto * 100 - Math.round(monto * 100)) < 1e-6;
        if (!centavosValidos || monto < 0 || monto > 1_000_000) {
            return { ok: false, error: `El monto de "${etiqueta}" debe estar entre 0 y 1,000,000 con máximo 2 decimales` };
        }

        let precioId: string | undefined;
        if (p.id != null) {
            if (typeof p.id !== "string" || !UUID.test(p.id)) {
                return { ok: false, error: "Identificador de precio no válido" };
            }
            precioId = p.id;
        }

        precios.push({ id: precioId, etiqueta, monto: Math.round(monto * 100) / 100 });
    }

    return {
        ok: true,
        datos: {
            id,
            nombre,
            descripcion,
            activo: typeof cuerpo.activo === "boolean" ? cuerpo.activo : undefined,
            precios,
        },
    };
}

function respuestaDeError(e: unknown): Response {
    const err = e as { code?: string; message?: string };
    const mensaje = err?.message ?? "";

    if (err?.code === "23505") {
        return json({ error: "Ya existe un servicio con ese nombre" }, 409);
    }
    if (mensaje.includes("servicio_no_encontrado")) {
        return json({ error: "El servicio ya no existe" }, 404);
    }
    if (mensaje.includes("precios_requeridos")) {
        return json({ error: "Agrega al menos un precio" }, 400);
    }

    console.error("Error en /api/servicios/admin:", e);
    return json({ error: "No se pudo completar la operación" }, 500);
}

export const POST: APIRoute = async (contexto) => {
    const rechazo = autorizar(contexto);
    if (rechazo) return rechazo;

    const cuerpo = await leerJson(contexto.request);
    if (!cuerpo) return json({ error: "Cuerpo de la petición no válido" }, 400);

    const validacion = validarServicio(cuerpo);
    if (!validacion.ok) return json({ error: validacion.error }, 400);

    try {
        const id = await guardarServicio(validacion.datos);
        await purgarCacheCatalogo();
        return json({ ok: true, id }, validacion.datos.id ? 200 : 201);
    } catch (e) {
        return respuestaDeError(e);
    }
};

export const PATCH: APIRoute = async (contexto) => {
    const rechazo = autorizar(contexto);
    if (rechazo) return rechazo;

    const cuerpo = await leerJson(contexto.request);
    if (!cuerpo) return json({ error: "Cuerpo de la petición no válido" }, 400);

    if (typeof cuerpo.id !== "string" || !UUID.test(cuerpo.id) || typeof cuerpo.activo !== "boolean") {
        return json({ error: "Datos no válidos" }, 400);
    }

    try {
        await cambiarEstadoServicio(cuerpo.id, cuerpo.activo);
        await purgarCacheCatalogo();
        return json({ ok: true });
    } catch (e) {
        return respuestaDeError(e);
    }
};

export const DELETE: APIRoute = async (contexto) => {
    const rechazo = autorizar(contexto);
    if (rechazo) return rechazo;

    const cuerpo = await leerJson(contexto.request);
    if (!cuerpo) return json({ error: "Cuerpo de la petición no válido" }, 400);

    if (typeof cuerpo.id !== "string" || !UUID.test(cuerpo.id)) {
        return json({ error: "Datos no válidos" }, 400);
    }

    try {
        await eliminarServicio(cuerpo.id);
        await purgarCacheCatalogo();
        return json({ ok: true });
    } catch (e) {
        return respuestaDeError(e);
    }
};