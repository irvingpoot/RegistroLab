/**
 * @file utils/client/reporte-noches.ts
 * @description Todo el comportamiento del reporte de noches (poligrafía) del expediente de sueño:
 *  - pestañas por fase, tabla de noches y promedios
 *  - modal de detalle, modal de alta/edición y borrado con confirmación
 *  - botón "Generar Reporte"
 *
 * Datos: <script type="application/json" id="noches-data"> (lo pinta SeccionReporteResultados).
 * Disparadores (delegación de eventos, sin funciones globales ni `onclick`):
 *   [data-noche-tab][data-fase]            cambia de fase
 *   [data-noche-nueva]                     abre el modal vacío
 *   [data-noche-editar][data-id]           abre el modal con la noche
 *   [data-noche-eliminar][data-id][data-num] confirma y elimina
 *   [data-noche-detalle][data-id]          (fila) abre el detalle
 *   [data-generar-reporte]                 va a /reportes con los datos del paciente
 */

import { CAMPOS_NOCHE_NUMERICOS, type CampoNoche } from "../../data/campos-noche";
import { FASE_DEFAULT, esFase, type Fase } from "../../data/fases";
import { extraerTiempo, formatDateShort } from "../formatters";
import { esc } from "./html";
import type { NocheSueno } from "../../services/expediente-sueno.service";


const STORAGE_KEY = "faseActivaNoches";

const TAB_ACTIVO =
    "tab-btn-noche px-4 py-1.5 rounded-md text-sm font-medium transition-all bg-indigo-600 text-white shadow";
const TAB_INACTIVO =
    "tab-btn-noche px-4 py-1.5 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white";

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

const val = (v: unknown, suf = "") => (v != null ? `${esc(v)}${suf}` : "—");

const SIN_DATO = '<span class="text-gray-600">—</span>';

const leerNoches = (): NocheSueno[] => {
    try {
        return JSON.parse(byId("noches-data")?.textContent || "[]");
    } catch {
        return [];
    }
};

const noches = leerNoches();

const faseActiva = (): Fase => {
    const guardada = sessionStorage.getItem(STORAGE_KEY);
    return esFase(guardada) ? guardada : FASE_DEFAULT;
};

const nochesDeFase = (fase: Fase) =>
    noches.filter((n) => n.fase === fase || (!n.fase && fase === "pre"));

const numeroEnFase = (noche: NocheSueno) =>
    nochesDeFase((noche.fase as Fase) || "pre").findIndex((n) => n.id === noche.id) + 1;

const buscarNoche = (id: string | undefined) => noches.find((n) => String(n.id) === id);


type Promedios = {
    totalNoches: number;
    duracion_registro: string | null;
    duracion_evaluacion: string | null;
} & Record<CampoNoche, number | null>;

const calcularPromedios = (lista: NocheSueno[]): Promedios | null => {
    if (lista.length === 0) return null;

    const promedioN = (campo: CampoNoche) => {
        const valores = lista
            .map((n) => n[campo])
            .filter((v) => v !== null && v !== undefined && !isNaN(v));
        if (valores.length === 0) return null;
        const suma = valores.reduce((acc, v) => acc + Number(v), 0);
        return Math.round((suma / valores.length) * 10) / 10;
    };

    const promedioDuracion = (campo: "duracion_registro" | "duracion_evaluacion") => {
        const minutos = lista
            .map((n) => {
                const t = extraerTiempo(n[campo]);
                if (!t.h && !t.m) return null;
                return parseInt(t.h || "0") * 60 + parseInt(t.m || "0");
            })
            .filter((v): v is number => v !== null);

        if (minutos.length === 0) return null;
        const avg = minutos.reduce((a, b) => a + b, 0) / minutos.length;
        return `${Math.floor(avg / 60)}h ${Math.round(avg % 60)}m`;
    };

    const campos = Object.fromEntries(
        CAMPOS_NOCHE_NUMERICOS.map((c) => [c, promedioN(c)]),
    ) as Record<CampoNoche, number | null>;

    return {
        totalNoches: lista.length,
        duracion_registro: promedioDuracion("duracion_registro"),
        duracion_evaluacion: promedioDuracion("duracion_evaluacion"),
        ...campos,
    };
};

const htmlPromedios = (p: Promedios) => `
    <div class="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-4">
        <div class="flex items-center gap-2 mb-4">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]"></div>
            <h4 class="text-sm font-bold text-blue-300 uppercase tracking-wider">
                Promedio de ${p.totalNoches} ${p.totalNoches === 1 ? "noche" : "noches"}
            </h4>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="text-center bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                <span class="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Dur. Registro</span>
                <p class="text-lg text-white font-mono">${val(p.duracion_registro)}</p>
            </div>
            <div class="text-center bg-gray-900/50 rounded-lg p-3 border border-gray-800 border-l border-l-gray-700/50">
                <span class="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Dur. Evaluación</span>
                <p class="text-lg text-white font-mono">${val(p.duracion_evaluacion)}</p>
            </div>
        </div>
        <div>
            <h5 class="text-xs font-bold text-gray-500 mb-3 border-b border-gray-800 pb-1 uppercase">Análisis Respiratorio</h5>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div class="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-center">
                    <span class="text-xs text-indigo-300 font-bold block">IAH</span>
                    <span class="text-2xl font-bold text-white">${val(p.iah)}</span>
                </div>
                <div class="bg-gray-800/60 p-3 rounded-lg text-center">
                    <span class="text-xs text-gray-400 block">Índ. Apneas</span>
                    <span class="text-xl font-bold text-gray-200">${val(p.indice_apneas)}</span>
                </div>
                <div class="bg-gray-800/60 p-3 rounded-lg text-center">
                    <span class="text-xs text-gray-400 block">Índ. Hipopnea</span>
                    <span class="text-xl font-bold text-gray-200">${val(p.indice_hipopnea)}</span>
                </div>
                <div class="bg-gray-800/60 p-3 rounded-lg text-center">
                    <span class="text-xs text-gray-400 block">Ronquidos</span>
                    <span class="text-xl font-bold text-gray-200">${val(p.ronquidos)}</span>
                </div>
            </div>
            <div class="grid grid-cols-5 gap-2 text-center">
                ${(["iai", "iao", "iac", "iam", "ido"] as CampoNoche[])
                    .map(
                        (c) =>
                            `<div class="bg-gray-800/30 rounded py-1.5"><span class="text-[10px] text-gray-500 block">${c.toUpperCase()}</span><span class="text-sm font-mono text-gray-300">${val(p[c])}</span></div>`,
                    )
                    .join("")}
            </div>
        </div>
        <div class="mt-4">
            <h5 class="text-xs font-bold text-gray-500 mb-3 border-b border-gray-800 pb-1 uppercase">Oximetría y Pulso</h5>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                    <span class="text-xs text-emerald-400 font-bold">Sat. Promedio</span>
                    <span class="text-xl font-bold text-white">${val(p.saturacion_promedio, "%")}</span>
                </div>
                <div class="flex items-center justify-between bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                    <span class="text-xs text-rose-400 font-bold">Pulso Promedio</span>
                    <span class="text-xl font-bold text-white">${val(p.pulso_promedio)} <span class="text-xs text-gray-500">bpm</span></span>
                </div>
                <div class="flex flex-col justify-center bg-gray-800/50 p-2 rounded-lg text-center">
                    <span class="text-[10px] text-gray-500 uppercase">Sat &lt; 90%</span>
                    <div class="flex justify-center gap-3 text-sm font-mono">
                        <span class="text-white">${val(p.sat_90_min, " min")}</span>
                        <span class="text-gray-600">|</span>
                        <span class="text-white">${val(p.sat_90_porc, "%")}</span>
                    </div>
                </div>
                <div class="flex flex-col justify-center bg-gray-800/50 p-2 rounded-lg text-center">
                    <span class="text-[10px] text-gray-500 uppercase">Sat &lt; 85%</span>
                    <div class="flex justify-center gap-3 text-sm font-mono">
                        <span class="text-white">${val(p.sat_85_min, " min")}</span>
                        <span class="text-gray-600">|</span>
                        <span class="text-white">${val(p.sat_85_porc, "%")}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;


const ICONO_EDITAR =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>';
const ICONO_ELIMINAR =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>';

const htmlFila = (noche: NocheSueno, idx: number) => `
    <tr class="hover:bg-white/[0.03] transition-colors cursor-pointer group" data-noche-detalle data-id="${noche.id}">
        <td class="px-4 py-3">
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                ${idx + 1}
            </span>
        </td>
        <td class="px-4 py-3 text-gray-400 font-mono text-xs">${esc(formatDateShort(noche.created_at))}</td>
        <td class="px-4 py-3 text-center font-bold text-white font-mono">${noche.iah != null ? esc(noche.iah) : SIN_DATO}</td>
        <td class="px-4 py-3 text-center font-mono text-gray-300">${noche.saturacion_promedio != null ? `${esc(noche.saturacion_promedio)}%` : SIN_DATO}</td>
        <td class="px-4 py-3 text-center font-mono text-gray-300">${noche.pulso_promedio != null ? esc(noche.pulso_promedio) : SIN_DATO}</td>
        <td class="px-4 py-3 text-center font-mono text-gray-400 text-xs">${noche.duracion_registro != null ? esc(noche.duracion_registro) : SIN_DATO}</td>
        <td class="px-4 py-3">
            <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" title="Editar noche" data-noche-editar data-id="${noche.id}" class="text-gray-500 hover:text-blue-400 transition-colors cursor-pointer">${ICONO_EDITAR}</button>
                <button type="button" title="Eliminar noche" data-noche-eliminar data-id="${noche.id}" data-num="${idx + 1}" class="text-gray-500 hover:text-red-400 transition-colors cursor-pointer">${ICONO_ELIMINAR}</button>
            </div>
        </td>
    </tr>
`;

const renderFase = (fase: Fase) => {
    const tbody = byId("tabla-noches");
    const promedios = byId("promedios-container");
    if (!tbody || !promedios) return;

    sessionStorage.setItem(STORAGE_KEY, fase);

    document.querySelectorAll<HTMLElement>("[data-noche-tab]").forEach((tab) => {
        tab.className = tab.dataset.fase === fase ? TAB_ACTIVO : TAB_INACTIVO;
    });

    const lista = nochesDeFase(fase);

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500 italic">No hay noches registradas para esta fase.</td></tr>`;
        promedios.innerHTML = "";
        return;
    }

    tbody.innerHTML = lista.map(htmlFila).join("");
    const resumen = calcularPromedios(lista);
    promedios.innerHTML = resumen ? htmlPromedios(resumen) : "";
};


const abrirModalNoche = (noche?: NocheSueno) => {
    const titulo = byId("titulo-modal-noche");
    const action = byId<HTMLInputElement>("action-noche");
    const idHidden = byId<HTMLInputElement>("id-noche-hidden");
    const selectFase = byId<HTMLSelectElement>("f-fase");
    const modal = byId<HTMLDialogElement>("modal-noche");
    if (!titulo || !action || !idHidden || !selectFase || !modal) return;

    const setValor = (id: string, valor: string) => {
        const el = byId<HTMLInputElement>(id);
        if (el) el.value = valor;
    };

    if (noche) {
        titulo.textContent = "Editar Noche";
        action.value = "editar_noche";
        idHidden.value = String(noche.id);
        selectFase.value = noche.fase || "pre";

        const reg = extraerTiempo(noche.duracion_registro);
        const evaluacion = extraerTiempo(noche.duracion_evaluacion);
        setValor("dur_reg_h", reg.h);
        setValor("dur_reg_m", reg.m);
        setValor("dur_eval_h", evaluacion.h);
        setValor("dur_eval_m", evaluacion.m);

        CAMPOS_NOCHE_NUMERICOS.forEach((c) => setValor(`f-${c}`, noche[c] != null ? String(noche[c]) : ""));
    } else {
        titulo.textContent = "Registrar Noche";
        action.value = "registrar_reporte";
        idHidden.value = "";
        selectFase.value = faseActiva();

        ["dur_reg_h", "dur_reg_m", "dur_eval_h", "dur_eval_m"].forEach((id) => setValor(id, ""));
        CAMPOS_NOCHE_NUMERICOS.forEach((c) => setValor(`f-${c}`, ""));
    }

    modal.showModal();
};

const htmlDetalle = (n: NocheSueno) => `
    <div class="grid grid-cols-2 gap-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div class="text-center">
            <span class="text-xs text-gray-500 uppercase font-bold tracking-wider">Duración Registro</span>
            <p class="text-xl text-white font-mono mt-1">${val(n.duracion_registro)}</p>
        </div>
        <div class="text-center border-l border-gray-700/50">
            <span class="text-xs text-gray-500 uppercase font-bold tracking-wider">Duración Evaluación</span>
            <p class="text-xl text-white font-mono mt-1">${val(n.duracion_evaluacion)}</p>
        </div>
    </div>

    <div>
        <h4 class="text-sm font-bold text-gray-400 mb-3 border-b border-gray-800 pb-1">Análisis Respiratorio</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-center">
                <span class="text-xs text-indigo-300 font-bold block">IAH</span>
                <span class="text-2xl font-bold text-white">${val(n.iah)}</span>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg text-center">
                <span class="text-xs text-gray-400 block">Índice Apneas</span>
                <span class="text-xl font-bold text-gray-200">${val(n.indice_apneas)}</span>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg text-center">
                <span class="text-xs text-gray-400 block">Índice Hipopnea</span>
                <span class="text-xl font-bold text-gray-200">${val(n.indice_hipopnea)}</span>
            </div>
            <div class="bg-gray-800 p-3 rounded-lg text-center">
                <span class="text-xs text-gray-400 block">Ronquidos</span>
                <span class="text-xl font-bold text-gray-200">${val(n.ronquidos)}</span>
            </div>
        </div>
        <div class="grid grid-cols-5 gap-2 mt-3 text-center">
            ${(["iai", "iao", "iac", "iam", "ido"] as CampoNoche[])
                .map(
                    (c) =>
                        `<div class="bg-gray-800/30 rounded py-1"><span class="text-[10px] text-gray-500 block">${c.toUpperCase()}</span><span class="text-sm font-mono text-gray-300">${val(n[c])}</span></div>`,
                )
                .join("")}
        </div>
    </div>

    <div>
        <h4 class="text-sm font-bold text-gray-400 mb-3 border-b border-gray-800 pb-1">Oximetría y Pulso</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg">
                <span class="text-xs text-emerald-400 font-bold">Sat. Promedio</span>
                <span class="text-xl font-bold text-white">${val(n.saturacion_promedio, "%")}</span>
            </div>
            <div class="flex items-center justify-between bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg">
                <span class="text-xs text-rose-400 font-bold">Pulso Promedio</span>
                <span class="text-xl font-bold text-white">${val(n.pulso_promedio)} <span class="text-xs text-gray-500">bpm</span></span>
            </div>
            <div class="flex flex-col justify-center bg-gray-800/50 p-2 rounded-lg text-center">
                <span class="text-[10px] text-gray-500 uppercase">Sat &lt; 90%</span>
                <div class="flex justify-center gap-3 text-sm font-mono">
                    <span class="text-white">${val(n.sat_90_min, " min")}</span>
                    <span class="text-gray-600">|</span>
                    <span class="text-white">${val(n.sat_90_porc, "%")}</span>
                </div>
            </div>
            <div class="flex flex-col justify-center bg-gray-800/50 p-2 rounded-lg text-center">
                <span class="text-[10px] text-gray-500 uppercase">Sat &lt; 85%</span>
                <div class="flex justify-center gap-3 text-sm font-mono">
                    <span class="text-white">${val(n.sat_85_min, " min")}</span>
                    <span class="text-gray-600">|</span>
                    <span class="text-white">${val(n.sat_85_porc, "%")}</span>
                </div>
            </div>
        </div>
    </div>
`;

const abrirDetalleNoche = (noche: NocheSueno) => {
    const modal = byId<HTMLDialogElement>("modal-detalle-noche");
    const titulo = byId("titulo-detalle-noche");
    const fecha = byId("fecha-detalle-noche");
    const contenido = byId("contenido-detalle-noche");
    if (!modal || !titulo || !fecha || !contenido) return;

    titulo.textContent = `Noche ${numeroEnFase(noche)}`;
    fecha.textContent = noche.created_at
        ? new Date(noche.created_at).toLocaleDateString("es-MX", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";
    contenido.innerHTML = htmlDetalle(noche);

    modal.showModal();
};

const confirmarEliminarNoche = (idNoche: string, numNoche: string) => {
    if (!confirm(`¿Eliminar la noche ${numNoche}? Esta acción no se puede deshacer.`)) return;

    const inputId = byId<HTMLInputElement>("id-eliminar-noche");
    const form = byId<HTMLFormElement>("form-eliminar-noche");
    if (!inputId || !form) return;

    inputId.value = idNoche;
    form.requestSubmit();
};


document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const tab = target.closest<HTMLElement>("[data-noche-tab]");
    if (tab) {
        if (esFase(tab.dataset.fase)) renderFase(tab.dataset.fase);
        return;
    }

    if (target.closest("[data-noche-nueva]")) {
        abrirModalNoche();
        return;
    }

    const editar = target.closest<HTMLElement>("[data-noche-editar]");
    if (editar) {
        const noche = buscarNoche(editar.dataset.id);
        if (noche) abrirModalNoche(noche);
        return;
    }

    const eliminar = target.closest<HTMLElement>("[data-noche-eliminar]");
    if (eliminar) {
        confirmarEliminarNoche(eliminar.dataset.id ?? "", eliminar.dataset.num ?? "");
        return;
    }

    const fila = target.closest<HTMLElement>("[data-noche-detalle]");
    if (fila) {
        const noche = buscarNoche(fila.dataset.id);
        if (noche) abrirDetalleNoche(noche);
        return;
    }

    const generar = target.closest<HTMLElement>("[data-generar-reporte]");
    if (generar) {
        const params = new URLSearchParams({
            paciente_id: generar.dataset.pacienteId ?? "",
            nombre: generar.dataset.nombre ?? "",
            edad: generar.dataset.edad ?? "",
            fase: faseActiva(),
        });
        window.location.href = `/reportes?${params.toString()}`;
    }
});

if (byId("tabla-noches")) renderFase(faseActiva());
