export const currentVersion = "4.3.0";

export const isMajorUpdate = true;

export const updateDate = "3 de noviembre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Sección de farmacos",
        description: "Se agregó una sección para registrar y editar los medicamentos de los pacientes de sueño.",
        type: "feature"
    },
    {
        title: "Expediente de ánimo",
        description: "Se realizaron optimizaciones en la sección del expediente de ánimo para mejorar la carga de la página.",
        type: "fix"
    },
    {
        title: "Calendario de citas",
        description: "Se realizaron optimizaciones en la carga de las citas y en el diseño del calendario para mejorar el rendimiento general de la página.",
        type: "fix"
    },
    {
        title: "Dashboard",
        description: "Se realizaron más optimizaciones en la página del dashboard para mejorar el rendimiento, carga y consumo general de la aplicación.",
        type: "fix"
    },
    {
        title: "Seguridad",
        description: "Se realizaron mejoras generales en la seguridad del sistema, para cuentas sin rol y errores de redirección.",
        type: "fix"
    },
    {
        title: "Calendario de citas",
        description: "Se agregaron unas animaciones faltantes al calendario.",
        type: "style"
    },
    {
        title: "Guión de entrevista",
        description: "Se cambió el diseño del panel de guía de entrevista para que sea más accesible y fácil de leer.",
        type: "style"
    }
];