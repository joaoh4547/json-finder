import {ReactElement} from "react";
import {Code} from "react-feather";

type RouteInfo = {
    title: string;
    description: string;
    icon?: ReactElement,
    titleIcon?: ReactElement,
    isRoot?: boolean
}

// Criando o objeto com chave 'string' e valor do tipo 'RouteInfo'
export const routes: { [key: string]: RouteInfo } = {
    '/': {
        title: 'Filtragem JSON',
        description: 'Realiza a filtragem de dados de arquivo JSON',
        icon: <Code/>,
        titleIcon: <Code/>
    }
};
