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

export interface Subcategoria {
    titulo: string;
    descripcion?: string;
    preguntas: string[];
}

export interface CategoriaEntrevista {
    titulo: string;
    descripcion?: string;
    preguntas?: string[];
    subcategorias?: Subcategoria[];
}

export const categoriasEntrevista: CategoriaEntrevista[] = [
    {
        titulo: "Preguntas apnea",
        descripcion: "Listado de preguntas de apnea del sueño",
        subcategorias: [
            {
                titulo: "Antecedentes",
                preguntas: [
                    "¿Toma algún medicamento?",
                    "¿Ha ido a consultar al otorrino/neumólogo/cardiólogo recientemente?",
                    "¿Sufre de hipertensión/diabetes/insuficiencia cardiaca?"
                ]
            },
            {
                titulo: "Síntomas",
                descripcion: "De todos preguntar que tan seguido le pasa y desde hace cuanto tiempo",
                preguntas: [
                    "¿Se siente cansado durante el día?",
                    "¿Siente que lucha contra las ganas de irse a dormir?",
                    "¿Se puede dormir haciendo actividades monotonas?",
                    "¿Alguna vez se ha quedado dormido manejando?",
                    "¿Alguna vez has sentido que se queda sin respiración durante la noche?, Ejemplificar si no entiende",
                    "¿Alguna vez se ha despertado por falta de aire?",
                    "¿Despierta con la gardante irritada?",
                    "¿Ronca?, ¿Todos los días?",
                    "¿Alguna vez lo ha despertado un ronquido?",
                    "Cuando ronca, ¿Lo pueden escuchar afuera de la habitación?"
                ]
            },
            {
                titulo: "Extras",
                preguntas: [
                    "¿Tiene gripa, tos o algún otro?, Si tiene, no se puede hacer el estudio"
                ]
            }
        ]
    },
    {
        titulo: "Preguntas insomnio",
        descripcion: "Listado de preguntas de insomnio",
        subcategorias: [
            {
                titulo: "Insomnio por higiene del sueño",
                descripcion: "Durante el ultimo mes has..",
                preguntas: [
                    "Tenido horarios variados para dormir",
                    "Realizado siestas frecuentes",
                    "Pasado tiempo excesivo en la cama (sin intención de dormir)",
                    "Consumido regularmente productos que contienen alcohol, nicotina o cafeína, especialmente cerca del horario de dormir",
                    "Realizado actividades estimulantes: mentales, físicas o emocionales cercana a la hora de dormir",
                    "Usado la cama para otras actividades (Ej.: ver TV, leer, estudiar, comer, pensar o planificar)",
                    "Tenido un ambiente desagradable para dormir (poca oscuridad, ruidoso y poco ventilado)",
                    "¿Has mantenido alguno de estos hábitos durante más de un mes?"
                ]
            },
            {
                titulo: "Insomnio por estrés",
                preguntas: [
                    "¿Actualmente estás pasando por una situación muy estresante?",
                    "¿Antes de esta situación estresante, podías dormir bien?",
                    "¿Comenzaste a tener problemas para dormir o quedarte dormido al mismo tiempo que se presentó la situación estresante?",
                    "¿Desde hace cuánto has tenido problemas para dormir debido a la situación estresante?"
                ]
            },
            {
                titulo: "Insomnio psicofisiológico",
                descripcion: "Durante el ultimo mes:",
                preguntas: [
                    "Al momento de acostarte has tenido ansiedad o preocupación por no poder dormir.",
                    "Has tenido dificultades para quedarte dormido en tu cama/hamaca, pero no durante actividades monótonas en otros espacios en los cuales no planeabas dormir.",
                    "Te duermes fácilmente cuando estás fuera de casa o incluso, fuera de tu habitación (Ej. en la sala)",
                    "Al momento de acostarte aumentan tus pensamientos y sientes que no los puedes detener voluntariamente.",
                    "Has tenido dificultades para relajar tu cuerpo lo suficiente para iniciar el sueño."
                ]
            },
            {
                titulo: "Exploración general",
                descripcion: "En el ultimo mes:",
                preguntas: [
                    "¿Has tenido dificultades para comenzar a dormir, mantenerte dormido o despiertas más temprano de lo que quisieras y no puedes volver a dormir?",
                    "¿Las dificultades para dormir en la noche ocurren a pesar de tener el lugar y tiempo para hacerlo?",
                ]
            },
            {
                titulo: "Síntomas específicos de insomnio",
                descripcion: "¿Has tenido alguno de los siguientes síntomas relacionados con las dificultades para dormir?",
                preguntas: [
                    "Fatiga o cansancio durante el día",
                    "Problemas de atención, concentración o memoria.",
                    "Disminución del rendimiento académico/laboral",
                    "Problemas en tus relaciones sociales (familia, amigos, pareja, etc.)",
                    "Alteraciones del estado de ánimo o irritabilidad",
                    "Somnolencia diurna (propensión a quedarte dormido en varias situaciones durante el día)",
                    "Disminución de la motivación, energía o iniciativa",
                    "Propensión a cometer errores o accidentes al conducir, en el trabajo o escuela",
                    "Dolor de cabeza, tensión muscular o problemas gastrointestinales",
                    "Preocupación constante por no poder dormir",
                    "En el último mes, indica los días en promedio a la semana que has tenido dificultades para dormir"
                ]
            },
            {
                titulo: "Antecedentes médicos y medicamentos",
                preguntas: [
                    "¿Padeces alguna enfermedad actualmente? (Ej. Alergias, problemas cardiacos o respiratorios, etc.), ¿Cuál?",
                    "¿Te han diagnosticado algún trastorno psiquiátrico?, ¿Cuál?",
                    "¿Las dificultades para dormir iniciaron al mismo tiempo que comenzó el padecimiento médico o psiquiátrico?",
                    "¿Actualmente estas tomando medicamentos?, ¿Cuáles?",
                    "¿Las dificultades para dormir iniciaron al mismo tiempo que comenzaste la medicación?",
                    "¿Consumes bebidas alcohólicas, sustancias narcóticas, cafeína o alguna otra sustancia que crees que puede",
                    "estar alterando tu sueño?, ¿Cuáles y con qué frecuencia?",
                    "¿Las dificultades para dormir iniciaron al mismo tiempo que el consumo de estas sustancias?"
                ]
            },
            {
                titulo: "Insomnio del desarrollo",
                preguntas: [
                    "El insomnio comenzó en la infancia.",
                    "Has identificado la causa de tu insomnio.",
                    "Desde que inició el insomnio, su curso ha sido constante."
                ]
            }
        ]
    }
];