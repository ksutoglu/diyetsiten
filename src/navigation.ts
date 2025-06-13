import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

import type { Props as HeaderProps } from '~/components/widgets/Header.astro';

export const headerData: HeaderProps = {
  isSticky: true,
  showToggleTheme: true, // Tekrar görünür yaptık, istersen 'false' yapabilirsin.
  showRssFeed: false,
  
  links: [
    {
      text: 'Anasayfa',
      href: getPermalink('/'),
    },
    {
      text: 'Ben Kimim?',
      links: [
        { text: 'Hakkımda', href: getPermalink('/hakkimda') },
        { text: 'Danışan Yorumları', href: getPermalink('/danisan-yorumlari') },
      ],
    },
    {
      text: 'Beslenme Danışmanlığı',
      links: [
        { text: 'Kilo Alma', href: getPermalink('/danismanlik/kilo-alma') },
        { text: 'Kilo Verme', href: getPermalink('/danismanlik/kilo-verme') },
        { text: 'Kilo Koruma', href: getPermalink('/danismanlik/kilo-koruma') },
        { text: 'Hastalıklarda Beslenme', href: getPermalink('/danismanlik/hastaliklarda-beslenme') },
        { text: 'Gebelikte Beslenme', href: getPermalink('/danismanlik/gebelikte-beslenme') },
      ],
    },
    {
      text: 'Tarifler',
      links: [
        { text: 'Tüm Tarifler', href: getPermalink('/tarifler') }, // Bu ana tarifler sayfası
        { text: 'Ana Yemek', href: getPermalink('ana-yemek', 'tag') },
        { text: 'Ara Öğün', href: getPermalink('ara-ogun', 'tag') },
        { text: 'İçecek', href: getPermalink('icecek', 'tag') },
        { text: 'Kahvaltı', href: getPermalink('kahvalti', 'tag') },
        { text: 'Tatlı', href: getPermalink('tatli', 'tag') },
      ],
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Hesaplamalar',
      links: [
        { text: 'BKİ Hesaplama', href: getPermalink('/hesaplamalar/bki-hesaplama') },
        { text: 'Günlük Su İhtiyacı', href: getPermalink('/hesaplamalar/gunluk-su-ihtiyaci') },
        { text: 'İnsülin Direnci Hesaplama', href: getPermalink('/hesaplamalar/insulin-direnci') }, // EKLENEN SATIR
      ],
    },
    {
      text: 'İletişim',
      href: getPermalink('/iletisim'),
    },
  ],
  
  actions: [{ text: 'Randevu Al', href: getPermalink('/iletisim'), variant: 'primary' }],
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