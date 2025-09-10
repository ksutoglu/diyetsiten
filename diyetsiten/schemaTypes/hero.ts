// schemas/hero.ts
import {defineField, defineType} from 'sanity'
export default defineType({
  name: 'hero',
  title: 'Ana Sayfa Hero Alanı',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Ana Başlık', type: 'string' }),
    defineField({ name: 'subtitle', title: 'Alt Başlık', type: 'text', rows: 3 }),
    defineField({ name: 'mainImage', title: 'Ana Görsel', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'actions', title: 'Butonlar', type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'text', title: 'Buton Metni', type: 'string'}),
          defineField({name: 'href', title: 'Buton Linki', type: 'string'}),
          defineField({ name: 'variant', title: 'Buton Tipi', type: 'string',
            options: { list: [ {title: 'Ana Buton (Primary)', value: 'primary'}, {title: 'İkincil Buton (Secondary)', value: 'secondary'} ] }
          }),
        ]
      }]
    }),
  ],
})