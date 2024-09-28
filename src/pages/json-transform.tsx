import {Panel} from "@/components/ui/panel";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";
import {X} from "react-feather"
import {Label} from "@/components/ui/label.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

// Definindo um enum para os operadores permitidos
const Operadores = {
    IGUAL: "Igual",
    MENOR: "Menor",
    DIFERENTE: "Diferente",
} as const;


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
        .refine((file) => file != undefined && file.size <= 500 * 1024 * 1024, {
            message: "O arquivo deve ter no máximo 500MB.",
        }),


    items: z.array(z.object({
        fieldPath: z.string().min(1, 'O Campo deve ser informado'),
        operator: z.enum([Operadores.IGUAL, Operadores.MENOR, Operadores.DIFERENTE], {
            errorMap: () => ({message: "O Operador deve ser informado."}),
        }),
        value: z.string().min(1, "O Valor deve ser informado."),

    })).min(1, {message: "Pelo menos um item deve ser informado."})
});


// Tipo inferido a partir do esquema
type FormData = z.infer<typeof formSchema>;

export function JsonTransformPage() {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            items: [
                {
                    fieldPath: "",
                    operator: undefined,
                    value: "",
                }
            ],
        },
    });


    const {control, handleSubmit, watch, formState: {errors}} = form;
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const firstErrorRef = useRef<HTMLDivElement | null>(null);
    const {fields, append, remove} = useFieldArray({
        control,
        name: "items", // Nome do campo do array
    });

    const [fileData, setFileData] = useState(undefined)

    const items = watch("items");


    const onSubmit = (data: FormData) => {
        console.log(data);
        console.log(fileData)
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
            const op = getEnumKeyByValue(item.operator.toUpperCase())
            if (!isMath(item.fieldPath, op, item.value, fileData)) {
                return false;
            }
        }
        return true;
    }

    const isAllMathByValue = (targetValue: never, params: ItemParamSerarch[]) => {
        for (const item of params) {
            const op = getEnumKeyByValue(item.operator.toUpperCase())
            if (!isMath(item.fieldPath, op, item.value, targetValue)) {
                return false;
            }
        }
        return true;
    }

    function getEnumKeyByValue(name: string): Operator {
        return Operator[name as keyof typeof Operadores]
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
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024 * 1024) {
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
                console.log(event.target?.result)
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
            <Form {...form} >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Panel title="Detalhamento" className="flex-col gap-2">
                        <FormField
                            control={control}
                            name="jsonFile"
                            render={({field}) => (
                                <FormItem className="w-full mb-5">
                                    <FormLabel>Upload de Arquivo JSON</FormLabel>
                                    <div className="flex items-center">
                                        <Input
                                            accept=".json"
                                            type="file"
                                            placeholder="Selecione um arquivo"
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                field.onChange(files && files.length > 0 ? files[0] : null);
                                                handleFileChange(e);
                                            }}
                                            ref={fileInputRef}
                                        />
                                        {field.value && (
                                            <Button
                                                variant="secondary" size="icon"
                                                type="button"
                                                onClick={() => {
                                                    field.onChange(null); // Limpa o valor no React Hook Form
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = ""; // Limpa o campo de entrada
                                                    }
                                                }}
                                                className="ml-2"
                                            >
                                                <X/>
                                            </Button>
                                        )}
                                    </div>
                                    <FormDescription>
                                        Selecione um arquivo JSON para processamento.
                                    </FormDescription>
                                    <FormMessage/>

                                </FormItem>
                            )}
                        />
                        {uploadProgress > 0 && (
                            <Progress value={uploadProgress} max={100}/>
                        )}
                        <Label className="">Campos para Filtragem</Label>
                        <Separator/>
                        <>
                            {fields.map((_, i) => (
                                <div key={i} className=" mb-4 flex w-full gap-5 items-center"
                                     ref={i === 0 ? firstErrorRef : null}>
                                    <FormField
                                        control={control}
                                        name={`items.${i}.fieldPath`} // Campo nome
                                        render={({field}) => (
                                            <FormItem className="w-[30%]">
                                                <FormLabel className="">Nome</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="input"/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`items.${i}.operator`} // Campo operador
                                        render={({field}) => (
                                            <FormItem className="w-[30%]">
                                                <FormLabel>Operador</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue
                                                                placeholder="Selecione o operador para busca"/>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {
                                                            Object.entries(Operadores).map(([key, value]) => (
                                                                <SelectItem
                                                                    key={key}
                                                                    value={value}>{value}</SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`items.${i}.value`} // Campo nome
                                        render={({field}) => (
                                            <FormItem className="w-[30%]">
                                                <FormLabel className="">Valor para Busca</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="input"/>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="button"
                                        onClick={() => remove(i)} // Remove o item da lista
                                        className={`"mt-2" ${getStyleItem(i)}`}
                                        disabled={items.length <= 1}
                                    >
                                        Remover
                                    </Button>
                                </div>

                            ))}
                        </>
                        <Button
                            type="button"
                            onClick={() => append({fieldPath: "", operator: Operadores.IGUAL, value: ""})}
                            className="mt-4"
                        >
                            Adicionar Item
                        </Button>
                    </Panel>
                    <Button type="submit" className="my-4">Processar</Button>
                </form>
            </Form>
        </div>
    );
}
