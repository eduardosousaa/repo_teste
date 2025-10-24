import TokenService from "./TokenService"; 

export type SendFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
export type DayOfWeek = "Segunda-feira" | "Terça-feira" | "Quarta-feira" | "Quinta-feira" | "Sexta-feira" | "Sábado" | "Domingo";
export type BackendContributorType = "PESSOA_FISICA" | "PESSOA_JURIDICA";
export type BackendValidationCondition = "EXIGIR_QUE_TENHA_OCORRIDO_NOTIFICACAO_PREVIA" | "EXIGIR_QUE_POSSUA_EMAIL_VALIDO" | "EXIGIR_QUE_POSSUA_TELEFONE_VALIDO" | "EXIGIR_QUE_POSSUA_ENDERECO_VALIDADO";
export type BackendSendFrequency = "DIARIO" | "SEMANAL" | "MENSAL";

export interface NegationConfigBackend {
    valorMinimo: number; 
    tipoContribuinte: BackendContributorType[]; 
    tributo: string[];
    condicaoValidacao: BackendValidationCondition[];
    frequencia: BackendSendFrequency; 
    diaInicio?: number; 
    diaFim?: number; 
    horaInicio: string; 
    horaFim: string; 
}

export interface Tributo {
    id: string; 
    nome: string; 
}

export interface NegationConfig {
    minCdaValue: number;
    contributorTypePF: boolean; 
    contributorTypePJ: boolean; 
    selectedTributos: string[];
    hasPreviousNotification: boolean;
    hasValidEmail: boolean;
    hasValidPhone: boolean;
    hasValidAddress: boolean;
    sendFrequency: SendFrequency; 
    startTime: string;
    endTime: string;
    weeklyDayStart: DayOfWeek | ""; 
    weeklyDayEnd: DayOfWeek | ""; 
    monthlyDayStart: number; 
    monthlyDayEnd: number; 
}

const API_BASE_URL = 'https://protest-api.gedaihml.isgsa.com.br'; 
const TRIBUTO_API_URL = `${API_BASE_URL}/tributo`;
const CONFIG_API_URL = `${API_BASE_URL}/configuracao`;

const tokenService = TokenService(); 

const getAuthHeader = (): Record<string, string> => {
    const token = tokenService.getToken();
    if (token) {
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

const createHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
    return { 
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...customHeaders
    };
};

const toBackendConfig = (config: NegationConfig, availableTributos: Tributo[]): NegationConfigBackend => {
    const tipoContribuinte: BackendContributorType[] = [];
    if (config.contributorTypePF) tipoContribuinte.push("PESSOA_FISICA");
    if (config.contributorTypePJ) tipoContribuinte.push("PESSOA_JURIDICA");

    const condicaoValidacao: BackendValidationCondition[] = [];
    if (config.hasPreviousNotification) condicaoValidacao.push("EXIGIR_QUE_TENHA_OCORRIDO_NOTIFICACAO_PREVIA");
    if (config.hasValidEmail) condicaoValidacao.push("EXIGIR_QUE_POSSUA_EMAIL_VALIDO");
    if (config.hasValidPhone) condicaoValidacao.push("EXIGIR_QUE_POSSUA_TELEFONE_VALIDO");
    if (config.hasValidAddress) condicaoValidacao.push("EXIGIR_QUE_POSSUA_ENDERECO_VALIDADO");

    const tributoIds = config.selectedTributos.map(tName => 
        availableTributos.find(t => t.nome === tName)?.id
    ).filter((id): id is string => !!id);

    const backendFrequencia = config.sendFrequency === "DAILY" ? "DIARIO" as const : config.sendFrequency === "WEEKLY" ? "SEMANAL" as const : "MENSAL" as const;
    
    const weekDaysMap: Record<DayOfWeek, number> = {
        "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, 
        "Sexta-feira": 5, "Sábado": 6, "Domingo": 7
    };
    
    let diaInicio: number | undefined;
    let diaFim: number | undefined;

    if (backendFrequencia === "SEMANAL" && config.weeklyDayStart && config.weeklyDayEnd) {
        diaInicio = weekDaysMap[config.weeklyDayStart];
        diaFim = weekDaysMap[config.weeklyDayEnd];
    } else if (backendFrequencia === "MENSAL") {
        diaInicio = config.monthlyDayStart;
        diaFim = config.monthlyDayEnd;
    }
    
    const backendConfig: NegationConfigBackend = {
        valorMinimo: config.minCdaValue,
        tipoContribuinte,
        tributo: tributoIds,
        condicaoValidacao,
        frequencia: backendFrequencia,
        diaInicio: diaInicio, 
        diaFim: diaFim,
        horaInicio: config.startTime,
        horaFim: config.endTime,
    };
    
    if (backendConfig.diaInicio === 0 || !diaInicio) delete backendConfig.diaInicio;
    if (backendConfig.diaFim === 0 || !diaFim) delete backendConfig.diaFim;
    
    return backendConfig;
};

/**
 * Converte a resposta do Backend para o formato de Estado do Frontend.
 */
const fromBackendConfig = (backend: NegationConfigBackend, availableTributos: Tributo[]): Partial<NegationConfig> => {
    
    const weekDaysMapReverse: Record<number, DayOfWeek> = {
        1: "Segunda-feira", 2: "Terça-feira", 3: "Quarta-feira", 4: "Quinta-feira", 
        5: "Sexta-feira", 6: "Sábado", 7: "Domingo"
    };
    
    const selectedTributos = (backend.tributo || []).map(tId =>
        availableTributos.find(t => t.id === tId)?.nome
    ).filter((name): name is string => !!name);

    let frontendFrequencia: SendFrequency; 
    
    if (backend.frequencia === "SEMANAL") {
        frontendFrequencia = "WEEKLY";
    } else if (backend.frequencia === "MENSAL") {
        frontendFrequencia = "MONTHLY";
    } else {
        frontendFrequencia = "DAILY"; 
    }
    
    const tipoContribuinteArray = backend.tipoContribuinte || [];
    const condicaoValidacaoArray = backend.condicaoValidacao || [];

    const frontendConfig: Partial<NegationConfig> = {
        minCdaValue: backend.valorMinimo,
        contributorTypePF: tipoContribuinteArray.includes("PESSOA_FISICA"),
        contributorTypePJ: tipoContribuinteArray.includes("PESSOA_JURIDICA"),
        selectedTributos,
        
        hasPreviousNotification: condicaoValidacaoArray.includes("EXIGIR_QUE_TENHA_OCORRIDO_NOTIFICACAO_PREVIA"),
        hasValidEmail: condicaoValidacaoArray.includes("EXIGIR_QUE_POSSUA_EMAIL_VALIDO"),
        hasValidPhone: condicaoValidacaoArray.includes("EXIGIR_QUE_POSSUA_TELEFONE_VALIDO"),
        hasValidAddress: condicaoValidacaoArray.includes("EXIGIR_QUE_POSSUA_ENDERECO_VALIDADO"),
        
        sendFrequency: frontendFrequencia,
        startTime: backend.horaInicio,
        endTime: backend.horaFim,
    };
    
    if (frontendFrequencia === "WEEKLY" && backend.diaInicio && backend.diaFim) {
        frontendConfig.weeklyDayStart = weekDaysMapReverse[backend.diaInicio] || "";
        frontendConfig.weeklyDayEnd = weekDaysMapReverse[backend.diaFim] || "";
    } else if (frontendFrequencia === "MONTHLY" && backend.diaInicio && backend.diaFim) {
        frontendConfig.monthlyDayStart = backend.diaInicio;
        frontendConfig.monthlyDayEnd = backend.diaFim;
    }

    return frontendConfig;
};

export async function getTributos(): Promise<Tributo[]> {
    try {
        const response = await fetch(TRIBUTO_API_URL, {
            method: 'GET',
            headers: createHeaders(), 
        });
        if (!response.ok) {
            if (response.status === 401) {
                console.error("401 Unauthorized: Token rejeitado pela API de Tributos.");
            }
            throw new Error(`Erro ao buscar lista de tributos: ${response.statusText}`);
        }

        const data: Tributo[] = await response.json();
        return data; 
    } catch (error) {
        console.error("Erro no serviço ao buscar tributos:", error);
        throw error; 
    }
}

export async function getNegationConfig(availableTributos: Tributo[]): Promise<Partial<NegationConfig>> {
    try {
        const response = await fetch(CONFIG_API_URL, {
            method: 'GET',
            headers: createHeaders(), 
        });

        if (!response.ok) {
            if (response.status === 401) {
                console.error("401 Unauthorized: Token rejeitado pela API de Configuração.");
            }
            if (response.status === 404 || response.status === 204) {
                 return {}; 
            }
            throw new Error(`Erro ao buscar configuração: ${response.statusText}`);
        }

        const backendData: NegationConfigBackend = await response.json();
        return fromBackendConfig(backendData, availableTributos);
    } catch (error) {
        console.error("Erro no serviço ao buscar configuração:", error);
        throw error;
    }
}

export async function saveNegationConfig(config: NegationConfig, availableTributos: Tributo[]): Promise<NegationConfigBackend> {
    const backendPayload = toBackendConfig(config, availableTributos);
    
    try {
        const response = await fetch(CONFIG_API_URL, {
            method: 'POST', 
            headers: createHeaders(),
            body: JSON.stringify(backendPayload),
        });
        
        if (!response.ok) {
             if (response.status === 401) {
                console.error("401 Unauthorized: Token rejeitado pela API de Salvamento.");
            }
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Falha ao salvar. Status: ${response.status}. Mensagem: ${errorBody.message || response.statusText}`);
        }

        const data: NegationConfigBackend = await response.json();
        return data;
        
    } catch (error) {
        console.error("Erro no serviço ao salvar configuração:", error);
        throw error;
    }
}