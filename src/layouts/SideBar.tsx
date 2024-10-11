import {Link, useLocation} from "react-router-dom";
import {rotes} from "@/lib/utils.tsx";
import {useTranslator} from "@/hooks/use-translator.ts";

export function SideBar() {

    const location = useLocation()

    const {translate} = useTranslator()


    const makeLinks = () => {

        const keys: string[] = Object.keys(rotes)
        return keys.map((route) => (
            <li key={route}
                className={`${String(location.pathname).toLowerCase() == route ? 'bg-purple-600' : 'bg-purple-500'} 
                     transition-colors ease-in-out cursor-pointer
                     py-3 px-3 mt-3 my-1 rounded-lg hover:bg-purple-700 w-full
                     text-white
                     active:bg-purple-500`}>
                <Link to={route} className="flex w-full justify-between">
                    {translate(rotes[route].title)} {rotes[route].icon}
                </Link>
            </li>
        ))
    }

    return <aside className="w-full mx-1">
        <nav className="flex flex-col w-full ">
            <ul className="flex flex-col w-full justify-center ">
                {
                    makeLinks()
                }
            </ul>
        </nav>
    </aside>
}

