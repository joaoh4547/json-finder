import {cn} from "@/lib/utils.tsx";

type FlagProps = {
    className?: string
    image: string
    isSelected: boolean
    onClick?: () => void

}

export function Flag({className, image, isSelected, ...props}: FlagProps) {
    return <img
        className={cn(`h-10 w-10 object-contain cursor-pointer m-3
         ${isSelected ? 'grayscale-0 hover:grayscale-0' : 'grayscale-[1] ' +
            'hover:grayscale-[0.5] '}`, className)}
        src={image} alt="Flag" onClick={props.onClick}/>
}
