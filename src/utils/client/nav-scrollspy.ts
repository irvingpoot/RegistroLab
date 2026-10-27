/**
 * @file utils/client/nav-scrollspy.ts
 * @description Nav del expediente: resalta el link de la sección visible (scroll-spy),
 * scroll suave al hacer clic y modo "flotante" cuando se baja de la cabecera.
 *
 * Requiere: <nav id="dynamic-nav" data-root-margin="…">, <div id="nav-sentinel">,
 * enlaces `.nav-link[href="#id"]` y secciones `<section id="id">`.
 */

export function initNavScrollSpy(): void {
    const nav = document.getElementById("dynamic-nav");
    if (!nav) return;

    const sentinel = document.getElementById("nav-sentinel");
    const navLinks = document.querySelectorAll<HTMLAnchorElement>(".nav-link");
    const sections = document.querySelectorAll<HTMLElement>("section[id]");
    const rootMargin = nav.dataset.rootMargin ?? "-40% 0px -60% 0px";

    const activateLink = (id: string) => {
        navLinks.forEach((link) => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${id}`) {
                link.classList.add("active");
                link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
        });
    };

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const targetId = link.getAttribute("href")?.substring(1);
            const targetSection = targetId ? document.getElementById(targetId) : null;

            if (targetId && targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
                history.pushState(null, "", `#${targetId}`);
                activateLink(targetId);
            }
        });
    });

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) activateLink(entry.target.id);
            });
        },
        { root: null, rootMargin, threshold: 0 },
    );
    sections.forEach((section) => sectionObserver.observe(section));

    if (sentinel) {
        const floatingObserver = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) nav.setAttribute("data-state", "floating");
                else nav.removeAttribute("data-state");
            },
            { root: null, threshold: 0, rootMargin: "50px 0px 0px 0px" },
        );
        floatingObserver.observe(sentinel);
    }
}
