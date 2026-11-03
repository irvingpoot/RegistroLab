/**
 * @file utils/client/farmacos-registro.ts
 * @description Interacciones de "Tratamiento Farmacológico" en el formulario de registro:
 *  - checkboxes de frecuencia (Mañana/Tarde/Noche) → llenan el hidden `farmacos_frecuencias`
 *    con los valores separados por ", " (mismo formato que ya guarda el registro de ánimo)
 *  - [data-farmaco-agregar] clona la fila de <template data-farmaco-plantilla> en #lista-farmacos
 *    (y retira el mensaje [data-farmacos-vacio], si existe)
 *  - [data-farmaco-quitar] elimina su fila (.item-farmaco)
 * Usa delegación de eventos, así las filas nuevas funcionan sin configurarlas una por una.
 */

document.addEventListener("change", (e) => {
    const checkbox = (e.target as HTMLElement | null)?.closest<HTMLInputElement>(".chk-freq");
    if (!checkbox) return;

    const fila = checkbox.closest<HTMLElement>(".item-farmaco");
    const oculto = fila?.querySelector<HTMLInputElement>(".input-frecuencia-real");
    if (!fila || !oculto) return;

    oculto.value = Array.from(fila.querySelectorAll<HTMLInputElement>(".chk-freq"))
        .filter((c) => c.checked)
        .map((c) => c.value)
        .join(", ");
});

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.closest("[data-farmaco-quitar]")) {
        target.closest(".item-farmaco")?.remove();
        return;
    }

    if (target.closest("[data-farmaco-agregar]")) {
        const lista = document.getElementById("lista-farmacos");
        const plantilla = document.querySelector<HTMLTemplateElement>("template[data-farmaco-plantilla]");
        const modelo = plantilla?.content.firstElementChild;
        if (!lista || !modelo) return;

        lista.querySelector("[data-farmacos-vacio]")?.remove();

        const fila = modelo.cloneNode(true) as HTMLElement;
        fila.classList.add("animate-fade-in");
        lista.appendChild(fila);
    }
});