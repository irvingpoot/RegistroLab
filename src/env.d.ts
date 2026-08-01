/// <reference types="astro/client" />

export {};

declare global {
    namespace App {
        interface Locals {
            userRole?: import("./lib/permisos").Rol;
        }
    }

    interface CustomJwtSessionClaims {
        metadata: {
            role?: import("./lib/permisos").Rol;
        };
    }
}