/**
 * @file manual-tipos.ts
 * @description Fuente única de verdad para los tipos de manual: nombre,
 * aclaración y color de acento. Lo usan la página, la tarjeta y el modal,
 * así un tipo nuevo se agrega en un solo lugar.
 *
 * Los colores siguen el sistema de acentos del dashboard (--a / --t):
 *   a = color base (bordes, fondos tintados)
 *   t = versión clara para texto e iconos sobre fondo oscuro
 */

export type TipoManual = "CANVA" | "WORD" | "DRIVE" | "VIDEO" | "EXCEL" | "WEB";

export interface Manual {
    id?: string;
    titulo: string;
    descripcion: string;
    url: string;
    tipo: TipoManual;
}

interface ConfigTipo {
    label: string;
    detalle: string;
    a: string;
    t: string;
}

export const TIPOS: Record<TipoManual, ConfigTipo> = {
    CANVA: { label: "Canva",  detalle: "Diseño o presentación", a: "6 182 212",   t: "103 232 249" },
    WORD:  { label: "Word",   detalle: "Word o Google Docs",    a: "59 130 246",  t: "147 197 253" },
    DRIVE: { label: "Drive",  detalle: "Carpeta o archivo",     a: "245 158 11",  t: "252 211 77"  },
    VIDEO: { label: "Video",  detalle: "Grabación o tutorial",  a: "244 63 94",   t: "253 164 175" },
    EXCEL: { label: "Excel",  detalle: "Excel o Sheets",        a: "16 185 129",  t: "110 231 183" },
    WEB:   { label: "Enlace", detalle: "Página web",            a: "148 163 184", t: "203 213 225" },
};

export const ORDEN_TIPOS = Object.keys(TIPOS) as TipoManual[];

export function resolverTipo(tipo?: string | null): TipoManual {
    return tipo && tipo in TIPOS ? (tipo as TipoManual) : "WEB";
}

export function estiloAcento(tipo: TipoManual): string {
    const { a, t } = TIPOS[tipo];
    return `--a: ${a}; --t: ${t};`;
}