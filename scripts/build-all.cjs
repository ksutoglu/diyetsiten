// scripts/build-all.cjs
const { execSync } = require('child_process');
const { existsSync, rmSync, mkdirSync, cpSync } = require('fs');
const path = require('path');

// DİZİNLERİ BURADA TANIMLIYORUZ:
const ROOT = process.cwd();
const ASTRO_DIR  = process.env.ASTRO_DIR  || ROOT;                           // Astro kökteyse böyle kalsın
const STUDIO_DIR = process.env.STUDIO_DIR || path.join(ROOT, 'diyetsiten', 'diyetsiten'); // Sanity burada

// ÇIKTILAR:
const ASTRO_OUT   = path.join(ASTRO_DIR, 'dist');        // Astro build çıkışı
const STUDIO_TMP  = path.join(ROOT, '.studio-build');    // Geçici Studio çıkışı
const PUBLISH_OUT = path.join(ROOT, 'dist');             // Netlify publish klasörü (KÖK/dist)
const STUDIO_TARGET = path.join(PUBLISH_OUT, 'studio');  // dist/studio

function run(cmd, cwd = ROOT) {
  execSync(cmd, { stdio: 'inherit', cwd });
}

try {
  // 1) Astro bağımlılıkları (kök)
  if (existsSync(path.join(ASTRO_DIR, 'package.json'))) {
    run('npm ci', ASTRO_DIR);
  }

  // 2) Sanity bağımlılıkları (alt klasör)
  if (existsSync(path.join(STUDIO_DIR, 'package.json'))) {
    run('npm ci', STUDIO_DIR);
  } else {
    throw new Error(`Sanity klasörü bulunamadı: ${STUDIO_DIR}`);
  }

  // 3) Astro'yu derle
  if (existsSync(ASTRO_OUT)) rmSync(ASTRO_OUT, { recursive: true, force: true });
  run('npm run build:astro', ASTRO_DIR);

  // 4) Sanity Studio'yu /studio basePath ile derle (geçici klasöre)
  if (existsSync(STUDIO_TMP)) rmSync(STUDIO_TMP, { recursive: true, force: true });
  run(`npx sanity@latest build --output "${STUDIO_TMP}"`, STUDIO_DIR);

  // 5) KÖK/dist'i publish klasörü olarak kullan (Astro kökte değilse bile kopyalarız)
  if (PUBLISH_OUT !== ASTRO_OUT) {
    // Astro çıktısını köke taşı
    if (existsSync(PUBLISH_OUT)) rmSync(PUBLISH_OUT, { recursive: true, force: true });
    mkdirSync(PUBLISH_OUT, { recursive: true });
    cpSync(ASTRO_OUT, PUBLISH_OUT, { recursive: true });
  }

  // 6) Studio'yu dist/studio altına kopyala
  mkdirSync(STUDIO_TARGET, { recursive: true });
  cpSync(STUDIO_TMP, STUDIO_TARGET, { recursive: true });

  console.log('✅ Tek site hazır: dist/ ve dist/studio/');
} catch (e) {
  console.error(e);
  process.exit(1);
}
