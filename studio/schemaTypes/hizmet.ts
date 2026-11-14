// schemas/hizmet.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'hizmet', // Bu isim API'lerde kullanılacak, küçük harf ve bitişik olmalı
  title: 'Hizmetler', // Bu isim admin panelinde görünecek
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Hizmet Başlığı',
      type: 'string',
      validation: (Rule) => Rule.required().error('Hizmet başlığı zorunludur.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL Uzantısı (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description: 'Her hizmet için benzersiz olmalı. "Generate" butonu ile baştan oluşturulabilir.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'kisaAciklama',
        title: 'Kısa Açıklama',
        type: 'text',
        rows: 3,
        description: 'Ana sayfadaki hizmetler bölümünde görünecek özet metin.',
        validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'icon',
      title: 'İkon Adı',
      type: 'string',
      description: 'Hizmetin ana sayfada görünecek ikonu. İkon isimlerini https://icones.js.org/collection/tabler adresinden bulabilirsiniz. Chatgpt gibi yapay zekalardanda ana başlığınızı yazarak \'Bana uygun bir tabler iconu ver\' ikon bulabilirsiniz. Örnek: tabler:rocket',
    }),

    defineField({
      name: 'anaGorsel',
      title: 'Ana Görsel',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'detayliAciklama',
      title: 'Detaylı Açıklama',
      description: 'Hizmetin kendi sayfasında görünecek olan tüm detaylar.',
      type: 'blockContent', // Bu bizim daha önce silmediğimiz blockContent.ts'den geliyor
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'anaGorsel',
    },
  },
})