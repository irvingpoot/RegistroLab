export const currentVersion = "3.10.0";

export const isMajorUpdate = true;

export const updateDate = "15 de junio del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Numeración de citas",
        description: "Ahora es posible enumerar las citas creadas por grupos.",
        type: "feature"
    }
];