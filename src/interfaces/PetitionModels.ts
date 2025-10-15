export interface PetitionModelsFilterData {
    modelName?: string;
    type?: string;
    status?: string;
}

export interface PetitionModelsTableData{
    id:number,
    modelName: string | null;
    activeVersion: string | null;
    status: string | null;
}

export interface PetitionCdaFilterData {
    origin?: string;
    emissionDate?: string;
    cnpjStatus?: string;
    tribute?: string;
    updatedValue?: number;
    cdaNumber?: string;
    cpfCnpj?: string;
    iERenavam?: string;
}

export interface PetitionCdaTableData {
    id: number;
    origin?: string | null;
    cdaNumber?: string | null;
    cpfCnpj?: string | null;
    iERenavam?: string | null;
    emissionDate?: string | null;
    cnpjStatus?: string | null;
    updatedValue?: number | null;
    tribute?: string | null;
}

export interface PetitionModelOption {
    value: string;
    label: string;
}