export type Unit = 'GB' | 'KB' | 'MB' | 'BYTES';

const units: {
    [key in Unit]: number;
} = {
    BYTES: 1,            // 1 byte
    KB: 1024,            // 1 KB = 1024 bytes
    MB: 1024 * 1024,     // 1 MB = 1024 KB
    GB: 1024 * 1024 * 1024, // 1 GB = 1024 MB
};

function generateFileSize(value: number, unit: Unit): number {
    return value * units[unit]; // Retorna o valor em bytes
}

// Função para converter entre unidades
function convertFileSize(value: number, fromUnit: Unit, toUnit: Unit): number {
    // Converte o valor da unidade de origem para bytes
    const valueInBytes = value * units[fromUnit]; // Converte para bytes
    // Converte de bytes para a unidade de destino
    return valueInBytes / units[toUnit]; // Retorna o valor na unidade desejada
}

export {convertFileSize, generateFileSize}


