/**
 * Contiene la lógica para puntuar los cuestionarios médicos.
 */

export const calcularEpworth = (datos: Record<string, any>): number => {
    let total = 0;
    for (let i = 1; i <= 8; i++) {
        const val = parseInt(datos[`epworth_${i}`] as string || '0', 10);
        total += isNaN(val) ? 0 : val;
    }
    return total;
};

export const calcularBerlin = (datos: Record<string, any>): { puntaje: number, extraData: Record<string, string> } => {
    let cat1Positivas = 0;
    let cat2Positivas = 0;

    let esCat1 = false;
    let esCat2 = false;
    let esCat3 = false;

    if (datos.ronca_volumen === 'positivo') cat1Positivas++;
    if (datos.ronca_frecuencia === 'positivo') cat1Positivas++;
    if (datos.ronca_molesta === 'positivo') cat1Positivas++;
    if (datos.ronca_deja_de_respirar === 'positivo') cat1Positivas++;
    
    esCat1 = cat1Positivas >= 2;

    if (datos.despierta_cansado === 'positivo') cat2Positivas++;
    if (datos.se_siente_mal === 'positivo') cat2Positivas++;
    if (datos.se_quedo_dormido_frecuencia === 'positivo') cat2Positivas++;

    esCat2 = cat2Positivas >= 2;

    
    const peso = parseFloat(datos.peso || '0');
    const alturaCm = parseFloat(datos.altura || '0');
    let imc = 0;
    
    if (peso > 0 && alturaCm > 0) {
        const alturaM = alturaCm / 100;
        imc = peso / (alturaM * alturaM);
    }

    esCat3 = (datos.hipertension === 'positivo');

    let totalScore = 0;
    if (esCat1) totalScore++;
    if (esCat2) totalScore++;
    if (esCat3) totalScore++;

    return {
        puntaje: totalScore,
        extraData: {
            "IMC": imc.toFixed(1),
            "Resultado Categoría 1 (Ronquido)": esCat1 ? "POSITIVA (Alto Riesgo)" : "Negativa",
            "Resultado Categoría 2 (Somnolencia)": esCat2 ? "POSITIVA (Alto Riesgo)" : "Negativa",
            "Resultado Categoría 3 (Hipertensión)": esCat3 ? "POSITIVA (Alto Riesgo)" : "Negativa",
            "Riesgo Global": totalScore >= 2 ? "ALTO RIESGO (2 o más categorías)" : "Bajo Riesgo"
        }
    };
};

export const calcularpsqi = (datos: Record<string, any>): { puntaje: number, extraData: Record<string, string> } => {
    
    const val = (key: string) => parseInt(datos[key] || '0', 10);

    const comp1 = val('calidad_sueno');

    const scoreLatenciaMin = val('tiempo_dormir'); 
    
    const freqNoDormir = val('alteracion_1');
    
    const sumaC2 = scoreLatenciaMin + freqNoDormir;
    let comp2 = 0;
    if (sumaC2 >= 5) comp2 = 3;
    else if (sumaC2 >= 3) comp2 = 2;
    else if (sumaC2 >= 1) comp2 = 1;

    const horasPaciente = parseFloat(datos.horas_sueno || '0');
    const horasEstudio = parseFloat(datos.horas_sueno_estudio || '0'); 
    
    const horasReales = horasEstudio > 0 ? horasEstudio : horasPaciente;

    let comp3 = 0;
    if (horasReales < 5) comp3 = 3;
    else if (horasReales < 6) comp3 = 2;
    else if (horasReales < 7) comp3 = 1;
    else comp3 = 0;

    let horasEnCama = 0;
    if (datos.hora_acostarse && datos.hora_levantarse) {
        const hA = new Date(`2000-01-01T${datos.hora_acostarse}`);
        const hL = new Date(`2000-01-01T${datos.hora_levantarse}`);
        
        if (hL <= hA) {
            hL.setDate(hL.getDate() + 1);
        }
        
        const diffMs = hL.getTime() - hA.getTime();
        horasEnCama = diffMs / (1000 * 60 * 60);
    }

    let eficiencia = 100;
    if (horasEnCama > 0) {
        eficiencia = (horasReales / horasEnCama) * 100;
    }

    let comp4 = 0;
    if (eficiencia < 65) comp4 = 3;
    else if (eficiencia < 75) comp4 = 2;
    else if (eficiencia < 85) comp4 = 1;
    else comp4 = 0;

    let sumaC5 = 0;
    for (let i = 2; i <= 9; i++) {
        sumaC5 += val(`alteracion_${i}`);
    }
    sumaC5 += val('frecuencia_otra_alteracion');

    let comp5 = 0;
    if (sumaC5 >= 19) comp5 = 3;
    else if (sumaC5 >= 10) comp5 = 2;
    else if (sumaC5 >= 1) comp5 = 1;

    const comp6 = val('tomo_medicinas');

    const sumaC7 = val('dificultad_despierto') + val('problema_entusiasmo');
    let comp7 = 0;
    if (sumaC7 >= 5) comp7 = 3;
    else if (sumaC7 >= 3) comp7 = 2;
    else if (sumaC7 >= 1) comp7 = 1;

    const totalScore = comp1 + comp2 + comp3 + comp4 + comp5 + comp6 + comp7;

    return {
        puntaje: totalScore,
        extraData: {
            "C1 Calidad": `${comp1}`,
            "C2 Latencia": `${comp2}`,
            "C3 Duración": `${comp3} (${horasReales}h reales)`,
            "C4 Eficiencia": `${comp4} (${eficiencia.toFixed(0)}% - en cama: ${horasEnCama.toFixed(1)}h)`,
            "C5 Perturbaciones": `${comp5}`,
            "C6 Medicación": `${comp6}`,
            "C7 Disfunción": `${comp7}`,
            "Dato Usado": horasEstudio > 0 ? "Estudio Médico" : "Reporte Paciente"
        }
    };
};