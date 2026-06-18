# X Scraper

Web scraper para extraer posts y comentarios de X (Twitter) por hashtag. Autentica en la plataforma, busca posts específicos y extrae información detallada incluyendo métricas y hasta 5 comentarios por post.

## Características

- ✅ Autenticación automática en X.com
- ✅ Búsqueda de posts por hashtag
- ✅ Extracción de datos del post: autor, fecha, texto, métricas (likes, replies, retweets, bookmarks, views)
- ✅ Extracción de 3-5 comentarios por post con información completa
- ✅ Manejo inteligente de navegación: preserva resultados de búsqueda

## Requisitos

- Node.js 18+
- npm o yarn
- Credenciales de X (email y contraseña)

## Instalación

```bash
git clone https://github.com/DevKendrySoto/x-scraper.git
cd x-scraper
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto con tus credenciales:

```env
X_EMAIL=tu_email@example.com
X_PASSWORD=tu_contraseña
HASHTAG=codeable
```

**Variables requeridas:**
- `X_EMAIL` - Email de tu cuenta en X.com
- `X_PASSWORD` - Contraseña de tu cuenta en X.com
- `HASHTAG` - (Opcional) Hashtag por defecto si no pasas uno en el comando

## Uso

### Con hashtag en el comando (recomendado)

```bash
npx ts-node index.ts codeable
```

O con el símbolo `#`:

```bash
npx ts-node index.ts "#codeable"
```

### Con hashtag en el `.env`

Si defines `HASHTAG` en tu archivo `.env`, puedes ejecutar sin argumentos:

```bash
npx ts-node index.ts
```

## Salida

El scraper extrae para cada post:

```
Tweet 1
  author: @username
  date:   2024-06-17T10:30:00.000Z
  text:   Contenido del tweet...
  Metrics:
    likes:     1.2K
    replies:   45
    retweets:  89
    bookmarks: 12
    views:     15K
  Comments (3):
    Comment 1
      author: @reply_user
      date:   2024-06-17T11:00:00.000Z
      text:   Respuesta al tweet...
      likes:  5 | replies: 2 | retweets: 1
    Comment 2
      ...
```

## Limitaciones

- Máximo 5 posts principales
- Máximo 5 comentarios por post
- X puede requerir verificación de dos factores - la herramienta lo manejará interactivamente
- Los comentarios se cargan bajo demanda; posts con pocas respuestas mostrarán menos de 5 comentarios

## Estructura del Código

- `index.ts` - Script principal con lógica de autenticación, búsqueda y scraping
- `package.json` - Dependencias del proyecto
- `tsconfig.json` - Configuración de TypeScript

## Dependencias

- `@ulixee/hero-playground` - Navegador headless con soporte para JavaScript complejo
- `dotenv` - Manejo de variables de entorno

## Notas de Desarrollo

Los archivos `*-debug.ts` en el repositorio son scripts de prueba utilizados durante el desarrollo. Puedes ignorarlos o eliminarlos.

## Licencia

ISC

## Autor

DevKendrySoto
