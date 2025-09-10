// schemas/post.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Yazıları',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Başlık',
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
      name: 'excerpt',
      title: 'Özet',
      description: 'Yazının blog listeleme sayfasında görünecek kısa özeti.',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Kapak Fotoğrafı',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Yayınlanma Tarihi',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'İçerik',
      type: 'blockContent', // Bu bizim daha önce kullandığımız zengin metin editörüdür
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})