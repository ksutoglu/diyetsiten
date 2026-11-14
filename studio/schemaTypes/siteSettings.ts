// schemas/siteSettings.ts

import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Genel Site Ayarları',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Adı',
      type: 'string',
      initialValue: 'Donusum Hareketi',
    }),
    defineField({
        name: 'footerText',
        title: 'Footer Metni',
        description: 'Sitenin en altındaki telif hakkı vb. metin.',
        type: 'string',
    }),
    defineField({
      name: 'philosophyNote',
      title: 'Ana Sayfa Felsefe Notu',
      description: 'Hero bölümünün altında görünen küçük not alanı.',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Başlık (örn: Felsefem:)',
          type: 'string',
        }),
        defineField({
          name: 'description',
          title: 'Açıklama',
          type: 'text',
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Sosyal Medya Linkleri',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          {name: 'platform', title: 'Platform', type: 'string', options: {
            list: ['instagram', 'facebook', 'twitter', 'linkedin']
          }},
          {name: 'url', title: 'URL', type: 'url'}
        ]
      }]
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Link Sütunları',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({name: 'title', title: 'Sütun Başlığı', type: 'string'}),
          defineField({
            name: 'links', 
            title: 'Linkler', 
            type: 'array', 
            of: [{
              type: 'object',
              fields: [
                {name: 'text', title: 'Link Metni', type: 'string'},
                {name: 'href', title: 'Link Adresi', type: 'string'}
              ]
            }]
          })
        ]
      }]
    }),

  ],
})