/**
 * @file expediente.actions.ts
 * @description Acciones del POST COMPARTIDAS por los expedientes (sueño y ánimo).
 * `ejecutarAccionComun` devuelve `null` si la acción no es de este grupo, para que
 * cada expediente maneje después las suyas.
 */

import * as svc from "./expediente.service";
import {
    getFechaISO,
    getInt,
    getRaw,
    getStr,
    parsePuntajes,
    parsePuntajesExtra,
} from "../utils/form-data";

export interface ContextoAccion {
    id: string;
    formData: FormData;
    autor: string;
    pathname: string;
    escalas: readonly string[];
}

export interface ResultadoAccion {
    redirectTo?: string;
    mensaje?: string;
}

export const conMensaje = (pathname: string, mensaje: string) => `${pathname}?mensaje=${mensaje}`;

const parseSesionTms = (fd: FormData): svc.SesionTmsInput => {
    const sitio = getStr(fd, "sitio_estimulacion");
    const esBilateral = sitio === "Bilateral";

    return {
        fecha_aplicacion: getRaw(fd, "fecha"),
        observaciones: getRaw(fd, "observaciones"),
        umbral_motor: getInt(fd, "umbral_motor"),
        intensidad_tratamiento: getInt(fd, "intensidad_tratamiento"),
        total_pulsos: getInt(fd, "total_pulsos"),
        sitio_estimulacion: sitio,
        protocolo: getStr(fd, "protocolo"),
        frecuencia: esBilateral ? getStr(fd, "frecuencia_izq") : getStr(fd, "frecuencia"),
        frecuencia_derecha: esBilateral ? getStr(fd, "frecuencia_der") : null,
    };
};

export async function ejecutarAccionComun(ctx: ContextoAccion): Promise<ResultadoAccion | null> {
    const { id, formData, autor, pathname, escalas } = ctx;

    switch (formData.get("action")) {
        case "add_seguimiento": {
            const { error } = await svc.addSeguimiento({
                pacienteId: id,
                fecha: getFechaISO(formData),
                observacion: formData.get("observacion"),
                registradoPor: autor,
            });
            if (error) return { mensaje: "Error al guardar" };
            return { redirectTo: conMensaje(pathname, "seguimiento_guardado") };
        }

        case "edit_seguimiento": {
            const { error } = await svc.editSeguimiento({
                id: formData.get("id_seguimiento"),
                fecha: getFechaISO(formData),
                observacion: formData.get("observacion"),
            });
            if (error) throw error;
            return {};
        }

        case "delete_seguimiento": {
            const { error } = await svc.deleteSeguimiento(formData.get("id_seguimiento"));
            if (error) throw error;
            return {};
        }

        case "delete_patient": {
            const { error } = await svc.deletePaciente(id);
            if (error) throw error;
            return { redirectTo: "/lista?mensaje=eliminado" };
        }

        case "update_scores": {
            const { error } = await svc.updatePuntajes(id, parsePuntajes(formData, escalas));
            if (error) throw error;

            const extras = parsePuntajesExtra(formData);
            await svc.reemplazarPuntajesExtra(id, extras);

            return extras.length > 0
                ? { redirectTo: conMensaje(pathname, "puntajes_actualizados") }
                : {};
        }

        case "habilitar_tms": {
            const { error } = await svc.habilitarTms(id);
            if (error) console.error("Error habilitando TMS:", error);
            return {};
        }

        case "nueva_sesion_tms": {
            const { error } = await svc.crearSesionTms(id, parseSesionTms(formData));
            if (error) {
                console.error("Error creando sesión:", error);
                return {};
            }
            return { redirectTo: conMensaje(pathname, "tms_guardado") };
        }

        case "subir_consentimiento_tms": {
            const archivo = formData.get("archivo_pdf");
            if (archivo instanceof File && archivo.size > 0) {
                const { error } = await svc.subirConsentimientoTms(id, archivo);
                if (error) console.error("Error subiendo consentimiento:", error);
            }
            return {};
        }

        default:
            return null;
    }
}
