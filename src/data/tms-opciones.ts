/**
 * @file data/tms-opciones.ts
 * @description Opciones del formulario de sesión TMS (compartidas entre expedientes).
 */

export const SITIOS_ESTIMULACION = [
    { value: "DLPFC Izquierdo", label: "DLPFC Izquierdo" },
    { value: "DLPFC Derecho", label: "DLPFC Derecho" },
    { value: "Bilateral", label: "Bilateral (Izq + Der)" },
    { value: "Corteza Motora M1", label: "Corteza Motora (M1)" },
    { value: "Otro", label: "Otro" },
] as const;

export const FRECUENCIAS_SIMPLE = [
    { value: "1Hz", label: "1 Hz" },
    { value: "10Hz", label: "10 Hz" },
    { value: "TBS", label: "Theta Burst" },
    { value: "Otro", label: "Otro" },
] as const;

export const FRECUENCIAS_BILATERAL = [
    { value: "1Hz", label: "1 Hz" },
    { value: "10Hz", label: "10 Hz" },
    { value: "TBS", label: "TBS" },
] as const;
