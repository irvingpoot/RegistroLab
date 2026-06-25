export const currentVersion = "3.12.0";

export const isMajorUpdate = true;

export const updateDate = "19 de junio del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Cuestionario de Posiciones",
        description: "Se corrgió el cuestionario de posiciones de forma que ahora los datos se guarden correctamente",
        type: "fix"
    }
];