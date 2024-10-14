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


type Property = {
    property: string
    propertyName: string
}

function isPrimitive(value: unknown) {
    return (
        value instanceof Number || typeof value === 'number' ||
        value instanceof String || typeof value === 'string' ||
        value instanceof Boolean || typeof value === 'boolean' ||
        value instanceof Symbol || typeof value === 'symbol'

    );
}

function getPropertyNames(data: unknown | unknown[]): Property[] {
    let properties: Property[] = [];
    if (data) {
        if (isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let keys = Object.keys(data[i]).map(x => {
                    return {property: x, propertyName: x} as Property
                });
                for (const key of keys) {
                    if (isArray(data[i][key.property]) || !isPrimitive(data[i][key.property])) {
                        keys = [...keys.filter(k => k.property != key.property)]
                        const newKeys = getPropertyNames(data[i][key.property]).map(x => {
                            return {property: x.property, propertyName: `${key.property}.${x.propertyName}`} as Property
                        })
                        keys = [...keys, ...newKeys]
                    }
                }
                properties = [...properties, ...keys]
            }
        } else if (!isPrimitive(data)) {
            properties = [...properties, ...Object.keys(data).map(x => {
                return {property: x, propertyName: x} as Property;
            })]
        }

    }
    return Array.from(new Set(properties));
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
    getPropertyNames,
}