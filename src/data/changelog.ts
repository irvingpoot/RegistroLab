export const currentVersion = "3.6.7";

export const isMajorUpdate = false;

export const updateDate = "30 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Tipos de citas",
        description: "Ahora se puede crear un tipo de cita especial con la etiqueta 'Otro'.",
        type: "style"
    }
];