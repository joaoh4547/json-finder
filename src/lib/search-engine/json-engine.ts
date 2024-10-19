import {AbstractSearchEngine, SearchParams} from "@/types/search-engine.ts";
import {isArray} from "@/lib/objects.ts";


export class JsonSearchEngine<T> extends AbstractSearchEngine<T> {

    search(params: SearchParams[], target: T[] | T): Promise<T> | Promise<T[]> {
        let promise: Promise<T> | Promise<T[]>
        if (!isArray(target)) {
            promise = new Promise<T>((resolve) => {
                if (this.isAllMatch(params, target)) {
                    resolve(target);
                }
                resolve({} as T)
            })
        } else {
            promise = new Promise<T[]>((resolve) => {
                resolve(target.map((item) =>  this.search(params, item).then( x => x)) as T[])
            })
        }
        return promise
    }

}