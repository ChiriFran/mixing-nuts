# Usar Titan One (self-hosted) en todos los títulos del sitio

## Objetivo
Reemplazar la fuente de títulos por Titan One usando la versión descargada
en `public/fonts/TitanOne-Regular.ttf` (ya está en el repo), aplicada a todos
los títulos del sitio y al nombre del logo del header.

## Cambios

### 1. `src/styles/globals.css`
- Quitar `&family=Titan+One` del `@import` de Google Fonts (queda solo Quicksand).
- Agregar `@font-face` self-hosted:
  ```css
  @font-face {
    font-family: 'Titan One';
    src: url('/fonts/TitanOne-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  ```
- Normalizar para evitar negrita sintética (Titan One tiene un único peso 400):
  ```css
  h1, h2, h3, h4, h5, h6,
  [class*="__title"],
  [class$="-title"],
  [class*=" section-title"],
  [class^="section-title"] {
    font-weight: 400 !important;
    letter-spacing: normal !important;
  }
  ```

### 2. `src/styles/variables.css`
- `--font-heading: 'Titan One', 'Spire', 'Georgia', serif;`
  (afecta a TODOS los títulos del sitio que ya usan `var(--font-heading)`)
- `--font-display: 'Titan One', 'Spire', 'Georgia', serif;` (el hero queda igual)

### 3. `src/components/layout/Header.css`
- `.header__logo-mixing` y `.header__logo-nuts`:
  - `font-weight: 900` -> `400`
  - `letter-spacing: -0.05em` -> `normal`

## Resultado esperado
- Todos los títulos (Home, Productos, Detalle, Carrito, Checkout, OrderSuccess,
  About, Admin, Footer, Featured) y logo del header en Titan One.
- El hero conserva el look ya aprobado (peso 400, letter-spacing normal).
- Efecto secundario: los links del menú móvil del header (`.header__mobile-link`)
  también usan `var(--font-heading`) y quedan en Titan One.

## Verificación
- Servidor dev: revisar http://localhost:5173 y las demás páginas.
- Titulares no deben verse con negrita sintética ni letras pegadas.