// src/lib/sanity.ts

import { useSanityClient } from "astro-sanity";

// Sanity'den görselleri çekmek için bir yardımcı fonksiyon
import imageUrlBuilder from "@sanity/image-url";

// Proje bilgilerimizle Sanity client'ını oluşturuyoruz
export const client = useSanityClient();

// Sanity'deki görselleri kullanabileceğimiz URL'lere çeviren builder'ı kuruyoruz
const builder = imageUrlBuilder(client);

// Bu fonksiyonu sitemizde görselleri göstermek için kullanacağız
export function urlFor(source: any) {
  return builder.image(source);
}