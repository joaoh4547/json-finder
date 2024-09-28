import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {Code} from 'react-feather'
import {ReactElement} from "react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

type RouteInfo = {
    title: string;
    description: string;
    icon?: ReactElement,
    titleIcon?: ReactElement,
    isRoot?: boolean
}

// Criando o objeto com chave 'string' e valor do tipo 'RouteInfo'
export const rotes: { [key: string]: RouteInfo } = {
    '/': {
        title: 'Filtragem JSON',
        description: 'Realiza a filtrage de dados de arquivo JSON',
        icon: <Code/>,
        titleIcon: <Code/>
    }
};

