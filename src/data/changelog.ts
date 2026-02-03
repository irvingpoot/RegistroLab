export const currentVersion = "2.2.0";

export const isMajorUpdate = true; 

export const updateDate = "2 de Febrero del 2026";

export const changes = [
    {
        title: "Manuales",
        description: "Se agregó una página para los manuales.",
        type: "feature"
    },
    {
        title: "Sesiones bilaterales de TMS",
        description: "Ya es posible realizar sesiones bilaterales de TMS con diferentes frecuencias para cada lado en ambos tipos de paciente.",
        type: "feature"
    },
    {
        title: "Reagendar citas",
        description: "Ya es posible reagendar citas desde la vista del calendario.",
        type: "feature"
    },
    {
        title: "Horas en Pittsburgh",
        description: "Se corrigió un problema en el que el paciente podía enviar el formulario sin seleccionar ninguna hora.",
        type: "fix"
    },
    {
        title: "Observaciones en citas",
        description: "Se corrigió un error en el cual no se mostraban las observaciones en las tarjetas de cita.",
        type: "fix"
    },
    {
        title: "Planeación de suicidio",
        description: "Ahora si muestra las 3 opciones de riesgo suicida.",
        type: "fix"
    },
    {
        title: "Optimizaciones al dashboard",
        description: "Ahora el dashboard carga usuarios y citas en paralelo para mejorar el rendimiento.",
        type: "fix"
    },
    {
        title: "Placeholders de reportes",
        description: "Se creo la página provisional para la generación de reportes.",
        type: "style"
    },
    {
        title: "Dashboard refactorizado",
        description: "Se modificó el orden de las opciones en el dashboard.",
        type: "style"
    }
];