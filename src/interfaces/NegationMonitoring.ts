export interface CdaMonitoringTableData {
    id: number;
    cdaNumber: string | null;
    devedor: string | null;
    statusSefaz: string | null;
    ultimaOpSefaz: string | null;
    statusCenprot: string | null;
    ultimaOpCenprot: string | null;
    statusCadin: string | null;
    ultimaOpCadin: string | null;
}

export interface CdaMonitoringFilterData {
    cdaNumber?: string;
    iERenavam?: string;
    tribute?: string;
    situacao?: string;
    cpfCnpj?: string;
    emissionDate?: string;
    periodo?: string;
    minValue?: number;
    maxValue?: number;
    status?: string;
    statusCENPROT?: string;
    statusCADIN?: string;
    statusSEFAZ?: string;
    ultimaOpStatus?: string;
}

export const MOCK_PROCESSING_CDAS: CdaMonitoringTableData[] = [
    {
        id: 1,
        cdaNumber: "CDA2025001",
        devedor: "Pessoa Física A",
        statusSefaz: "OK",
        ultimaOpSefaz: "2025-10-20",
        statusCenprot: "Enviado",
        ultimaOpCenprot: "2025-10-21",
        statusCadin: "Pendente",
        ultimaOpCadin: "2025-10-22",
    },
    {
        id: 2,
        cdaNumber: "CDA2025002",
        devedor: "Empresa B LTDA",
        statusSefaz: "OK",
        ultimaOpSefaz: "2025-10-18",
        statusCenprot: "Processando",
        ultimaOpCenprot: "2025-10-19",
        statusCadin: "Não Enviado",
        ultimaOpCadin: "-",
    },
];

export const MOCK_PROCESSED_CDAS: CdaMonitoringTableData[] = [
    {
        id: 3,
        cdaNumber: "CDA2025010",
        devedor: "Pessoa Jurídica C",
        statusSefaz: "OK",
        ultimaOpSefaz: "2025-09-01",
        statusCenprot: "Negativado",
        ultimaOpCenprot: "2025-09-05",
        statusCadin: "OK",
        ultimaOpCadin: "2025-09-10",
    },
];

export const MOCK_SELECT_OPTIONS = [
    { value: "OK", label: "OK" },
    { value: "PENDENTE", label: "Pendente" },
    { value: "FALHA", label: "Com Falha" },
];