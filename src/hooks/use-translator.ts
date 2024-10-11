import {useTranslation} from "react-i18next";
import {TranslationKeys} from "@/i18n/locales/tranlation.ts";


type TranslateParams = {
    [key: string]: string | number | undefined; // pode incluir strings, números ou undefined
};


export function useTranslator() {
    const {t} = useTranslation()

    function translate(key: TranslationKeys | string, params?: TranslateParams) {
        return t(key, params)
    }

    return {translate}
}