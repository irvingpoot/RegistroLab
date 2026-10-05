/**
 * @file src/pages/api/horario/psicologo.ts
 * @description Alta de psicólogos, cambio de color y vinculación con su
 * cuenta de Clerk.
 *
 * PATCH  { psicologoId, color }                  -> dueño o admin cambia el color
 * POST   { id, nombre, color?, clerkUserId? }     -> SOLO admin: crea un psicólogo nuevo
 * PATCH  { psicologoId, clerkUserId }             -> SOLO admin: vincula/desvincula la cuenta
 *
 * (PATCH decide qué hacer según qué campos vengan en el body.)
 */

import type { APIRoute } from "astro";
import {
    actualizarColorPsicologo,
    crearPsicologo,
    eliminarPsicologo,
    obtenerPsicologoPorClerkId,
    vincularClerkUserId,
} from "../../../lib/horarios-db";
import { esHexValido } from "../../../lib/horario-utils";

function esAdmin(user: { publicMetadata?: Record<string, unknown> }): boolean {
    return user.publicMetadata?.role === "admin";
}

export const POST: APIRoute = async ({ request, locals }) => {
    const user = await locals.currentUser();
    if (!user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
    if (!esAdmin(user)) {
        return new Response(JSON.stringify({ error: "Solo un admin puede dar de alta psicólogos" }), {
            status: 403,
        });
    }

    let body: { id?: string; nombre?: string; color?: string; clerkUserId?: string | null };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
    }

    if (!body.id || !body.nombre) {
        return new Response(JSON.stringify({ error: "id y nombre son requeridos" }), { status: 400 });
    }
    if (body.color && !esHexValido(body.color)) {
        return new Response(JSON.stringify({ error: "Color hex inválido" }), { status: 400 });
    }

    try {
        await crearPsicologo({
            id: body.id,
            nombre: body.nombre,
            color: body.color ?? "#3b82f6",
            clerkUserId: body.clerkUserId ?? null,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 201 });
};

export const PATCH: APIRoute = async ({ request, locals }) => {
    const user = await locals.currentUser();
    if (!user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });

    let body: { psicologoId?: string; color?: string; clerkUserId?: string | null };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
    }

    if (!body.psicologoId) {
        return new Response(JSON.stringify({ error: "psicologoId es requerido" }), { status: 400 });
    }

    const admin = esAdmin(user);

    if ("clerkUserId" in body) {
        if (!admin) {
            return new Response(JSON.stringify({ error: "Solo un admin puede vincular cuentas" }), {
                status: 403,
            });
        }
        try {
            await vincularClerkUserId(body.psicologoId, body.clerkUserId ?? null);
        } catch (err) {
            return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (body.color) {
        if (!esHexValido(body.color)) {
            return new Response(JSON.stringify({ error: "Color hex inválido" }), { status: 400 });
        }
        const propio = await obtenerPsicologoPorClerkId(user.id);
        if (!admin && propio?.id !== body.psicologoId) {
            return new Response(
                JSON.stringify({ error: "No puedes cambiar el color de otro psicólogo" }),
                { status: 403 },
            );
        }
        try {
            await actualizarColorPsicologo(body.psicologoId, body.color);
        } catch (err) {
            return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Nada que actualizar" }), { status: 400 });
};

export const DELETE: APIRoute = async ({ request, locals }) => {
    const user = await locals.currentUser();
    if (!user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
    if (!esAdmin(user)) {
        return new Response(JSON.stringify({ error: "Solo un admin puede eliminar psicólogos" }), {
            status: 403,
        });
    }

    let body: { psicologoId?: string };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
    }

    if (!body.psicologoId) {
        return new Response(JSON.stringify({ error: "psicologoId es requerido" }), { status: 400 });
    }

    try {
        await eliminarPsicologo(body.psicologoId);
    } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
};