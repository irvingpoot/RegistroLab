/**
 * @file utils/client/tms-form.ts
 * @description Interacciones de TMS:
 *  1. Formulario de sesión: alterna frecuencia simple / bilateral según el sitio de estimulación
 *     (#select-sitio, #freq-simple, #freq-bilateral) y deshabilita los selects ocultos para que
 *     no viajen en el POST.
 *  2. Inputs con `data-autosubmit`: envían su formulario al elegir archivo (subir consentimiento).
 */

const selectSitio = document.getElementById("select-sitio") as HTMLSelectElement | null;
const freqSimple = document.getElementById("freq-simple");
const freqBilateral = document.getElementById("freq-bilateral");

if (selectSitio && freqSimple && freqBilateral) {
    const setDisabled = (el: HTMLElement, disabled: boolean) =>
        el.querySelectorAll("select").forEach((s) => (s.disabled = disabled));

    const toggle = () => {
        const esBilateral = selectSitio.value === "Bilateral";

        if (esBilateral) {
            freqSimple.classList.replace("block", "hidden");
            setDisabled(freqSimple, true);

            freqBilateral.classList.replace("hidden", "grid");
            setDisabled(freqBilateral, false);
        } else {
            freqBilateral.classList.replace("grid", "hidden");
            setDisabled(freqBilateral, true);

            freqSimple.classList.replace("hidden", "block");
            setDisabled(freqSimple, false);
        }
    };

    selectSitio.addEventListener("change", toggle);
    toggle();
}

document.querySelectorAll<HTMLInputElement>("[data-autosubmit]").forEach((input) => {
    input.addEventListener("change", () => input.form?.requestSubmit());
});
