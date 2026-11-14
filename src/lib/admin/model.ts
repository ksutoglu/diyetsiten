export const PROJECT_ID = '9a4tp2sj';
export const DATASET = 'production';
export const STUDIO_URL = 'https://9a4tp2sj.sanity.studio/';
export const API_VERSION = '2024-07-06';

export type Doc = Record<string, unknown>;

interface FieldBase {
  name: string;
  title: string;
  description?: string;
  required?: boolean;
}

export type Field =
  | (FieldBase & { type: 'string'; slugOf?: string })
  | (FieldBase & { type: 'text'; rows?: number; max?: number })
  | (FieldBase & { type: 'slug'; hidden?: boolean })
  | (FieldBase & { type: 'datetime' })
  | (FieldBase & { type: 'image' })
  | (FieldBase & {
      type: 'select';
      options: { title: string; value: string }[];
      layout?: 'radio' | 'dropdown';
      syncSlug?: string;
    })
  | (FieldBase & { type: 'blocks' })
  | (FieldBase & { type: 'reference'; to: string })
  | (FieldBase & { type: 'object'; fields: Field[]; collapsible?: boolean })
  | (FieldBase & { type: 'array'; fields: Field[]; itemTitle?: string });

export interface ContentType {
  name: string;
  title: string;
  description: string;
  group: 'Sayfalar' | 'İçerik';
  singleton?: string;
  label: string;
  thumb?: string;
  usesFirst?: boolean;
  nav: boolean;
  fields: Field[];
}

const STYLES = new Set(['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote']);

export const contentTypes: ContentType[] = [
  {
    name: 'hero',
    title: 'Karşılama alanı',
    description: 'Ana sayfanın en üstündeki büyük başlık, yazı, görsel ve butonlar.',
    group: 'Sayfalar',
    singleton: 'hero',
    label: 'title',
    thumb: 'mainImage',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Ana başlık', required: true },
      { type: 'text', name: 'subtitle', title: 'Alt başlık', rows: 3 },
      { type: 'image', name: 'mainImage', title: 'Ana görsel' },
      {
        type: 'array',
        name: 'actions',
        title: 'Butonlar',
        itemTitle: 'Buton',
        fields: [
          { type: 'string', name: 'text', title: 'Buton metni' },
          { type: 'string', name: 'href', title: 'Buton linki' },
          {
            type: 'select',
            name: 'variant',
            title: 'Buton tipi',
            options: [
              { title: 'Ana buton', value: 'primary' },
              { title: 'İkincil buton', value: 'secondary' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'pageSection',
    title: 'Ana sayfa bölümleri',
    description: 'Karşılama alanının altında, görsel ile yazının yan yana durduğu alanlar.',
    group: 'Sayfalar',
    label: 'title',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Listede görünen ad', required: true, slugOf: 'identifier' },
      {
        type: 'slug',
        name: 'identifier',
        title: 'Kısa ad',
        hidden: true,
        required: true,
      },
      {
        type: 'select',
        name: 'backgroundColor',
        title: 'Arka plan rengi',
        layout: 'radio',
        options: [
          { title: 'Beyaz', value: 'white' },
          { title: 'Açık mavi', value: 'light' },
        ],
      },
      {
        type: 'object',
        name: 'contentWithImage',
        title: 'Sitede görünen alan',
        description: 'Başlık, yazı ve görsel.',
        collapsible: true,
        fields: [
          { type: 'string', name: 'mainTitle', title: 'Ana başlık' },
          { type: 'text', name: 'description', title: 'Açıklama', rows: 4 },
          {
            type: 'array',
            name: 'featureList',
            title: 'Maddeler',
            itemTitle: 'Madde',
            fields: [
              { type: 'string', name: 'title', title: 'Madde başlığı' },
              { type: 'text', name: 'description', title: 'Madde açıklaması', rows: 3 },
            ],
          },
          { type: 'image', name: 'image', title: 'Görsel' },
          {
            type: 'select',
            name: 'imagePosition',
            title: 'Görselin konumu',
            layout: 'radio',
            options: [
              { title: 'Sağda', value: 'right' },
              { title: 'Solda', value: 'left' },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'about',
    title: 'Ben kimim?',
    description: 'Hakkımda sayfası.',
    group: 'Sayfalar',
    label: 'title',
    thumb: 'profileImage',
    usesFirst: true,
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Sayfa başlığı', required: true },
      { type: 'image', name: 'profileImage', title: 'Profil fotoğrafı', required: true },
      { type: 'blocks', name: 'body', title: 'Sayfa içeriği' },
    ],
  },
  {
    name: 'contact',
    title: 'İletişim',
    description: 'İletişim sayfası.',
    group: 'Sayfalar',
    label: 'title',
    usesFirst: true,
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Sayfa başlığı', required: true },
      { type: 'text', name: 'intro', title: 'Giriş metni', rows: 3 },
      { type: 'string', name: 'email', title: 'E-posta' },
      { type: 'string', name: 'phone', title: 'Telefon' },
      { type: 'text', name: 'address', title: 'Adres', rows: 4 },
    ],
  },
  {
    name: 'calculatorPage',
    title: 'Hesaplama sayfaları',
    description: 'BKİ, su ve insülin direnci sayfalarının metinleri.',
    group: 'Sayfalar',
    label: 'pageTitle',
    thumb: 'mainImage',
    nav: true,
    fields: [
      {
        type: 'select',
        name: 'title',
        title: 'Hesaplama aracı',
        required: true,
        layout: 'radio',
        syncSlug: 'slug',
        description: 'Hangi hesaplama sayfasına ait olduğunu seç.',
        options: [
          { title: 'Vücut kitle indeksi (BKİ)', value: 'bki-hesaplama' },
          { title: 'Günlük su ihtiyacı', value: 'gunluk-su-ihtiyaci' },
          { title: 'İnsülin direnci (HOMA-IR)', value: 'insulin-direnci' },
        ],
      },
      { type: 'string', name: 'pageTitle', title: 'Sayfa başlığı' },
      { type: 'slug', name: 'slug', title: 'Adres', hidden: true },
      { type: 'image', name: 'mainImage', title: 'Sayfa görseli' },
      { type: 'blocks', name: 'content', title: 'Hesaplama altındaki açıklama' },
    ],
  },
  {
    name: 'hizmet',
    title: 'Hizmetler',
    description: 'Hizmet kartları ve hizmet sayfaları.',
    group: 'İçerik',
    label: 'title',
    thumb: 'anaGorsel',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Hizmet başlığı', required: true, slugOf: 'slug' },
      { type: 'slug', name: 'slug', title: 'Adres', required: true },
      { type: 'text', name: 'kisaAciklama', title: 'Kısa açıklama', rows: 3, max: 200, required: true },
      {
        type: 'string',
        name: 'icon',
        title: 'İkon',
        description: 'Boş bırakabilirsin.',
      },
      { type: 'image', name: 'anaGorsel', title: 'Ana görsel' },
      { type: 'blocks', name: 'detayliAciklama', title: 'Detaylı açıklama' },
    ],
  },
  {
    name: 'danismanlik',
    title: 'Danışmanlıklar',
    description: 'Beslenme danışmanlığı sayfaları.',
    group: 'İçerik',
    label: 'title',
    thumb: 'mainImage',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Danışmanlık başlığı', required: true, slugOf: 'slug' },
      { type: 'slug', name: 'slug', title: 'Adres', required: true },
      { type: 'image', name: 'mainImage', title: 'Sayfa görseli' },
      { type: 'blocks', name: 'content', title: 'Sayfa içeriği' },
    ],
  },
  {
    name: 'post',
    title: 'Blog yazıları',
    description: 'Blog listelemesi ve yazı sayfaları.',
    group: 'İçerik',
    label: 'title',
    thumb: 'mainImage',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Başlık', required: true, slugOf: 'slug' },
      { type: 'slug', name: 'slug', title: 'Adres', required: true },
      { type: 'text', name: 'excerpt', title: 'Özet', rows: 4, max: 200, required: true },
      { type: 'image', name: 'mainImage', title: 'Kapak fotoğrafı', required: true },
      { type: 'datetime', name: 'publishedAt', title: 'Yayınlanma tarihi', required: true },
      { type: 'blocks', name: 'body', title: 'İçerik' },
    ],
  },
  {
    name: 'recipeCategory',
    title: 'Tarif kategorileri',
    description: 'Tariflerin gruplandığı kategoriler.',
    group: 'İçerik',
    label: 'title',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Kategori adı', required: true, slugOf: 'slug' },
      { type: 'slug', name: 'slug', title: 'Adres', required: true },
    ],
  },
  {
    name: 'recipe',
    title: 'Tarifler',
    description: 'Tarif kartları ve tarif sayfaları.',
    group: 'İçerik',
    label: 'title',
    thumb: 'mainImage',
    nav: true,
    fields: [
      { type: 'string', name: 'title', title: 'Tarif adı', required: true, slugOf: 'slug' },
      { type: 'slug', name: 'slug', title: 'Adres', required: true },
      { type: 'image', name: 'mainImage', title: 'Tarif fotoğrafı', required: true },
      { type: 'reference', name: 'category', title: 'Kategori', to: 'recipeCategory', required: true },
      { type: 'text', name: 'summary', title: 'Özet', rows: 3, max: 250, required: true },
      { type: 'text', name: 'ingredients', title: 'Malzemeler', description: 'Her malzemeyi yeni satıra yaz.', rows: 8 },
      { type: 'blocks', name: 'instructions', title: 'Hazırlanışı' },
    ],
  },
  {
    name: 'faq',
    title: 'Sıkça sorulan sorular',
    description: 'Ana sayfadaki soru-cevaplar.',
    group: 'İçerik',
    label: 'question',
    nav: true,
    fields: [
      { type: 'string', name: 'question', title: 'Soru', required: true },
      { type: 'text', name: 'answer', title: 'Cevap', rows: 5, required: true },
    ],
  },
  {
    name: 'testimonial',
    title: 'Danışan yorumları',
    description: 'Ana sayfa ve yorumlar sayfasındaki yorumlar.',
    group: 'İçerik',
    label: 'name',
    thumb: 'image',
    nav: true,
    fields: [
      { type: 'string', name: 'name', title: 'Adı soyadı', required: true },
      { type: 'string', name: 'title', title: 'Unvan', description: 'Örn: Online danışan, sporcu' },
      { type: 'text', name: 'quote', title: 'Yorum', rows: 5, required: true },
      { type: 'image', name: 'image', title: 'Fotoğraf' },
    ],
  },
  {
    name: 'siteSettings',
    title: 'Site ayarları',
    description: 'Site adı, en alttaki yazı, sosyal hesaplar ve linkler.',
    group: 'Sayfalar',
    singleton: 'siteSettings',
    label: 'title',
    nav: false,
    fields: [
      { type: 'string', name: 'title', title: 'Site adı' },
      { type: 'string', name: 'footerText', title: 'En alttaki yazı', description: 'Telif satırı.' },
      {
        type: 'object',
        name: 'philosophyNote',
        title: 'Ana sayfa felsefe notu',
        description: 'Karşılama alanının hemen altındaki kısa not.',
        collapsible: true,
        fields: [
          { type: 'string', name: 'title', title: 'Başlık' },
          { type: 'text', name: 'description', title: 'Açıklama', rows: 3 },
        ],
      },
      {
        type: 'array',
        name: 'socialLinks',
        title: 'Sosyal medya',
        itemTitle: 'Hesap',
        fields: [
          {
            type: 'select',
            name: 'platform',
            title: 'Platform',
            options: [
              { title: 'Instagram', value: 'instagram' },
              { title: 'Facebook', value: 'facebook' },
              { title: 'Twitter', value: 'twitter' },
              { title: 'LinkedIn', value: 'linkedin' },
            ],
          },
          { type: 'string', name: 'url', title: 'Adres' },
        ],
      },
      {
        type: 'array',
        name: 'footerLinks',
        title: 'En alttaki linkler',
        itemTitle: 'Sütun',
        fields: [
          { type: 'string', name: 'title', title: 'Sütun başlığı' },
          {
            type: 'array',
            name: 'links',
            title: 'Linkler',
            itemTitle: 'Link',
            fields: [
              { type: 'string', name: 'text', title: 'Link metni' },
              { type: 'string', name: 'href', title: 'Link adresi' },
            ],
          },
        ],
      },
    ],
  },
];

export function getType(name: string): ContentType | undefined {
  return contentTypes.find((type) => type.name === name);
}

export function isDoc(value: unknown): value is Doc {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function key(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const TURKISH: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  Ç: 'c',
  Ğ: 'g',
  İ: 'i',
  I: 'i',
  Ö: 'o',
  Ş: 's',
  Ü: 'u',
};

export function slugify(input: string): string {
  const mapped = input
    .split('')
    .map((char) => TURKISH[char] ?? char)
    .join('');
  return mapped
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export function imageUrlFromRef(ref: string | null | undefined): string | null {
  if (!ref || !ref.startsWith('image-')) return null;
  const rest = ref.slice('image-'.length);
  const extAt = rest.lastIndexOf('-');
  if (extAt < 0) return null;
  const ext = rest.slice(extAt + 1);
  const id = rest.slice(0, extAt);
  if (!id || !ext) return null;
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}.${ext}`;
}

export function imageRef(value: unknown): string | null {
  if (!isDoc(value) || !isDoc(value.asset) || typeof value.asset._ref !== 'string') return null;
  return value.asset._ref;
}

export function labelFromDoc(doc: Doc, labelKey: string): string {
  const value = doc[labelKey];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (isDoc(doc.slug) && typeof doc.slug.current === 'string' && doc.slug.current) return doc.slug.current;
  return 'Adsız kayıt';
}

export function previewPath(typeName: string, doc: Doc): string | null {
  const slug = isDoc(doc.slug) && typeof doc.slug.current === 'string' ? doc.slug.current : '';
  if (typeName === 'post' && slug) return `/blog/${slug}`;
  if (typeName === 'recipe' && slug) return `/tarifler/${slug}`;
  if (typeName === 'recipeCategory' && slug) return `/tarifler/kategori/${slug}`;
  if (typeName === 'hizmet' && slug) return `/hizmetler/${slug}`;
  if (typeName === 'danismanlik' && slug) return `/danismanliklar/${slug}`;
  if (typeName === 'about') return '/hakkimda';
  if (typeName === 'contact') return '/iletisim';
  if (typeName === 'calculatorPage' && typeof doc.title === 'string') return `/hesaplamalar/${doc.title}`;
  if (typeName === 'hero' || typeName === 'pageSection' || typeName === 'faq' || typeName === 'testimonial') return '/';
  return null;
}

export function blankDoc(type: ContentType): Doc {
  const doc: Doc = {};
  if (type.name === 'post') doc.publishedAt = new Date().toISOString();
  if (type.name === 'pageSection') doc.backgroundColor = 'white';
  if (type.name === 'siteSettings') doc.title = 'Donusum Hareketi';
  if (type.name === 'about') doc.title = 'Ben Kimim?';
  if (type.name === 'contact') doc.title = 'İletişim';
  return doc;
}

export function validateDoc(type: ContentType, doc: Doc): string | null {
  return validateFields(type.fields, doc);
}

function validateFields(fields: Field[], doc: Doc): string | null {
  for (const field of fields) {
    const value = doc[field.name];
    if (field.type === 'object') {
      const nested = validateFields(field.fields, isDoc(value) ? value : {});
      if (nested) return nested;
      continue;
    }
    if (field.type === 'array') {
      const items = Array.isArray(value) ? value : [];
      for (const item of items) {
        if (!isDoc(item)) continue;
        const nested = validateFields(field.fields, item);
        if (nested) return nested;
      }
      continue;
    }
    if (field.required && !isPresent(field, value)) return `${field.title} zorunlu.`;
    if (field.type === 'text' && field.max && typeof value === 'string' && value.length > field.max) {
      return `${field.title} en fazla ${field.max} karakter olabilir.`;
    }
    if (field.type === 'string' && field.name === 'email' && typeof value === 'string' && value.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Geçerli bir e-posta yaz.';
    }
  }
  return null;
}

function isPresent(field: Field, value: unknown): boolean {
  if (field.type === 'slug') return isDoc(value) && typeof value.current === 'string' && value.current.trim().length > 0;
  if (field.type === 'image') return imageRef(value) !== null;
  if (field.type === 'reference') return isDoc(value) && typeof value._ref === 'string' && value._ref.length > 0;
  if (field.type === 'string' || field.type === 'text' || field.type === 'select' || field.type === 'datetime') {
    return typeof value === 'string' && value.trim().length > 0;
  }
  return true;
}

export function pickFields(fields: Field[], input: unknown): Doc {
  const source = isDoc(input) ? input : {};
  const out: Doc = {};
  for (const field of fields) {
    const cleaned = cleanField(field, source[field.name]);
    if (cleaned !== undefined) out[field.name] = cleaned;
  }
  return out;
}

function cleanField(field: Field, value: unknown): unknown {
  if (field.type === 'string' || field.type === 'text' || field.type === 'datetime' || field.type === 'select') {
    return typeof value === 'string' ? value.trim() : '';
  }
  if (field.type === 'slug') {
    const current = isDoc(value) && typeof value.current === 'string' ? slugify(value.current) : '';
    return { _type: 'slug', current };
  }
  if (field.type === 'image') return cleanImage(value);
  if (field.type === 'reference') {
    if (!isDoc(value) || typeof value._ref !== 'string' || !value._ref) return undefined;
    return { _type: 'reference', _ref: value._ref };
  }
  if (field.type === 'blocks') {
    if (!Array.isArray(value)) return [];
    return value.map(cleanBlock).filter((block) => block !== null);
  }
  if (field.type === 'object') return pickFields(field.fields, value);
  const items = Array.isArray(value) ? value : [];
  return items.filter(isDoc).map((item) => ({
    _key: typeof item._key === 'string' && item._key ? item._key : key(),
    ...pickFields(field.fields, item),
  }));
}

function cleanImage(value: unknown): Doc | undefined {
  const ref = imageRef(value);
  if (!ref || !isDoc(value)) return undefined;
  const image: Doc = { _type: 'image', asset: { _type: 'reference', _ref: ref } };
  if (isDoc(value.hotspot)) image.hotspot = value.hotspot;
  if (isDoc(value.crop)) image.crop = value.crop;
  return image;
}

function cleanBlock(value: unknown): Doc | null {
  if (!isDoc(value)) return null;
  if (value._type === 'image') {
    const ref = imageRef(value);
    if (!ref) return null;
    return {
      _type: 'image',
      _key: typeof value._key === 'string' ? value._key : key(),
      asset: { _type: 'reference', _ref: ref },
    };
  }
  if (value._type !== 'block') return null;
  const children = Array.isArray(value.children)
    ? value.children.filter(isDoc).map((span) => ({
        _type: 'span',
        _key: typeof span._key === 'string' ? span._key : key(),
        text: typeof span.text === 'string' ? span.text : '',
        marks: Array.isArray(span.marks) ? span.marks.filter((mark) => typeof mark === 'string').slice(0, 8) : [],
      }))
    : [];
  const markDefs = Array.isArray(value.markDefs)
    ? value.markDefs.filter(isDoc).flatMap((mark) => {
        if (mark._type !== 'link' || typeof mark._key !== 'string') return [];
        return [{ _key: mark._key, _type: 'link', href: typeof mark.href === 'string' ? mark.href : '' }];
      })
    : [];
  const block: Doc = {
    _type: 'block',
    _key: typeof value._key === 'string' ? value._key : key(),
    style: typeof value.style === 'string' && STYLES.has(value.style) ? value.style : 'normal',
    children: children.length ? children : [{ _type: 'span', _key: key(), text: '', marks: [] }],
    markDefs,
  };
  if (value.listItem === 'bullet') {
    block.listItem = 'bullet';
    block.level = 1;
  }
  return block;
}

export function referenceTypes(fields: Field[], found = new Set<string>()): string[] {
  for (const field of fields) {
    if (field.type === 'reference') found.add(field.to);
    if (field.type === 'object' || field.type === 'array') referenceTypes(field.fields, found);
  }
  return [...found];
}
