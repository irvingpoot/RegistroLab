export const currentVersion = "3.6.0";

export const isMajorUpdate = true;

export const updateDate = "13 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Informe de resultados (Apnea Link)",
        description: "Ya es posible generar el informe de resultados del Apnea Link desde /reportes.",
        type: "feature"
    },
    {
        title: "Filtro de pacientes",
        description: "Ya es posible filtrar los pacientes por sus alteraciones o transtornos registrados.",
        type: "feature"
    },
    {
        title: "Recordatorio de tareas",
        description: "Ahora el recordatorio de tareas del dashboard aparece oculto y se abre si el usuario hace pasa el mouse sobre él.",
        type: "style"
    },
    {
        title: "Iconos",
        description: "Se han actualizado algunos iconos genericos de la página.",
        type: "style"
    }
];