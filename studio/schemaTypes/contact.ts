// schemas/contact.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'contact',
  title: 'İletişim Sayfası',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Sayfa Başlığı',
      type: 'string',
      initialValue: 'İletişim',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
        name: 'intro',
        title: 'Giriş Metni',
        description: 'İletişim formunun veya bilgilerinin üzerinde görünecek kısa bir karşılama metni.',
        type: 'text',
        rows: 3,
    }),
    defineField({
      name: 'email',
      title: 'E-posta Adresi',
      type: 'string',
      validation: (Rule) => Rule.email().error('Lütfen geçerli bir e-posta adresi girin.'),
    }),
    defineField({
        name: 'phone',
        title: 'Telefon Numarası',
        type: 'string',
    }),
    defineField({
        name: 'address',
        title: 'Adres',
        type: 'text',
        rows: 4,
    }),
  ],
})