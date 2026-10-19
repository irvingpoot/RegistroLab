/**
 * @file generar-reporte-poligrafia.ts
 * @description Genera el reporte de poligrafía nocturna en Word (.docx) usando la librería docx.
 *
 * - La firma debe estar en el bucket "assets" de Supabase Storage (fuera del repo)
 * - El fondo (fondo_sueno.png) también debe estar en el bucket "assets"
 *   (se coloca en el encabezado del documento, detrás del texto, en todas las páginas)
 *
 * Dependencias:
 *   npm install docx
 */

import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  AlignmentType,
  LineRuleType,
  BorderStyle,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
} from "docx";
import { requerirSesion } from "../../lib/api-auth";


const descargarDeStorage = async (path: string): Promise<Buffer> => {
  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_KEY
  );

  const { data, error } = await supabase.storage
    .from("assets")
    .download(path);

  if (error || !data) {
    throw new Error(`No se pudo descargar '${path}' de Supabase Storage: ${error?.message}`);
  }

  return Buffer.from(await data.arrayBuffer());
};

type FaseEstudio = 'pre' | 'inter' | 'post';

interface PacienteReporte {
  nombre: string;
  edad: number;
  epworth_pre?: number | null;
  epworth_inter?: number | null;
  epworth_post?: number | null;
  psqi_pre?: number | null;
  psqi_inter?: number | null;
  psqi_post?: number | null;
}

interface Noche {
  id: number;
  created_at: string;
  duracion_registro: string | null;
  duracion_evaluacion: string | null;
  iah: number | null;
  indice_apneas: number | null;
  indice_hipopnea: number | null;
  iai: number | null;
  iao: number | null;
  iac: number | null;
  iam: number | null;
  ido: number | null;
  saturacion_promedio: number | null;
  pulso_promedio: number | null;
  ronquidos: number | null;
  sat_90_min: number | null;
  sat_90_porc: number | null;
  sat_85_min: number | null;
  sat_85_porc: number | null;
}

const duracionAMinutos = (s: string | null): number | null => {
  if (!s) return null;
  const m = s.match(/(\d+)h\s*(\d+)m/);
  if (!m) return null;
  return parseInt(m[1]) * 60 + parseInt(m[2]);
};

const minutosATexto = (min: number): string => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  const ht = h === 1 ? "1 hora" : `${h} horas`;
  const mt = m === 1 ? "1 minuto" : `${m} minutos`;
  if (h === 0) return mt;
  if (m === 0) return ht;
  return `${ht} con ${mt}`;
};

const promedioN = (noches: Noche[], campo: keyof Noche): number | null => {
  const vals = noches
    .map((n) => n[campo] as number | null)
    .filter((v): v is number => v !== null && !isNaN(v));
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
};

const clasificarEpworth = (p: number | null): string => {
  if (p === null) return "Sin datos";
  if (p <= 10) return "Sin somnolencia significativa";
  if (p <= 12) return "Somnolencia leve";
  if (p <= 15) return "Somnolencia moderada";
  return "Somnolencia diurna excesiva";
};

const clasificarPsqi = (p: number | null): { categoria: string } => {
  if (p === null) return { categoria: "Sin datos" };
  if (p < 5)  return { categoria: "Sin alteración en la calidad de sueño" };
  if (p < 10) return { categoria: "Alteración leve en la calidad de sueño" };
  if (p < 15) return { categoria: "Alteración moderada en la calidad de sueño" };
  return { categoria: "Alteración de moderada a grave en la calidad de sueño" };
};

const clasificarBerlin = (cat1: boolean | null, cat2: boolean | null, cat3: boolean | null): string => {
  if (cat1 === null && cat2 === null && cat3 === null) return "Sin datos del cuestionario de Berlín.";
  const etiquetas = [
    cat1 ? "la 1) Síntomas persistentes de ronquidos y apneas" : null,
    cat2 ? "la 2) Síntomas persistentes de somnolencia diurna" : null,
    cat3 ? "la 3) Hipertensión" : null,
  ].filter((c): c is string => c !== null);
  if (etiquetas.length === 0) return "En el cuestionario de Berlín para SAOS no obtuvo categorías positivas, indicando bajo riesgo.";
  return `En el cuestionario de Berlín para SAOS (síndrome de apnea obstructiva del sueño) obtuvo ${etiquetas.length === 1 ? "una categoría positiva" : `${etiquetas.length} categorías positivas`}, ${etiquetas.join(", ")}.`;
};

const clasificarSaos = (iah: number | null): string => {
  if (iah === null) return "indeterminado";
  if (iah < 5)  return "normal (sin SAOS)";
  if (iah < 15) return "leve";
  if (iah < 30) return "moderado";
  return "grave";
};

const tipoApneaPredominante = (noches: Noche[]): string => {
  const iao = promedioN(noches, "iao") ?? 0;
  const iac = promedioN(noches, "iac") ?? 0;
  const iam = promedioN(noches, "iam") ?? 0;
  const iah = promedioN(noches, "indice_hipopnea") ?? 0;
  const max = Math.max(iao, iac, iam, iah);
  if (max === 0) return "apneas no clasificadas";
  if (max === iao) return "predominantemente de apneas obstructivas";
  if (max === iac) return "predominantemente de apneas centrales";
  if (max === iah) return "predominantemente de hipoapneas";
  return "predominantemente de apneas mixtas";
};

const nombreSindrome = (tipoApnea: string): string => {
  if (tipoApnea.includes("obstructivas")) return "Síndrome de Apnea Obstructiva del Sueño (SAOS)";
  if (tipoApnea.includes("centrales"))   return "Síndrome de Apnea Central del Sueño (SACS)";
  if (tipoApnea.includes("mixtas"))      return "Síndrome de Apnea Mixta del Sueño";
  if (tipoApnea.includes("hipoapneas"))  return "Síndrome de Hipoapnea del Sueño";
  return "Síndrome de Apnea del Sueño (SAS)";
};

const PT          = 20;
const PX_POR_PT   = 96 / 72;
const PAGE_W_PT   = 612;
const PAGE_H_PT   = 792;
const MARGIN_LEFT_PT   = 72;
const MARGIN_RIGHT_PT  = 92;
const MARGIN_TOP_PT    = 146;
const MARGIN_BOTTOM_PT = 65;
const LINE_HEIGHT_PT   = 22;
const FONT        = "Arial";
const SIZE_BODY   = 22;
const SIZE_FIRMA  = 20;
const TEXT_WIDTH_PT = PAGE_W_PT - MARGIN_LEFT_PT - MARGIN_RIGHT_PT;

interface Segment { text: string; bold: boolean }

const parsearSegmentos = (text: string): Segment[] =>
  text.split(/(\*\*[^*]+\*\*)/g).map(p =>
    p.startsWith("**") && p.endsWith("**")
      ? { text: p.slice(2, -2), bold: true }
      : { text: p, bold: false }
  );

interface OpcionesParrafo {
  size?: number;
  firstLineIndent?: number;
  bold?: boolean;
  spaceAfter?: number;
  align?: "left" | "center";
  keepNext?: boolean;
}

const crearParrafo = (text: string, opts: OpcionesParrafo = {}): Paragraph => {
  const { size = SIZE_BODY, firstLineIndent = 0, bold = false, spaceAfter = LINE_HEIGHT_PT, align, keepNext = false } = opts;

  return new Paragraph({
    alignment: align === "center" ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    indent: firstLineIndent ? { firstLine: firstLineIndent * PT } : undefined,
    spacing: {
      before: 0,
      after: spaceAfter * PT,
      line: LINE_HEIGHT_PT * PT,
      lineRule: LineRuleType.EXACT,
    },
    keepNext,
    children: parsearSegmentos(text)
      .filter(s => s.text)
      .map(s => new TextRun({ text: s.text, bold: bold || s.bold, font: FONT, size })),
  });
};

const dimensionesPng = (b: Buffer) => ({ width: b.readUInt32BE(16), height: b.readUInt32BE(20) });

const generarDOCX = async (params: {
  nombre: string;
  edad: number;
  fechaReporte: string;
  totalNoches: number;
  duracionesTexto: string;
  duracionTotalEval: string;
  iahPorNoche: string;
  iahPromedio: number | null;
  tipoApnea: string;
  ronquidosPromedio: number | null;
  satPorNoche: string;
  satPromedio: number | null;
  idoPorNoche: string;
  idoPromedio: number | null;
  sat90PorNoche: string;
  sat85PorNoche: string;
  epworthPuntaje: number | null;
  epworthCat: string;
  psqiPuntaje: number | null;
  psqi: { categoria: string; observaciones: string };
  berlinTexto: string;
  saosNivel: string;
  recomendaciones: string[];
}): Promise<Buffer> => {

  const [bgBytes, firmaBytes] = await Promise.all([
    descargarDeStorage("fondo_sueno.png"),
    descargarDeStorage("firma.png"),
  ]);

  const nl = params.totalNoches === 1 ? "noche" : "noches";
  const n  = params.totalNoches;

  const children: Paragraph[] = [];
  const w = (text: string, opts: OpcionesParrafo = {}) => { children.push(crearParrafo(text, opts)); };

  w(`**NOMBRE: ${params.nombre}**`, { spaceAfter: 3 });
  w(`**EDAD: ${params.edad} AÑOS.**`, { spaceAfter: 3 });
  w(`**FECHA: ${params.fechaReporte}.**`, { spaceAfter: 20 });

  w("Reporte técnico", { spaceAfter: 8, align: "center", bold: true, keepNext: true });
  w("POLIGRAFÍA NOCTURNA", { spaceAfter: 8, align: "center", bold: true, keepNext: true });
  w(
    "Se realizó un estudio de poligrafía nocturna para la detección de alteraciones de la respiración durante el sueño mediante el equipo Apnea Link, registrando 4 canales: flujo de aire, saturación de oxígeno, frecuencia cardíaca, esfuerzo respiratorio.",
    { firstLineIndent: 30, spaceAfter: 16 }
  );

  w("RESULTADOS", { align: "center", bold: true, spaceAfter: 8, keepNext: true });
  w(
    `El estudio se realizó en ${n} ${nl}, en las cuales se registraron ${params.duracionesTexto} respectivamente, para dar un total de ${params.duracionTotalEval}.`,
    { firstLineIndent: 30, spaceAfter: 16 }
  );

  w("**Alteraciones de la respiración**", { spaceAfter: 8, keepNext: true });
  w(
    `Los índices de apnea e hipopnea (IAH) por noche fueron: ${params.iahPorNoche}. El promedio de las ${n} ${nl} fue de **IAH = ${params.iahPromedio ?? "—"} eventos por hora**. Los eventos fueron ${params.tipoApnea}. Durante el estudio se obtuvo un promedio de **${params.ronquidosPromedio ?? "—"} ronquidos** en las ${n} ${nl}.`,
    { firstLineIndent: 30, spaceAfter: 12 }
  );
  w(
    `La **saturación promedio de oxígeno** durante el sueño fue del ${params.satPorNoche} respectivamente, con un promedio de ${params.satPromedio ?? "—"}%. Los **índices de desaturación de oxígeno** fueron de ${params.idoPorNoche}, promediando **${params.idoPromedio ?? "—"} eventos por hora** a lo largo de las ${n} ${nl}.`,
    { spaceAfter: 10 }
  );
  w(
    `La saturación de **oxígeno menor al 90%** fue del ${params.sat90PorNoche} respectivamente. La saturación de **oxígeno menor al 85%** fue del ${params.sat85PorNoche} respectivamente.`,
    { spaceAfter: 16 }
  );

  w("**Datos de autoinforme**", { spaceAfter: 8, keepNext: true });
  w(
    `En la escala de somnolencia de Epworth obtuvo ${params.epworthPuntaje ?? "—"} puntos de una puntuación máxima de 24, lo cual lo ubica en la categoría: **${params.epworthCat}.**`,
    { firstLineIndent: 30, spaceAfter: 12 }
  );
  w(
    `En el cuestionario de calidad de sueño de Pittsburgh obtuvo ${params.psqiPuntaje ?? "—"} puntos, ubicándolo en la categoría: **${params.psqi.categoria}**${params.psqi.observaciones}`,
    { firstLineIndent: 30, spaceAfter: 12 }
  );
  w(params.berlinTexto, { firstLineIndent: 30, spaceAfter: 16 });

  w("RECOMENDACIONES", { spaceAfter: 8, align: "center", bold: true, keepNext: true });
  w(
    `- Con base al IAH promedio de las ${n} ${nl} (**IAH = ${params.iahPromedio ?? "—"} eventos**), se considera la **presencia de Síndrome de Apnea Obstructiva del Sueño (SAOS) en nivel ${params.saosNivel}, ${params.tipoApnea}.** Se obtuvo un promedio de ${params.ronquidosPromedio ?? "—"} eventos relacionados con ronquidos, los cuales, junto con el SAOS, se pueden valorar clínicamente como posible causa de la alteración de la calidad del sueño y la somnolencia diurna excesiva.`,
    { spaceAfter: 10 }
  );

  if (params.recomendaciones.includes("cpap")) {
    w(
      "- Se recomienda la valoración del uso de ventilación mecánica no invasiva, mediante presión positiva continua de la vía aérea superior (CPAP, por sus siglas en inglés). Realizar seguimiento mediante ensayo terapéutico con CPAP.",
      { spaceAfter: 10 }
    );
  }
  if (params.recomendaciones.includes("orl")) {
    w(
      "- Se recomienda revisión de otorrinolaringología para valorar oclusiones en la vía aérea superior. Asimismo, se recomienda lograr un peso corporal saludable por su relación con las alteraciones de la respiración durante el sueño, como el ronquido y el SAOS.",
      { spaceAfter: 10 }
    );
  }
  if (params.recomendaciones.includes("posicion")) {
    w(
      "- Se recomienda dormir en posición lateral evitando la posición supina (boca arriba). En algunos pacientes la posición supina contribuye a la aparición y gravedad de eventos obstructivos durante el sueño.",
      { spaceAfter: 10 }
    );
  }
  if (params.recomendaciones.includes("autoinforme")) {
    w(
      "- Respecto a los resultados de auto informe del sueño, la somnolencia diurna excesiva suele ser un síntoma de la apnea obstructiva que puede mejorar después de la atención de los síntomas relacionados con el problema respiratorio. Asimismo, se recomienda psicoeducación y orientación sobre estrategias para la higiene de sueño y su ciclo circadiano.",
      { spaceAfter: 10 }
    );
  }

  w("Se anexan los datos del estudio de poligrafía respiratoria.", { spaceAfter: 36, keepNext: true });

  const firmaW_pt = 100;
  const { width: pngW, height: pngH } = dimensionesPng(firmaBytes);
  const firmaH_pt = pngH * (firmaW_pt / pngW);
  const LINEA_FIRMA_PT = 200;
  const sangriaLinea = ((TEXT_WIDTH_PT - LINEA_FIRMA_PT) / 2) * PT;

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    keepNext: true,
    spacing: { before: 0, after: 0, line: LINE_HEIGHT_PT * PT, lineRule: LineRuleType.EXACT },
    children: [new TextRun({ text: "A T E N T A M E N T E", bold: true, font: FONT, size: SIZE_BODY })],
  }));

  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    keepNext: true,
    indent: { left: sangriaLinea, right: sangriaLinea },
    spacing: { before: Math.max(75 - firmaH_pt, 6) * PT, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000", space: 1 } },
    children: [
      new ImageRun({
        type: "png",
        data: firmaBytes,
        transformation: {
          width: Math.round(firmaW_pt * PX_POR_PT),
          height: Math.round(firmaH_pt * PX_POR_PT),
        },
      }),
    ],
  }));

  const lineasFirma = ["DR. JESÚS MOO ESTRELLA", "Laboratorio del Sueño y Neurociencias", "jmestre@correo.uady.mx"];
  lineasFirma.forEach((txt, i) => {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      keepNext: i < lineasFirma.length - 1,
      spacing: { before: i === 0 ? 3 * PT : 0, after: 0, line: 14 * PT, lineRule: LineRuleType.EXACT },
      children: [new TextRun({ text: txt, bold: true, font: FONT, size: SIZE_FIRMA })],
    }));
  });

  const header = new Header({
    children: [
      new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({
            type: "png",
            data: bgBytes,
            transformation: {
              width: Math.round(PAGE_W_PT * PX_POR_PT),
              height: Math.round(PAGE_H_PT * PX_POR_PT),
            },
            floating: {
              horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
              verticalPosition:   { relative: VerticalPositionRelativeFrom.PAGE,   offset: 0 },
              behindDocument: true,
              allowOverlap: true,
              lockAnchor: true,
            },
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: "Laboratorio del Sueño y Neurociencias",
    title: `Reporte de poligrafía - ${params.nombre}`,
    styles: { default: { document: { run: { font: FONT, size: SIZE_BODY } } } },
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W_PT * PT, height: PAGE_H_PT * PT },
          margin: {
            top: MARGIN_TOP_PT * PT,
            bottom: MARGIN_BOTTOM_PT * PT,
            left: MARGIN_LEFT_PT * PT,
            right: MARGIN_RIGHT_PT * PT,
            header: 0,
            footer: 0,
          },
        },
      },
      headers: { default: header },
      children,
    }],
  });

  return Packer.toBuffer(doc);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const sinSesion = requerirSesion(locals);
  if (sinSesion) return sinSesion;

  let pacienteId: string;
  let recomendaciones: string[];
  let fase: FaseEstudio;

  try {
    const body = await request.json();
    pacienteId = String(body.paciente_id);
    const faseRecibida = String(body.fase || 'pre');
    fase = ['pre', 'inter', 'post'].includes(faseRecibida) ? (faseRecibida as FaseEstudio) : 'pre';
    recomendaciones = Array.isArray(body.recomendaciones) ? body.recomendaciones : [];
  } catch {
    return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400 });
  }

  const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_KEY
  );

  const epworthCol = `epworth_${fase}` as const;
  const psqiCol = `psqi_${fase}` as const;

  let queryNoches = supabase
    .from("pacientes_reportes_sueno")
    .select("*")
    .eq("paciente_id", pacienteId)
    .order("created_at", { ascending: true });
    
  if (fase === 'pre') {
    queryNoches = queryNoches.or('fase.eq.pre,fase.is.null');
  } else {
    queryNoches = queryNoches.eq('fase', fase);
  }

  const [
    { data: pacienteRaw, error: errP }, 
    { data: nochesRaw, error: errN }, 
    { data: berlinRaw }, 
    { data: psqiRaw }
  ] = await Promise.all([
    supabase.from("pacientes").select(`nombre, edad, ${epworthCol}, ${psqiCol}`).eq("id", pacienteId).single(),
    queryNoches,
    supabase.from("respuestas_cuestionarios").select("datos").eq("paciente_id", pacienteId).eq("fase", fase).eq("cuestionario", "berlin").maybeSingle(),
    supabase.from("respuestas_cuestionarios").select("datos").eq("paciente_id", pacienteId).eq("fase", fase).eq("cuestionario", "psqi").maybeSingle(),
  ]);
  const paciente = pacienteRaw as PacienteReporte | null;
  const berlinDatos = berlinRaw?.datos as Record<string, string> | null ?? null;
  const esPositiva  = (v: string | undefined) => typeof v === "string" && v.toUpperCase().includes("POSITIVA");
  const berlin = berlinDatos ? {
    cat1: esPositiva(berlinDatos["Resultado Categoría 1 (Ronquido)"]),
    cat2: esPositiva(berlinDatos["Resultado Categoría 2 (Somnolencia)"]),
    cat3: esPositiva(berlinDatos["Resultado Categoría 3 (Hipertensión)"]) ||
          esPositiva(berlinDatos["Resultado Categoría 3 (Presión Arterial)"]),
  } : null;

  const PSQI_COMPONENTES: [string, string][] = [
    ["C1 Calidad",        "calidad subjetiva de sueño"],
    ["C2 Latencia",       "latencia del sueño"],
    ["C3 Duración",       "duración del sueño"],
    ["C4 Eficiencia",     "eficiencia habitual del sueño"],
    ["C5 Perturbaciones", "perturbación del sueño"],
    ["C6 Medicación",     "uso de medicación hipnótica"],
    ["C7 Disfunción",     "disfunción diurna"],
  ];
  const psqiDatos = psqiRaw?.datos as Record<string, string> | null ?? null;
  const psqiObservaciones = (() => {
    if (!psqiDatos) return "";
    const alteradas = PSQI_COMPONENTES
      .filter(([key]) => parseInt(psqiDatos[key] ?? "0") >= 3)
      .map(([, label]) => label);
    if (!alteradas.length) return "";
    return `, con observaciones en ${alteradas.join(", ")}.`;
  })();

  if (errP || !paciente)
    return new Response(JSON.stringify({ error: "Paciente no encontrado" }), { status: 404 });
  if (errN)
    return new Response(JSON.stringify({ error: "Error al obtener noches" }), { status: 500 });

  const noches: Noche[] = nochesRaw ?? [];
  if (!noches.length)
    return new Response(JSON.stringify({ error: `El paciente no tiene noches de poligrafía registradas para la fase ${fase.toUpperCase()}` }), { status: 422 });

  const totalNoches       = noches.length;
  const duracionesTexto   = noches.map(n => { const m = duracionAMinutos(n.duracion_evaluacion); return m ? minutosATexto(m) : "—"; }).join(", ");
  const totalMinEval      = noches.reduce((a, n) => a + (duracionAMinutos(n.duracion_evaluacion) ?? 0), 0);
  const iahPromedio       = promedioN(noches, "iah");
  const idoPromedio       = promedioN(noches, "ido");
  const satPromedio       = promedioN(noches, "saturacion_promedio");
  const ronquidosPromedio = promedioN(noches, "ronquidos");
  const iahPorNoche       = noches.map((n, i) => `IAH noche ${i + 1} = ${n.iah ?? "—"}`).join(", ");
  const satPorNoche       = noches.map((n, i) => `${n.saturacion_promedio ?? "—"}% (noche ${i + 1})`).join(", ");
  const idoPorNoche       = noches.map((n, i) => `${n.ido ?? "—"} (noche ${i + 1})`).join(", ");
  const sat90PorNoche     = noches.map((n, i) => `${n.sat_90_porc ?? "—"}% (${n.sat_90_min ?? "—"} min) en la noche ${i + 1}`).join(", ");
  const sat85PorNoche     = noches.map((n, i) => `${n.sat_85_porc ?? "—"}% (${n.sat_85_min ?? "—"} min) en la noche ${i + 1}`).join(", ");

  const puntajeEpworth = paciente ? paciente[epworthCol] ?? null : null;
  const puntajePsqi = paciente ? paciente[psqiCol] ?? null : null;

  try {
    const docxBytes = await generarDOCX({
      nombre: paciente.nombre,
      edad: paciente.edad,
      fechaReporte: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" }),
      totalNoches,
      duracionesTexto,
      duracionTotalEval: minutosATexto(totalMinEval),
      iahPorNoche,
      iahPromedio,
      tipoApnea: tipoApneaPredominante(noches),
      ronquidosPromedio,
      satPorNoche,
      satPromedio,
      idoPorNoche,
      idoPromedio,
      sat90PorNoche,
      sat85PorNoche,
      epworthPuntaje: puntajeEpworth,
      epworthCat: clasificarEpworth(puntajeEpworth),
      psqiPuntaje: puntajePsqi,
      psqi: { ...clasificarPsqi(puntajePsqi), observaciones: psqiObservaciones },
      berlinTexto: clasificarBerlin(berlin?.cat1 ?? null, berlin?.cat2 ?? null, berlin?.cat3 ?? null),
      saosNivel: clasificarSaos(iahPromedio),
      recomendaciones,
    });

    const nombreArchivo = `reporte_poligrafia_${paciente.nombre.replace(/\s+/g, "_")}_${fase}_${new Date().toISOString().split("T")[0]}.docx`;

    return new Response(Buffer.from(docxBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err: any) {
    console.error("Error generando DOCX:", err);
    return new Response(JSON.stringify({ error: err.message ?? "Error al generar el documento Word" }), { status: 500 });
  }
};