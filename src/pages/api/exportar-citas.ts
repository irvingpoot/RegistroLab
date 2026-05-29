import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

export const GET: APIRoute = async ({ url }) => {
    const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.SUPABASE_KEY
    );

    const filtro = url.searchParams.get("filtro") ?? "pendiente";
    const soloEstado = filtro === "pendiente";

    try {
        let query = supabase
            .from("citas")
            .select("id, nombre, sintoma, telefono, referencia, motivo, observaciones, fecha_hora, estado, atendido_por, registrado_por_id")
            .order("fecha_hora", { ascending: true });

        if (soloEstado) {
            query = query.eq("estado", "pendiente");
        }

        const { data: citas, error } = await query;
        if (error) throw error;

        const filas = citas.map((c) => ({
            "ID":             c.id,
            "Paciente":       c.nombre,
            "Estado":         c.estado         ?? "",
            "Síntoma":        c.sintoma        ?? "",
            "Teléfono":       c.telefono       ?? "",
            "Referencia":     c.referencia     ?? "",
            "Motivo":         c.motivo         ?? "",
            "Observaciones":  c.observaciones  ?? "",
            "Fecha y Hora":   new Date(c.fecha_hora).toLocaleString("es-MX", {
                                timeZone: "America/Merida",
                                year: "numeric", month: "2-digit", day: "2-digit",
                                hour: "2-digit", minute: "2-digit",
                                }),
            "Atendido por":   c.atendido_por       ?? "",
            "Registrado por": c.registrado_por_id  ?? "",
        }));

        const ws = XLSX.utils.json_to_sheet(filas);
        ws["!cols"] = [
            { wch: 6  },
            { wch: 30 },
            { wch: 12 },
            { wch: 25 },
            { wch: 15 },
            { wch: 20 },
            { wch: 25 },
            { wch: 35 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
        ];

        const wb = XLSX.utils.book_new();
        const nombreHoja = soloEstado ? "Citas Pendientes" : "Todas las Citas";
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        const fecha = new Date().toISOString().split("T")[0];
        const nombreArchivo = soloEstado
            ? `citas_pendientes_${fecha}.xlsx`
            : `citas_todas_${fecha}.xlsx`;

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
                "Cache-Control": "private, max-age=30",
            },
        });

    } catch (e) {
        console.error(e);
        return new Response(JSON.stringify({ error: "Error generando reporte de citas" }), {
            status: 500,
        });
    }
};