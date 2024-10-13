import {useTranslation} from "react-i18next";
import {ActionIcon, Flex, Tooltip} from "@mantine/core";
import locales from "@/i18n/locales";
import {Flag} from "@/components/i18n/flag.tsx";
import {useEffect, useRef, useState} from "react";
import {Globe} from "react-feather";
import {useTranslator} from "@/hooks/use-translator.ts";


type LanguageSelectorProps = {
    className?: string
}

const languageColor = {
    "en-US": "blue",
    "pt-BR": "green"
}

export function LanguageSelector(props: LanguageSelectorProps) {
    const {i18n} = useTranslation()
    const {translate} = useTranslator()

    const ref = useRef<HTMLDivElement>(null);

    const [hiddenLanguage, setHidden] = useState(true)

    async function handleChangeLanguage(language: string) {
        await i18n.changeLanguage(language)
        setHidden(true)
    }

    const handleClickOutside = (event: MouseEvent) => {
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
        {hiddenLanguage ? <Tooltip label={translate('select_lang')}>
                <ActionIcon onClick={() => setHidden(prev => !prev)} size="lg"
                            color={languageColor[selectedLanguage as 'pt-BR' | 'en-US']}>
                    <Globe/>
                </ActionIcon>
            </Tooltip>
            : Object.keys(locales).map((v, i) => {
                return <Flag image={`${String(v).toLowerCase()}.png`} isSelected={selectedLanguage == v}
                             onClick={() => handleChangeLanguage(v)} key={i}/>
            })
        }
    </Flex>
}