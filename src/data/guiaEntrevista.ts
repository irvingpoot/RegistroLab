/**
 * @file guiaEntrevista.ts
 * @description Categorías y preguntas guía que se muestran en el aside
 * `GuiaEntrevista.astro` del formulario de registro.
 *
 * CÓMO AGREGAR UNA CATEGORÍA:
 * Añade un objeto nuevo al arreglo `categoriasEntrevista`:
 *
 *   {
 *       titulo: "Nombre de la categoría",
 *       descripcion: "Texto corto opcional bajo el título",
 *       preguntas: [
 *           "Primera pregunta",
 *           "Segunda pregunta",
 *       ],
 *   },
 *
 * Para agregar una pregunta, añade una cadena al arreglo `preguntas`.
 * El orden del arreglo es el orden en que se muestran.
 */

export interface CategoriaEntrevista {
    titulo: string;
    descripcion?: string;
    preguntas: string[];
}

export const categoriasEntrevista: CategoriaEntrevista[] = [
    {
        titulo: "Entrevista inicial",
        descripcion: "Ejemplo: contexto general del paciente.",
        preguntas: [
            "¿Cuál es el motivo principal de la consulta?",
            "¿Desde cuándo presenta el problema?",
            "¿Qué ha intentado antes para resolverlo?",
        ],
    },
    {
        titulo: "Historia del sueño",
        preguntas: [
            "¿A qué hora suele acostarse y levantarse entre semana y en fin de semana?",
            "¿Cuánto tarda en quedarse dormido?",
            "¿Cuántas veces despierta durante la noche?",
        ],
    },
    {
        titulo: "Hábitos y entorno",
        preguntas: [
            "¿Usa pantallas antes de dormir?",
            "¿Cómo describiría su habitación (ruido, luz, temperatura)?",
        ],
    },
];