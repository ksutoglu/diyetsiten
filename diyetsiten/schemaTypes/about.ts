// schemas/about.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'about',
  title: 'Ben Kimim? Sayfası',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sayfa Başlığı',
      type: 'string',
      initialValue: 'Ben Kimim?',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profileImage',
      title: 'Profil Fotoğrafı',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Sayfa İçeriği',
      description: 'Kendinizi tanıttığınız ana metin alanı.',
      type: 'blockContent', // Zengin metin editörümüz
    }),
  ],
})