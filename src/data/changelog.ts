export const currentVersion = "2.0.1";

export const isMajorUpdate = true; 

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
        title: "Desborde del ChangeLog",
        description: "Se corrgió un error en el que el ChangeLog se estiraba fuera de la pantalla al agregar demasiados cambios.",
        type: "fix"
    },
    {
        title: "Iconos actualizados",
        description: "Se actualizaron los iconos de los tickets para evitar el desbordamiento de los mismos en /feedback.",
        type: "style"
    }
];