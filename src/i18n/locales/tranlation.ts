type  Translations = {
    'filter-json.title': string,
    'filter-json.description': string
}

export type TranslationKeys = keyof Translations;


type Translation = {
    translations: Translations
}


export type {Translation}

