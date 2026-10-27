/**
 * @file utils/client/puntajes-extras.ts
 * @description Filas dinámicas de "Puntajes Extra" en el modal de puntajes.
 *
 * Estructura esperada:
 *   <div data-extras>
 *     <div data-extras-contenedor> …filas `.extra-row`… </div>
 *     <template data-extra-plantilla> …fila vacía… </template>
 *     <button data-extra-agregar>
 *   </div>
 *   y en cada fila un botón [data-extra-quitar].
 */

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const quitar = target.closest("[data-extra-quitar]");
    if (quitar) {
        quitar.closest(".extra-row")?.remove();
        return;
    }

    const agregar = target.closest<HTMLElement>("[data-extra-agregar]");
    if (agregar) {
        const raiz = agregar.closest("[data-extras]");
        const contenedor = raiz?.querySelector("[data-extras-contenedor]");
        const plantilla = raiz?.querySelector<HTMLTemplateElement>("template[data-extra-plantilla]");
        if (contenedor && plantilla) contenedor.appendChild(plantilla.content.cloneNode(true));
    }
});
