export const currentVersion = "4.2.0";

export const isMajorUpdate = true;

export const updateDate = "27 de octubre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Lista de espera",
        description: "Se agregó una página para gestionar la lista de espera de pacientes que aún no se han agendado.",
        type: "feature"
    },
    {
        title: "Solicitud de cita",
        description: "Se agregó una funcionalidad para que los pacientes puedan solicitar una cita de entrevista mediante un link o QR.",
        type: "feature"
    },
    {
        title: "Guía de entrevista",
        description: "Se agregó una guía que muestra sugerencias de preguntas para diferentes tipos de entrevista.",
        type: "feature"
    },
    {
        title: "Optimizaciones de rendimiento",
        description: "Se implementaron optimizaciones para mejorar el rendimiento del expediente de paciente.",
        type: "feature"
    },
];