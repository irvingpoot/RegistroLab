export const currentVersion = "3.7.0";

export const isMajorUpdate = true;

export const updateDate = "25 de mayo del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Multiples citas",
        description: "Ahora es posible crear varias citas a la vez.",
        type: "feature"
    },
    {
        title: "PSQI",
        description: "Ahora PSQI muestra correctamente los numeros de categorias positivas.",
        type: "fix"
    }
];