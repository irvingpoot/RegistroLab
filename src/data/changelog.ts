export const currentVersion = "2.2.1";

export const isMajorUpdate = false; 

export const updateDate = "4 de Febrero del 2026";

export const changes = [
    {
        title: "Menu dinamico",
        description: "Se agregaró un menú para facilitar la navegación en el expediente.",
        type: "feature"
    },
    {
        title: "Tratamiento Farmacologico",
        description: "Se agregaron los campos de motivo, frecuencia, y dosis solicitados.",
        type: "feature"
    },
    {
        title: "Optimizacion de solicitudes",
        description: "Ahora, tanto el expediente como la lista, solo solicitan los campos necesarios para cada sección.",
        type: "fix"
    }
];