/**
 * @file utils/client/html.ts
 * @description Utilidades para construir HTML en el navegador con datos que no son de confianza.
 */

const ENTIDADES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

export const esc = (valor: unknown): string => String(valor).replace(/[&<>"']/g, (c) => ENTIDADES[c]);
