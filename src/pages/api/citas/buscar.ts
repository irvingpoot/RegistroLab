/**
 * @file api/citas/buscar.ts
 * @description GET /api/citas/buscar — búsqueda de citas para el gestor.
 * Query params: q, campo (múltiple), referencia, estado, atendido_por,
 * registrado_por (múltiples), offset, limit.
 */
import type { APIRoute } from "astro";
import {
    buscarCitas,
    CAMPOS_BUSQUEDA,
    ESTADOS_CITA,
    type CampoBusqueda,
    type EstadoCita,
} from "../../../services/citas.service";

export const prerender = false;

const REFERENCIAS_VALIDAS = ["Particular", "Servicio Medico", "Protocolo"];
const LIMITE_MAXIMO = 60;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

export const GET: APIRoute = async ({ url, locals }) => {
    const user = await locals.currentUser();
    if (!user) return json({ error: "No autorizado" }, 401);

    const p = url.searchParams;
    const entero = (valor: string | null, defecto: number) => {
        const n = parseInt(valor ?? "", 10);
        return Number.isFinite(n) && n >= 0 ? n : defecto;
    };

    try {
        const resultado = await buscarCitas({
            q:             (p.get("q") ?? "").slice(0, 120),
            campos:        p.getAll("campo").filter((c): c is CampoBusqueda => (CAMPOS_BUSQUEDA as string[]).includes(c)),
            referencias:   p.getAll("referencia").filter(r => REFERENCIAS_VALIDAS.includes(r)),
            estados:       p.getAll("estado").filter((e): e is EstadoCita => (ESTADOS_CITA as string[]).includes(e)),
            atendidoPor:   p.getAll("atendido_por").slice(0, 30),
            registradoPor: p.getAll("registrado_por").slice(0, 30),
            offset:        entero(p.get("offset"), 0),
            limit:         Math.min(Math.max(entero(p.get("limit"), 30), 1), LIMITE_MAXIMO),
        });
        return json(resultado);
    } catch (e) {
        console.error(e);
        return json({ error: "No se pudo completar la búsqueda." }, 500);
    }
};