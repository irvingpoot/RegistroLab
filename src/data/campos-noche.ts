/**
 * @file data/campos-noche.ts
 * @description Campos numéricos de una noche de poligrafía (tabla `pacientes_reportes_sueno`).
 * Una sola fuente para el servidor (parseo del POST) y el cliente (llenar el modal de edición).
 * Los inputs del formulario usan `id="f-<campo>"` y `name="<campo>"`.
 */

export const CAMPOS_NOCHE_NUMERICOS = [
    "iah",
    "indice_apneas",
    "indice_hipopnea",
    "iai",
    "iao",
    "iac",
    "iam",
    "ido",
    "saturacion_promedio",
    "pulso_promedio",
    "ronquidos",
    "sat_90_min",
    "sat_90_porc",
    "sat_85_min",
    "sat_85_porc",
] as const;

export type CampoNoche = (typeof CAMPOS_NOCHE_NUMERICOS)[number];
