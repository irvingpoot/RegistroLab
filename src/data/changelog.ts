export const currentVersion = "4.3.1";

export const isMajorUpdate = true;

export const updateDate = "13 de noviembre del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Edición en el gestor de citas",
        description: "Se agregó una funcionalidad para que al momento de editar una cita, el gestor mantenga el estado de la busqueda y la edición redigija correctamente.",
        type: "feature"
    },
    {
        title: "Edición de expedientes",
        description: "Se corrgió un problema donde la edición daba error al intentar editar un expediente sin colocar campos de fechas u horas.",
        type: "fix"
    },
    {
        title: "Edición de expedientes",
        description: "Se corrgió un problema con los campos obligatorios de los expedientes.",
        type: "fix"
    },
    {
        title: "Tabla de lista de espera",
        description: "Se cambió el diseño de la tabla de la lista de espera para alinearse con el estilo de la página.",
        type: "style"
    },
];