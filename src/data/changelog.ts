export const currentVersion = "4.4.0";

export const isMajorUpdate = true;

export const updateDate = "23 de noviembre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Interfaz de multiples citas",
        description: "Se rediseñó la página de agendar múltiples citas para mejorar la experiencia del usuario y facilitar la captura de datos.",
        type: "style"
    }
];