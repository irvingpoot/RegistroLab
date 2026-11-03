/**
 * @file utils/form-data.ts
 * @description Helpers para leer y convertir los campos de un `FormData` (POST de los formularios).
 */

import { FASES_PUNTAJE } from "../data/fases";

export const getStr = (fd: FormData, key: string): string | null => {
    const v = fd.get(key);
    return v ? v.toString().trim() : null;
};

export const getRaw = (fd: FormData, key: string): string | null => fd.get(key)?.toString() ?? null;

export const getInt = (fd: FormData, key: string): number | null => {
    const v = fd.get(key);
    return v && v.toString().trim() !== "" ? parseInt(v.toString()) : null;
};

export const getNum = (fd: FormData, key: string): number | null => {
    const v = fd.get(key);
    return v && v.toString().trim() !== "" ? parseFloat(v.toString()) : null;
};

export const getFechaISO = (fd: FormData, key = "fecha"): string => {
    const v = fd.get(key);
    return v ? new Date(v.toString()).toISOString() : new Date().toISOString();
};

export const parsePuntajes = (
    fd: FormData,
    escalas: readonly string[],
): Record<string, number | null> => {
    const puntajes: Record<string, number | null> = {};
    for (const escala of escalas) {
        for (const fase of FASES_PUNTAJE) {
            const columna = `${escala}_${fase}`;
            puntajes[columna] = getInt(fd, columna);
        }
    }
    return puntajes;
};

export interface PuntajeExtra {
    nombre_prueba: string;
    puntaje_pre: number | null;
    puntaje_inter: number | null;
    puntaje_post: number | null;
}

export const parsePuntajesExtra = (fd: FormData): PuntajeExtra[] => {
    const nombres = fd.getAll("extra_prueba_nombre");
    const pre = fd.getAll("extra_prueba_pre");
    const inter = fd.getAll("extra_prueba_inter");
    const post = fd.getAll("extra_prueba_post");

    const aEntero = (v: FormDataEntryValue | undefined) => (v ? parseInt(v.toString()) : null);

    return nombres
        .map((nombre, i) => ({
            nombre_prueba: nombre.toString(),
            puntaje_pre: aEntero(pre[i]),
            puntaje_inter: aEntero(inter[i]),
            puntaje_post: aEntero(post[i]),
        }))
        .filter((item) => item.nombre_prueba.trim() !== "");
};

export interface FarmacosPayload {
    farmacos_nombres: string[];
    farmacos_dosis: string[];
    farmacos_motivos: string[];
    farmacos_frecuencias: string[];
    farmacos_tiempos: string[];
}

export const parseFarmacos = (fd: FormData): FarmacosPayload => {
    const conNombre = fd.getAll("farmacos_nombres").map((n) => n.toString().trim() !== "");
    const soloConNombre = (campo: string) =>
        fd.getAll(campo).map((v) => v.toString()).filter((_, i) => conNombre[i]);

    return {
        farmacos_nombres: soloConNombre("farmacos_nombres"),
        farmacos_tiempos: soloConNombre("farmacos_tiempos"),
        farmacos_motivos: soloConNombre("farmacos_motivos"),
        farmacos_frecuencias: soloConNombre("farmacos_frecuencias"),
        farmacos_dosis: soloConNombre("farmacos_dosis"),
    };
};