import {Link, useLocation} from "react-router-dom";
import {rotes} from "@/lib/utils.tsx";

export function SideBar() {

    const location = useLocation()
    const makeLinks = () => {

        const keys: string[] = Object.keys(rotes)
        return keys.map((route) => (
            <li key={route}
                className={`${String(location.pathname).toLowerCase() == route ? 'bg-zinc-300' : 'bg-zinc-900'} 
                     transition-colors ease-in-out cursor-pointer
                     py-3 px-3 mt-3 my-1 mx-2 rounded-lg hover:bg-zinc-200 
                     active:bg-zinc-500`}>
                <Link to={route} className="flex justify-between">
                    {rotes[route].title} {rotes[route].icon}
                </Link>
            </li>
        ))
    }

    return <aside>
        <nav className="flex flex-col">
            <ul className="flex flex-col w-full">
                {
                    makeLinks()
                }
            </ul>
        </nav>
    </aside>
}

