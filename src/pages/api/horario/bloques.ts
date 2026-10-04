/**
 * @file src/pages/api/horario/bloques.ts
 * @description Guarda de una sola vez todos los bloques de disponibilidad de
 * UN psicólogo (lo que el editor de la UI junta cuando el usuario da "Guardar").
 *
 * Body esperado (POST):
 *   {
 *     "psicologoId": "jesus-moo",
 *     "bloques": [{ "dia": "lunes", "horaInicio": "10:00" }, ...]
 *   }
 *
 * Reglas de acceso (mismo espíritu que src/lib/permisos.ts):
 *   - Un psicólogo solo puede guardar bloques de SU PROPIO horario
 *     (clerk_user_id del registro debe coincidir con el usuario actual).
 *   - Un usuario con `publicMetadata.role === "admin"` puede guardar
 *     el horario de cualquier psicólogo.
 */

import type { APIRoute } from "astro";
import { obtenerPsicologoPorClerkId, reemplazarBloques } from "../../../lib/horarios-db";
import type { Dia } from "../../../data/horarios.config";

const DIAS_VALIDOS: Dia[] = ["lunes", "martes", "miercoles", "jueves", "viernes"];
const HORA_REGEX = /^([01]\d|2[0-3]):(00|30)$/;

export const POST: APIRoute = async ({ request, locals }) => {
    const user = await locals.currentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
    }

    let body: { psicologoId?: string; bloques?: { dia: string; horaInicio: string }[] };
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
    }

    const { psicologoId, bloques } = body;
    if (!psicologoId || !Array.isArray(bloques)) {
        return new Response(JSON.stringify({ error: "psicologoId y bloques son requeridos" }), {
            status: 400,
        });
    }

    for (const b of bloques) {
        if (!DIAS_VALIDOS.includes(b.dia as Dia) || !HORA_REGEX.test(b.horaInicio)) {
            return new Response(
                JSON.stringify({ error: `Bloque inválido: ${JSON.stringify(b)}` }),
                { status: 400 },
            );
        }
    }

    const esAdmin = user.publicMetadata?.role === "admin";
    const propio = await obtenerPsicologoPorClerkId(user.id);
    const puedeEditar = esAdmin || propio?.id === psicologoId;

    if (!puedeEditar) {
        return new Response(
            JSON.stringify({ error: "No puedes editar el horario de otro psicólogo" }),
            { status: 403 },
        );
    }

    try {
        await reemplazarBloques(
            psicologoId,
            bloques.map((b) => ({ dia: b.dia as Dia, horaInicio: b.horaInicio })),
        );
    } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
};