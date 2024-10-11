import {useEffect, useState} from "react";

export function useTitle(initialTitle?: string) {
    const [title, setTitle] = useState<string>(initialTitle || "");

    const updateTitle = (newTitle: string) => {
        setTitle(newTitle);
    }

    useEffect(() => {
        document.title = title;
    }, [title]);

    return [updateTitle]
}