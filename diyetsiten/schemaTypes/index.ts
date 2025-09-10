// schemas/index.ts

import blockContent from './blockContent'
import hizmet from './hizmet' // YENİ: hizmet.ts dosyasını import et
import post from './post'
import faq from './faq'
import about from './about'
import recipe from './recipe'
import recipeCategory from './recipeCategory'
import contact from './contact' 
import siteSettings from './siteSettings'
import testimonial from './testimonial'
import danismanlik from './danismanlik'
import hero from './hero'
import calculatorPage from './calculatorPage' 

export const schemaTypes = [
    hero,
    post,
    hizmet, 
    faq,
    about,
    recipe,
    recipeCategory,
    contact,
    siteSettings,
    testimonial,
    danismanlik,
    calculatorPage,
    blockContent
]