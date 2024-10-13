import {getKeys, isArray} from "@/lib/objects.ts";

function isEqual(a: unknown, b: unknown): boolean {
    // Se os valores são diferentes, retorna false
    if (a !== b) return false;

    // Se os valores são objetos, verifica se são iguais
    if (typeof a === 'object' && a !== null) {
        if (isArray(a) && isArray(b)) {
            // Se os arrays têm o mesmo comprimento e todos os elementos são iguais, retorna true
            if (a.length !== b.length) return false;
            return a.every((value, index) => isEqual(value, b[index]));
        } else if (a instanceof Date && b instanceof Date) {
            // Se os objetos são instâncias de Date e têm os valores iguais, retorna true
            return a.getTime() === b.getTime();
        } else {
            // Se os objetos têm chaves iguais e todos os valores são iguais, retorna
            const keysA = getKeys(a as never)
            const keysB = getKeys(b as never);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => isEqual((a as never)[key], (b as never)[key]));
        }
    } else {
        return a === b;
    }
}

function isGreaterThanOrEqual(a: unknown, b: unknown): boolean {
    if (typeof a === 'number' && typeof b === 'number') {
        return a >= b;
    } else if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b) >= 0;
    } else if (typeof a === 'boolean' && typeof b === 'boolean') {
        return a === b;
    } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() >= b.getTime();
    } else if (isArray(a) && isArray(b)) {
        return isEqual(a, b)
    } else if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        return isEqual(a, b);
    }
    return false
}

// function  isGreaterThan(a: unknown, b: unknown): boolean {
//     return isGreaterThanOrEqual(a, b) & a >& b;
// }


export {isEqual, isGreaterThanOrEqual}