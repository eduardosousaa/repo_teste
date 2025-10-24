// ============================ Comunicação Interna ============================
export type ContactAPI = {
    id:number,
    identificacao: string, 
    email: string
    createdAt: string
    updatedAt: string
}


// ============================ Fonte de Dados ============================

export interface FrequenciaItem {
  diaSemana: number
  diaAno: number
  horario: string
}

export interface CDADataSourceData {
  dadosTipo: "CDA"
  fonteDadosTipo: "API" | "RPA"
  usuario: string
  senha: string
  frequenciaTipo: "SEMANAL" | "MENSAL" | "DIARIO"
  frequencia: FrequenciaItem[]
}

export interface DevedoresDataSourceData {
  dadosTipo: "DEVEDOR"
  fonteDadosTipo: "API" | "RPA"
  usuario: string
  senha: string
  frequenciaTipo: "SEMANAL" | "MENSAL" | "DIARIO"
  frequencia: FrequenciaItem[]
}

export interface RFBDataSourceData {
  dadosTipo: "RFB"
  fonteDadosTipo: "RPA"
  frequenciaTipo: "SEMANAL" | "MENSAL" | "DIARIO"
  frequencia: FrequenciaItem[]
  usuario: string
  senha: string
}



// ============================ Campanhas ============================
export type CampanhaData = {
  id: number
  nome: string
  campanhaRegras: RegraData[]
  campanhaTemplates: TemplateData[]
  campanhaTipo: string
  status: string
  created: string
}

export interface ChannelData {
  id: string
  name: string
  description: string
  iconUrl: string
  isActive: boolean
}

export interface TemplateData {
  assunto: string
  nome: string
  canalComunicacao: "SMS" | "EMAIL" | "WHATSAPP"
  texto: string
  status: "ACTIVE" | "INACTIVE"
}

export interface Rule {
  id: string
  tabela: string
  atributo: string
  operacao: string
  valor: string
  operadorLogico?: string
}

export interface Period {
  startDay: string
  startTime: string
  endDay: string
  endTime: string
}

export interface RegraPeriodoData {
  id: string
  dataInicio: string
  dataFim: string
  horaInicio: string
  horaFim: string
}

export interface RegraRelacionamentoData {
  tabelaRef: string
  colunaRef: string
  operacaoTipo: "MENOR_OU_IGUAL" | "MENOR" | "IGUAL" | "MAIOR_OU_IGUAL" | "MAIOR" | "DIFERENTE"
  valor: string
}

export interface RegraData {
  nome: string
  campanhaRegraPeriodos: RegraPeriodoData[]
  campanhaRegraRelacionamentos: RegraRelacionamentoData[]
}

export interface TabelaColuna {
  nomeTabela: string
  colunasPermitidas: string[]
}

export interface RuleCondition {
  id: string
  tabela: string
  atributo: string
  operacao: string
  valor: string
}

export interface RuleGroup {
  id: string
  nome: string
  conditions: RuleCondition[]
  periods: RegraPeriodoData[]
}

export interface PageInfo {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface TemplateHistoryResponse {
  content: TemplateData[]
  page: PageInfo
}

