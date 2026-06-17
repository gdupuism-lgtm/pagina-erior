/**
 * Extrae imágenes base64 del catálogo en index.html → img/catalog/
 * Uso: node scripts/extract-catalog-images.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'index.html');
const OUT_DIR = path.join(ROOT, 'img', 'catalog');

function slugify(nombre) {
  return String(nombre || 'audio')
    .replace(/^[\s\p{Extended_Pictographic}\u2600-\u27BF]+/gu, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'audio';
}

function main() {
  const before = fs.statSync(HTML_PATH).size;
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const lines = fs.readFileSync(HTML_PATH, 'utf8').split('\n');
  const used = new Map();
  let n = 0;

  const out = lines.map((line) => {
    const imgMatch = line.match(/img:"data:image\/jpeg;base64,([^"]+)"/);
    if (!imgMatch) return line;

    const nameMatch = line.match(/nombre:"([^"]+)"/);
    const nombre = nameMatch ? nameMatch[1] : `audio-${n + 1}`;
    let slug = slugify(nombre);
    if (used.has(slug)) {
      used.set(slug, used.get(slug) + 1);
      slug = `${slug}-${used.get(slug)}`;
    } else {
      used.set(slug, 1);
    }

    const filename = `${slug}.jpg`;
    fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(imgMatch[1], 'base64'));
    n += 1;
    return line.replace(
      /img:"data:image\/jpeg;base64,[^"]+"/,
      `img:"img/catalog/${filename}"`
    );
  });

  fs.writeFileSync(HTML_PATH, out.join('\n'), 'utf8');
  const after = fs.statSync(HTML_PATH).size;
  console.log(`Extracted ${n} images to img/catalog/`);
  console.log(
    `index.html: ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`
  );
}

main();
