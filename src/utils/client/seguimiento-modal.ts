/**
 * @file utils/client/seguimiento-modal.ts
 * @description Modal de seguimiento: agregar nota, editar nota y confirmar borrado.
 *
 * Disparadores (delegación de eventos):
 *   [data-seguimiento-nuevo]                              → abre el modal vacío (agregar)
 *   [data-seguimiento-editar][data-id][data-fecha][data-texto] → abre el modal con la nota (editar)
 *   [data-seguimiento-borrar][data-id]                    → abre la confirmación de borrado
 */

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

const hoyLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
};

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const modal = byId<HTMLDialogElement>("modal-seguimiento");
    const inputAction = byId<HTMLInputElement>("seguimiento-action");
    const inputId = byId<HTMLInputElement>("seguimiento-id");
    const inputFecha = byId<HTMLInputElement>("seguimiento-fecha");
    const inputTexto = byId<HTMLTextAreaElement>("seguimiento-texto");
    const titulo = byId("modal-seguimiento-titulo");

    if (target.closest("[data-seguimiento-nuevo]") && modal) {
        modal.querySelector("form")?.reset();
        if (inputAction) inputAction.value = "add_seguimiento";
        if (inputId) inputId.value = "";
        if (inputFecha) inputFecha.value = hoyLocal();
        if (titulo) titulo.textContent = "Agregar Nota";
        modal.showModal();
        return;
    }

    const editar = target.closest<HTMLElement>("[data-seguimiento-editar]");
    if (editar && modal && editar.dataset.id) {
        if (inputAction) inputAction.value = "edit_seguimiento";
        if (inputId) inputId.value = editar.dataset.id;
        if (inputFecha) inputFecha.value = editar.dataset.fecha ?? "";
        if (inputTexto) inputTexto.value = editar.dataset.texto ?? "";
        if (titulo) titulo.textContent = "Editar Nota";
        modal.showModal();
        return;
    }

    const borrar = target.closest<HTMLElement>("[data-seguimiento-borrar]");
    const modalBorrar = byId<HTMLDialogElement>("modal-eliminar-observacion");
    const inputIdBorrar = byId<HTMLInputElement>("input-id-borrar-observacion");
    if (borrar && modalBorrar && inputIdBorrar && borrar.dataset.id) {
        inputIdBorrar.value = borrar.dataset.id;
        modalBorrar.showModal();
    }
});
