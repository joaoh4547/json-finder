import {Panel} from "@/components/ui/panel";
import {z} from "zod";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useRef, useState} from "react";
import {Button, Fieldset, FileInput, Flex, Input, Progress, Select} from "@mantine/core";
import {TranslationKeys} from "@/i18n/locales/tranlation.ts";
import {useTranslator} from "@/hooks/use-translator.ts";


enum Operator {
    IGUAL = "IGUAL",
    MENOR = "MENOR",
    DIFERENTE = "DIFERENTE",
}

type ItemParamSerarch = {
    fieldPath: string,
    operator: keyof typeof Operator,
    value: string,
}


const operatorKeys = Object.keys(Operator) as Array<Operator>;

const OperatorSchema = z.enum(operatorKeys as [Operator, ...Operator[]], {
    errorMap: () => ({message: "O Operador deve ser informado."})
}); // Ajuste aqui

// Definindo o esquema de validação
const formSchema = z.object({
    jsonFile: z
        .custom<File | null>((value) => {
            // Verifica se o arquivo é fornecido e se é uma instância de File
            if (!value) {
                return false; // Se não houver arquivo, falha a validação
            }
            return value instanceof File;
            // Validação bem-sucedida
        }, {message: "Arquivo é obrigatório."})
        .refine((file) => file != undefined && file.size <= 1024 * 1024 * 1024, {
            message: "O arquivo deve ter no máximo 500MB.",
        }),


    items: z.array(z.object({
        fieldPath: z.string().min(1, 'O Campo deve ser informado'),
        operator: OperatorSchema,
        value: z.string().min(1, "O Valor deve ser informado."),

    })).min(1, {message: "Pelo menos um item deve ser informado."})
});


// type OperatorTranslator = {
//     operator: Operator,
//     labelKey: TranslationKeys | string
// }

// const operatorTranslator: OperatorTranslator = {
//
//     labelKey: 'filter-json.description', operator: Operator.IGUAL
//
// }


// Tipo inferido a partir do esquema
type FormData = z.infer<typeof formSchema>;

export function JsonTransformPage() {
    const {translate} = useTranslator()

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: [
                {
                    fieldPath: "",
                    operator: Operator.IGUAL,
                    value: "",
                }
            ],
        },
    });


    const {control, handleSubmit, watch, formState: {errors}} = form;
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLButtonElement>(null);
    const firstErrorRef = useRef<HTMLDivElement | null>(null);
    const {fields, append, remove} = useFieldArray({
        control,
        name: "items", // Nome do campo do array
    });


    const [fileData, setFileData] = useState(undefined)

    const items = watch("items");

    const onSubmit = (data: FormData) => {
        const filteredData = filterData(data)


        const fileResult: string
            = JSON.stringify(filteredData, null, 4)

        const blob = new Blob([fileResult], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'result.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    function createParams(param: FormData) {
        return param.items.map(item => {
            return {
                fieldPath: item.fieldPath,
                operator: item.operator,
                value: item.value,
            }
        }) as unknown as ItemParamSerarch[];
    }

    const filterData = (param: FormData) => {

        if (Array.isArray(fileData)) {
            const arrayData = fileData as never[]
            return arrayData.filter((i: never) => {
                const paramns = createParams(param)
                return isAllMathByValue(i, paramns)
            })
        } else {
            const params = createParams(param);
            if (isAllMath(params)) {
                return fileData
            } else {
                return {}
            }
        }
    }

    const isAllMath = (params: ItemParamSerarch[]) => {
        for (const item of params) {
            const op = Operator[item.operator]
            if (!isMath(item.fieldPath, op, item.value, fileData)) {
                return false;
            }
        }
        return true;
    }

    const isAllMathByValue = (targetValue: never, params: ItemParamSerarch[]) => {
        for (const item of params) {
            const op = Operator[item.operator]
            if (!isMath(item.fieldPath, op, item.value, targetValue)) {
                return false;
            }
        }
        return true;
    }


    const isMath = (path: string, op: Operator, expectedValue: unknown, targetValue: unknown) => {
        const value = getValueInPath(path, targetValue)
        if (op == Operator.IGUAL) {
            return value == expectedValue;
        } else if (op == Operator.DIFERENTE) {
            return value != expectedValue;
        } else if (op == Operator.MENOR) {
            return isMenor(value, expectedValue)
        }
        return false;
    }

    const isMenor = (value: unknown, expectedValue: unknown) => {
        if (isString(value)) {
            return String(value).length < getValueAsNumber(expectedValue)
        }
        return false
    }

    const getValueAsNumber = (obj: unknown) => {
        return isNumber(obj) ? Number(obj) : String(obj).length
    }

    const isString = (obj: unknown) => {
        return typeof obj === 'string';
    }

    const isNumber = (value: unknown) => {
        return typeof value === 'number';
    }

    const getValueInPath = (path: string, obj: unknown) => {
        const parts = path.split('.');
        let result = obj as never;
        for (const part of parts) {
            if (result && result[part] !== undefined) {
                result = result[part];
            } else {
                return undefined;
            }
        }
        return result;
    }


    // Função para lidar com a mudança no input de arquivo
    const handleFileChange = (file: File | null) => {
        if (file) {
            if (file.size > 1024 * 1024 * 1024) {
                return; // Não faz nada mais se o arquivo for muito grande
            }
            // Define o arquivo diretamente no formulário
            form.setValue("jsonFile", file);

            const reader = new FileReader();

            // Evento para capturar o progresso do upload
            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(percentComplete); // Atualiza o estado com o progresso
                }
            };

            reader.onload = (event) => {
                setFileData(JSON.parse(event.target?.result as string))
            }

            // Evento disparado quando a leitura termina
            reader.onloadend = () => {
                setTimeout(() => setUploadProgress(0), 1000); // Limpa a barra de progresso após a conclusão
            };

            // Lê o arquivo
            reader.readAsText(file);
        }
    };

    const getStyleItem = (index: number) => {
        return !(errors?.items?.[index]) ? 'self-end' : '';
    };


    useEffect(() => {
        // Identifica se há erros após a submissão
        const errors = Object.keys(control.getFieldState("items")).length > 0;
        if (errors && firstErrorRef.current) {
            firstErrorRef.current.scrollIntoView({behavior: "smooth", block: "center"});
        }
    }, [control]);

    return (
        <div className="mt-10">
            <form onSubmit={handleSubmit(onSubmit)}>
                <Panel title={translate('details.title')} className="mb-5">
                    <Flex direction="column" flex="1" gap={6} w="100%">
                        <Flex w="100%" direction="column" gap="5">
                            <Controller render={({field}) =>
                                <FileInput required label={translate('json-file.label')} clearable
                                           placeholder="Selecione um arquivo"
                                           accept=".json" error={errors.jsonFile?.message} ref={fileInputRef}
                                           onChange={(e) => {
                                               field.onChange(e)
                                               handleFileChange(e)
                                           }}
                                />
                            } name="jsonFile" control={control}/>
                            {uploadProgress > 0 && (
                                <Progress w="100%" value={uploadProgress} radius="xl" animated/>
                            )}
                        </Flex>
                        <Fieldset legend={translate('fields-to-filter.label')} className="mt-7 mb-2 gap-2">
                            <Flex direction="column" className="gap-5">
                                {fields.map((_, i) => (
                                    <Flex flex={1} gap={20} w="100%" key={i} ref={i === 0 ? firstErrorRef : null}
                                          align="end">
                                        <Controller render={({field}) => (
                                            <Input.Wrapper required w="100%" label={translate('field-name.label')}
                                                           className="w-[30%]"
                                                           error={errors.items?.[i]?.fieldPath?.message}>
                                                <Input    {...field} />
                                            </Input.Wrapper>
                                        )} control={control} name={`items.${i}.fieldPath`}/>

                                        <Controller render={({field}) => (
                                            <Select label={translate('operator.label')}
                                                    error={errors.items?.[i]?.operator?.message || ""}
                                                    className="w-full" data={operatorKeys.map(e => {
                                                return {
                                                    value: e,
                                                    label: e,
                                                }
                                            })} searchable unselectable="off" {...field} />
                                        )} control={control} name={`items.${i}.operator`}/>


                                        <Controller render={({field}) => (
                                            <Input.Wrapper required w="100%" label={translate('value.label')}
                                                           className="w-[30%]"
                                                           error={errors.items?.[i]?.value?.message}>
                                                <Input   {...field} />
                                            </Input.Wrapper>
                                        )} control={control} name={`items.${i}.value`}/>

                                        <Button w="320px"
                                                type="button"
                                                onClick={() => remove(i)} // Remove o item da lista
                                                className={`"mt-2" ${getStyleItem(i)}`}
                                                disabled={items.length <= 1}
                                        >
                                            {translate('remove.label')}
                                        </Button>
                                    </Flex>
                                ))}
                            </Flex>
                        </Fieldset>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => append({fieldPath: "", operator: Operator.IGUAL, value: ""})}
                            className="mt-4"
                        >
                            {translate('add-item.label')}
                        </Button>
                    </Flex>

                </Panel>
                {/*<Divider/>*/}
                <Button className="mt-2" variant="filled" type="submit">{translate('process.label')}</Button>
            </form>
        </div>
    );
}
