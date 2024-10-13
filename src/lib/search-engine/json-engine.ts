import {AbstractSearchEngine, SearchParams} from "@/types/search-engine.ts";
import {isArray} from "@/lib/objects.ts";


export class JsonSearchEngine<T> extends AbstractSearchEngine<T> {

    search(params: SearchParams[], target: T[] | T): T[] | T {
        if (isArray(target)) {
            return target.filter(obj => this.isAllMatch(params, obj));
        } else if (this.isAllMatch(params, target)) {
            return target;
        }
        return {} as T
    }

}