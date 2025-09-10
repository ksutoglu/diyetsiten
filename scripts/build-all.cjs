// scripts/build-all.cjs
const { execSync } = require('child_process');
const { existsSync, rmSync, mkdirSync, cpSync, readFileSync } = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ASTRO_DIR  = process.env.ASTRO_DIR  || ROOT;

function findStudioDir() {
  const candidates = [
    process.env.STUDIO_DIR,
    path.join(ROOT, 'diyetsiten', 'diyetsiten'),
    path.join(ROOT, 'diyetsiten'),
    path.join(ROOT, 'studio'),
    path.join(ROOT, 'sanity'),
    ROOT,
  ].filter(Boolean);

  for (const dir of candidates) {
    const pkg = path.join(dir, 'package.json');
    const sanityCfgTs = path.join(dir, 'sanity.config.ts');
    const sanityCfgJs = path.join(dir, 'sanity.config.js');
    if (!existsSync(dir) || !existsSync(pkg)) continue;

    try {
      const json = JSON.parse(readFileSync(pkg, 'utf8'));
      const deps = { ...(json.dependencies||{}), ...(json.devDependencies||{}) };
      const looksLikeStudio = deps.sanity || deps['@sanity/cli'] || existsSync(sanityCfgTs) || existsSync(sanityCfgJs);
      if (looksLikeStudio) return dir;
    } catch (_) {}
  }
  throw new Error('Sanity klasörü bulunamadı. STUDIO_DIR env ile yol verin.');
}

const STUDIO_DIR    = findStudioDir();
console.log('STUDIO_DIR =>', STUDIO_DIR);

const ASTRO_OUT     = path.join(ASTRO_DIR, 'dist');
const STUDIO_TMP    = path.join(ROOT, '.studio-build');
const PUBLISH_OUT   = path.join(ROOT, 'dist');
const STUDIO_TARGET = path.join(PUBLISH_OUT, 'studio');

function run(cmd, cwd = ROOT) {
  execSync(cmd, { stdio: 'inherit', cwd });
}

function copyDirContents(srcDir, dstDir) {
  if (!existsSync(srcDir)) throw new Error(`Kaynak klasör yok: ${srcDir}`);
  if (existsSync(dstDir)) rmSync(dstDir, { recursive: true, force: true });
  mkdirSync(dstDir, { recursive: true });
  cpSync(path.join(srcDir, '.'), dstDir, { recursive: true });
}

try {
  if (existsSync(path.join(ASTRO_DIR, 'package.json'))) run('npm ci', ASTRO_DIR);
  if (existsSync(path.join(STUDIO_DIR, 'package.json'))) run('npm ci', STUDIO_DIR);
  else throw new Error(`Sanity klasörü bulunamadı: ${STUDIO_DIR}`);

  if (existsSync(ASTRO_OUT)) rmSync(ASTRO_OUT, { recursive: true, force: true });
  run('npm run build:astro', ASTRO_DIR);

  if (existsSync(STUDIO_TMP)) rmSync(STUDIO_TMP, { recursive: true, force: true });
  try { run(`npx sanity@latest build --output "${STUDIO_TMP}"`, STUDIO_DIR); }
  catch { console.warn('[WARN] sanity build --output çalışmadı, fallback denenecek.'); }

  const candidates = [
    STUDIO_TMP,
    path.join(STUDIO_DIR, 'dist'),
    path.join(STUDIO_DIR, 'build'),
    path.join(STUDIO_DIR, 'out'),
  ];
  const foundOut = candidates.find(p => existsSync(p));
  if (!foundOut) {
    throw new Error('Sanity Studio build çıktısı bulunamadı:\n' + candidates.map(p => ' - ' + p).join('\n'));
  }
  console.log('Sanity Studio output =>', foundOut);

  if (PUBLISH_OUT !== ASTRO_OUT) {
    if (existsSync(PUBLISH_OUT)) rmSync(PUBLISH_OUT, { recursive: true, force: true });
    mkdirSync(PUBLISH_OUT, { recursive: true });
    cpSync(ASTRO_OUT, PUBLISH_OUT, { recursive: true });
  }

  // 🔧 içerik kopyalama (klasörün kendisi değil)
  copyDirContents(foundOut, STUDIO_TARGET);

  console.log('✅ Tek site hazır: dist/ ve dist/studio/');
} catch (e) {
  console.error(e);
  process.exit(1);
}
