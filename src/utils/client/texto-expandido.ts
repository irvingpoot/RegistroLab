/**
 * @file utils/client/texto-expandido.ts
 * @description Abre el modal de lectura (`#modal-texto-expandido`) con el texto de otro elemento.
 *
 *   <button data-texto-expandir="id-del-elemento" data-titulo="Título del modal">
 *
 * Copia el contenido con `textContent` (nunca `innerHTML`), así que el texto se muestra tal cual
 * y no puede ejecutar HTML. Los saltos de línea se conservan con `whitespace-pre-wrap` en el modal.
 */

document.addEventListener("click", (e) => {
    const boton = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-texto-expandir]");
    if (!boton) return;

    const origen = document.getElementById(boton.dataset.textoExpandir ?? "");
    const modal = document.getElementById("modal-texto-expandido") as HTMLDialogElement | null;
    const titulo = document.getElementById("texto-expandido-titulo");
    const contenido = document.getElementById("texto-expandido-contenido");
    if (!origen || !modal || !titulo || !contenido) return;

    titulo.textContent = boton.dataset.titulo ?? "";
    contenido.textContent = origen.textContent?.trim() ?? "";

    contenido.parentElement?.scrollTo({ top: 0 });
    modal.showModal();
});