export const currentVersion = "3.14.1";

export const isMajorUpdate = true;

export const updateDate = "17 de agosto del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Tarjeta de citas",
        description: "Se corrigió un error en el que no se mostraba quién agendó una cita en la tarjeta correspondiente.",
        type: "fix"
    }
];