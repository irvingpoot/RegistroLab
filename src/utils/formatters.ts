/**
 * @file utils/formatters.ts
 * @description Funciones puras de formato para el expediente del paciente.
 */

export const formatDate = (dateString?: string | null) => {
    if (!dateString) return "No registrado";
    const fechaLimpia = dateString.substring(0, 10);

    return new Date(fechaLimpia + "T12:00:00").toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return "";
    const fechaLimpia = dateString.substring(0, 10);

    return new Date(fechaLimpia + "T12:00:00").toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export const formatTime = (timeString?: string | null) => {
    if (!timeString) return "—";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
};

export const isEmptyTime = (timeString?: string | null) => !timeString;

export const extraerTiempo = (texto?: string | null) => {
    if (!texto) return { h: "", m: "" };
    const match = texto.match(/(\d+)h\s*(\d+)m/);
    if (match) return { h: match[1], m: match[2] };
    return { h: "", m: "" };
};

export const calcularEdad = (paciente: {
    edad?: number | null;
    fecha_nacimiento?: string | null;
}): number | string =>
    paciente.edad ||
    (paciente.fecha_nacimiento
        ? new Date().getFullYear() - new Date(paciente.fecha_nacimiento).getFullYear()
        : "N/A");

export const calcularIMC = (peso?: number | null, altura?: number | null) =>
    peso && altura ? (peso / (altura * altura)).toFixed(1) : "—";
