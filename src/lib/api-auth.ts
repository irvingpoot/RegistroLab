/**
 * @file api-auth.ts
 * @description Protección de endpoints de /api: exige una sesión activa de Clerk.
 *
 * Uso al inicio de cada handler (antes de leer el cuerpo o tocar la base de datos):
 *
 *   const sinSesion = requerirSesion(locals);
 *   if (sinSesion) return sinSesion;
 *
 * Usa locals.auth(), que valida el token de sesión en el propio servidor. A diferencia de
 * locals.currentUser(), no hace una llamada a la API de Clerk en cada petición, así que no
 * agrega latencia ni cuenta contra los límites de peticiones de Clerk.
 */

import type { APIContext } from "astro";

export function requerirSesion(locals: APIContext["locals"]): Response | null {
    const { userId } = locals.auth();
    if (userId) return null;

    return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
        },
    });
}