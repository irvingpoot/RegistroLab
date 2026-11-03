/**
 * @file expediente-animo.actions.ts
 * @description Despacha el campo `action` del POST del expediente de ánimo. Por ahora todas sus
 * acciones son las compartidas (seguimiento, puntajes, TMS, consentimiento, eliminar); si en el
 * futuro hay acciones exclusivas de ánimo, se agregan aquí después de `ejecutarAccionComun`.
 */

import { ESCALAS_ANIMO } from "../data/escalas-animo";
import {
    ejecutarAccionComun,
    type ContextoAccion,
    type ResultadoAccion,
} from "./expediente.actions";

export async function procesarAccionAnimo(
    ctx: Omit<ContextoAccion, "escalas">,
): Promise<ResultadoAccion> {
    try {
        const comun = await ejecutarAccionComun({ ...ctx, escalas: ESCALAS_ANIMO });
        if (comun) return comun;
    } catch (error) {
        console.error("Error en acción:", error);
    }

    return {};
}
