import {Operator} from "@/types/filter-data.ts";
import {isEqual} from "@/lib/values.ts";
import {getValueInPath, isArray} from "@/lib/objects.ts";

export type SearchParams = {
    field: string,
    operator: Operator,
    value: unknown,
}


export interface SearchEngine<T> {
    search(params: SearchParams[], target: T | T[]): Promise<T> | Promise<T[]>;

}


export abstract class AbstractSearchEngine<T> implements SearchEngine<T> {

    abstract search(params: SearchParams[], target: T | T[]):  Promise<T> | Promise<T[]>;


    protected isMatch(searchParams: SearchParams, target: T | T[]): boolean {
        const {field, operator, value} = searchParams;
        if (!field || !operator || !value) {
            return false;
        }
        if (!isArray(target)) {
            const targetValue = getValueInPath(target as never, field) as T;
            // return isEqual(targetValue, value, operator);

            return this.isMath(operator, targetValue, value);
        } else {
            for (const item of target) {
                if (this.isMatch(searchParams, item)) {
                    return true;
                }
            }
        }
        return false;
    }

    protected isAllMatch(searchParams: SearchParams[], target: T | T[]): boolean {
        for (const item of searchParams) {
            if (!this.isMatch(item, target)) {
                return false;
            }
        }
        return true;
    }

    private isMath(operator: Operator, targetValue: T, value: unknown) {
        switch (operator) {
            case Operator.EQUAL:
                return isEqual(targetValue, value);
            case Operator.LESS_THEN:
                return false
            // return targetValue < value;
            case Operator.DIFFERENT:
                return !isEqual(targetValue, value);
            default:
                throw new Error(`Invalid operator: ${operator}`);
        }
    }


}