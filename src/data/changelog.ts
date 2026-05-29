export const currentVersion = "3.8.0";

export const isMajorUpdate = true;

export const updateDate = "29 de mayo del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Exportar citas",
        description: "Ahora es posible exportar citas a Excel filtrando por pendientes o todas.",
        type: "feature"
    }
];