export const currentVersion = "3.15.0";

export const isMajorUpdate = true;

export const updateDate = "26 de agosto del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Fases en resultados de poligrafia",
        description: "Ahora es posible guardar registros de noche en diferentes fases del tratamiento.",
        type: "feature"
    },
    {
        title: "Fases en reportes de poligrafia",
        description: "Ahora es posible generar reportes de poligrafia en diferentes fases del tratamiento.",
        type: "feature"
    },
    {
        title: "Tarjeta de citas",
        description: "Se cambió el estilo de la tarjeta de cita para agregar el estado de la misma y mantener la coherencia visual.",
        type: "style"
    }
];