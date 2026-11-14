// schemas/calculatorPage.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'calculatorPage',
  title: 'Hesaplama Sayfaları İçerikleri',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Hesaplama Aracı',
      description: 'İçeriğini düzenlemek istediğiniz hesaplama aracını seçin.',
      type: 'string',
      options: {
        list: [
          { title: 'Vücut Kitle İndeksi (BKİ) Hesaplama', value: 'bki-hesaplama' },
          { title: 'Günlük Su İhtiyacı Hesaplama', value: 'gunluk-su-ihtiyaci' },
          { title: 'İnsülin Direnci (HOMA-IR) Hesaplama', value: 'insulin-direnci' },
        ],
        layout: 'radio', // Daha kullanıcı dostu bir görünüm için
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'pageTitle',
      title: 'Sayfa Başlığı',
      description: 'Sayfada görünecek ana başlık. Genellikle yukarıdakiyle aynı olur.',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'URL Uzantısı (Bu alan otomatik dolacak)',
      type: 'slug',
      options: {
        source: 'title',
      },
      // Bu alanı müşteriden gizliyoruz, çünkü sabit olmalı
      hidden: true,
    }),
    defineField({
      name: 'mainImage',
      title: 'Sayfa Görseli',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'content',
      title: 'Hesaplama Aracı Altındaki Açıklama',
      description: 'Hesaplama formunun altında görünecek olan bilgilendirici metin.',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'pageTitle',
      media: 'mainImage'
    },
  },
})