/**
 * @file utils/client/clipboard.ts
 * @description Copiar al portapapeles el contenido de un input/textarea.
 */

export async function copiarDesdeCampo(campo: HTMLInputElement | HTMLTextAreaElement): Promise<boolean> {
    campo.select();
    try {
        await navigator.clipboard.writeText(campo.value);
        return true;
    } catch {
        try {
            return document.execCommand("copy");
        } catch {
            return false;
        }
    }
}
