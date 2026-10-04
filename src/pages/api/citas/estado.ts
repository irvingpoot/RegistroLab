/**
 * @file api/citas/estado.ts
 * @description POST /api/citas/estado — cambia el estado de una cita sin recargar la página.
 * Body JSON: { id: number, estado: "pendiente" | "completada" | "cancelada" }
 */
import type { APIRoute } from "astro";
import { cambiarEstadoCita, ESTADOS_CITA, type EstadoCita } from "../../../services/citas.service";

export const prerender = false;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request, locals }) => {
    const user = await locals.currentUser();
    if (!user) return json({ error: "No autorizado" }, 401);

    let body: { id?: unknown; estado?: unknown };
    try {
        body = await request.json();
    } catch {
        return json({ error: "Solicitud inválida" }, 400);
    }

    const id = Number(body.id);
    const estado = body.estado as EstadoCita;

    if (!Number.isInteger(id) || id <= 0 || !ESTADOS_CITA.includes(estado)) {
        return json({ error: "Datos inválidos" }, 400);
    }

    try {
        await cambiarEstadoCita(id, estado);
        return json({ ok: true, id, estado });
    } catch (e) {
        console.error(e);
        return json({ error: e instanceof Error ? e.message : "Error al actualizar" }, 500);
    }
};