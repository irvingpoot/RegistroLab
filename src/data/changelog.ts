export const currentVersion = "3.6.3";

export const isMajorUpdate = false;

export const updateDate = "17 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Cuestionarios",
        description: "Se corrigieron multiples detalles en los cuestionarios.",
        type: "fix"
    }
];