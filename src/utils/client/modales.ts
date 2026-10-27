/**
 * @file utils/client/modales.ts
 * @description Abrir/cerrar <dialog> con delegación de eventos (reemplaza los `onclick` inline).
 *
 *   <button data-abrir-modal="modal-puntajes">…</button>   → abre el <dialog id="modal-puntajes">
 *   <button data-cerrar-modal>…</button>                    → cierra el <dialog> que lo contiene
 *   <button data-cerrar-modal="modal-x">…</button>          → cierra el <dialog id="modal-x">
 *
 * Lo carga `ModalDialog.astro`; basta con que haya un modal en la página.
 */

const getDialog = (id: string | undefined) =>
    id ? (document.getElementById(id) as HTMLDialogElement | null) : null;

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const abrir = target.closest<HTMLElement>("[data-abrir-modal]");
    if (abrir) {
        getDialog(abrir.dataset.abrirModal)?.showModal();
        return;
    }

    const cerrar = target.closest<HTMLElement>("[data-cerrar-modal]");
    if (cerrar) {
        const dialog = cerrar.dataset.cerrarModal
            ? getDialog(cerrar.dataset.cerrarModal)
            : cerrar.closest("dialog");
        dialog?.close();
    }
});
