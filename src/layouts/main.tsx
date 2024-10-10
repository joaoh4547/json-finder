import {Outlet, useLocation} from "react-router-dom";
// import {SideBar} from "@/layouts/SideBar.tsx";
import {useTitle} from "@/hooks/useTitle.ts";
import {rotes} from "@/lib/utils.tsx";
import {Flex} from "@mantine/core";
import {SideBar} from "@/layouts/SideBar.tsx";

export function RootLayout() {

    const location = useLocation()

    console.log(location.pathname) // prints current route path

    useTitle(rotes[location.pathname].title)

    return <Flex h="100vh" w="100vw">
        <Flex className="w-[250px] h-full mx-1 bg-zinc-50 border-r border-purple-300">
            <SideBar/>
        </Flex>
        <Flex className="p-5 flex-col w-full">
            <Flex direction="column">
                <h1 className="font-medium text-2xl">{rotes[location.pathname].title}</h1>
                <h2 className="font-light">{rotes[location.pathname].description}</h2>
            </Flex>
            <Flex w="100%" direction="column">
                <Outlet/>
            </Flex>
        </Flex>
    </Flex>
}