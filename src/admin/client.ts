import {
  STUDIO_URL,
  blankDoc,
  contentTypes,
  getType,
  imageUrlFromRef,
  isDoc,
  key,
  labelFromDoc,
  previewPath,
  referenceTypes,
  slugify,
  validateDoc,
  type ContentType,
  type Doc,
  type Field,
} from '~/lib/admin/model';

interface ListItem {
  _id: string;
  label: string;
  image: string | null;
  _updatedAt: string;
}

interface EditorState {
  typeName: string;
  id: string | null;
  isNew: boolean;
  doc: Doc;
  slugTouched: Set<string>;
  refs: Record<string, { _id: string; label: string }[]>;
  deleteArmed: boolean;
}

class Stop extends Error {}

let editor: EditorState | null = null;

export function boot() {
  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('change', onChange);
  document.addEventListener('submit', onSubmit);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('keydown', onKey);
  const toastEl = document.createElement('div');
  toastEl.id = 'toast';
  toastEl.className = 'hide';
  document.body.appendChild(toastEl);
  paint(`<div class="boot"><span>Panel açılıyor…</span></div>`);
  void open();
}

async function open() {
  try {
    const session = await api('session');
    if (!session.configured) return renderSetup();
    if (!session.authenticated) return renderLogin();
    await renderPage();
  } catch (error) {
    if (error instanceof Stop) return;
    paint(`<div class="fatal">${esc(error instanceof Error ? error.message : 'Panel açılmadı.')}</div>`);
  }
}

async function api(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`/api/admin/${path}`, { ...init, headers, credentials: 'same-origin' });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (response.status === 401 && path !== 'login') {
    editor = null;
    renderLogin();
    throw new Stop('auth');
  }
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'İstek başarısız.');
  return data;
}

function paint(html: string) {
  const app = document.querySelector('#app');
  if (app) app.innerHTML = html;
}

function toast(message: string, bad = false) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.className = bad ? 'bad' : '';
  el.textContent = message;
  window.setTimeout(() => el.classList.add('hide'), 3600);
}

function renderSetup() {
  editor = null;
  paint(`
    <section class="auth">
      <div class="auth-side">
        <div>
          <div class="eyebrow">Donusum Hareketi</div>
          <h1>İçerik paneli</h1>
        </div>
      </div>
      <div class="auth-card">
        <form class="card" data-form="setup">
          <h2>Şifre belirle</h2>
          <div class="stack">
            <label><span>Şifre</span><input name="password" type="password" autocomplete="new-password" required minlength="6"></label>
            <label><span>Şifre tekrar</span><input name="passwordConfirm" type="password" autocomplete="new-password" required minlength="6"></label>
            <p class="form-error" data-error></p>
            <button class="btn" type="submit">Devam</button>
          </div>
        </form>
      </div>
    </section>
  `);
}

function renderLogin(message = '') {
  editor = null;
  paint(`
    <section class="auth">
      <div class="auth-side">
        <div>
          <div class="eyebrow">Donusum Hareketi</div>
          <h1>İçerik paneli</h1>
        </div>
      </div>
      <div class="auth-card">
        <form class="card" data-form="login">
          <h2>Giriş</h2>
          <div class="stack">
            <label><span>Şifre</span><input name="password" type="password" autocomplete="current-password" required></label>
            <p class="form-error" data-error>${esc(message)}</p>
            <button class="btn" type="submit">Giriş yap</button>
          </div>
        </form>
      </div>
    </section>
  `);
}

type Route =
  | { name: 'home' }
  | { name: 'list'; type: string }
  | { name: 'new'; type: string }
  | { name: 'edit'; type: string; id: string }
  | { name: 'settings' }
  | { name: 'panel' };

function route(): Route {
  const parts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).slice(1);
  if (parts[0] === 'liste' && parts[1]) return { name: 'list', type: parts[1] };
  if (parts[0] === 'yeni' && parts[1]) return { name: 'new', type: parts[1] };
  if (parts[0] === 'duzenle' && parts[1] && parts[2]) return { name: 'edit', type: parts[1], id: decodeURIComponent(parts[2]) };
  if (parts[0] === 'ayarlar' && parts[1] === 'panel') return { name: 'panel' };
  if (parts[0] === 'ayarlar') return { name: 'settings' };
  return { name: 'home' };
}

function typeHref(type: ContentType): string {
  if (type.name === 'siteSettings') return '/adminfeyza/ayarlar';
  if (type.singleton) return `/adminfeyza/duzenle/${type.name}/${type.singleton}`;
  return `/adminfeyza/liste/${type.name}`;
}

function aside(current: Route): string {
  const active = (href: string) => {
    if (href === '/adminfeyza') return current.name === 'home' ? 'active' : '';
    if (href === '/adminfeyza/ayarlar') return current.name === 'settings' || current.name === 'panel' ? 'active' : '';
    const typeName = href.split('/').pop() || '';
    if (current.name === 'list' || current.name === 'new' || current.name === 'edit') return current.type === typeName ? 'active' : '';
    return '';
  };
  const links = (group: ContentType['group']) =>
    contentTypes
      .filter((type) => type.nav && type.group === group)
      .map((type) => `<a class="${active(typeHref(type))}" href="${typeHref(type)}">${esc(type.title)}</a>`)
      .join('');
  return `
    <aside>
      <a class="brand" href="/adminfeyza"><span class="mark">D</span><span><strong>Donusum Hareketi</strong><small>İçerik paneli</small></span></a>
      <nav>
        <a class="${active('/adminfeyza')}" href="/adminfeyza">Özet</a>
        <div class="nav-label">Sayfalar</div>
        ${links('Sayfalar')}
        <div class="nav-label">İçerik</div>
        ${links('İçerik')}
        <a class="${active('/adminfeyza/ayarlar')}" href="/adminfeyza/ayarlar">Ayarlar</a>
      </nav>
      <div class="aside-foot">
        <a href="${STUDIO_URL}" target="_blank" rel="noreferrer">Studio</a>
        <button type="button" data-logout>Çıkış</button>
      </div>
    </aside>
  `;
}

function frame(current: Route, main: string): string {
  return `<div class="layout">${aside(current)}<div class="main">${main}</div></div>`;
}

async function renderPage() {
  const current = route();
  paint(`<div class="boot"><span>Yükleniyor…</span></div>`);
  try {
    if (current.name === 'home') return paint(frame(current, await homeHtml()));
    if (current.name === 'list') return paint(frame(current, await listHtml(current.type)));
    if (current.name === 'panel') return paint(frame(current, await panelHtml()));
    if (current.name === 'settings') return await renderEditor('siteSettings', 'siteSettings', false, true);
    if (current.name === 'new') return await renderEditor(current.type, null, true, false);
    return await renderEditor(current.type, current.id, false, false);
  } catch (error) {
    if (error instanceof Stop) return;
    paint(frame(current, `<div class="panel empty">${esc(error instanceof Error ? error.message : 'Sayfa açılmadı.')}</div>`));
  }
}

async function homeHtml(): Promise<string> {
  const data = await api('overview');
  const counts = isDoc(data.counts) ? data.counts : {};
  const recent = Array.isArray(data.recent) ? data.recent.filter(isDoc) : [];
  const cards = contentTypes
    .map((type) => {
      const count = typeof counts[type.name] === 'number' ? counts[type.name] : 0;
      return `<a class="stat" href="${typeHref(type)}"><span>${esc(type.title)}</span><b>${count}</b></a>`;
    })
    .join('');
  const rows = recent.length
    ? recent
        .map((item) => {
          const type = getType(String(item._type ?? ''));
          const href = type ? `/adminfeyza/duzenle/${type.name}/${encodeURIComponent(String(item._id ?? ''))}` : '/adminfeyza';
          return `<a class="row plain" href="${href}"><span><strong>${esc(String(item.label ?? 'Kayıt'))}</strong><small>${esc(type?.title || '')} · ${esc(formatDate(String(item._updatedAt ?? '')))}</small></span><span class="btn ghost small">Aç</span></a>`;
        })
        .join('')
    : `<div class="empty">Henüz kayıt yok.</div>`;
  return `
    <header class="top"><div><p class="kicker">Donusum Hareketi</p><h1>Özet</h1></div></header>
    <div class="grid">${cards}</div>
    <h2 class="section-title">Son değişiklikler</h2>
    <div class="list">${rows}</div>
  `;
}

async function listHtml(typeName: string): Promise<string> {
  const type = getType(typeName);
  if (!type || type.singleton) return `<div class="panel empty">Bu tür listelenmiyor.</div>`;
  const data = await api(`list/${type.name}`);
  const items = Array.isArray(data.items) ? (data.items as ListItem[]) : [];
  const rows = items.length
    ? items
        .map((item) => {
          const src = imageUrlFromRef(item.image);
          const thumb = src ? `<img class="thumb" src="${esc(src)}" alt="">` : `<div class="thumb-empty">görsel</div>`;
          return `<a class="row" data-label="${esc(item.label)}" href="/adminfeyza/duzenle/${type.name}/${encodeURIComponent(item._id)}">${thumb}<span><strong>${esc(item.label)}</strong><small>${esc(formatDate(item._updatedAt))}</small></span><span class="btn ghost small">Düzenle</span></a>`;
        })
        .join('')
    : `<div class="empty">Henüz ${esc(type.title.toLocaleLowerCase('tr'))} yok.</div>`;
  return `
    <header class="top">
      <div><p class="kicker">${esc(type.group)}</p><h1>${esc(type.title)}</h1></div>
      <div class="top-actions"><a class="btn" href="/adminfeyza/yeni/${type.name}">Yeni ekle</a></div>
    </header>
    <p class="hint">${esc(type.description)}</p>
    <input class="search" data-search placeholder="Ara">
    <div class="list">${rows}</div>
  `;
}

async function renderEditor(typeName: string, id: string | null, isNew: boolean, settings: boolean) {
  const type = getType(typeName);
  const current = route();
  if (!type) {
    paint(frame(current, `<div class="panel empty">Böyle bir içerik türü yok.</div>`));
    return;
  }
  let doc = blankDoc(type);
  if (!isNew && id) {
    const data = await api(`doc/${type.name}/${encodeURIComponent(id)}`);
    if (isDoc(data.doc)) doc = data.doc;
    else if (!type.singleton) {
      paint(frame(current, `<div class="panel empty">Bu kayıt bulunamadı.</div>`));
      return;
    }
  }
  const refs: EditorState['refs'] = {};
  await Promise.all(
    referenceTypes(type.fields).map(async (name) => {
      const data = await api(`options/${name}`);
      refs[name] = Array.isArray(data.items)
        ? data.items.filter(isDoc).map((item) => ({ _id: String(item._id ?? ''), label: String(item.label ?? 'Kayıt') }))
        : [];
    }),
  );
  editor = { typeName: type.name, id, isNew, doc, slugTouched: new Set(), refs, deleteArmed: false };
  lockSlugs(type.fields, doc);
  const preview = previewPath(type.name, doc);
  const actions = `
    ${preview ? `<a class="btn ghost" href="${esc(preview)}" target="_blank" rel="noreferrer">Sitede gör</a>` : ''}
    ${!isNew && !type.singleton ? `<button class="btn danger" type="button" data-delete>Sil</button>` : ''}
    <button class="btn" type="button" data-save>Kaydet</button>
  `;
  paint(
    frame(current, `
      ${settings ? tabs('site') : ''}
      <header class="top">
        <div>
          <p class="kicker">${esc(settings ? 'Ayarlar' : type.group)}</p>
          <h1>${esc(isNew ? `Yeni ${type.title.toLocaleLowerCase('tr')}` : settings ? 'Site ayarları' : labelFromDoc(doc, type.label))}</h1>
        </div>
        <div class="top-actions">${actions}</div>
      </header>
      ${type.description ? `<p class="hint">${esc(type.description)}</p>` : ''}
      ${type.usesFirst ? `<p class="note">Birden fazla kayıt varsa sitede ilki görünür.</p>` : ''}
      <div class="editor" id="fields">${renderFields(type.fields, doc, '')}</div>
    `),
  );
}

function tabs(active: 'site' | 'panel'): string {
  return `<div class="tabs"><a class="${active === 'site' ? 'active' : ''}" href="/adminfeyza/ayarlar">Site</a><a class="${active === 'panel' ? 'active' : ''}" href="/adminfeyza/ayarlar/panel">Panel</a></div>`;
}

async function panelHtml(): Promise<string> {
  const data = await api('panel');
  const passwordFromEnv = data.passwordFromEnv === true;
  return `
    ${tabs('panel')}
    <header class="top"><div><p class="kicker">Ayarlar</p><h1>Panel</h1></div></header>
    <form class="card" data-form="panel">
      <div class="stack">
        ${
          passwordFromEnv
            ? ''
            : `<label><span>Yeni şifre</span><input name="password" type="password" autocomplete="new-password" minlength="6"></label>
               <label><span>Yeni şifre tekrar</span><input name="passwordConfirm" type="password" autocomplete="new-password"></label>`
        }
        <p class="form-error" data-error></p>
        ${passwordFromEnv ? '' : '<button class="btn" type="submit">Kaydet</button>'}
      </div>
    </form>
  `;
}

function renderFields(fields: Field[], doc: Doc, base: string): string {
  return fields.map((field) => renderField(field, doc[field.name], base ? `${base}.${field.name}` : field.name)).join('');
}

function renderField(field: Field, value: unknown, path: string): string {
  if (field.type === 'slug' && field.hidden) return '';
  const hint = field.description ? `<p class="hint">${esc(field.description)}</p>` : '';
  if (field.type === 'string' || field.type === 'text' || field.type === 'datetime' || field.type === 'slug') {
    const slugSource = field.type === 'string' && field.slugOf ? ` data-slug-source="${sibling(path, field.slugOf)}"` : '';
    const kind = field.type === 'text' ? 'text' : field.type === 'datetime' ? 'datetime' : field.type === 'slug' ? 'slug' : 'string';
    const shown =
      field.type === 'slug'
        ? isDoc(value) && typeof value.current === 'string'
          ? value.current
          : ''
        : field.type === 'datetime'
          ? toLocalInput(value)
          : typeof value === 'string'
            ? value
            : '';
    const control =
      field.type === 'text'
        ? `<textarea data-bind="${path}" data-kind="text" rows="${field.rows || 4}" ${field.max ? `maxlength="${field.max}"` : ''}>${esc(shown)}</textarea>`
        : `<input data-bind="${path}" data-kind="${kind}"${slugSource} type="${field.type === 'datetime' ? 'datetime-local' : 'text'}" value="${esc(shown)}">`;
    return `<label class="field"><span class="field-label">${esc(field.title)}</span>${hint}${control}</label>`;
  }
  if (field.type === 'select') {
    const current = typeof value === 'string' ? value : '';
    const sync = field.syncSlug ? ` data-sync-slug="${sibling(path, field.syncSlug)}"` : '';
    if (field.layout === 'radio') {
      const radios = field.options
        .map(
          (option) =>
            `<label><input type="radio" name="${path}" data-bind="${path}" data-kind="select"${sync} value="${esc(option.value)}" ${option.value === current ? 'checked' : ''}>${esc(option.title)}</label>`,
        )
        .join('');
      return `<div class="field"><span class="field-label">${esc(field.title)}</span>${hint}<div class="radios">${radios}</div></div>`;
    }
    const options = [`<option value="">Seç</option>`]
      .concat(field.options.map((option) => `<option value="${esc(option.value)}" ${option.value === current ? 'selected' : ''}>${esc(option.title)}</option>`))
      .join('');
    return `<label class="field"><span class="field-label">${esc(field.title)}</span>${hint}<select data-bind="${path}" data-kind="select"${sync}>${options}</select></label>`;
  }
  if (field.type === 'image') {
    const src = imageUrlFromRef(imageRefOf(value));
    const preview = src ? `<img src="${esc(src)}" alt="">` : `<div class="image-placeholder">Görsel yok</div>`;
    return `<div class="field"><span class="field-label">${esc(field.title)}</span>${hint}<div class="image-box" data-image-box="${path}">${preview}<div class="image-actions"><label class="btn ghost file">Görsel seç<input type="file" accept="image/*" data-image-path="${path}"></label><button class="btn ghost" type="button" data-clear-image="${path}">Kaldır</button></div></div></div>`;
  }
  if (field.type === 'reference') {
    const current = isDoc(value) && typeof value._ref === 'string' ? value._ref : '';
    const options = editor?.refs[field.to] || [];
    const html = [`<option value="">Seç</option>`]
      .concat(options.map((option) => `<option value="${esc(option._id)}" ${option._id === current ? 'selected' : ''}>${esc(option.label)}</option>`))
      .join('');
    return `<label class="field"><span class="field-label">${esc(field.title)}</span>${hint}<select data-bind="${path}" data-kind="reference">${html}</select></label>`;
  }
  if (field.type === 'blocks') return renderBlocks(field, value, path);
  if (field.type === 'object') {
    const nested = isDoc(value) ? value : {};
    return `<details class="object" open><summary>${esc(field.title)}</summary>${hint}${renderFields(field.fields, nested, path)}</details>`;
  }
  const items = Array.isArray(value) ? value.filter(isDoc) : [];
  const cards = items
    .map((item, index) => {
      return `<article class="array-item"><header><strong>${esc(field.itemTitle || 'Öğe')} ${index + 1}</strong><span class="inline-actions"><button class="btn ghost small" type="button" data-move-array="${path}" data-index="${index}" data-dir="-1">Yukarı</button><button class="btn ghost small" type="button" data-move-array="${path}" data-index="${index}" data-dir="1">Aşağı</button><button class="btn danger small" type="button" data-remove-array="${path}" data-index="${index}">Sil</button></span></header>${renderFields(field.fields, item, `${path}.${index}`)}</article>`;
    })
    .join('');
  return `<div class="field"><div class="array-head"><span class="field-label">${esc(field.title)}</span><button class="btn ghost small" type="button" data-add-array="${path}">Ekle</button></div>${hint}<div class="array">${cards || '<p class="hint">Henüz öğe yok.</p>'}</div></div>`;
}

function renderBlocks(field: Field, value: unknown, path: string): string {
  const blocks = Array.isArray(value) ? value.filter(isDoc) : [];
  const html = blocks
    .map((block) => {
      const blockKey = typeof block._key === 'string' ? block._key : key();
      if (block._type === 'image') {
        const src = imageUrlFromRef(imageRefOf(block));
        return `<article class="block" data-block-key="${esc(blockKey)}"><div class="block-top"><span>Görsel</span><button class="btn danger small" type="button" data-remove-block="${path}" data-block-key="${esc(blockKey)}">Kaldır</button></div><div class="pt-image">${src ? `<img src="${esc(src)}" alt="">` : ''}</div></article>`;
      }
      const style = block.listItem === 'bullet' ? 'bullet' : typeof block.style === 'string' ? block.style : 'normal';
      return `<article class="block ${style === 'bullet' ? 'is-bullet' : ''}" data-block-key="${esc(blockKey)}"><div class="block-top"><select data-block-style="${esc(blockKey)}" data-blocks-path="${path}">${blockStyleOptions(style)}</select><span class="inline-actions"><button class="btn ghost small" type="button" data-cmd="bold">Kalın</button><button class="btn ghost small" type="button" data-cmd="italic">İtalik</button><button class="btn ghost small" type="button" data-cmd="link">Link</button><button class="btn danger small" type="button" data-remove-block="${path}" data-block-key="${esc(blockKey)}">Sil</button></span></div><div class="pt-text" contenteditable="true" data-style="${esc(style)}" data-placeholder="Yazmaya başla">${spansToHtml(block)}</div></article>`;
    })
    .join('');
  return `<div class="field"><span class="field-label">${esc(field.title)}</span>${field.description ? `<p class="hint">${esc(field.description)}</p>` : ''}<div class="blocks" data-blocks-path="${path}"><div class="block-tools"><button class="btn ghost small" type="button" data-add-block="normal" data-blocks-path="${path}">Paragraf</button><button class="btn ghost small" type="button" data-add-block="h2" data-blocks-path="${path}">Başlık</button><button class="btn ghost small" type="button" data-add-block="blockquote" data-blocks-path="${path}">Alıntı</button><button class="btn ghost small" type="button" data-add-block="bullet" data-blocks-path="${path}">Madde</button><label class="btn ghost small file">Görsel<input type="file" accept="image/*" data-blocks-path="${path}"></label></div>${html || '<p class="hint">İçerik boş.</p>'}</div></div>`;
}

function blockStyleOptions(current: string): string {
  const options = [
    ['normal', 'Paragraf'],
    ['h1', 'Büyük başlık'],
    ['h2', 'Başlık'],
    ['h3', 'Alt başlık'],
    ['h4', 'Küçük başlık'],
    ['blockquote', 'Alıntı'],
    ['bullet', 'Madde'],
  ];
  return options.map(([value, title]) => `<option value="${value}" ${value === current ? 'selected' : ''}>${title}</option>`).join('');
}

function spansToHtml(block: Doc): string {
  const children = Array.isArray(block.children) ? block.children : [];
  const markDefs = Array.isArray(block.markDefs) ? block.markDefs.filter(isDoc) : [];
  return children
    .map((span) => {
      if (!isDoc(span)) return '';
      let html = esc(typeof span.text === 'string' ? span.text : '').replace(/\n/g, '<br>');
      const marks = Array.isArray(span.marks) ? span.marks.filter((mark) => typeof mark === 'string') : [];
      if (marks.includes('em')) html = `<em>${html}</em>`;
      if (marks.includes('strong')) html = `<strong>${html}</strong>`;
      for (const mark of marks) {
        const def = markDefs.find((item) => item._key === mark && item._type === 'link');
        if (def && typeof def.href === 'string' && def.href) html = `<a href="${esc(def.href)}">${html}</a>`;
      }
      return html;
    })
    .join('');
}

function htmlToSpans(root: HTMLElement): { children: Doc[]; markDefs: Doc[] } {
  const markDefs: Doc[] = [];
  const children: Doc[] = [];
  const walk = (node: Node, marks: string[]) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text) return;
      children.push({ _type: 'span', _key: key(), text, marks: [...marks] });
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    const tag = node.tagName;
    if (tag === 'BR') {
      children.push({ _type: 'span', _key: key(), text: '\n', marks: [...marks] });
      return;
    }
    let next = marks;
    if (tag === 'STRONG' || tag === 'B') next = [...marks, 'strong'];
    else if (tag === 'EM' || tag === 'I') next = [...marks, 'em'];
    else if (tag === 'A') {
      const id = key();
      markDefs.push({ _key: id, _type: 'link', href: node.getAttribute('href') || '' });
      next = [...marks, id];
    }
    if ((tag === 'DIV' || tag === 'P') && children.length) {
      children.push({ _type: 'span', _key: key(), text: '\n', marks: [...marks] });
    }
    node.childNodes.forEach((child) => walk(child, next));
  };
  root.childNodes.forEach((node) => walk(node, []));
  if (!children.length) children.push({ _type: 'span', _key: key(), text: '', marks: [] });
  return { children, markDefs };
}

function lockSlugs(fields: Field[], doc: Doc, base = '') {
  if (!editor) return;
  fields.forEach((field) => {
    const path = base ? `${base}.${field.name}` : field.name;
    if (field.type === 'slug' && isDoc(doc[field.name]) && typeof (doc[field.name] as Doc).current === 'string' && (doc[field.name] as Doc).current) {
      editor?.slugTouched.add(path);
    }
    if (field.type === 'object' && isDoc(doc[field.name])) lockSlugs(field.fields, doc[field.name] as Doc, path);
    const nested = doc[field.name];
    if (field.type === 'array' && Array.isArray(nested)) {
      nested.forEach((item: unknown, index: number) => {
        if (isDoc(item)) lockSlugs(field.fields, item, `${path}.${index}`);
      });
    }
  });
}

function sibling(path: string, name: string): string {
  const index = path.lastIndexOf('.');
  return index === -1 ? name : `${path.slice(0, index + 1)}${name}`;
}

function imageRefOf(value: unknown): string | null {
  if (!isDoc(value) || !isDoc(value.asset) || typeof value.asset._ref !== 'string') return null;
  return value.asset._ref;
}

function setPath(root: unknown, path: string, value: unknown) {
  const parts = path.split('.');
  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const next = parts[i + 1];
    if (Array.isArray(cur)) {
      const index = Number(part);
      if (!isDoc(cur[index]) && !Array.isArray(cur[index])) cur[index] = /^\d+$/.test(next) ? [] : {};
      cur = cur[index];
      continue;
    }
    if (!isDoc(cur)) return;
    if (!isDoc(cur[part]) && !Array.isArray(cur[part])) cur[part] = /^\d+$/.test(next) ? [] : {};
    cur = cur[part];
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) cur[Number(last)] = value;
  else if (isDoc(cur)) cur[last] = value;
}

function getPath(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (Array.isArray(acc)) return acc[Number(part)];
    if (isDoc(acc)) return acc[part];
    return undefined;
  }, root);
}

function ensureArray(path: string): Doc[] {
  if (!editor) return [];
  const current = getPath(editor.doc, path);
  if (Array.isArray(current)) return current.filter(isDoc);
  const fresh: Doc[] = [];
  setPath(editor.doc, path, fresh);
  return fresh;
}

function fieldByPath(type: ContentType, path: string): Field | null {
  const parts = path.split('.');
  let fields = type.fields;
  let found: Field | null = null;
  for (const part of parts) {
    if (/^\d+$/.test(part)) continue;
    found = fields.find((field) => field.name === part) || null;
    if (!found) return null;
    if (found.type === 'object' || found.type === 'array') fields = found.fields;
  }
  return found;
}

function rerenderFields() {
  if (!editor) return;
  syncAllBlocks();
  const type = getType(editor.typeName);
  const holder = document.querySelector('#fields');
  const main = document.querySelector('.main');
  const top = main instanceof HTMLElement ? main.scrollTop : 0;
  if (type && holder) holder.innerHTML = renderFields(type.fields, editor.doc, '');
  if (main instanceof HTMLElement) main.scrollTop = top;
}

function syncAllBlocks() {
  document.querySelectorAll<HTMLElement>('.pt-text').forEach(syncTextBlock);
}

function syncTextBlock(text: HTMLElement) {
  if (!editor) return;
  const wrap = text.closest('[data-block-key]');
  const container = text.closest('[data-blocks-path]');
  if (!(wrap instanceof HTMLElement) || !(container instanceof HTMLElement)) return;
  const blocks = getPath(editor.doc, container.dataset.blocksPath || '');
  if (!Array.isArray(blocks)) return;
  const block = blocks.find((item) => isDoc(item) && item._key === wrap.dataset.blockKey);
  if (!isDoc(block) || block._type === 'image') return;
  const parsed = htmlToSpans(text);
  block.children = parsed.children;
  block.markDefs = parsed.markDefs;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function toLocalInput(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textBlock(style: string): Doc {
  const block: Doc = {
    _type: 'block',
    _key: key(),
    style: style === 'bullet' ? 'normal' : style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text: '', marks: [] }],
  };
  if (style === 'bullet') {
    block.listItem = 'bullet';
    block.level = 1;
  }
  return block;
}

async function onSubmit(event: Event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !form.closest('#app')) return;
  event.preventDefault();
  const error = form.querySelector('[data-error]');
  const show = (message: string) => {
    if (error) error.textContent = message;
  };
  const data = new FormData(form);
  try {
    if (form.dataset.form === 'setup' || form.dataset.form === 'login') {
      const password = String(data.get('password') || '');
      if (form.dataset.form === 'setup' && password !== String(data.get('passwordConfirm') || '')) {
        show('Şifreler aynı değil.');
        return;
      }
      await api(form.dataset.form, {
        method: 'POST',
        body: JSON.stringify({
          password,
          passwordConfirm: String(data.get('passwordConfirm') || ''),
          token: String(data.get('token') || ''),
        }),
      });
      await renderPage();
      return;
    }
    if (form.dataset.form === 'panel') {
      const password = String(data.get('password') || '');
      const confirm = String(data.get('passwordConfirm') || '');
      if (password && password !== confirm) {
        show('Şifreler aynı değil.');
        return;
      }
      const body: Record<string, string> = {};
      if (password) body.password = password;
      const token = data.get('token');
      if (typeof token === 'string' && token.trim()) body.token = token.trim();
      await api('panel', { method: 'PUT', body: JSON.stringify(body) });
      toast('Panel ayarları kaydedildi.');
      paint(frame(route(), await panelHtml()));
    }
  } catch (err) {
    if (err instanceof Stop) return;
    show(err instanceof Error ? err.message : 'İşlem olmadı.');
  }
}

function onInput(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.closest('#app')) return;
  if (target instanceof HTMLInputElement && target.dataset.search !== undefined) {
    const query = target.value.toLocaleLowerCase('tr');
    document.querySelectorAll<HTMLElement>('[data-label]').forEach((row) => {
      row.classList.toggle('gone', Boolean(query) && !(row.dataset.label || '').toLocaleLowerCase('tr').includes(query));
    });
    return;
  }
  if (!editor) return;
  if ((target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) && target.dataset.bind) {
    applyBind(target);
  }
  if (target.classList.contains('pt-text')) syncTextBlock(target);
}

function applyBind(el: HTMLInputElement | HTMLTextAreaElement) {
  if (!editor || !el.dataset.bind) return;
  const path = el.dataset.bind;
  const kind = el.dataset.kind || 'string';
  if (kind === 'slug') {
    const current = slugify(el.value);
    if (!el.value.trim()) editor.slugTouched.delete(path);
    else editor.slugTouched.add(path);
    setPath(editor.doc, path, { _type: 'slug', current });
    if (el.value !== current) el.value = current;
    return;
  }
  if (kind === 'datetime') {
    setPath(editor.doc, path, el.value ? new Date(el.value).toISOString() : '');
    return;
  }
  setPath(editor.doc, path, el.value);
  const slugPath = el.dataset.slugSource;
  if (slugPath && !editor.slugTouched.has(slugPath)) {
    const current = slugify(el.value);
    setPath(editor.doc, slugPath, { _type: 'slug', current });
    const slugInput = document.querySelector(`[data-bind="${slugPath}"]`);
    if (slugInput instanceof HTMLInputElement) slugInput.value = current;
  }
}

async function onChange(event: Event) {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.closest('#app')) return;
  if (target instanceof HTMLInputElement && target.type === 'file') {
    const file = target.files?.[0];
    target.value = '';
    if (file) await upload(file, target);
    return;
  }
  if (!editor) return;
  if (target instanceof HTMLSelectElement && target.dataset.blockStyle) {
    const blocks = getPath(editor.doc, target.dataset.blocksPath || '');
    if (!Array.isArray(blocks)) return;
    const block = blocks.find((item) => isDoc(item) && item._key === target.dataset.blockStyle);
    if (!isDoc(block)) return;
    if (target.value === 'bullet') {
      block.listItem = 'bullet';
      block.level = 1;
      block.style = 'normal';
    } else {
      delete block.listItem;
      delete block.level;
      block.style = target.value;
    }
    rerenderFields();
    return;
  }
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement) || !target.dataset.bind) return;
  if (target.dataset.kind !== 'reference' && target.dataset.kind !== 'select') return;
  const path = target.dataset.bind;
  if (target.dataset.kind === 'reference') {
    setPath(editor.doc, path, target.value ? { _type: 'reference', _ref: target.value } : null);
    return;
  }
  setPath(editor.doc, path, target.value);
  if (target.dataset.syncSlug) {
    setPath(editor.doc, target.dataset.syncSlug, { _type: 'slug', current: target.value });
  }
}

async function upload(file: File, input: HTMLInputElement) {
  if (!editor) return;
  const body = new FormData();
  body.set('file', file);
  try {
    const asset = await api('upload', { method: 'POST', body });
    const assetId = String(asset.assetId || '');
    if (input.dataset.imagePath) {
      setPath(editor.doc, input.dataset.imagePath, { _type: 'image', asset: { _type: 'reference', _ref: assetId } });
      const box = document.querySelector(`[data-image-box="${input.dataset.imagePath}"]`);
      const url = imageUrlFromRef(assetId);
      const img = box?.querySelector('img, .image-placeholder');
      if (url && img) {
        const next = document.createElement('img');
        next.src = url;
        next.alt = '';
        img.replaceWith(next);
      }
      return;
    }
    if (input.dataset.blocksPath) {
      const blocks = ensureArray(input.dataset.blocksPath);
      blocks.push({ _type: 'image', _key: key(), asset: { _type: 'reference', _ref: assetId } });
      setPath(editor.doc, input.dataset.blocksPath, blocks);
      rerenderFields();
    }
  } catch (error) {
    if (error instanceof Stop) return;
    toast(error instanceof Error ? error.message : 'Görsel yüklenmedi.', true);
  }
}

function onMouseDown(event: MouseEvent) {
  const button = event.target instanceof Element ? event.target.closest('[data-cmd]') : null;
  if (button) event.preventDefault();
}

async function onClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('[data-logout]')) {
    await api('logout', { method: 'POST' });
    renderLogin();
    return;
  }
  if (!editor) return;
  const addArray = target.closest('[data-add-array]');
  if (addArray instanceof HTMLElement && addArray.dataset.addArray) {
    const type = getType(editor.typeName);
    const field = type ? fieldByPath(type, addArray.dataset.addArray) : null;
    const items = ensureArray(addArray.dataset.addArray);
    const blank: Doc = { _key: key() };
    if (field?.type === 'array') {
      for (const child of field.fields) {
        if (child.type === 'select' && child.name === 'variant') blank.variant = 'primary';
        if (child.type === 'select' && child.name === 'imagePosition') blank.imagePosition = 'right';
      }
    }
    items.push(blank);
    setPath(editor.doc, addArray.dataset.addArray, items);
    rerenderFields();
    return;
  }
  const removeArray = target.closest('[data-remove-array]');
  if (removeArray instanceof HTMLElement && removeArray.dataset.removeArray) {
    syncAllBlocks();
    const items = ensureArray(removeArray.dataset.removeArray);
    items.splice(Number(removeArray.dataset.index), 1);
    setPath(editor.doc, removeArray.dataset.removeArray, items);
    rerenderFields();
    return;
  }
  const moveArray = target.closest('[data-move-array]');
  if (moveArray instanceof HTMLElement && moveArray.dataset.moveArray) {
    syncAllBlocks();
    const items = ensureArray(moveArray.dataset.moveArray);
    const index = Number(moveArray.dataset.index);
    const next = index + Number(moveArray.dataset.dir);
    if (next < 0 || next >= items.length) return;
    const [item] = items.splice(index, 1);
    items.splice(next, 0, item);
    setPath(editor.doc, moveArray.dataset.moveArray, items);
    rerenderFields();
    return;
  }
  const addBlock = target.closest('[data-add-block]');
  if (addBlock instanceof HTMLElement && addBlock.dataset.addBlock && addBlock.dataset.blocksPath) {
    syncAllBlocks();
    const items = ensureArray(addBlock.dataset.blocksPath);
    items.push(textBlock(addBlock.dataset.addBlock));
    setPath(editor.doc, addBlock.dataset.blocksPath, items);
    rerenderFields();
    return;
  }
  const removeBlock = target.closest('[data-remove-block]');
  if (removeBlock instanceof HTMLElement && removeBlock.dataset.removeBlock) {
    syncAllBlocks();
    const items = ensureArray(removeBlock.dataset.removeBlock).filter((item) => item._key !== removeBlock.dataset.blockKey);
    setPath(editor.doc, removeBlock.dataset.removeBlock, items);
    rerenderFields();
    return;
  }
  const command = target.closest('[data-cmd]');
  if (command instanceof HTMLElement && command.dataset.cmd) {
    applyCommand(command.dataset.cmd);
    return;
  }
  const clearImage = target.closest('[data-clear-image]');
  if (clearImage instanceof HTMLElement && clearImage.dataset.clearImage) {
    setPath(editor.doc, clearImage.dataset.clearImage, null);
    rerenderFields();
    return;
  }
  if (target.closest('[data-save]')) {
    await saveCurrent();
    return;
  }
  if (target.closest('[data-delete]')) await deleteCurrent();
}

function applyCommand(command: string) {
  const selection = window.getSelection();
  const node = selection?.anchorNode;
  const text = node instanceof HTMLElement ? node.closest('.pt-text') : node?.parentElement?.closest('.pt-text');
  if (!(text instanceof HTMLElement)) return;
  text.focus();
  if (command === 'link') {
    const href = window.prompt('Bağlantı adresi', 'https://');
    if (!href) return;
    document.execCommand('createLink', false, href);
  } else {
    document.execCommand(command === 'italic' ? 'italic' : 'bold');
  }
  syncTextBlock(text);
}

async function saveCurrent() {
  if (!editor) return;
  syncAllBlocks();
  const type = getType(editor.typeName);
  if (!type) return;
  const problem = validateDoc(type, editor.doc);
  if (problem) {
    toast(problem, true);
    return;
  }
  const button = document.querySelector('[data-save]');
  if (button instanceof HTMLButtonElement) {
    button.disabled = true;
    button.textContent = 'Kaydediliyor…';
  }
  try {
    if (editor.isNew) {
      const created = await api(`doc/${type.name}`, { method: 'POST', body: JSON.stringify(editor.doc) });
      toast('Kaydedildi.');
      location.href = `/adminfeyza/duzenle/${type.name}/${encodeURIComponent(String(created._id || ''))}`;
      return;
    }
    await api(`doc/${type.name}/${encodeURIComponent(editor.id || '')}`, { method: 'PUT', body: JSON.stringify(editor.doc) });
    toast('Kaydedildi.');
  } catch (error) {
    if (error instanceof Stop) return;
    toast(error instanceof Error ? error.message : 'Kayıt olmadı.', true);
  } finally {
    if (button instanceof HTMLButtonElement && button.isConnected) {
      button.disabled = false;
      button.textContent = 'Kaydet';
    }
  }
}

async function deleteCurrent() {
  if (!editor?.id || editor.isNew) return;
  const button = document.querySelector('[data-delete]');
  if (!editor.deleteArmed) {
    editor.deleteArmed = true;
    if (button) button.textContent = 'Silinsin mi?';
    return;
  }
  try {
    await api(`doc/${editor.typeName}/${encodeURIComponent(editor.id)}`, { method: 'DELETE' });
    location.href = `/adminfeyza/liste/${editor.typeName}`;
  } catch (error) {
    if (error instanceof Stop) return;
    toast(error instanceof Error ? error.message : 'Silinemedi.', true);
  }
}

function onKey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && editor) {
    event.preventDefault();
    void saveCurrent();
  }
}
