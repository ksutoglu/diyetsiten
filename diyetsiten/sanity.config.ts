// sanity.config.ts

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Sadece kalan şemalarımızı import ediyoruz
import {schemaTypes} from './schemaTypes' 

export default defineConfig({
  name: 'default',
  title: 'Diyetisyen Sitesi İçerik Paneli', // Müşterinizin göreceği başlık

  projectId: '9a4tp2sj', // BU SİZİN PROJE ID'NİZ, DEĞİŞTİRMEYİN
  dataset: 'production', // BU DA DATASET ADINIZ, DEĞİŞTİRMEYİN
  studio: {
    basePath: '/studio',   // <-- kritik
  },
  plugins: [
      structureTool({
          structure: (S) =>
              S.list()
                  .title('İçerik')
                  .items([
                      S.listItem()
                          .title('Genel Site Ayarları')
                          .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
                      S.listItem() // YENİ: Bu bloğu ekleyin
                          .title('Ana Sayfa Hero Alanı')
                          .child(S.document().schemaType('hero').documentId('hero')),
                      S.divider(),
                      ...S.documentTypeListItems().filter(listItem => !['siteSettings', 'hero'].includes(listItem.getId()!))
                  ])
      }),
      visionTool()
  ],



  schema: {
    types: schemaTypes,
  },
})