import {useTranslation} from "react-i18next";
import {ActionIcon, Flex, Tooltip} from "@mantine/core";
import locales from "@/i18n/locales";
import {Flag} from "@/components/i18n/flag.tsx";
import {useEffect, useRef, useState} from "react";
import {Globe} from "react-feather";


type LanguageSelectorProps = {
    className?: string
}

export function LanguageSelector(props: LanguageSelectorProps) {
    const {i18n} = useTranslation()

    const ref = useRef<HTMLDivElement>(null);

    const [hiddenLanguage, setHidden] = useState(true)

    async function handleChangeLanguage(language: string) {
        await i18n.changeLanguage(language)
        setHidden(true)
    }

    const handleClickOutside = (event: MouseEvent) => {
        // Verifica se o clique foi fora do componente
        if (ref.current && !ref.current.contains(event.target as Node)) {
            setHidden(true);
        }
    };


    useEffect(() => {
        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const selectedLanguage = i18n.language

    return <Flex ref={ref} {...props}>
        {hiddenLanguage ?
            <Tooltip label={"Selecionar Idioma"}>
                <ActionIcon onClick={() => setHidden(prev => !prev)}>
                    <Globe/>
                </ActionIcon>
            </Tooltip>
            :


            Object.keys(locales).map((v, i) => {
                return <Flag image={`${String(v).toLowerCase()}.png`} isSelected={selectedLanguage == v}
                             onClick={() => handleChangeLanguage(v)} key={i}/>
            })}
    </Flex>
}