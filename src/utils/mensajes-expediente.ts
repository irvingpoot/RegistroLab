/**
 * @file utils/mensajes-expediente.ts
 * @description Mensajes de retroalimentación según el parámetro `?mensaje=` de la URL.
 */

const MENSAJES: Record<string, string> = {
    tms_guardado: "Sesión de TMS registrada correctamente.",
    puntajes_actualizados: "Los puntajes se han actualizado.",
    seguimiento_guardado: "Seguimiento registrado exitosamente.",
    nota_guardada: "Nota clínica guardada.",
    reporte_guardado: "Reporte de noche guardado correctamente.",
    error: "Ocurrió un error al procesar la solicitud.",
};

export const getMensaje = (param: string | null): string => (param ? (MENSAJES[param] ?? "") : "");
