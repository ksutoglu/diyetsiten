// schemas/faq.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'faq',
  title: 'Sıkça Sorulan Sorular',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Soru',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Cevap',
      type: 'text', // Uzun cevaplar için 'text' tipi daha uygundur
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'question',
    },
  },
})