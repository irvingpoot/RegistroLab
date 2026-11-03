/**
 * @file middleware.ts
 * @description Middleware de seguridad y control de sesiones (Clerk).
 *
 * FUNCIÓN PRINCIPAL:
 * - Intercepta todas las solicitudes al servidor (SSR) antes de renderizar la página.
 *
 * LÓGICA DE PROTECCIÓN (ver `resolverRedireccion`):
 * 1. Rutas Protegidas (`isProtectedRoute`): lista blanca de rutas que requieren sesión activa
 *    (ej: /dashboard, /lista, /registro). Sin usuario, redirige al inicio (/).
 * 2. Redirección Inversa: si un usuario YA logueado entra a `/login`, va al `/dashboard`.
 * 3. Permisos por rol: si el rol no puede ver la ruta, vuelve al `/dashboard`.
 * 4. Sesión sin rol reconocido: va a `/sin-acceso`, una página pública. Antes se le mandaba a
 *    `/dashboard`, que también exige rol, y el navegador caía en un bucle de redirecciones.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { tieneAccesoRuta, esRolValido } from "./lib/permisos";
import type { Rol } from "./lib/permisos";

const isProtectedRoute = createRouteMatcher([
    '/dashboard',
    '/estadisticas',
    '/lista',
    '/citas',
    '/nueva-cita',
    '/multiples-citas',
    '/404',
    '/feedback',
    '/reportes',
    '/manuales',
    '/usuarios',
    '/servicios',
    '/horario',
    '/gestor',
    '/registro(.*)',
    '/paciente(.*)',
    '/editar-paciente(.*)',
    '/editar-cita(.*)',
    '/pendientes(.*)',
    '/waitlist'
]);

const RUTA_SIN_ACCESO = "/sin-acceso";

function resolverRedireccion(p: {
    userId: string | null | undefined;
    role: Rol | undefined;
    pathname: string;
    protegida: boolean;
}): string | null {
    const { userId, role, pathname, protegida } = p;

    if (!userId) {
        return protegida || pathname === RUTA_SIN_ACCESO ? "/" : null;
    }

    if (pathname === "/login") return role ? "/dashboard" : RUTA_SIN_ACCESO;

    if (!role) return protegida ? RUTA_SIN_ACCESO : null;

    if (pathname === RUTA_SIN_ACCESO) return tieneAccesoRuta(role, "/dashboard") ? "/dashboard" : null;

    if (protegida && !tieneAccesoRuta(role, pathname)) {
        return pathname === "/dashboard" ? RUTA_SIN_ACCESO : "/dashboard";
    }

    return null;
}

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId, sessionClaims } = auth();
    const claimRole = sessionClaims?.metadata?.role;
    const role = esRolValido(claimRole) ? claimRole : undefined;

    const destino = resolverRedireccion({
        userId,
        role,
        pathname: context.url.pathname,
        protegida: isProtectedRoute(context.request),
    });
    if (destino) return context.redirect(destino);

    context.locals.userRole = role;
});