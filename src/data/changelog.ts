export const currentVersion = "3.6.2";

export const isMajorUpdate = false;

export const updateDate = "17 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Cuestionario Berlin",
        description: "Se corrigió un error en donde las partes expandibles no se mostraban correctamente.",
        type: "fix"
    }
];