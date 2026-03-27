export const currentVersion = "3.3.1";

export const isMajorUpdate = true;

export const updateDate = "13 de Marzo del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Recordatorio de tareas pendientes",
        description: "Se agregó un sidebar fijo en el dashboard que muestra las tareas pendientes del usuario correspondiente",
        type: "feature"
    }
];