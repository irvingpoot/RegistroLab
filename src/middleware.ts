import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/lista", "/registro", "/paciente/:id", "/citas"]);

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId } = auth()

    if (isProtectedRoute(context.request) && !userId) {
        return context.redirect("/")
    }

    if (userId && context.url.pathname === "/login") {
        return context.redirect("/lista");
    }
});