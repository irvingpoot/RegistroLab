/**
 * @file utils/farmacos.ts
 * @description Conversión entre la forma en que se guardan los fármacos en `pacientes`
 * (arreglos paralelos: misma posición = mismo medicamento) y las filas de los formularios.
 */

export interface FarmacoItem {
    nombre: string;
    dosis: string;
    motivo: string;
    tiempo: string;
    frecuencia: string;
}

export const farmacosDePaciente = (paciente: Record<string, any>): FarmacoItem[] => {
    const nombres: unknown[] = Array.isArray(paciente.farmacos_nombres) ? paciente.farmacos_nombres : [];

    const valorEn = (campo: string, i: number): string => {
        const arreglo = paciente[campo];
        return Array.isArray(arreglo) && arreglo[i] != null ? String(arreglo[i]) : "";
    };

    return nombres.map((nombre, i) => ({
        nombre: String(nombre),
        dosis: valorEn("farmacos_dosis", i),
        motivo: valorEn("farmacos_motivos", i),
        tiempo: valorEn("farmacos_tiempos", i),
        frecuencia: valorEn("farmacos_frecuencias", i),
    }));
};

export const horariosDe = (frecuencia: string): string[] =>
    frecuencia
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);