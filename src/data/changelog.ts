export const currentVersion = "3.2.0";

export const isMajorUpdate = true;

export const updateDate = "13 de Marzo del 2026";

export const changes = [
    {
        title: "Lista de tareas pendientes",
        description: "Se agregó la funcionalidad para poder crear, asignar y gestionar tareas pendientes del laboratorio.",
        type: "feature"
    },
    {
        title: "Días inhabiles",
        description: "Se agregó la funcionalidad para marcar o desmarcar días inhábiles o vacacionales.",
        type: "feature"
    },
    {
        title: "Resultados Berlín",
        description: "Se corrigió un error en donde la tercera categoría no se mostraba correctamente si era positiva.",
        type: "fix"
    },
    {
        title: "Scroll con modal abierto",
        description: "Se corrigió un bug en el que la página se desplazaba mientras algún modal estaba abierto.",
        type: "fix"
    },
    {
        title: "Lista de pacientes",
        description: "Se redujo la cantidad de pacientes mostrados en la lista.",
        type: "style"
    }
];