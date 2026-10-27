/**
 * @file rate-limit.ts
 * @description Límite de intentos por clave (IP) en memoria, ventana deslizante.
 *
 * Limitación honesta: vive en la memoria del proceso. En un servidor único
 * funciona bien; en serverless (varias instancias) cada instancia cuenta por su
 * cuenta. Por eso el formulario también aplica un tope global en la base de datos.
 */

const intentos = new Map<string, number[]>();

export function permitirEnvio(clave: string, max = 8, ventanaMs = 10 * 60_000): boolean {
    const ahora = Date.now();
    const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);

    if (recientes.length >= max) {
        intentos.set(clave, recientes);
        return false;
    }
    recientes.push(ahora);
    intentos.set(clave, recientes);

    if (intentos.size > 5000) {
        for (const [k, v] of intentos) {
            if (v.every((t) => ahora - t >= ventanaMs)) intentos.delete(k);
        }
    }
    return true;
}