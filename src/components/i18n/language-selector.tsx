import {useTranslation} from "react-i18next";
import {ActionIcon, Flex, Tooltip} from "@mantine/core";
import locales from "@/i18n/locales";
import {Flag} from "@/components/i18n/flag.tsx";
import {useState} from "react";
import {Globe} from "react-feather";


type LanguageSelectorProps = {
    className?: string
}

export function LanguageSelector(props: LanguageSelectorProps) {
    const {i18n} = useTranslation()

    const [hiddenLanguage, setHidden] = useState(true)

    async function handleChangeLanguage(language: string) {
        await i18n.changeLanguage(language)
        setHidden(true)
    }

    const selectedLanguage = i18n.language

    return <Flex {...props}>
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