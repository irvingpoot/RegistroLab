/**
 * @file data/cuestionarios.ts
 * @description Cuestionarios remotos del expediente de sueño: ids, enlaces y
 * diccionarios de preguntas para el modal "Ver respuestas".
 */

import type { Fase } from "./fases";

export const CUESTIONARIOS = ["epworth", "berlin", "psqi", "posicion_sueno"] as const;
export type Cuestionario = (typeof CUESTIONARIOS)[number];

export const urlCuestionario = (
    baseUrl: string,
    cuestionario: string,
    token: string,
    fase: Fase,
) => `${baseUrl}/cuestionarios/${cuestionario}/${token}?fase=${fase}`;

export const CLAVES_OCULTAS = [
    "puntaje",
    "Categoría 1 (Ronquido)",
    "Categoría 2 (Somnolencia)",
    "Categoría 3 (Hipertensión)",
    "Categoría 3 (Presión Arterial)",
    "Riesgo Global",
];

export const DICCIONARIOS: Record<string, Record<string, string>> = {
    epworth: {
        epworth_1: "Al estar sentado leyendo",
        epworth_2: "Viendo T.V.",
        epworth_3: "Sentado inactivo en un lugar público",
        epworth_4: "Como pasajero en un auto (1 hora)",
        epworth_5: "Recostado descansando por la tarde",
        epworth_6: "Sentado, hablando con alguien",
        epworth_7: "Sentado tranquilamente tras comer",
        epworth_8: "En un auto detenido por tráfico",
    },
    berlin: {
        edad: "Edad",
        altura: "Altura (cm)",
        peso: "Peso (kg)",
        sexo: "Sexo",
        ronca: "¿Ronca?",
        ronca_volumen: "Volumen del ronquido",
        ronca_frecuencia: "Frecuencia del ronquido",
        ronca_molesta: "¿Molesta a otros?",
        ronca_deja_de_respirar: "¿Deja de respirar?",
        despierta_cansado: "¿Despierta cansado?",
        se_siente_mal: "¿Fatiga diurna?",
        se_quedo_dormido: "¿Se durmió conduciendo?",
        se_quedo_dormido_frecuencia: "Frecuencia al conducir",
        hipertension: "¿Hipertensión?",
    },
    psqi: {
        hora_acostarse: "Hora habitual de acostarse",
        tiempo_dormir: "Tiempo para conciliar el sueño",
        hora_levantarse: "Hora habitual de levantarse",
        horas_sueno: "Horas de sueño reales",

        alteracion_1: "No poder dormir en 30 min",
        alteracion_2: "Despertar a media noche/madrugada",
        alteracion_3: "Tener que ir al baño",
        alteracion_4: "No poder respirar bien",
        alteracion_5: "Tos o ronquidos",
        alteracion_6: "Sentir frío",
        alteracion_7: "Sentir calor",
        alteracion_8: "Tener pesadillas",
        alteracion_9: "Sentir dolor",

        otra_causa: "Otra causa de alteración (descripción)",
        frecuencia_otra_alteracion: "Frecuencia de otra causa",

        calidad_sueno: "Calidad subjetiva del sueño",
        tomo_medicinas: "Uso de medicinas para dormir",
        dificultad_despierto: "Dificultad para mantenerse despierto",
        problema_entusiasmo: "Problema de entusiasmo/ánimo",

        pareja_companero: "Presencia de compañero de cama",
        compañero_1: "Pareja: Ronquidos fuertes",
        compañero_2: "Pareja: Pausas respiratorias",
        compañero_3: "Pareja: Movimientos de piernas",
        compañero_4: "Pareja: Desorientación/Confusión",
        compañero_5: "Pareja: Otro trastorno",
        otra_transtorno: "Desc. trastorno pareja",

        horas_sueno_estudio: "Horas Sueño (Dato Estudio Médico)",
        puntaje: "Puntaje Global PSQI",
    },
    posicion_sueno: {
        resumen: "Resumen de posiciones",
        supino: "Posición Supino (%)",
        prono: "Posición Prono (%)",
        lateral_izq: "Lateral Izquierdo (%)",
        lateral_der: "Lateral Derecho (%)",
    },
};
