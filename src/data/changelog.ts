export const currentVersion = "3.11.0";

export const isMajorUpdate = true;

export const updateDate = "18 de junio del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Agregar manuales",
        description: "Ahora es posible agregar diferentes manuales desde la propia interfaz de la página.",
        type: "feature"
    }
];