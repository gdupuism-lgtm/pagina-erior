# Libro MENTAL TECH — Acceso con código único

## Qué quedó armado

| Archivo | Para qué |
|---------|----------|
| `supabase/erior-libro.sql` | Tablas + bucket Storage |
| `netlify/functions/libro-*.js` | Validar código + panel admin |
| `libro/index.html` | Cliente pone código y lee el PDF |
| `admin-libro.html` | Tú generas códigos |

**Tú solo haces 2 cosas en Supabase una vez.** El resto ya está en la web.

---

## Lo que TÚ haces (una sola vez)

### 1) SQL en Supabase
1. Entra a [supabase.com](https://supabase.com) → tu proyecto
2. **SQL Editor** → New query
3. Abre y pega todo: `supabase/erior-libro.sql`
4. Run

### 2) Subir el PDF al Storage
1. Supabase → **Storage**
2. Si no existe, crea bucket **`erior-libro`** → **Private** (no público)
3. Entra al bucket → **Upload file**
4. Sube tu PDF y nómbralo exactamente:  
   **`mental-tech-es.pdf`**  
   (archivo local: `Erior-Center_MENTAL-TECH_ES.pdf`)

### 3) Netlify (si ya tienes Alicia Premium, ya está)
Confirma que existan estas variables (Site settings → Environment):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALICIA_ADMIN_PASSWORD` ← misma clave del panel Alicia

Luego deploy (push a `main`).

---

## Uso diario

### Tú (Pauline)
1. Abre: `https://eriorcenterguiaaudios.netlify.app/admin-libro.html`
2. Entra con tu clave admin
3. Genera 1 código por cliente (`LIBRO-XXXX-XXXX`)
4. Copia / mándalo por WhatsApp

Mensaje sugerido:
```
Tu acceso al libro MENTAL TECH 📖
Código: LIBRO-XXXX-XXXX
Ábrelo aquí (no lo compartas): https://eriorcenterguiaaudios.netlify.app/libro/
```

### Cliente
1. Entra a `/libro/`
2. Pega el código
3. Lee el libro

El código se **pega a su dispositivo** (1 activación por defecto).  
Si lo comparte y otra persona lo usa primero, a la segunda persona no le abre (o viceversa).

En el admin puedes:
- **Desactivar** un código
- **Reset uso** (liberarlo si cambió de celular)

---

## Cómo funciona (simple)
- El PDF **no** se publica suelto en la web
- Vive en Storage privado de Supabase
- Solo con código válido el servidor genera un **link temporal** (~2 horas)
- Al recargar, el mismo dispositivo vuelve a pedir link (con el mismo código)

---

## Si algo falla

| Error | Qué hacer |
|-------|-----------|
| “¿Ejecutaste erior-libro.sql?” | Corre el SQL |
| “No se pudo firmar el PDF” | Revisa que el archivo se llame `mental-tech-es.pdf` en bucket `erior-libro` |
| “No autorizado” en admin | Misma `ALICIA_ADMIN_PASSWORD` que Alicia |
| Código ya usado | Reset uso en admin o crea código nuevo |
