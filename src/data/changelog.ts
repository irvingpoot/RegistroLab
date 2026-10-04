export const currentVersion = "4.0.0";

export const isMajorUpdate = true;

export const updateDate = "5 de octubre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Gestor de citas",
        description: "Desde /gestor, ahora es posible gestionar todas las citas en la base de datos, incluyendo la creación, edición y eliminación de citas.",
        type: "feature"
    },
    {
        title: "Horario de psicólogos",
        description: "Ahora es posible visualizar y gestionar el horario de cada psicólogo en la aplicación.",
        type: "feature"
    },
    {
        title: "Opción de procololo",
        description: "Ahora al seleccionar 'Procololo' en el formulario de creación de citas, se mostrará la información correspondiente.",
        type: "fix"
    },
    {
        title: "Dashboard y login renovado",
        description: "Se ha rediseñado el dashboard y el login para mejorar la experiencia del usuario.",
        type: "style"
    },
    {
        title: "Eventos de calendario",
        description: "Al hacer click en el botón de crear/editar evento, ahora la página se desplazará automáticamente para mostrar el formulario.",
        type: "style"
    },
    {
        title: "Tabla de usuarios",
        description: "Se cambió el estilo de la tabla de usuarios.",
        type: "style"
    }
];