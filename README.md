<div align="center">

<img src="https://astro.build/assets/press/astro-icon-light.png" width="80" alt="RegistroLab Logo" />

# 🧪 RegistroLab

**Gestión moderna de pacientes y registros de laboratorio**

[![Astro](https://img.shields.io/badge/Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

[![Deploy](https://img.shields.io/badge/▲_Vercel-Live-black?style=flat-square&logo=vercel)](https://pacientes-lab.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[🐛 Reportar bug](https://github.com/irvingpoot/RegistroLab/issues) · [💡 Solicitar feature](https://github.com/irvingpoot/RegistroLab/issues)

</div>

---

## 📖 Descripción

**RegistroLab** es una aplicación web para la **gestión de pacientes y registros de laboratorio**, construida con un stack moderno centrado en rendimiento y experiencia de usuario. Ofrece autenticación segura mediante Clerk, una interfaz adaptable con TailwindCSS y un despliegue optimizado gracias a Astro.

> Ideal como base sólida para proyectos que requieran autenticación, diseño responsive y despliegue eficiente en la nube.

---

## ✨ Características

- 🔐 **Autenticación segura** con Clerk (login, registro, gestión de sesiones)
- 🎨 **UI moderna y responsiva** usando TailwindCSS
- ⚡ **Rendimiento óptimo** gracias a la arquitectura de islas de Astro
- 🗂️ **Gestión de registros** de pacientes de laboratorio
- 🌍 **Desplegado en Vercel** con integración continua

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| [Astro](https://astro.build/) | Framework principal de frontend |
| [TailwindCSS](https://tailwindcss.com/) | Estilos utilitarios y diseño |
| [Clerk](https://clerk.com/) | Autenticación y gestión de usuarios |
| [Supabase](https://supabase.com/) | Base de datos y backend (PostgreSQL) |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático |
| [pnpm](https://pnpm.io/) | Gestor de paquetes |

---

## 🚀 Inicio rápido

### Prerrequisitos

- **Node.js** `>= 18`
- **pnpm** instalado globalmente

```bash
npm install -g pnpm
```

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/irvingpoot/RegistroLab.git
cd RegistroLab

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes claves (obtenidas desde el [dashboard de Clerk](https://dashboard.clerk.com/)):

```env
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Ejecutar en desarrollo

```bash
pnpm dev
```

Abre [http://localhost:4321](http://localhost:4321) en tu navegador 🎉

---

## 📜 Scripts disponibles

```bash
pnpm dev        # Servidor de desarrollo con hot-reload
pnpm build      # Compilación optimizada para producción
pnpm preview    # Vista previa del build de producción
pnpm astro      # CLI de Astro para tareas adicionales
```

---

## 📂 Estructura del proyecto

```
RegistroLab/
├── public/                 # Archivos estáticos (favicon, imágenes públicas)
├── src/
│   ├── assets/             # Recursos (imágenes, íconos, fuentes)
│   ├── components/         # Componentes reutilizables de UI
│   ├── layouts/            # Plantillas base de las páginas
│   └── pages/              # Rutas y páginas del sitio
├── .env                    # Variables de entorno (no commitear)
├── astro.config.mjs        # Configuración de Astro
├── tailwind.config.js      # Configuración de TailwindCSS
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias y scripts
```

---

## 🚢 Despliegue

El proyecto está configurado para desplegarse en **Vercel** de forma automática.

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en el panel de Vercel
3. ¡Listo! Cada push a `main` desplegará automáticamente

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/irvingpoot/RegistroLab)

---

## 🔗 Versiones del proyecto

| Versión | Repositorio | Descripción |
|---|---|---|
| 🖥️ Desktop | [RegistroLab - Desktop](https://github.com/irvingpoot/RegistroLab-Desktop) | App instalable para Windows |
| 🌐 Web | Este repositorio | Desplegada en Vercel |

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas o encuentras algún bug:

1. Haz **fork** del repositorio
2. Crea una rama: `git checkout -b feature/mi-nueva-feature`
3. Commitea tus cambios: `git commit -m 'feat: agrega nueva feature'`
4. Haz push: `git push origin feature/mi-nueva-feature`
5. Abre un **Pull Request**

---

## 👤 Autor

**Irving Poot**

[![GitHub](https://img.shields.io/badge/GitHub-@irvingpoot-181717?style=flat-square&logo=github)](https://github.com/irvingpoot)

---

<div align="center">
  <sub>Hecho con ❤️ usando Astro + TailwindCSS + Clerk + Supabase</sub>
</div>