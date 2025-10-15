export interface JudicialDistrictFilterData {
    city?: string;
    judicialDistrict?: string;
}

export interface JudicialDistrictTableData{
    id: number,
    city: string | null;
    judicialDistrict: string | null;
}