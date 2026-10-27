/**
 * @file utils/whatsapp.ts
 * @description Mensaje de WhatsApp con los enlaces de los cuestionarios remotos.
 * Una sola implementación usada por el servidor (valor inicial) y el cliente (al cambiar de fase).
 */

import { urlCuestionario } from "../data/cuestionarios";
import type { Fase } from "../data/fases";

export const buildMensajeWhatsApp = (params: {
    autor: string;
    baseUrl: string;
    token: string;
    fase: Fase;
}) => {
    const { autor, baseUrl, token, fase } = params;

    return [
        `Buen día. Soy ${autor}, del laboratorio del sueño y neurociencias de la UADY. Estos son los formularios para complementar el estudio de Apnea. Si tiene oportunidad de contestarlo con alguien más, por si hay algún dato que desconoce y alguien más pueda ayudarlo a responder.`,
        "",
        "Aquí le dejo los links:",
        "",
        "Indice de calidad de sueño de pitsburgh:",
        urlCuestionario(baseUrl, "psqi", token, fase),
        "",
        "Cuestionario Berlin:",
        urlCuestionario(baseUrl, "berlin", token, fase),
        "",
        "Escala Epworth de somnolencia:",
        urlCuestionario(baseUrl, "epworth", token, fase),
    ].join("\n");
};
