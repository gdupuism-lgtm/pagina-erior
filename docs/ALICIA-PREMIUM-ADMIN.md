# Alicia Premium — Panel Admin

## Qué se creó

| Archivo | Para qué |
|---------|----------|
| `supabase/alicia-premium.sql` | Tablas de códigos y activaciones |
| `netlify/functions/premium-validate.js` | Cliente activa su código |
| `netlify/functions/premium-admin.js` | Panel: crear / listar / desactivar |
| `admin-alicia.html` | Tu panel visual |

## Pasos que debes hacer (en orden)

### 1. Supabase — crear tablas

1. Entra a [supabase.com](https://supabase.com) → proyecto **moamgixswoykfamysavs**
2. **SQL Editor** → New query
3. Pega y ejecuta todo el contenido de `supabase/alicia-premium.sql`
4. Verifica en **Table Editor** que existan `alicia_premium_codes` y `alicia_premium_activations`

### 2. Netlify — variables de entorno

En **Site settings → Environment variables** agrega:

| Variable | Valor | Notas |
|----------|-------|-------|
| `SUPABASE_URL` | `https://moamgixswoykfamysavs.supabase.co` | Ya la tienes en el front |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave **service_role** de Supabase | ⚠️ **Nunca** en el HTML. Solo Netlify |
| `ALICIA_ADMIN_PASSWORD` | Una clave larga que solo tú sepas | Para entrar al panel admin |

**Dónde sacar service_role:** Supabase → Project Settings → API → `service_role` (secret).

### 3. Deploy

Sube a Netlify:

- `index.html`
- `admin-alicia.html`
- `netlify/functions/premium-lib.js`
- `netlify/functions/premium-validate.js`
- `netlify/functions/premium-admin.js`
- `netlify/functions/claude.js` (ahora verifica Premium en servidor)

### 4. Usar el panel

Abre: **https://eriorcenter.netlify.app/admin-alicia.html**

1. Ingresa tu `ALICIA_ADMIN_PASSWORD`
2. Crea un código por cliente (nombre, WhatsApp, notas)
3. Copia el código (formato `ERIOR-XXXX-XXXX`) y envíaselo por WhatsApp
4. El cliente lo pega en Alicia Premium → **Activar →**

## Flujo del cliente

1. Compra Alicia Premium contigo
2. Tú generas código en el panel (1 activación = 1 dispositivo/navegador)
3. Cliente activa en la card dorada de Alicia
4. El código queda registrado en Supabase (cuántas veces se usó, cuándo)

## Seguridad

- Los códigos **no** están en el JavaScript del sitio
- Solo las Netlify Functions (con service_role) leen la base
- Alicia Premium real se confirma en `claude.js` con el `code_id` guardado
- El panel pide tu clave admin en cada sesión

## Tips

- **1 cliente = 1 código** con `max_activaciones = 1` (default)
- Si cambia de celular, genera código nuevo o sube activaciones a 2
- **Desactivar** un código corta el acceso en la próxima validación de chat
- El código legacy `ERIOR2024` sigue funcionando si ejecutaste el SQL (999 usos)
