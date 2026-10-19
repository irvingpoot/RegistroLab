export const currentVersion = "4.1.0";

export const isMajorUpdate = true;

export const updateDate = "19 de octubre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Servicios del laboratorio",
        description: "Se agregó una página para gestionar los servicios disponibles en el laboratorio.",
        type: "feature"
    },
    {
        title: "Reporte en formato .docx",
        description: "Ahora se puede generar el reporte de poligrafía en formato .docx.",
        type: "feature"
    },
    {
        title: "Servicios en citas",
        description: "Ahora al momento de buscar, crear o editar una o multiples citas, se pueden seleccionar los servicios disponibles.",
        type: "feature"
    },
    {
        title: "Estadisticas",
        description: "Se creo la página de estadísticas para visualizar los datos de las citas y ganancias del laboratorio.",
        type: "feature"
    },
    {
        title: "Orden y colores en la agenda de hoy",
        description: "Ahora la sección de agenda de hoy muestra las citas en orden y con colores distintos según su estado.",
        type: "feature"
    },
    {
        title: "Optimización del dashboard",
        description: "Se realizaron mejoras generales a la carga del dashboard.",
        type: "fix"
    },
    {
        title: "Mensaje de confirmación de cita",
        description: "Se agregaron los datos de transferencias bancarias en el mensaje de confirmación para cada cita creada.",
        type: "fix"
    },
    {
        title: "Agendar paciente -> Ver Agenda",
        description: "Se cambió el nombre del botón 'Agendar paciente' a 'Ver Agenda' en la agenda del día para mejor comprensión.",
        type: "fix"
    },
    {
        title: "Botones del dashboard",
        description: "Ahora el dashboard muestra 'Agenda' como su botón individual para mejor acceso.",
        type: "style"
    },
    {
        title: "Precio en tarjetas de citas",
        description: "La tarjeta de citas ahora muestra el servicio correspondiente con los precios.",
        type: "style"
    }
];