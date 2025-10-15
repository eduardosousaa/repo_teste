export interface PendencyFilterData {
    cda?: string;
    cpfCnpj?: string;
    iERenavam?: string;
    tribute?: string;
}

export interface PendencyTableData{
    id: number,
    cda: string | null;
    cpfCnpj: string | null;
    value: string | null;
    daysPending: number | null;
}