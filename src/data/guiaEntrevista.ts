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
        titulo: "Listado en proceso",
        descripcion: "Pronto estará completada esta función.",
        preguntas: []
    }
];