import {ReactNode} from "react";
import {cn} from "@/lib/utils.tsx";

type PanelProps = {
    title: string;
    children?: ReactNode,
    className?: string;
}

export function Panel({title, children, className}: PanelProps) {
    return <fieldset className={cn('border border-solid border-gray-300 py-0 px-2 pb-2 rounded w-full flex', className)}>
        <legend className="text-lg font-medium max-w-full relative m-auto px-7">{title}</legend>
        {children}
    </fieldset>
}