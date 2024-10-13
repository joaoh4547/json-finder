import {Outlet, useLocation} from "react-router-dom";
import {SideBar} from "@/layouts/SideBar.tsx";
import {useTitle} from "@/hooks/use-title.ts";
import {routes} from "@/lib/routes.tsx";
import {Flex} from "@mantine/core";
import {useTranslator} from "@/hooks/use-translator.ts";
import {LanguageSelector} from "@/components/i18n/language-selector.tsx";
import {useEffect} from "react";
export function RootLayout() {

    const location = useLocation()

    const [setTitle] = useTitle()

    const {translate} = useTranslator()

    useEffect(() => {
        setTitle(translate(routes[location.pathname].title))
    }, [translate, location.pathname, setTitle])

    return <Flex h="100vh" w="100vw" className="overflow-x-hidden">
        <Flex className="absolute top-5 right-5">
            <LanguageSelector className="z-10 bg-white rounded shadow shadow-purple-300 drop-shadow-2xl"/>
        </Flex>
        <Flex className="w-[250px] h-full mx-1 bg-zinc-50 border-r border-purple-300">
            <SideBar/>
        </Flex>
        <Flex className="p-5 flex-col w-full">
            <Flex direction="column">
                <h1 className="font-medium text-2xl">{translate(rotes[location.pathname].title)}</h1>
                <h2 className="font-light">{translate(rotes[location.pathname].description)}</h2>
            </Flex>
            <Flex w="100%" direction="column">
                <Outlet/>
            </Flex>
        </Flex>
    </Flex>
}