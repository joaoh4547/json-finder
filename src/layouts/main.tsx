import {Outlet, useLocation} from "react-router-dom";
import {SideBar} from "@/layouts/SideBar.tsx";
import {useTitle} from "@/hooks/useTitle.ts";
import {rotes} from "@/lib/utils.tsx";
import {Box, Container, Flex} from "@radix-ui/themes";

export function RootLayout() {

    const location = useLocation()

    console.log(location.pathname) // prints current route path

    useTitle(rotes[location.pathname].title)

    return <Flex height="100vh">
        <Box className="w-1/6 h-full  bg-zinc-50 border-r">
            <SideBar/>
        </Box>
        <Box className="p-5 flex-1 flex-col">
            <Box>
                <h1 className="font-medium text-2xl">{rotes[location.pathname].title}</h1>
                <h2 className="font-light">{rotes[location.pathname].description}</h2>
            </Box>
            <Container>
                <Outlet/>
            </Container>
        </Box>
    </Flex>
}