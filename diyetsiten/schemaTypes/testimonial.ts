// schemas/testimonial.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Müşteri Yorumları',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Adı Soyadı',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'title',
        title: 'Unvan/Tanım',
        description: 'Örn: Online Danışan, Sporcu',
        type: 'string',
    }),
    defineField({
      name: 'quote',
      title: 'Yorum Metni',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Fotoğraf',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'image',
    },
  },
})