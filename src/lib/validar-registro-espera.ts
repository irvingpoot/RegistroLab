/**
 * @file validar-registro-espera.ts
 * @description Limpieza y validación de los datos del formulario PÚBLICO de la
 * lista de espera. Corre en el servidor: nunca confíes en lo que valide el navegador.
 *
 * Qué evita:
 *  - Caracteres de control y "invisibles" (cero-ancho, override bidireccional) que
 *    sirven para falsear nombres o romper vistas.
 *  - Etiquetas HTML en el motivo (el render ya escapa, esto es defensa extra).
 *  - Texto gigante, teléfonos con letras y enlaces de spam.
 * La inyección SQL no aplica: supabase-js envía los valores como parámetros.
 */

export interface RegistroPublico {
    nombre: string;
    telefono: string;
    motivo: string;
}

export type ErroresRegistro = Partial<Record<keyof RegistroPublico, string>>;

export const LIMITES = { nombre: 100, telefono: 20, motivo: 100 } as const;

const INVISIBLES = /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g;

function limpiar(valor: unknown, max: number): string {
    return String(valor ?? "")
        .normalize("NFC")
        .replace(/\s+/g, " ")
        .replace(INVISIBLES, "")
        .trim()
        .slice(0, max);
}

const REGEX_NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const REGEX_TELEFONO = /^\+?[0-9()\s.-]+$/;
const REGEX_ENLACE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|mx|io|ru|xyz|info|top)\b)/i;

export function validarRegistroPublico(raw: Record<string, unknown>): {
    datos: RegistroPublico;
    errores: ErroresRegistro;
} {
    const datos: RegistroPublico = {
        nombre: limpiar(raw.nombre, LIMITES.nombre),
        telefono: limpiar(raw.telefono, LIMITES.telefono),
        motivo: limpiar(raw.motivo, LIMITES.motivo + 20).replace(/[<>]/g, "").slice(0, LIMITES.motivo).trim(),
    };
    const errores: ErroresRegistro = {};

    const letrasNombre = datos.nombre.match(/\p{L}/gu)?.length ?? 0;
    if (!datos.nombre) errores.nombre = "Escribe tu nombre completo.";
    else if (letrasNombre < 2 || !REGEX_NOMBRE.test(datos.nombre))
        errores.nombre = "Usa solo letras, espacios, puntos o guiones.";

    const digitos = datos.telefono.replace(/\D/g, "");
    if (!datos.telefono) errores.telefono = "Escribe tu número de teléfono.";
    else if (!REGEX_TELEFONO.test(datos.telefono) || digitos.length < 7 || digitos.length > 15)
        errores.telefono = "Escribe un número válido (de 7 a 15 dígitos).";

    if (!datos.motivo) errores.motivo = "Cuéntanos brevemente el motivo.";
    else if (datos.motivo.length < 3 || !/\p{L}/u.test(datos.motivo))
        errores.motivo = "Escribe al menos una palabra o frase corta.";
    else if (REGEX_ENLACE.test(datos.motivo))
        errores.motivo = "El motivo no puede incluir enlaces.";

    return { datos, errores };
}