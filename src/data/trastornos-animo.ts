/**
 * @file data/trastornos-animo.ts
 * @description Catálogo de trastornos del ánimo agrupados por categoría. Los valores deben
 * coincidir con los que guarda el formulario de registro en `pacientes.trastornos_animo`;
 * lo que no esté aquí se muestra como "Otros / Sin clasificar".
 */

export const GROUPS_TRASTORNOS = [
    {
        categoria: "Ansiedad, TOC y Trauma",
        opciones: [
            "Ansiedad generalizada",
            "Ansiedad inducida por sustancia o medicamento",
            "Ansiedad debida a afección médica",
            "Ansiedad por enfermedad",
            "TOC",
            "Dismórfico corporal",
            "TEPT"
        ]
    },
    {
        categoria: "Espectro Esquizofrénico y Psicótico",
        opciones: [
            "Esquizofreniforme",
            "Esquizoafectivo",
            "Esquizofrenia (Paranoide, catatónica, desorganizada, indiferenciada, simple)",
            "Psicótico breve",
            "Delirante (Erotomaníaco, celotípico, grandeza, mixto, persecutorio, somático, no especificado)",
        ]
    },
    {
        categoria: "Bipolar y Depresivos",
        opciones: [
            "Bipolar I (Predominan episodios maníacos)",
            "Bipolar II (Predominan episodios depresivos)",
            "Ciclotímico: Cíclico, tiempo especifico",
            "Depresión mayor",
            "Distimia",
            "Disfórico premenstrual"
        ]
    },
    {
        categoria: "Conducta Alimentaria y Sustancias",
        opciones: [
            "Anorexia",
            "Bulimia",
            "Atracones",
            "Consumo de sustancias"
        ]
    }
];
