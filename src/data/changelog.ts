export const currentVersion = "2.0.0";

export const isMajorUpdate = false; 

export const updateDate = "26 de Enero, 2026";

// Opciones type: 'feature', 'fix', 'style'
export const changes = [
    {
        title: "Tipos de paciente",
        description: "Se agregó la funcionalidad para separar el registro de pacientes de sueño y ánimo.",
        type: "feature"
    },
    {
        title: "Sesiones TMS",
        description: "Se agregó la funcionalidad para gestionar sesiones de TMS para pacientes candidatos.",
        type: "feature"
    },
    {
        title: "Consentimiento TMS",
        description: "Se agregó la funcionalidad para gestionar el almacenamiento del consentimiento informado para sesiones de TMS.",
        type: "feature"
    },
    {
        title: "IMC en Berlín",
        description: "Se corrgió el algoritmo de la categoría 3 en la escala de Berlin para no considerar el IMC.",
        type: "fix"
    },
    {
        title: "Iconos actualizados",
        description: "Se actualizaron los iconos de los tickets para evitar el desbordamiento de los mismos en /feedback.",
        type: "style"
    }
];