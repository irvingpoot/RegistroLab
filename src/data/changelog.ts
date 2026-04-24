export const currentVersion = "3.6.4";

export const isMajorUpdate = false;

export const updateDate = "17 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Reportes mejorados",
        description: "Se corrigieron multiples detalles en la generación de reportes.",
        type: "fix"
    }
];