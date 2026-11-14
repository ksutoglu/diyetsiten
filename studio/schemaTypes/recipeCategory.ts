// schemas/recipeCategory.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'recipeCategory',
  title: 'Tarif Kategorileri',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Kategori Adı',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'URL Uzantısı (Slug)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
  ],
})