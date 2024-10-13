import {Panel} from "@/components/ui/panel";
import {z} from "zod";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useRef, useState} from "react";
import {Button, Fieldset, FileInput, Flex, Input, Divider, Progress, Select} from "@mantine/core";
import {messages, TranslationKeys} from "@/i18n/locales/tranlation.ts";
import {useTranslator} from "@/hooks/use-translator.ts";
import {convertFileSize, generateFileSize, Unit} from "@/lib/unit.ts";
import {Operator} from "@/types/filter-data.ts";
import {SearchEngineFactory} from "@/lib/search-engine";
import {SearchParams} from "@/types/search-engine.ts";


const fileUnit: Unit = 'MB'
// 1GB
const maxFileSize = generateFileSize(500, fileUnit)


const operatorKeys = Object.keys(Operator) as Array<Operator>;

const OperatorSchema = z.enum(operatorKeys as [Operator, ...Operator[]], {
    errorMap: () => ({message: messages.operator_required_message})
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
        }, {message: messages.json_file_required})
        .refine((file) => file != undefined && file.size <= maxFileSize, {
            message: messages.json_file_size_max_message,
        }),


    items: z.array(z.object({
        fieldPath: z.string().min(1, 'O Campo deve ser informado'),
        operator: OperatorSchema,
        value: z.string().min(1, "O Valor deve ser informado."),

    })).min(1, {message: "Pelo menos um item deve ser informado."})
});


type OperatorTranslator = {
    operator: Operator,
    labelKey: TranslationKeys | string
}

const operatorTranslator: OperatorTranslator[] = [
    {labelKey: 'equal_label', operator: Operator.IGUAL},
    {labelKey: 'less_than_label', operator: Operator.MENOR},
    {labelKey: 'different_label', operator: Operator.DIFERENTE},
]


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


    const [fileData, setFileData] = useState<unknown>()

    const items = watch("items");

    const onSubmit = (data: FormData) => {
        const result = SearchEngineFactory.createSearchEngine('JSON').search(createParams(data), fileData)

        // const engine = SearchEngineFactory.createSearchEngine('JSON')
        // Salva o resultado no localStorage
        const fileResult: string
            = JSON.stringify(result, null, 4)

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
        }) as unknown as SearchParams[];
    }


    // Função para lidar com a mudança no input de arquivo
    const handleFileChange = (file: File | null) => {
        if (file) {
            console.log(file.size)
            console.log(maxFileSize)
            if (file.size > maxFileSize) {
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
                <Panel title={translate('details_title')} className="mb-5">
                    <Flex direction="column" flex="1" gap={6} w="100%">
                        <Flex w="100%" direction="column" gap="5">
                            <Controller render={({field}) =>
                                <FileInput required label={translate('json_file_label')} clearable
                                           placeholder={translate('select_file_label')}
                                           accept=".json"
                                           error={errors.jsonFile?.message && translate(errors.jsonFile?.message, errors.jsonFile?.message == messages.json_file_size_max_message ? {value: convertFileSize(maxFileSize, 'BYTES', fileUnit) + fileUnit} : {})}
                                           ref={fileInputRef}
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
                        <Fieldset legend={translate('fields_to_filter_label')} className="mt-7 mb-2 gap-2">
                            <Flex direction="column" className="gap-5">
                                {fields.map((_, i) => (
                                    <Flex flex={1} gap={20} w="100%" key={i} ref={i === 0 ? firstErrorRef : null}
                                          align="end">
                                        <Controller render={({field}) => (
                                            <Input.Wrapper required w="100%" label={translate('field_name_label')}
                                                           className="w-[30%]"
                                                           error={errors.items?.[i]?.fieldPath?.message}>
                                                <Input    {...field} />
                                            </Input.Wrapper>
                                        )} control={control} name={`items.${i}.fieldPath`}/>

                                        <Controller render={({field}) => (
                                            <Select label={translate('operator_label')}
                                                    error={errors.items?.[i]?.operator?.message && translate(errors.items?.[i]?.operator?.message)}
                                                    className="w-full" data={operatorKeys.map(e => {
                                                return {
                                                    value: e,
                                                    label: translate(operatorTranslator.find(x => x.operator == e)!.labelKey),
                                                }
                                            })} searchable unselectable="off" {...field} />
                                        )} control={control} name={`items.${i}.operator`}/>


                                        <Controller render={({field}) => (
                                            <Input.Wrapper required w="100%" label={translate('value_label')}
                                                           className="w-[30%]"
                                                           error={errors.items?.[i]?.value?.message}>
                                                <Input   {...field} />
                                            </Input.Wrapper>
                                        )} control={control} name={`items.${i}.value`}/>

                                        <Button w="320px"
                                                type="button"
                                                radius="xl"
                                                onClick={() => remove(i)}
                                                className={`"mt-2" ${getStyleItem(i)}`}
                                                disabled={items.length <= 1}
                                        >
                                            {translate('remove_label')}
                                        </Button>
                                    </Flex>
                                ))}
                            </Flex>
                        </Fieldset>
                        <Divider/>
                        <Button
                            radius="xl"
                            variant="outline"
                            type="button"
                            onClick={() => append({fieldPath: "", operator: Operator.IGUAL, value: ""})}
                            className="mt-4 self-end"
                        >
                            {translate('add_item_label')}
                        </Button>
                    </Flex>

                </Panel>
                <Button radius="xl" className="mt-2 self-end" variant="filled"
                        type="submit">{translate('process_label')}</Button>
            </form>
        </div>
    );
}
