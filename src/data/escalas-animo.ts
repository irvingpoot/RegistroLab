/**
 * @file data/escalas-animo.ts
 * @description Escalas de puntaje del expediente de estado de ánimo.
 * Cada escala tiene columnas `<escala>_pre`, `<escala>_inter` y `<escala>_post` en `pacientes`.
 */

export const ESCALAS_ANIMO = ["hamilton_d", "hamilton_a", "isi", "beck", "banfe", "bai"] as const;

export type EscalaAnimo = (typeof ESCALAS_ANIMO)[number];

export const ETIQUETAS_ANIMO: Record<EscalaAnimo, string> = {
    hamilton_d: "Hamilton D",
    hamilton_a: "Hamilton A",
    isi: "Índice Severidad Insomnio (ISI)",
    beck: "Inventario de Depresión de Beck",
    banfe: "BANFE",
    bai: "Inventario de Ansiedad de Beck (BAI)",
};
