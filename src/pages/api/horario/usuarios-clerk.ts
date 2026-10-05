/**
 * @file src/pages/api/horario/usuarios-clerk.ts
 * @description Lista los usuarios de Clerk para que un admin elija a quién
 * vincular un horario, en vez de tener que copiar/pegar un User ID a mano.
 *
 * Ajusta el import/llamada de `clerkClient` de abajo a como lo uses en el
 * resto del proyecto — aquí se asume el patrón estándar de @clerk/astro
 * (`clerkClient(context)`), pero si en tu setup lo tienes expuesto distinto
 * (ej. `locals.clerkClient`), solo cambia esas dos líneas.
 */

import type { APIRoute } from "astro";
import { clerkClient } from "@clerk/astro/server";

function esAdmin(user: { publicMetadata?: Record<string, unknown> }): boolean {
    return user.publicMetadata?.role === "admin";
}

export const GET: APIRoute = async (context) => {
    const user = await context.locals.currentUser();
    if (!user) return new Response(JSON.stringify({ error: "No autenticado" }), { status: 401 });
    if (!esAdmin(user)) {
        return new Response(JSON.stringify({ error: "Solo un admin puede ver esta lista" }), {
            status: 403,
        });
    }

    try {
        const { data } = await clerkClient(context).users.getUserList({ limit: 200 });

        const usuarios = data.map((u) => ({
            id: u.id,
            nombre:
                [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
                u.username ||
                u.emailAddresses[0]?.emailAddress ||
                u.id,
            email: u.emailAddresses[0]?.emailAddress ?? null,
        }));

        usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

        return new Response(JSON.stringify({ usuarios }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
    }
};