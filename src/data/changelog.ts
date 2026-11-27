export const currentVersion = "4.5.0";

export const isMajorUpdate = true;

export const updateDate = "27 de noviembre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Múltiples citas independientes",
        description: "Se implementó una página para crear múltiples citas independientes, cada una con sus propios datos: paciente, servicio, fecha y hora.",
        type: "feature"
    },
    {
        title: "Validaciones del formulario de nueva cita",
        description: "Se corrigió un detalle en el que las validaciones no se estaban aplicando correctamente en algunos casos y los errores no se podían visualizar correctamente.",
        type: "fix"
    },
    {
        title: "Permisos de usuario",
        description: "Se corrigieron los permisos de algunos roles que podría causar conflictos en la navegación del usuario.",
        type: "fix"
    },
    {
        title: "Optimizaciones generales",
        description: "Se realizaron optimizaciones generales en el código para mejorar el tiempo de carga en algunas páginas.",
        type: "fix"
    },
    {
        title: "Manuales",
        description: "Se rediseñó la página de manuales para mejorar la experiencia del usuario y la consistencia visual.",
        type: "style"
    },
    {
        title: "Modal de alertas y confirmaciones",
        description: "Se rediseñaron los modales de alertas y confirmaciones para mejorar la experiencia del usuario y la consistencia visual.",
        type: "style"
    },
    {
        title: "Página 404",
        description: "Se rediseñó la página de error 404 para alinearse con el nuevo diseño del dashboard.",
        type: "style"
    }
];