/**
 * @file utils/client/evaluacion-remota.ts
 * @description Comportamiento de "Enlaces de evaluación remota" del expediente de sueño:
 *  - cambio de fase (enlaces, plantilla de WhatsApp, enlace vs "Ver respuestas")
 *  - modal de respuestas del paciente y modal del PSQI de estudio
 *  - copiar enlaces / mensaje al portapapeles
 *
 * Datos: <script type="application/json" id="evaluacion-data"> { baseUrl, token, autor, pacienteId, respuestas }.
 * `respuestas` es solo un RESUMEN (id, cuestionario, fase, updated_at); el contenido (`datos`) se pide
 * a /api/expediente/respuesta cuando se abre "Ver respuestas" o el PSQI de estudio, y se guarda en caché.
 * Disparadores (delegación de eventos):
 *   [data-eval-fase="pre|inter|post"]  [data-eval-copiar="<id del input>"]  [data-eval-ver="<cuestionario>"]
 *   [data-eval-estudio]  [data-eval-copiar-mensaje]  [data-eval-copiar-modal]
 */

import { CLAVES_OCULTAS, CUESTIONARIOS, DICCIONARIOS, urlCuestionario } from "../../data/cuestionarios";
import {
    BTN_FASE_ACTIVO,
    BTN_FASE_INACTIVO,
    FASES,
    FASES_PUNTAJE,
    FASE_DEFAULT,
    esFase,
    type Fase,
} from "../../data/fases";
import { copiarDesdeCampo } from "./clipboard";
import { esc } from "./html";
import { buildMensajeWhatsApp } from "../whatsapp";

interface RespuestaResumen {
    id: number;
    cuestionario: string;
    fase: string;
    updated_at: string | null;
}

interface RespuestaCompleta {
    updated_at: string | null;
    datos: Record<string, any>;
}

interface DatosEvaluacion {
    baseUrl: string;
    token: string;
    autor: string;
    pacienteId: number;
    respuestas: RespuestaResumen[];
}

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

const leerDatos = (): DatosEvaluacion | null => {
    try {
        const el = byId("evaluacion-data");
        return el ? JSON.parse(el.textContent || "null") : null;
    } catch {
        return null;
    }
};

const datos = leerDatos();
let faseActual: Fase = FASE_DEFAULT;

const respuestaDe = (cuestionario: string, fase: Fase) =>
    datos?.respuestas.find((r) => r.cuestionario === cuestionario && r.fase === fase);


const setFase = (fase: Fase) => {
    if (!datos) return;
    faseActual = fase;

    for (const cuestionario of CUESTIONARIOS) {
        const input = byId<HTMLInputElement>(`link-${cuestionario}`);
        if (input) input.value = urlCuestionario(datos.baseUrl, cuestionario, datos.token, fase);
    }

    const textarea = byId<HTMLTextAreaElement>("texto-plantilla-wpp");
    if (textarea) {
        textarea.value = buildMensajeWhatsApp({
            autor: datos.autor,
            baseUrl: datos.baseUrl,
            token: datos.token,
            fase,
        });
    }

    for (const f of FASES_PUNTAJE) {
        const btn = byId(`btn-${f}`);
        if (btn) btn.className = f === fase ? BTN_FASE_ACTIVO : BTN_FASE_INACTIVO;
    }

    for (const cuestionario of CUESTIONARIOS) {
        const row = byId(`row-${cuestionario}`);
        if (!row) continue;

        const contenedorLink = row.querySelector(".container-link");
        const contenedorBtn = row.querySelector(".container-btn");
        const respondido = !!respuestaDe(cuestionario, fase);

        contenedorLink?.classList.toggle("hidden", respondido);
        contenedorBtn?.classList.toggle("hidden", !respondido);
    }
};


const cacheRespuestas = new Map<string, Promise<RespuestaCompleta>>();

const MENSAJES_ERROR: Record<number, string> = {
    401: "Tu sesión expiró. Recarga la página e inicia sesión de nuevo.",
    403: "No tienes permiso para ver estas respuestas.",
    404: "No se encontraron respuestas para este cuestionario.",
};

const cargarRespuesta = (cuestionario: string, fase: Fase): Promise<RespuestaCompleta> => {
    if (!datos) return Promise.reject(new Error("Sin datos de evaluación."));

    const clave = `${cuestionario}:${fase}`;
    const enCache = cacheRespuestas.get(clave);
    if (enCache) return enCache;

    const params = new URLSearchParams({
        paciente_id: String(datos.pacienteId),
        cuestionario,
        fase,
    });

    const peticion = fetch(`/api/expediente/respuesta?${params.toString()}`, {
        headers: { Accept: "application/json" },
    }).then(async (res) => {
        if (!res.ok) {
            throw new Error(MENSAJES_ERROR[res.status] ?? "No se pudieron cargar las respuestas. Intenta de nuevo.");
        }
        return (await res.json()) as RespuestaCompleta;
    });

    cacheRespuestas.set(clave, peticion);
    peticion.catch(() => cacheRespuestas.delete(clave));

    return peticion;
};


const htmlPuntaje = (cuestionario: string, d: Record<string, any>) => {
    let html = `
        <div class="px-6 py-5 bg-gradient-to-r from-gray-800/50 to-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div>
                <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Puntaje Total</p>
                <p class="text-gray-500 text-xs">Cálculo automático</p>
            </div>
            <div class="flex flex-col items-end">
                <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-mono font-bold text-white">${esc(d.puntaje)}</span>
                    <span class="text-xs text-gray-500 font-medium uppercase">pts</span>
                </div>
    `;

    if (cuestionario === "berlin") {
        const cats: string[] = [];
        if (d["Resultado Categoría 1 (Ronquido)"]?.includes("POSITIVA")) cats.push("1");
        if (d["Resultado Categoría 2 (Somnolencia)"]?.includes("POSITIVA")) cats.push("2");
        if (
            d["Resultado Categoría 3 (Presión Arterial)"]?.includes("POSITIVA") ||
            d["Resultado Categoría 3 (Hipertensión)"]?.includes("POSITIVA")
        ) {
            cats.push("3");
        }

        const textoCats = cats.length > 0 ? cats.join(", ") : "Ninguna";
        const colorTexto = cats.length > 0 ? "text-red-400" : "text-gray-400";

        html += `
                <div class="mt-1 text-right">
                    <span class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mr-1">Categorías Positivas:</span>
                    <span class="text-sm font-bold ${colorTexto}">${textoCats}</span>
                </div>
        `;
    }

    return html + `
            </div>
        </div>
    `;
};

const htmlPregunta = (texto: string, valor: unknown) => `
    <div class="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-white/5 transition-colors group border-b border-gray-800/30 last:border-0">
        <div class="md:w-3/4">
            <p class="text-gray-300 text-sm font-medium leading-snug group-hover:text-white transition-colors">
                ${esc(texto)}
            </p>
        </div>
        <div class="md:w-1/4 flex justify-end">
            <span class="inline-block bg-gray-900 border border-gray-700 text-gray-300 px-3 py-1.5 rounded text-xs font-mono font-bold text-center min-w-[3rem]">
                ${esc(valor)}
            </span>
        </div>
    </div>
`;

const htmlCargando = `
    <div class="px-6 py-12 text-center text-gray-400 text-sm animate-pulse">Cargando respuestas…</div>
`;

const htmlError = (mensaje: string) => `
    <div class="px-6 py-12 text-center">
        <p class="text-red-400 text-sm font-medium">${esc(mensaje)}</p>
    </div>
`;

const htmlRespuestas = (cuestionario: string, d: Record<string, any>) => {
    const preguntas = DICCIONARIOS[cuestionario] ?? {};

    let html = d.puntaje !== undefined ? htmlPuntaje(cuestionario, d) : "";
    for (const key in d) {
        if (CLAVES_OCULTAS.includes(key)) continue;
        html += htmlPregunta(preguntas[key] || key, d[key]);
    }
    return html;
};

let solicitudVerRespuestas = 0;

const verRespuestas = async (cuestionario: string) => {
    if (!datos) return;
    const resumen = respuestaDe(cuestionario, faseActual);
    if (!resumen) return;

    const modal = byId<HTMLDialogElement>("modal-ver-respuestas");
    const titulo = byId("titulo-ver-respuestas");
    const subtitulo = byId("subtitulo-ver-respuestas");
    const badgeFase = byId("badge-fase");
    const contenido = byId("contenido-respuestas");
    const linkInput = byId<HTMLInputElement>("modal-link-input");
    if (!modal || !titulo || !subtitulo || !badgeFase || !contenido) return;

    titulo.textContent = cuestionario.charAt(0).toUpperCase() + cuestionario.slice(1);
    subtitulo.textContent = resumen.updated_at
        ? new Date(resumen.updated_at).toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    badgeFase.textContent = faseActual.toUpperCase();
    badgeFase.className = FASES[faseActual].badge;

    if (linkInput) linkInput.value = urlCuestionario(datos.baseUrl, cuestionario, datos.token, faseActual);

    contenido.innerHTML = htmlCargando;
    modal.showModal();

    const solicitud = ++solicitudVerRespuestas;
    try {
        const respuesta = await cargarRespuesta(cuestionario, faseActual);
        if (solicitud !== solicitudVerRespuestas) return;
        contenido.innerHTML = htmlRespuestas(cuestionario, respuesta.datos);
    } catch (error) {
        if (solicitud !== solicitudVerRespuestas) return;
        contenido.innerHTML = htmlError(error instanceof Error ? error.message : "Error desconocido.");
    }
};


const abrirModalEstudio = async () => {
    const resumen = respuestaDe("psqi", faseActual);
    if (!resumen) return;

    const modal = byId<HTMLDialogElement>("modal-psqi-estudio");
    const inputFase = byId<HTMLInputElement>("input-fase-estudio");
    const inputHoras = byId<HTMLInputElement>("input-horas-estudio");
    if (!modal || !inputFase || !inputHoras) return;

    const fase = faseActual;
    inputFase.value = fase;
    inputHoras.value = "";
    modal.showModal();

    try {
        const respuesta = await cargarRespuesta("psqi", fase);
        const horasPrevias = respuesta.datos.horas_sueno_estudio;
        if (horasPrevias && inputHoras.value === "" && inputFase.value === fase) {
            inputHoras.value = String(horasPrevias);
        }
    } catch {
        // Sin prellenado: el usuario puede capturar las horas igualmente.
    }
};

const copiarEnlace = async (inputId: string) => {
    const input = byId<HTMLInputElement>(inputId);
    if (!input) return;
    if (!(await copiarDesdeCampo(input))) return;

    const contenedor = input.parentElement;
    contenedor?.classList.add("bg-blue-900/30", "border-blue-500");
    setTimeout(() => contenedor?.classList.remove("bg-blue-900/30", "border-blue-500"), 200);
};

const ICONO_CHECK =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';

const copiarMensaje = async () => {
    const textarea = byId<HTMLTextAreaElement>("texto-plantilla-wpp");
    const btn = byId<HTMLButtonElement>("btn-copiar-plantilla");
    if (!textarea || !btn) return;
    if (!(await copiarDesdeCampo(textarea))) return;

    const htmlOriginal = btn.innerHTML;
    btn.innerHTML = `${ICONO_CHECK} ¡Mensaje Copiado!`;
    btn.classList.remove("bg-green-600", "hover:bg-green-500");
    btn.classList.add("bg-emerald-500");

    setTimeout(() => {
        btn.innerHTML = htmlOriginal;
        btn.classList.remove("bg-emerald-500");
        btn.classList.add("bg-green-600", "hover:bg-green-500");
    }, 2000);
};

const copiarEnlaceDelModal = async () => {
    const input = byId<HTMLInputElement>("modal-link-input");
    const btn = byId<HTMLButtonElement>("btn-copiar-modal");
    if (!input || !btn) return;
    if (!(await copiarDesdeCampo(input))) return;

    const textoOriginal = btn.innerText;
    btn.innerText = "¡Copiado!";
    btn.classList.add("text-green-400");

    setTimeout(() => {
        btn.innerText = textoOriginal;
        btn.classList.remove("text-green-400");
    }, 1500);
};

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target || !datos) return;

    const fase = target.closest<HTMLElement>("[data-eval-fase]");
    if (fase) {
        if (esFase(fase.dataset.evalFase)) setFase(fase.dataset.evalFase);
        return;
    }

    const copiar = target.closest<HTMLElement>("[data-eval-copiar]");
    if (copiar?.dataset.evalCopiar) {
        void copiarEnlace(copiar.dataset.evalCopiar);
        return;
    }

    const ver = target.closest<HTMLElement>("[data-eval-ver]");
    if (ver?.dataset.evalVer) {
        void verRespuestas(ver.dataset.evalVer);
        return;
    }

    if (target.closest("[data-eval-estudio]")) {
        void abrirModalEstudio();
        return;
    }

    if (target.closest("[data-eval-copiar-mensaje]")) {
        void copiarMensaje();
        return;
    }

    if (target.closest("[data-eval-copiar-modal]")) {
        void copiarEnlaceDelModal();
    }
});

if (datos) setFase(FASE_DEFAULT);