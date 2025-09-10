// schemas/danismanlik.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'danismanlik',
  title: 'Danışmanlık Sayfaları',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Danışmanlık Başlığı',
      description: 'Örn: Kilo Verme Danışmanlığı',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Uzantısı (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Sayfa Görseli',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'content',
      title: 'Sayfa İçeriği',
      description: 'Danışmanlık hizmetinin detaylı açıklaması.',
      type: 'blockContent',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})