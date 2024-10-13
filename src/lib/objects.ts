function isArray(obj: unknown) {
    return Array.isArray(obj);
}

function isString(obj: unknown) {
    return typeof obj === 'string';
}

function isNumber(obj: unknown) {
    return typeof obj === 'number';
}

function isBoolean(obj: unknown) {
    return typeof obj === 'boolean';
}


function isObjectEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function getKeys(obj: never): string[] {
    return Object.keys(obj);
}

function getValues(obj: object): unknown[] {
    return Object.values(obj);
}

function getEntries(obj: object): [string, unknown][] {
    return Object.entries(obj);
}

function hasKey(obj: object, key: string): boolean {
    return Object.hasOwnProperty.call(obj, key);
}

function hasValue(obj: object, value: unknown): boolean {
    return getValues(obj).includes(value);
}

function hasEntry(obj: never, key: string): boolean {
    return hasKey(obj, key) && getValues(obj).includes(obj[key]);
}

function getValueInPath(obj: never, path: string) {
    const parts = path.split('.');
    let result = obj;
    for (const part of parts) {
        if (result && hasKey(result, part)) {
            result = result[part];
        } else {
            return undefined;
        }
    }
    return result;
}


export {
    isArray,
    isObjectEmpty,
    hasKey,
    hasEntry,
    hasValue,
    getEntries,
    getValues,
    getValueInPath,
    getKeys,
    isBoolean,
    isNumber,
    isString,
}