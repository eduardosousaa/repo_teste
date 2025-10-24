export interface NegationCdaTableData {
    id: number;
    cdaNumber: string | null;
    devedor: string | null;
    cpfCnpj: string | null;
    iERenavam: string | null;
    valorAtualizado: number | null;
    motivoInelegibilidade?: string | null;
}

export interface NegationCdaFilterData {
    cdaNumber?: string;
    iERenavam?: string;
    tribute?: string;
    cpfCnpj?: string;
    emissionDate?: string;
    minValue?: number;
    maxValue?: number;
}

export const MOCK_ELIGIBLE_CDAS: NegationCdaTableData[] = [
    {
        id: 1,
        cdaNumber: "CDA2025001",
        devedor: "Pessoa Física A",
        cpfCnpj: "123.456.789-00",
        iERenavam: "12345678",
        valorAtualizado: 15230.75,
    },
    {
        id: 2,
        cdaNumber: "CDA2025002",
        devedor: "Empresa B LTDA",
        cpfCnpj: "12.345.678/0001-99",
        iERenavam: "ISENTO",
        valorAtualizado: 20350.40,
    },
    {
        id: 3,
        cdaNumber: "CDA2025003",
        devedor: "Pessoa Física C",
        cpfCnpj: "987.654.321-00",
        iERenavam: "98765432101",
        valorAtualizado: 1250.00,
    },
];

export const MOCK_INELIGIBLE_CDAS: NegationCdaTableData[] = [
    {
        id: 4,
        cdaNumber: "CDA2025004",
        devedor: "Empresa D S/A",
        cpfCnpj: "55.555.555/0001-00",
        iERenavam: "11223344",
        valorAtualizado: 35000.00,
        motivoInelegibilidade: "Valor abaixo do mínimo (R$ 50k)",
    },
    {
        id: 5,
        cdaNumber: "CDA2025005",
        devedor: "Pessoa Física E",
        cpfCnpj: "444.444.444-44",
        iERenavam: null,
        valorAtualizado: 500.00,
        motivoInelegibilidade: "Já notificado em 20/05/2025",
    },
];

export const MOCK_TRIBUTE_OPTIONS = [
    { value: "ICMS", label: "ICMS" },
    { value: "IPVA", label: "IPVA" },
    { value: "ITCD", label: "ITCD" },
];