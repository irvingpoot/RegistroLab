/**
 * @file api/servicios/index.ts
 * @description Catálogo público de servicios y precios (solo lectura).
 *
 * - No depende de la sesión de Clerk, por eso se puede cachear en el CDN.
 * - Expone solo servicios activos y columnas públicas (id, nombre, descripcion, precios).
 * - Cada escritura en /api/servicios/admin purga la etiqueta y el CDN lo regenera.
 */

import type { APIRoute } from "astro";
import { CACHE_TAG_CATALOGO, getCatalogoPublico } from "../../../services/servicios.service";

export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        const servicios = await getCatalogoPublico();

        return new Response(JSON.stringify({ servicios }), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "public, max-age=0, must-revalidate",
                "Vercel-CDN-Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
                "Vercel-Cache-Tag": CACHE_TAG_CATALOGO,
            },
        });
    } catch (e) {
        console.error("Error leyendo el catálogo de servicios:", e);
        return new Response(JSON.stringify({ error: "No se pudo cargar el catálogo" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
            },
        });
    }
};