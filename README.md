# RegistroLab

RegistroLab es una aplicación web construida con [Astro](https://astro.build/), [TailwindCSS](https://tailwindcss.com/) y [Clerk](https://clerk.com/) para gestionar autenticación y registros de usuarios.  
El proyecto está configurado para ejecutarse con **pnpm**.

---

## 🚀 Tecnologías utilizadas
- [Astro](https://astro.build/) - Framework de frontend
- [TailwindCSS](https://tailwindcss.com/) - Estilos utilitarios
- [Clerk](https://clerk.com/) - Autenticación y gestión de usuarios
- [Node.js](https://nodejs.org/) - Entorno de ejecución

---

## 📦 Instalación

1. Clonar el repositorio:
    ```sh
    git clone <url-del-repo>
    cd RegistroLab
    ```
2. Instalar dependencias con pnpm:
    ```sh
    pnpm install
    ```
3. Crear el archivo .env con las variables necesarias de Clerk:
    ```sh
    PUBLIC_CLERK_PUBLISHABLE_KEY=tu_publishable_key
    CLERK_SECRET_KEY=tu_secret_key
    ```

---

## 🛠️ Scripts disponibles
- En el package.json se definen los siguientes comandos:

- pnpm dev → Inicia el servidor de desarrollo

- pnpm build → Compila la aplicación para producción

- pnpm preview → Vista previa de la compilación

- pnpm astro → Comando directo para correr scripts de Astro

---

## 📂 Estructura del proyecto
```sh
/
├── public/          # Archivos estáticos
├── src/
│   ├── assets/      # Recursos (imágenes, íconos, etc.)
│   ├── components/  # Componentes Astro
│   ├── layouts/     # Plantillas de diseño
│   └── pages/       # Páginas del sitio
├── .env             # Variables de entorno
├── package.json
├── astro.config.mjs
├── tailwind.config.js
└── tsconfig.json
```
