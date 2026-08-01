/**
 * @file middleware.ts
 * @description Middleware de seguridad y control de sesiones (Clerk).
 * * FUNCIÓN PRINCIPAL:
 * - Intercepta todas las solicitudes al servidor (SSR) antes de renderizar la página.
 * * LÓGICA DE PROTECCIÓN:
 * 1. Rutas Protegidas (`isProtectedRoute`): Define la lista blanca de rutas que requieren sesión activa
 * (ej: /dashboard, /lista, /registro). Si no hay usuario, redirige al inicio (/).
 * 2. Redirección Inversa: Si un usuario YA logueado intenta entrar explícitamente a `/login`
 * (o la landing page de login), lo redirige automáticamente al `/dashboard` para mejorar la UX.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";
import { tieneAccesoRuta } from "./lib/permisos";

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
    '/registro(.*)',
    '/paciente(.*)',
    '/editar-paciente(.*)',
    '/editar-cita(.*)',
    '/pendientes(.*)'
]);

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId, sessionClaims } = auth();
    const role = sessionClaims?.metadata?.role;

    if (isProtectedRoute(context.request) && !userId) {
        return context.redirect("/")
    }

    if (userId && context.url.pathname === "/login") {
        return context.redirect("/dashboard");
    }

    if (
        userId &&
        isProtectedRoute(context.request) &&
        !tieneAccesoRuta(role, context.url.pathname)
    ) {
        return context.redirect("/dashboard");
    }

    context.locals.userRole = role;
});