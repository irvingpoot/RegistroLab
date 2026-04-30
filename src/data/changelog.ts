export const currentVersion = "3.6.6";

export const isMajorUpdate = false;

export const updateDate = "30 de Abril del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Reportes directos",
        description: "Ahora se puede generar el reporte directo del expediente del paciente.",
        type: "feature"
    },
    {
        title: "Reportes mejorados",
        description: "Se corrigió la primera observación para considerar el tipo de apnea presente.",
        type: "fix"
    }
];