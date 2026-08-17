export const currentVersion = "3.14.0";

export const isMajorUpdate = true;

export const updateDate = "17 de agosto del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Gestión de usuarios",
        description: "Ahora el sistema permite la creación, edición y eliminación de usuarios con diferentes roles y permisos. Función exclusiva para administradores.",
        type: "feature"
    }
];