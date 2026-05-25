export const currentVersion = "3.6.7";

export const isMajorUpdate = false;

export const updateDate = "25 de mayo del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "PSQI",
        description: "Ahora PSQI muestra correctamente los numeros de categorias positivas.",
        type: "fix"
    }
];