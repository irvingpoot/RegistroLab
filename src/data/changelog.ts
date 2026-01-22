export const currentVersion = "1.2.0";

export const isMajorUpdate = false; 

export const updateDate = "28 de Enero, 2026";

// Opciones type: 'feature', 'fix', 'style'
export const changes = [
    {
        title: "Corrección de Calendario",
        description: "Se arregló el desfase de zona horaria en el calendario. Ahora el día 'Hoy' coincide correctamente con el día actual.",
        type: "fix"
    },
    {
        title: "Corrección de las tarjetas de cita",
        description: "Se corrigió el desbordamiento de texto en las tarjetas de cita cuando el campo era demasiado largo.",
        type: "fix"
    },
    {
        title: "Resumen de actualizaciones",
        description: "Se agregó este modal para anunciar las grandes o pequeñas actualizaciones.",
        type: "feature"
    },
    {
        title: "Mejora de Contraste en Tarjetas",
        description: "Se mejoró el contraste de las tarjetas para evitar líneas visibles en el modo vidrio.",
        type: "style"
    }
];