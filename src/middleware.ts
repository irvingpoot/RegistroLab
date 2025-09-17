import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

const isProtectedRoute = createRouteMatcher(["/retos"])

export const onRequest = clerkMiddleware((auth, context) => {
    const { userId, redirectToSignIn } = auth()

    if (isProtectedRoute(context.request) && !userId) {
        return redirectToSignIn()
    }

    if (userId && context.url.pathname === "/login") {
        return context.redirect("/lista");
    }
});