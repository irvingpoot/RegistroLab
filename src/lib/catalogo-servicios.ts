/**
 * @file catalogo-servicios.ts
 * @description Lectura del catálogo de servicios desde el navegador con caché local.
 *
 * Uso (por ejemplo en nueva-cita o en la agenda):
 *   import { obtenerCatalogo } from "../lib/catalogo-servicios";
 *   const servicios = await obtenerCatalogo();
 *
 * Solo para código que corre en el navegador.
 */

export interface PrecioCatalogo {
    id: string;
    etiqueta: string;
    monto: number;
}

export interface ServicioCatalogo {
    id: string;
    nombre: string;
    descripcion: string | null;
    precios: PrecioCatalogo[];
}

const CLAVE = "servicios:catalogo:v1";
const TTL_MS = 10 * 60 * 1000;

interface Guardado {
    guardadoEn: number;
    servicios: ServicioCatalogo[];
}

function leerLocal(): Guardado | null {
    try {
        const crudo = localStorage.getItem(CLAVE);
        if (!crudo) return null;
        const g = JSON.parse(crudo) as Guardado;
        return Array.isArray(g.servicios) && typeof g.guardadoEn === "number" ? g : null;
    } catch {
        return null;
    }
}

function guardarLocal(servicios: ServicioCatalogo[]): void {
    try {
        localStorage.setItem(CLAVE, JSON.stringify({ guardadoEn: Date.now(), servicios }));
    } catch {
        // Almacenamiento lleno o bloqueado: se sigue sin caché local.
    }
}

async function pedirAlServidor(): Promise<ServicioCatalogo[]> {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 8000);

    try {
        const res = await fetch("/api/servicios", {
            signal: control.signal,
            redirect: "error",
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("No se pudo cargar el catálogo de servicios");
        if (!(res.headers.get("content-type") ?? "").includes("application/json")) {
            throw new Error("Respuesta inesperada al cargar el catálogo de servicios");
        }
        const { servicios } = (await res.json()) as { servicios: ServicioCatalogo[] };
        guardarLocal(servicios);
        return servicios;
    } finally {
        clearTimeout(temporizador);
    }
}

export async function obtenerCatalogo(opciones: { forzar?: boolean } = {}): Promise<ServicioCatalogo[]> {
    if (!opciones.forzar) {
        const local = leerLocal();
        if (local) {
            if (Date.now() - local.guardadoEn > TTL_MS) {
                pedirAlServidor().catch(() => {});
            }
            return local.servicios;
        }
    }
    return pedirAlServidor();
}

export function limpiarCatalogoCache(): void {
    try {
        localStorage.removeItem(CLAVE);
    } catch {
        // Sin acceso a localStorage: nada que limpiar.
    }
}