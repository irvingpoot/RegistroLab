/**
 * @file selector-servicio.ts
 * @description Llena y enlaza los selectores de "Servicio" y "Precio" de los formularios de cita.
 *
 * El catálogo viene de obtenerCatalogo() (copia local en el navegador, o el CDN de Vercel).
 * El formulario solo envía servicio_id y precio_id: el monto lo vuelve a consultar el servidor.
 *
 * Solo para código que corre en el navegador.
 */

import { obtenerCatalogo, type PrecioCatalogo, type ServicioCatalogo } from "./catalogo-servicios";

export interface OpcionesSelectorServicio {
    servicio: HTMLSelectElement;
    precio: HTMLSelectElement;
    aviso?: HTMLElement | null;
    asterisco?: HTMLElement | null;
    obligatorio?: boolean;
    textoVacio: string;
    forzarRecarga?: boolean;
}

const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

function textoPrecio(p: PrecioCatalogo): string {
    return `${p.etiqueta} · ${p.monto === 0 ? "Sin costo" : moneda.format(p.monto)}`;
}

function opcion(valor: string, texto: string, estado: { disabled?: boolean; selected?: boolean } = {}) {
    const op = document.createElement("option");
    op.value = valor;
    op.textContent = texto;
    op.className = "bg-gray-900";
    op.disabled = !!estado.disabled;
    op.selected = !!estado.selected;
    return op;
}

function avisar(el: HTMLElement | null | undefined, texto: string) {
    if (!el) return;
    el.textContent = texto;
    el.classList.toggle("hidden", !texto);
}

function pintarPrecios(precio: HTMLSelectElement, servicio?: ServicioCatalogo) {
    precio.replaceChildren();

    if (!servicio) {
        precio.append(opcion("", "Elige primero un servicio", { disabled: true, selected: true }));
        precio.disabled = true;
        precio.required = false;
        return;
    }

    precio.disabled = false;
    precio.required = true;

    if (servicio.precios.length === 1) {
        precio.append(opcion(servicio.precios[0].id, textoPrecio(servicio.precios[0]), { selected: true }));
        return;
    }

    precio.append(opcion("", "Selecciona el precio", { disabled: true, selected: true }));
    servicio.precios.forEach((p) => precio.append(opcion(p.id, textoPrecio(p))));
}

function sinCatalogo(o: OpcionesSelectorServicio, etiqueta: string, aviso: string) {
    o.servicio.replaceChildren(opcion("", etiqueta, { disabled: true, selected: true }));
    o.servicio.disabled = true;
    o.servicio.required = false;
    o.asterisco?.classList.add("hidden");
    pintarPrecios(o.precio);
    avisar(o.aviso, aviso);
}

export async function iniciarSelectorServicio(o: OpcionesSelectorServicio): Promise<void> {
    let catalogo: ServicioCatalogo[] = [];

    try {
        catalogo = await obtenerCatalogo({ forzar: o.forzarRecarga });
    } catch {
        sinCatalogo(
            o,
            "Catálogo no disponible",
            "No se pudo cargar el catálogo de servicios. Recarga la página; mientras tanto la cita se guardará sin cambios en el servicio.",
        );
        return;
    }

    if (catalogo.length === 0) {
        sinCatalogo(o, "Sin servicios registrados", "Aún no hay servicios registrados en el catálogo.");
        return;
    }

    const obligatorio = !!o.obligatorio;

    avisar(o.aviso, "");
    o.servicio.disabled = false;
    o.servicio.required = obligatorio;
    o.asterisco?.classList.toggle("hidden", !obligatorio);

    o.servicio.replaceChildren(opcion("", o.textoVacio, { disabled: obligatorio, selected: true }));
    catalogo.forEach((s) => o.servicio.append(opcion(s.id, s.nombre)));
    pintarPrecios(o.precio);

    o.servicio.addEventListener("change", () => {
        pintarPrecios(o.precio, catalogo.find((s) => s.id === o.servicio.value));
    });
}