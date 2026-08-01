export const currentVersion = "3.13.0";

export const isMajorUpdate = true;

export const updateDate = "24 de junio del 2026";

type Changes = {
    title: string;
    description: string;
    type: "feature" | "fix" | "style";
}

export const changes: Changes[] = [
    {
        title: "Implementación de permisos de acceso",
        description: "Se ha añadido un sistema de permisos que restringe el acceso a ciertas secciones de la aplicación, asegurando que solo los usuarios autorizados puedan acceder a ellas.",
        type: "feature"
    },
    {
        title: "Corrección en la creación de citas",
        description: "Se corrigió un bug donde se creaba una cita con fecha y hora incorrectas debido a un error en la conversión de zonas horarias.",
        type: "fix"
    }
];