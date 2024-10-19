import {ReactElement} from "react";
import {Code} from "react-feather";
import {TranslationKeys} from "@/i18n/locales/tranlation.ts";

type RouteInfo = {
    title: TranslationKeys | string;
    description: TranslationKeys | string;
    icon?: ReactElement,
    titleIcon?: ReactElement,
    isRoot?: boolean
}
//
// Criando o objeto com chave 'string' e valor do tipo 'RouteInfo'
export const routes: { [key: string]: RouteInfo } = {
    '/': {
        title: 'filter_json_title',
        description: 'filter_json_description',
        icon: <Code/>,
        titleIcon: <Code/>
    }
};


