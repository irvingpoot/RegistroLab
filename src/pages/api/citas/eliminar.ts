import type { APIRoute } from "astro";
import { eliminarCita } from "../../../services/citas.service";

export const POST: APIRoute = async ({ request }) => {
    let body: { id?: number };
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0) {
        return Response.json({ error: "ID de cita inválido" }, { status: 400 });
    }

    try {
        await eliminarCita(id);
        return Response.json({ ok: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Error desconocido";
        return Response.json({ error: msg }, { status: 500 });
    }
};