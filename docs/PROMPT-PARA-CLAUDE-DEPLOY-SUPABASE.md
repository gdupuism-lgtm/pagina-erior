# Copia y pega esto en Claude (chat nuevo)

Usa este prompt tal cual. Claude te guiará paso a paso. Responde en español y espera confirmación antes de cada paso.

---

```
Soy Pauline de Erior Center. Necesito que me guíes PASO A PASO (uno a la vez, esperando mi "listo" antes del siguiente) para:

1) Configurar Supabase para Alicia Premium (códigos de acceso)
2) Conectar Git + GitHub + Netlify para deploy automático de eriorcenter.netlify.app

CONTEXTO DE MI PROYECTO:
- Sitio: ERIOR CENTER en Netlify → https://eriorcenter.netlify.app
- Carpeta local: C:\Users\HUAWEI\Downloads
- Supabase proyecto: moamgixswoykfamysavs
- URL Supabase: https://moamgixswoykfamysavs.supabase.co
- Git instalado en: C:\Program Files\Git\bin\git.exe (puede que no esté en PATH)
- Ya existen en el proyecto:
  - index.html (sitio principal + Alicia IA)
  - admin-alicia.html (panel admin códigos Premium)
  - netlify/functions/claude.js (Alicia chat)
  - netlify/functions/premium-validate.js (activar código cliente)
  - netlify/functions/premium-admin.js (API panel admin)
  - netlify/functions/premium-lib.js
  - supabase/alicia-premium.sql (SQL para crear tablas)
- En index.html ya hay Supabase anon key para eventos/prospectos (NO es la service_role)

LO QUE QUIERO LOGRAR:
A) Ejecutar el SQL en Supabase para tablas alicia_premium_codes y alicia_premium_activations
B) Agregar en Netlify estas variables de entorno:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY (secreta, solo Netlify)
   - ALICIA_ADMIN_PASSWORD (mi clave para admin-alicia.html)
   - ANTHROPIC_API_KEY (ya debería existir)
C) Subir el sitio con Git → GitHub → Netlify auto-deploy
D) Probar: admin-alicia.html → crear código → cliente activa en Alicia Premium

REGLAS PARA TI (Claude):
- Un solo paso por mensaje
- Dime exactamente dónde hacer clic (Supabase / Netlify / GitHub)
- Si un paso requiere copiar algo, dime QUÉ copiar y DÓNDE pegarlo
- Nunca me pidas pegar la service_role key en el HTML ni en GitHub
- Si algo falla, pide el mensaje de error exacto

Empieza por el PASO 1 de Supabase (crear tablas con el SQL).
```

---

# Referencia rápida (para ti, no para Claude)

## Supabase — orden de pasos

| # | Qué hacer | Dónde |
|---|-----------|--------|
| 1 | Login | supabase.com |
| 2 | Abrir proyecto `moamgixswoykfamysavs` | Dashboard |
| 3 | SQL Editor → New query | Menú izquierdo |
| 4 | Pegar contenido de `supabase/alicia-premium.sql` | Editor |
| 5 | Run | Botón verde |
| 6 | Verificar tablas | Table Editor → `alicia_premium_codes` |
| 7 | Copiar **service_role** key | Settings → API → Project API keys → service_role (Reveal) |

## Netlify — variables de entorno

| Variable | Valor |
|----------|--------|
| `SUPABASE_URL` | `https://moamgixswoykfamysavs.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | (la service_role de paso 7) |
| `ALICIA_ADMIN_PASSWORD` | inventa una clave solo tuya |
| `ANTHROPIC_API_KEY` | (ya la tienes si Alicia funciona) |

Ruta: Netlify → tu sitio eriorcenter → **Site configuration** → **Environment variables** → **Add a variable**

Después de agregar variables: **Deploys** → **Trigger deploy** → **Deploy site**

## Git + GitHub + Netlify (primera vez)

| # | Comando / acción |
|---|------------------|
| 1 | Crear repo en github.com → `erior-center` → Private |
| 2 | En PowerShell (cierra y abre terminal nueva después de instalar Git): |
| | `cd C:\Users\HUAWEI\Downloads` |
| | `git init` |
| | `git add index.html admin-alicia.html netlify.toml robots.txt sitemap.xml netlify docs supabase *.glb testimonio1.mp4 ebook-erior.pdf .gitignore` |
| | `git commit -m "Erior Center: Alicia Premium admin + funciones"` |
| | `git branch -M main` |
| | `git remote add origin https://github.com/TU-USUARIO/erior-center.git` |
| | `git push -u origin main` |
| 3 | Netlify → **Add new site** → **Import from Git** → GitHub → repo → Build: publish `.`, functions `netlify/functions` |

## Probar que todo funciona

1. https://eriorcenter.netlify.app/admin-alicia.html → login con ALICIA_ADMIN_PASSWORD
2. Generar código para un cliente de prueba
3. https://eriorcenter.netlify.app → Alicia → Premium → pegar código → Activar
4. Chat debe responder en modo Premium
