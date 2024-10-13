import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import {initReactI18next} from 'react-i18next'
import translations from './locales'

const i18nConfig = {
    resources: translations,  // resources são as nossas traduções
    fallbackLng: 'pt-BR',     // fallbackLng é o idioma padrão caso o browser não consiga detectar sozinho
    defaultNS: 'translations' // defaultNS é o namespace padrão, podemos usar 'translations'
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nConfig)

export default i18n