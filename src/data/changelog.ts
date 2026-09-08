export const currentVersion = "3.16.0";

export const isMajorUpdate = true;

export const updateDate = "08 de septimebre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Eventos en la agenda",
        description: "Ahora es posible señalar un evento en la agenda así como reservar por completo un día para el mismo.",
        type: "feature"
    },
    {
        title: "Reportes de poligrafia",
        description: "Se corrigió un error en la redacción de una sección del reporte de poligrafia.",
        type: "fix"
    },
    {
        title: "Campos de paciente opcionales",
        description: "Se hicieron opcionales ciertos campos del paciente en lugar de obligatorios.",
        type: "fix"
    },
    {
        title: "Estilos en general",
        description: "Se agregaron nuevos estilos para mejorar la apariencia general de la aplicación, desde animaciones en el menu del calendario hasta señalamientos en los campos que ahora pueden ser vacíos.",
        type: "style"
    }
];