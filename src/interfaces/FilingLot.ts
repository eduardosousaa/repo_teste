export interface FilingLotFilterData {
    cda?: string;
    cpfCnpj?: string;
    iERenavam?: string;
    lotName?: string;
    createdAt?: string;
}

export interface FilingLotTableData{
    id: number,
    lotName: string | null;
    createdAt: string | null;
    status: string | null;
}

export interface FilingLotSimulationFilterData {
  debtType?: string;      
  minValue?: number;       
  maxValue?: number;      
  emissionDate?: string;   
}

export interface FilingLotCdaFilterData {
  origin?: string;         
  emissionDate?: string;   
  cnpjStatus?: string;    
  tribute?: string;      
  updatedValue?: number;   
  cdaNumber?: string;     
  cpfCnpj?: string;     
  iERenavam?: string;     
}

export interface FilingLotCdaTableData {
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

export interface FilingLotValidationTableData {
  id: number;
  debtor?: string | null;   
  cnpjRoot?: string | null;  
  cda?: string | null;       
  value?: number | null;    
  debtType?: string | null; 
}