/**
 * @file expediente-sueno.actions.ts
 * @description Despacha el campo `action` del POST del expediente de sueño:
 * primero las acciones compartidas y luego las exclusivas (PSQI estudio y noches de poligrafía).
 */

import { ESCALAS_SUENO } from "../data/escalas-sueno";
import { CAMPOS_NOCHE_NUMERICOS } from "../data/campos-noche";
import { getInt, getNum } from "../utils/form-data";
import {
    conMensaje,
    ejecutarAccionComun,
    type ContextoAccion,
    type ResultadoAccion,
} from "./expediente.actions";
import * as sueno from "./expediente-sueno.service";

const parseCamposNoche = (fd: FormData): sueno.CamposNoche => {
    const campos: sueno.CamposNoche = {
        duracion_registro: `${getInt(fd, "dur_reg_h") ?? 0}h ${getInt(fd, "dur_reg_m") ?? 0}m`,
        duracion_evaluacion: `${getInt(fd, "dur_eval_h") ?? 0}h ${getInt(fd, "dur_eval_m") ?? 0}m`,
        fase: fd.get("fase") as string,
    };
    for (const campo of CAMPOS_NOCHE_NUMERICOS) {
        campos[campo] = getNum(fd, campo);
    }
    return campos;
};

export async function procesarAccionSueno(
    ctx: Omit<ContextoAccion, "escalas">,
): Promise<ResultadoAccion> {
    const { id, formData, pathname } = ctx;

    try {
        const comun = await ejecutarAccionComun({ ...ctx, escalas: ESCALAS_SUENO });
        if (comun) return comun;

        switch (formData.get("action")) {
            case "update_psqi_study": {
                await sueno.updatePsqiEstudio({
                    pacienteId: id,
                    fase: formData.get("fase") as string,
                    horas: parseFloat(formData.get("horas") as string),
                });
                return {};
            }

            case "registrar_reporte": {
                const { error } = await sueno.registrarNoche(id, parseCamposNoche(formData));
                if (error) {
                    console.error("Error guardando noche:", error);
                    return {};
                }
                return { redirectTo: conMensaje(pathname, "reporte_guardado") };
            }

            case "editar_noche": {
                const { error } = await sueno.editarNoche(
                    formData.get("id_noche") as string,
                    parseCamposNoche(formData),
                );
                if (error) {
                    console.error("Error editando noche:", error);
                    return {};
                }
                return { redirectTo: conMensaje(pathname, "reporte_guardado") };
            }

            case "eliminar_noche": {
                const { error } = await sueno.eliminarNoche(formData.get("id_noche") as string);
                if (error) {
                    console.error("Error eliminando noche:", error);
                    return {};
                }
                return { redirectTo: pathname };
            }
        }
    } catch (error) {
        console.error("Error en acción:", error);
    }

    return {};
}
