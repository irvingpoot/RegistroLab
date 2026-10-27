/**
 * @file api/expediente/respuesta.ts
 * @description GET: respuestas completas de un cuestionario del paciente (fase indicada).
 * Lo usa el modal "Ver respuestas" del expediente de sueño (utils/client/evaluacion-remota.ts).
 *
 *   /api/expediente/respuesta?paciente_id=12&cuestionario=psqi&fase=pre
 *   → 200 { updated_at, datos }  |  400 parámetros  |  401 sin sesión  |  403 sin permiso  |  404 no hay respuesta
 *
 * Seguridad: exige sesión activa de Clerk y excluye al rol `recepcion` (los expedientes son
 * solo para psicólogos). Si tu middleware ya protege /api con `tieneAccesoRuta`, puedes quitar
 * la comprobación de rol de aquí.
 */

import type { APIRoute } from "astro";
import { CUESTIONARIOS } from "../../../data/cuestionarios";
import { esFase } from "../../../data/fases";
import { getRespuestaCuestionario } from "../../../services/expediente-sueno.service";

export const prerender = false;

const json = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "private, no-store",
        },
    });

export const GET: APIRoute = async ({ locals, url }) => {
    const user = await locals.currentUser();
    if (!user) return json({ error: "No autorizado" }, 401);
    if (locals.userRole === "recepcion") return json({ error: "Sin permiso" }, 403);

    const pacienteId = url.searchParams.get("paciente_id");
    const cuestionario = url.searchParams.get("cuestionario");
    const fase = url.searchParams.get("fase");

    if (
        !pacienteId ||
        !/^\d+$/.test(pacienteId) ||
        !cuestionario ||
        !(CUESTIONARIOS as readonly string[]).includes(cuestionario) ||
        !esFase(fase)
    ) {
        return json({ error: "Parámetros inválidos" }, 400);
    }

    const { respuesta, error } = await getRespuestaCuestionario({ pacienteId, cuestionario, fase });

    if (error) {
        console.error("Error cargando respuesta:", error);
        return json({ error: "Error al consultar las respuestas" }, 500);
    }
    if (!respuesta) return json({ error: "Sin respuestas" }, 404);

    return json(respuesta);
};