import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'pageSection',
  title: 'Ana Sayfa İçerik Bölümleri',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Bölüm Başlığı (Panel için)',
      description: 'Bu başlık sadece Sanity panelinde bölümü tanımanıza yardımcı olur.',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'identifier',
      title: 'Bölüm ID (Tekil Olmalı)',
      description: 'Sayfa içi linkler için kullanılır (örn: hakkimizda, hizmet-sureci).',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Arka Plan Rengi',
      type: 'string',
      options: {
        list: [
          {title: 'Beyaz', value: 'white'},
          {title: 'Açık Mavi (Tema Rengi)', value: 'light'},
        ],
        layout: 'radio',
      },
      initialValue: 'white',
    }),
    
    // --- BÖLÜM TİPİ 1: Resim ve Maddeler ---
    defineField({
        name: 'contentWithImage',
        title: 'Tip 1: Yan Yana Resim ve Metin',
        description: 'Bu bölüm tipini kullanmak için burayı doldurun.',
        type: 'object',
        collapsible: true,
        collapsed: true,
        fields: [
            defineField({ name: 'mainTitle', title: 'Ana Başlık', type: 'string' }),
            defineField({ name: 'description', title: 'Açıklama', type: 'text' }),
            defineField({
                name: 'featureList',
                title: 'Maddeler (Yanında Tik Olan)',
                type: 'array',
                of: [{
                    type: 'object',
                    fields: [
                        {name: 'title', title: 'Madde Başlığı', type: 'string'},
                        {name: 'description', title: 'Madde Açıklaması', type: 'text'}
                    ]
                }]
            }),
            defineField({ name: 'image', title: 'Görsel', type: 'image' }),
            defineField({
                name: 'imagePosition',
                title: 'Görselin Konumu',
                type: 'string',
                options: {
                    list: [{title: 'Sağda', value: 'right'}, {title: 'Solda', value: 'left'}],
                    layout: 'radio'
                },
                initialValue: 'right',
            })
        ],
    }),

  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'identifier.current'
    }
  }
})

