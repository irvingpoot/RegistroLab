import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import { calcularBerlin, calcularpsqi } from "../../utils/calculos";

export const GET: APIRoute = async () => {
    const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.SUPABASE_KEY
    );

    try {
        const { data: pacientes, error: errorPacientes } = await supabase
            .from('pacientes')
            .select('id, nombre, donde_duerme, epworth_pre, psqi_pre, berlin_pre')
            .neq('donde_duerme', null)
            .order('nombre');

        if (errorPacientes) throw errorPacientes;

        const ids = pacientes.map((p) => p.id);

        const { data: respuestas, error: errorResp } = await supabase
            .from('respuestas_cuestionarios')
            .select('paciente_id, cuestionario, datos')
            .in('paciente_id', ids)
            .eq('fase', 'pre')
            .in('cuestionario', ['berlin', 'psqi']);

        if (errorResp) throw errorResp;

        const respMap: Record<number, Record<string, Record<string, any>>> = {};
        for (const r of respuestas ?? []) {
            if (!respMap[r.paciente_id]) respMap[r.paciente_id] = {};
            respMap[r.paciente_id][r.cuestionario] = r.datos;
        }

        const cabecera = [
            "Nombre",
            "Lugar de Sueño",
            "Epworth (Pre)",
            "Berlin (Pre) – Puntaje Total",
            "Berlin – C1 Ronquido",
            "Berlin – C2 Somnolencia",
            "Berlin – C3 Hipertensión",
            "Berlin – Riesgo Global",
            "PSQI (Pre) – Puntaje Total",
            "PSQI – C1 Calidad",
            "PSQI – C2 Latencia",
            "PSQI – C3 Duración",
            "PSQI – C4 Eficiencia",
            "PSQI – C5 Perturbaciones",
            "PSQI – C6 Medicación",
            "PSQI – C7 Disfunción",
            "PSQI – Dato Usado",
        ].join(",") + "\n";

        const filas = pacientes.map((p) => {
            const datosBerlin = respMap[p.id]?.['berlin'] ?? null;
            const datosPsqi   = respMap[p.id]?.['psqi']   ?? null;

            let berlinTotal = p.berlin_pre !== null ? String(p.berlin_pre) : '';
            let berlinC1 = '', berlinC2 = '', berlinC3 = '', berlinRiesgo = '';

            if (datosBerlin) {
                const { puntaje, extraData } = calcularBerlin(datosBerlin);
                berlinTotal  = String(puntaje);
                berlinC1     = extraData["Resultado Categoría 1 (Ronquido)"] ?? '';
                berlinC2     = extraData["Resultado Categoría 2 (Somnolencia)"] ?? '';
                berlinC3     = extraData["Resultado Categoría 3 (Hipertensión)"] ?? '';
                berlinRiesgo = extraData["Riesgo Global"] ?? '';
            }

            let psqiTotal = p.psqi_pre !== null ? String(p.psqi_pre) : '';
            let psqiC1 = '', psqiC2 = '', psqiC3 = '', psqiC4 = '';
            let psqiC5 = '', psqiC6 = '', psqiC7 = '', psqiDato = '';

            if (datosPsqi) {
                const { puntaje, extraData } = calcularpsqi(datosPsqi);
                psqiTotal = String(puntaje);
                psqiC1    = extraData["C1 Calidad"]        ?? '';
                psqiC2    = extraData["C2 Latencia"]       ?? '';
                psqiC3    = extraData["C3 Duración"]       ?? '';
                psqiC4    = extraData["C4 Eficiencia"]     ?? '';
                psqiC5    = extraData["C5 Perturbaciones"] ?? '';
                psqiC6    = extraData["C6 Medicación"]     ?? '';
                psqiC7    = extraData["C7 Disfunción"]     ?? '';
                psqiDato  = extraData["Dato Usado"]        ?? '';
            }

            const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;

            return [
                esc(p.nombre || 'Anónimo'),
                p.donde_duerme || 'No especificado',
                p.epworth_pre !== null ? p.epworth_pre : '',
                berlinTotal,
                esc(berlinC1),
                esc(berlinC2),
                esc(berlinC3),
                esc(berlinRiesgo),
                psqiTotal,
                psqiC1,
                psqiC2,
                esc(psqiC3),
                esc(psqiC4),
                psqiC5,
                psqiC6,
                psqiC7,
                psqiDato,
            ].join(",");
        });

        const csvContent = cabecera + filas.join("\n") + "\n";

        return new Response("\uFEFF" + csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="reporte_sueno_habit.csv"',
                "Cache-Control": "private, max-age=30",
            },
        });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Error generando reporte" }), {
            status: 500,
        });
    }
};