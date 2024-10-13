import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
// import {Code} from 'react-feather'
import {ReactElement} from "react";
import {Code} from "react-feather";
import {TranslationKeys} from "@/i18n/locales/tranlation.ts";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type RouteInfo = {
    title: TranslationKeys | string;
    description: TranslationKeys | string;
    icon?: ReactElement,
    titleIcon?: ReactElement,
    isRoot?: boolean
}
//
// Criando o objeto com chave 'string' e valor do tipo 'RouteInfo'
export const rotes: { [key: string]: RouteInfo } = {
    '/': {
        title: 'filter_json_title',
        description: 'filter_json_description',
        icon: <Code/>,
        titleIcon: <Code/>
    }
};

