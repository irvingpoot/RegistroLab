// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import clerk from "@clerk/astro";
import tailwindcss from '@tailwindcss/vite';
import { dark } from '@clerk/themes';
import { esMX } from '@clerk/localizations'

// https://astro.build/config
export default defineConfig({
  integrations: [clerk({
    appearance: { 
        baseTheme: [dark],
        signIn: { variables: { colorBackground: "gray-950" } },
      },
    signInForceRedirectUrl: "/lista",
    localization: esMX}
  )],
  vite: {
    plugins: [tailwindcss()]
  },
  adapter: node({ mode: "standalone" }),
  output: "server",
});