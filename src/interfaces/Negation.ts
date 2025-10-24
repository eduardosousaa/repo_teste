export type SendFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type DayOfWeek = "Segunda-feira" | "Terça-feira" | "Quarta-feira" | "Quinta-feira" | "Sexta-feira" | "Sábado" | "Domingo";

export type BackendContributorType = "PESSOA_FISICA" | "PESSOA_JURIDICA";
export type BackendValidationCondition = 
    "EXIGIR_QUE_TENHA_OCORRIDO_NOTIFICACAO_PREVIA" | 
    "EXIGIR_QUE_POSSUA_EMAIL_VALIDO" | 
    "EXIGIR_QUE_POSSUA_TELEFONE_VALIDO" | 
    "EXIGIR_QUE_POSSUA_ENDERECO_VALIDADO";
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

export const initialNegationConfig: NegationConfig = {
    minCdaValue: 0.0,
    contributorTypePF: true,
    contributorTypePJ: false,
    selectedTributos: [],
    hasPreviousNotification: false,
    hasValidEmail: false,
    hasValidPhone: false,
    hasValidAddress: false,
    sendFrequency: "DAILY",
    startTime: "08:00",
    endTime: "18:00",
    weeklyDayStart: "",
    weeklyDayEnd: "",
    monthlyDayStart: 1,
    monthlyDayEnd: 1,
};

export const WEEK_DAYS_OPTIONS: { value: DayOfWeek, label: string }[] = [
    { value: "Segunda-feira", label: "Segunda-feira" },
    { value: "Terça-feira", label: "Terça-feira" },
    { value: "Quarta-feira", label: "Quarta-feira" },
    { value: "Quinta-feira", label: "Quinta-feira" },
    { value: "Sexta-feira", label: "Sexta-feira" },
    { value: "Sábado", label: "Sábado" },
];

export interface ValidationErrors {
    [key: string]: string | undefined;
}