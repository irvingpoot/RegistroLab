/**
 * @file utils/client/restaurar-scroll.ts
 * @description Conserva la posición de scroll al enviar un formulario (el POST recarga la página).
 * Importar una vez desde la página: <script>import "…/utils/client/restaurar-scroll";</script>
 */

const KEY = "scrollPos";

const guardada = sessionStorage.getItem(KEY);
if (guardada) {
    window.scrollTo({ top: parseInt(guardada), behavior: "instant" });
    sessionStorage.removeItem(KEY);
}

document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", () => {
        sessionStorage.setItem(KEY, window.scrollY.toString());
    });
});
