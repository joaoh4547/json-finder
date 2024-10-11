type  Translations = {
    'filter-json.title': string,
    'filter-json.description': string,
    'details.title': string,
    'process.label': string,
    'add-item.label': string
    'json-file.label': string,
    'field-name.label': string,
    'operator.label': string
    'value.label': string
    'remove.label': string,
    'fields-to-filter.label': string,
    'select-file.label': string,
    'field-required.message': string
    'operator-required.message': string
    'value-required.message': string
    'json-file.size-max.message': string,
}

export type TranslationKeys = keyof Translations;


type Translation = {
    translations: Translations
}


export type {Translation}

