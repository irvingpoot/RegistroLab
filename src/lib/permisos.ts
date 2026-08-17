/**
 * @file permisos.ts
 * @description Fuente única de verdad para roles y control de acceso por ruta.
 *
 * Se usa tanto en middleware.ts (protección real de rutas) como en páginas
 * .astro (para reflejar visualmente qué opciones puede usar cada rol).
 * Si se agrega una ruta nueva accesible para "recepcion", solo se toca
 * este archivo — no hace falta editar el middleware ni cada página.
 */

export type Rol = "psicologo" | "recepcion" | "admin";

const RUTAS_RECEPCION: string[] = [
    "/dashboard",
    "/citas",
    "/nueva-cita",
    "/multiples-citas",
    "/editar-cita",
];

export function tieneAccesoRuta(rol: Rol | undefined, pathname: string): boolean {
    if (rol === "psicologo" || rol === "admin") return true;

    if (rol === "recepcion") {
        return RUTAS_RECEPCION.some((ruta) => {
            return pathname === ruta || pathname.startsWith(`${ruta}/`);
        });
    }

    return false;
}

export function puedeVerTareas(userId: string | undefined): boolean {
    const idRestringido = import.meta.env.ID_RESTRINGIDO;
    return userId !== idRestringido;
}

export function esUsuarioConAccesoEspecial(userId: string | undefined): boolean {
    const usuarioEspecifico = import.meta.env.USUARIO_ESPECIFICO;
    return userId === usuarioEspecifico;
}

export function puedeGestionarUsuarios(rol: Rol | undefined): boolean {
    return rol === "admin";
}