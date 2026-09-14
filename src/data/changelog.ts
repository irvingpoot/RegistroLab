export const currentVersion = "3.17.0";

export const isMajorUpdate = true;

export const updateDate = "14 de septiembre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Usuarios que pueden atender",
        description: "Ahora al momento de crear una cita, solamente los usuarios con el rol adecuado pueden ser seleccionados como encargado de la misma.",
        type: "fix"
    },
    {
        title: "Días bloqueados en el calendario",
        description: "Se corrigió un error en el que se podía agendar citas en días que estaban bloqueados por completo por un evento.",
        type: "fix"
    },
    {
        title: "Fotos de perfil de los usuarios",
        description: "Ahora en la lista de usuarios se muestran las fotos de perfil de cada uno.",
        type: "style"
    }
];