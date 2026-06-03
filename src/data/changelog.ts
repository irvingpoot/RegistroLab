export const currentVersion = "3.9.0";

export const isMajorUpdate = true;

export const updateDate = "3 de junio del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Graficas de resultados",
        description: "Ahora es posible visualizar los resultados de los cuestionarios en gráficos por cada paciente.",
        type: "feature"
    }
];