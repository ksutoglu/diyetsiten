// schemas/recipe.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'recipe',
  title: 'Tarifler',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tarif Adı',
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
      title: 'Tarif Fotoğrafı',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'category',
        title: 'Kategori',
        type: 'reference',
        to: {type: 'recipeCategory'},
        validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'summary',
        title: 'Özet',
        description: 'Tarifin listeleme sayfasında görünecek kısa ve çekici bir açıklama.',
        type: 'text',
        rows: 3,
        validation: (Rule) => Rule.required().max(250),
    }),
    defineField({
      name: 'ingredients',
      title: 'Malzemeler',
      description: 'Her bir malzemeyi yeni bir satıra yazın.',
      type: 'text',
      rows: 10,
    }),
    defineField({
      name: 'instructions',
      title: 'Hazırlanışı',
      description: 'Tarifin hazırlanış adımlarını detaylıca açıklayın.',
      type: 'blockContent', // Zengin metin editörümüz
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
})