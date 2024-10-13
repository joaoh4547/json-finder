const filter_json_title = "filter_json_title"
const filter_json_description = "filter_json_description"
const details_title = "details_title";
const process_label = "process_label";
const add_item_label = "add_item_label";
const json_file_label = "json_file_label";
const json_file_required = "json_file_required";
const field_name_label = "field_name_label";
const operator_label = "operator_label";
const value_label = "value_label";
const remove_label = "remove_label";
const fields_to_filter_label = "fields_to_filter_label";
const select_file_label = "select_file_label";
const field_required_message = "field_required_message";
const operator_required_message = "operator_required_message";
const value_required_message = "value_required_message";
const json_file_size_max_message = "json_file_size_max_message";
const equal_label = "equal_label";
const different_label = "different_label";
const greater_than_label = "greater_than_label";
const less_than_label = "less_than_label";
const select_lang = "select_lang";


export const messages = {
    filter_json_title,
    filter_json_description,
    details_title,
    process_label,
    add_item_label,
    json_file_label,
    json_file_required,
    field_name_label,
    operator_label,
    value_label,
    remove_label,
    fields_to_filter_label,
    select_file_label,
    field_required_message,
    operator_required_message,
    value_required_message,
    json_file_size_max_message,
    equal_label,
    different_label,
    greater_than_label,
    less_than_label,
    select_lang,

} as const

type MessagesKeys = keyof typeof messages


type  Translations = {
    [key in MessagesKeys]: string
}


export type TranslationKeys = keyof Translations;


type Translation = {
    translations: Translations
}


export type {Translation}

