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
        description: "Se agregó un prototipo del cuestionario de posiciones para evaluar la posición de los pacientes",
        type: "feature"
    },
    {
        title: "Reporte de cama vs hamaca",
        description: "Se corrigió la generación del reporte de cama vs hamaca para mostrar los datos necesarios",
        type: "fix"
    }
];