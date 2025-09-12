import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

import type { Props as HeaderProps } from '~/components/widgets/Header.astro';
import { client } from '~/lib/sanity';

export const getHeaderData = async (): Promise<HeaderProps> => {
  const staticLinks = [
    { text: 'Anasayfa', href: getPermalink('/') },
    {
      text: 'Ben Kimim?',
      links: [
        { text: 'Hakkımda', href: getPermalink('/hakkimda') },
        { text: 'Danışan Yorumları', href: getPermalink('/danisan-yorumlari') },
      ],
    },
    {
      text: 'Beslenme Danışmanlığı',
      links: [], // Burayı Sanity'den gelenlerle dolduracağız
    },
    { text: 'Tarifler', links: []  },
    { text: 'Blog', href: getBlogPermalink() },
    { text: 'Hesaplamalar', links: [] },
    //{ text: 'İletişim', href: getPermalink('/iletisim') },
  ];
  const calculatorPages = await client.fetch(`*[_type == "calculatorPage"]{pageTitle, "slug": title} | order(pageTitle asc)`);
  const recipeCategories = await client.fetch(`*[_type == "recipeCategory"]{title, "slug": slug.current} | order(title asc)`); // YENİ: Tarif kategorilerini çekiyoruz
  const danismanlikPages = await client.fetch(`*[_type == "danismanlik"]{title, "slug": slug.current} | order(title asc)`);
  
  
  const danismanlikLinks = danismanlikPages.map(page => ({
    text: page.title,
    href: getPermalink(`/danismanliklar/${page.slug}`),
  }));
  const recipeCategoryLinks = recipeCategories.map(category => ({
      text: category.title,
      href: getPermalink(`/tarifler/kategori/${category.slug}`),
  }));
  recipeCategoryLinks.unshift({ text: 'Tüm Tarifler', href: getPermalink('/tarifler') });
  const calculatorLinks = calculatorPages.map(page => ({
    text: page.pageTitle,
    href: getPermalink(`/hesaplamalar/${page.slug}`),
  }));
  const danismanlikMenu = staticLinks.find(link => link.text === 'Beslenme Danışmanlığı');
  if (danismanlikMenu) {
    danismanlikMenu.links = danismanlikLinks;
  }
  const recipeMenu = staticLinks.find(link => link.text === 'Tarifler');
  if (recipeMenu) {
    recipeMenu.links = recipeCategoryLinks;
  }
  const calculatorMenu = staticLinks.find(link => link.text === 'Hesaplamalar');
  if (calculatorMenu) {
    calculatorMenu.links = calculatorLinks;
  }
  

  return {
      isSticky: true,
      showToggleTheme: true,
      links: staticLinks,
      actions: [{ text: 'Randevu Al', href: getPermalink('/iletisim'), variant: 'primary' }],
    };
};



export const footerData = {
  // Footer'daki link sütunları
  links: [
    {
      title: 'Hızlı Erişim',
      links: [
        { text: 'Hakkımda', href: getPermalink('/hakkimda') },
        { text: 'Danışan Yorumları', href: getPermalink('/danisan-yorumlari') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'İletişim', href: getPermalink('/iletisim') },
      ],
    },
    {
      title: 'Temel Hizmetler',
      links: [
        { text: 'Kilo Verme Danışmanlığı', href: getPermalink('/danismanlik/kilo-verme') },
        { text: 'Kilo Alma Danışmanlığı', href: getPermalink('/danismanlik/kilo-alma') },
        { text: 'Hastalıklarda Beslenme', href: getPermalink('/danismanlik/hastaliklarda-beslenme') },
        { text: 'Gebelikte Beslenme', href: getPermalink('/danismanlik/gebelikte-beslenme') },
      ],
    },
    {
      title: 'Faydalı Araçlar',
      links: [
        { text: 'BKİ Hesaplama', href: getPermalink('/hesaplamalar/bki-hesaplama') },
        { text: 'Günlük Su İhtiyacı', href: getPermalink('/hesaplamalar/gunluk-su-ihtiyaci') },
        { text: 'Tüm Tarifler', href: getPermalink('/tarifler') }, // Bu sayfayı daha sonra oluşturabiliriz
      ],
    },
  ],

  // Alttaki 'Gizlilik Politikası' gibi linkler. Şimdilik boş kalabilir.
  secondaryLinks: [],

  // Sosyal Medya ikonları ve linkleri
  socialLinks: [
    // Kendi sosyal medya linklerini # yerine yapıştır
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
    // İstersen WhatsApp linki de ekleyebiliriz:
    // { ariaLabel: 'WhatsApp', icon: 'tabler:brand-whatsapp', href: 'https://wa.me/905xxxxxxxxx' },
  ],

  // En alttaki telif hakkı notu
  footNote: `
    Tüm Hakları Saklıdır © ${new Date().getFullYear()} · Feyza Subaşı
  `,
};