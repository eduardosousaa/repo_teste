"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import FilterField from "../filterField/FilterField"
import ActionButton from "../actionButton/ActionButton"
import PeriodCampaignField from "../filterField/PeriodCampaignField"
import { Pencil, Trash2, X } from "lucide-react"
import type { RegraData, RegraPeriodoData, TabelaColuna, RuleCondition, RuleGroup } from "@/interfaces/Notifications"

interface NotificationsEditCampaignSectionProps {
  onDataChange: (regras: RegraData[]) => void
  initialRegras: RegraData[]
}

export default function NotificationsEditCampaignSection({ onDataChange, initialRegras }: NotificationsEditCampaignSectionProps) {
  const [ruleName, setRuleName] = useState("")
  const [tabelasColunas, setTabelasColunas] = useState<TabelaColuna[]>([])
  const [loading, setLoading] = useState(true)

  const [savedRuleGroups, setSavedRuleGroups] = useState<RuleGroup[]>([])

  const [currentConditions, setCurrentConditions] = useState<RuleCondition[]>([
    {
      id: "1",
      tabela: "",
      atributo: "",
      operacao: "",
      valor: ""
    },
  ])

  const [savedPeriods, setSavedPeriods] = useState<RegraPeriodoData[]>([])

  // Mapeia operações da API para o formato do frontend - movido para useMemo
  const reverseOperacaoMap: Record<string, string> = useMemo(() => ({
    "MAIOR": "maior que",
    "MENOR": "menor que",
    "IGUAL": "igual a",
    "DIFERENTE": "diferente de",
    "MAIOR_OU_IGUAL": "maior ou igual",
    "MENOR_OU_IGUAL": "menor ou igual",
  }), [])

  // Mapeia operações do frontend para o formato da API - movido para useMemo
  const operacaoMap: Record<string, "MENOR_OU_IGUAL" | "MENOR" | "IGUAL" | "MAIOR_OU_IGUAL" | "MAIOR" | "DIFERENTE"> = useMemo(() => ({
    "maior que": "MAIOR",
    "menor que": "MENOR",
    "igual a": "IGUAL",
    "diferente de": "DIFERENTE",
    "maior ou igual": "MAIOR_OU_IGUAL",
    "menor ou igual": "MENOR_OU_IGUAL",
  }), [])

  // Converte períodos da API para formato local
  const convertPeriodosFromAPI = useCallback((periodos: RegraPeriodoData[]): RegraPeriodoData[] => {
    return periodos.map(periodo => {
      const startDay = periodo.dataInicio.split('-')[2]
      const endDay = periodo.dataFim.split('-')[2]
      
      return {
        id: periodo.id || (Date.now().toString() + Math.random()),
        dataInicio: startDay,
        dataFim: endDay,
        horaInicio: periodo.horaInicio,
        horaFim: periodo.horaFim
      }
    })
  }, [])

  // Carrega as regras iniciais
  useEffect(() => {
    if (initialRegras && initialRegras.length > 0) {
      const grupos: RuleGroup[] = initialRegras.map(regra => {
        // Converte os relacionamentos para condições
        const conditions: RuleCondition[] = regra.campanhaRegraRelacionamentos.map((rel, idx) => ({
          id: `${Date.now()}-${idx}`,
          tabela: rel.tabelaRef,
          atributo: rel.colunaRef,
          operacao: reverseOperacaoMap[rel.operacaoTipo] || "igual a",
          valor: rel.valor
        }))

        // Converte os períodos
        const periods = convertPeriodosFromAPI(regra.campanhaRegraPeriodos || [])

        return {
          id: Date.now().toString() + Math.random(),
          nome: regra.nome,
          conditions,
          periods
        }
      })

      setSavedRuleGroups(grupos)
    }
  }, [initialRegras, reverseOperacaoMap, convertPeriodosFromAPI])

  // Busca as tabelas e colunas da API
  useEffect(() => {
    const fetchTabelasColunas = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/campanhas/listar-tabelas-colunas')
        
        if (!response.ok) {
          throw new Error('Erro ao buscar tabelas e colunas')
        }
        
        const data: TabelaColuna[] = await response.json()
        setTabelasColunas(data)
      } catch (error) {
        console.error('Erro ao carregar tabelas e colunas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTabelasColunas()
  }, [])

  // Converte as regras locais para o formato da API - movido para useCallback
  const convertToAPIFormat = useCallback((): RegraData[] => {
    const currentYear = new Date().getFullYear()
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")

    return savedRuleGroups.map((group) => {
      // Converte os períodos do grupo para o formato da API
      const periodos = group.periods.map(period => {
        const dataInicio = `${currentYear}-${currentMonth}-${period.dataInicio.padStart(2, '0')}`
        const dataFim = `${currentYear}-${currentMonth}-${period.dataFim.padStart(2, '0')}`

        return {
          id: period.id,
          dataInicio,
          dataFim,
          horaInicio: period.horaInicio,
          horaFim: period.horaFim,
        }
      })

      // Converte as condições para relacionamentos
      const relacionamentos = group.conditions.map(condition => ({
        tabelaRef: condition.tabela,
        colunaRef: condition.atributo,
        operacaoTipo: operacaoMap[condition.operacao] || "IGUAL",
        valor: condition.valor,
      }))

      return {
        nome: group.nome,
        campanhaRegraPeriodos: periodos,
        campanhaRegraRelacionamentos: relacionamentos,
      }
    })
  }, [savedRuleGroups, operacaoMap])

  // Atualiza o componente pai sempre que as regras mudarem
  useEffect(() => {
    const apiFormattedRules = convertToAPIFormat()
    console.log("📤 [EditCampaign] Regras formatadas para enviar:", JSON.stringify(apiFormattedRules, null, 2))
    onDataChange(apiFormattedRules)
  }, [convertToAPIFormat, onDataChange])

  // Adiciona uma nova condição (linha) ao clicar em "And"
  const handleAddCondition = () => {
    const newCondition: RuleCondition = {
      id: Date.now().toString(),
      tabela: "",
      atributo: "",
      operacao: "",
      valor: ""
    }
    setCurrentConditions([...currentConditions, newCondition])
  }

  // Remove uma condição específica
  const handleRemoveCondition = (id: string) => {
    if (currentConditions.length > 1) {
      setCurrentConditions(currentConditions.filter((cond) => cond.id !== id))
    }
  }

  // Atualiza uma condição específica
  const handleUpdateCondition = (id: string, field: keyof RuleCondition, value: string) => {
    setCurrentConditions(
      currentConditions.map((cond) =>
        cond.id === id ? { ...cond, [field]: value } : cond
      )
    )
  }

  // Adiciona o grupo de regras completo
  const handleAddRuleGroup = () => {
    // Valida se todas as condições estão preenchidas
    const allValid = currentConditions.every(
      (cond) => cond.tabela && cond.atributo && cond.operacao && cond.valor
    )

    if (!ruleName.trim()) {
      alert('O nome da regra é obrigatório')
      return
    }

    if (allValid) {
      const newRuleGroup: RuleGroup = {
        id: Date.now().toString(),
        nome: ruleName,
        conditions: [...currentConditions],
        periods: [...savedPeriods]
      }
      setSavedRuleGroups([...savedRuleGroups, newRuleGroup])
      
      // Reseta para uma condição vazia
      setRuleName("")
      setCurrentConditions([
        {
          id: Date.now().toString(),
          tabela: "",
          atributo: "",
          operacao: "",
          valor: ""
        },
      ])
      setSavedPeriods([])
    } else {
      alert('Preencha todos os campos da regra')
    }
  }

  // Deleta um grupo de regras
  const handleDeleteRuleGroup = (id: string) => {
    setSavedRuleGroups(savedRuleGroups.filter((group) => group.id !== id))
  }

  // Editar um grupo de regras
  const handleEditRuleGroup = (id: string) => {
    const group = savedRuleGroups.find(g => g.id === id)
    if (group) {
      setRuleName(group.nome)
      setCurrentConditions(group.conditions)
      setSavedPeriods(group.periods)
      
      // Remove o grupo que está sendo editado
      setSavedRuleGroups(savedRuleGroups.filter((g) => g.id !== id))
    }
  }

  // Handler para adicionar período
  const handlePeriodAdd = (period: RegraPeriodoData) => {
    setSavedPeriods([...savedPeriods, period])
  }

  // Handler para remover período
  const handlePeriodRemove = (index: number) => {
    setSavedPeriods(savedPeriods.filter((_, i) => i !== index))
  }

  // Gera as opções de tabela dinamicamente a partir da API
  const tabelaOptions = tabelasColunas.map(t => ({
    value: t.nomeTabela,
    label: t.nomeTabela.toUpperCase()
  }))

  // Gera as opções de atributo baseado na tabela selecionada
  const getAtributoOptions = (tabela: string) => {
    if (!tabela) return []
    
    return tabelasColunas
      .find(t => t.nomeTabela === tabela)
      ?.colunasPermitidas.map(col => ({
        value: col,
        label: col.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      })) || []
  }

  const operacaoOptions = [
    { value: "maior que", label: "Maior que" },
    { value: "menor que", label: "Menor que" },
    { value: "igual a", label: "Igual a" },
    { value: "diferente de", label: "Diferente de" },
    { value: "maior ou igual", label: "Maior ou igual" },
    { value: "menor ou igual", label: "Menor ou igual" },
  ]

  // Reseta o atributo quando a tabela muda
  const handleTabelaChange = (id: string, value: string) => {
    setCurrentConditions(
      currentConditions.map((cond) =>
        cond.id === id ? { ...cond, tabela: value, atributo: "" } : cond
      )
    )
  }

  if (loading) {
    return (
      <div className="bg-[#E8EBF5] rounded-lg p-6">
        <div className="text-center text-gray-600">
          Carregando tabelas e colunas...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#E8EBF5] rounded-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Left section - Rule configuration */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <div className="max-w-sm">
              <FilterField
                label="Nome da Regra"
                name="ruleName"
                type="text"
                value={ruleName}
                onChange={(value) => setRuleName(String(value))}
                placeholder="Digite o nome da regra"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="space-y-4">
              {currentConditions.map((condition, index) => (
                <div key={condition.id}>
                  {index > 0 && (
                    <div className="flex items-center justify-center my-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        E
                      </span>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FilterField
                        label="Escolha a tabela"
                        name={`tabela-${condition.id}`}
                        type="select"
                        value={condition.tabela}
                        onChange={(value) => handleTabelaChange(condition.id, String(value))}
                        options={tabelaOptions}
                        placeholder="Selecione"
                      />

                      <FilterField
                        label="Escolha o atributo"
                        name={`atributo-${condition.id}`}
                        type="select"
                        value={condition.atributo}
                        onChange={(value) => handleUpdateCondition(condition.id, "atributo", String(value))}
                        options={getAtributoOptions(condition.tabela)}
                        placeholder={condition.tabela ? "Selecione" : "Selecione uma tabela primeiro"}
                        disabled={!condition.tabela}
                      />

                      <FilterField
                        label="Escolha a operação"
                        name={`operacao-${condition.id}`}
                        type="select"
                        value={condition.operacao}
                        onChange={(value) => handleUpdateCondition(condition.id, "operacao", String(value))}
                        options={operacaoOptions}
                        placeholder="Selecione"
                      />

                      <FilterField
                        label="Digite o Valor"
                        name={`valor-${condition.id}`}
                        type="text"
                        value={condition.valor}
                        onChange={(value) => handleUpdateCondition(condition.id, "valor", String(value))}
                        placeholder="Valor"
                      />
                    </div>

                    {currentConditions.length > 1 && (
                      <button
                        onClick={() => handleRemoveCondition(condition.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remover condição"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <ActionButton label="And" onClick={handleAddCondition} variant="secondary" />
              <ActionButton label="Add regra" onClick={handleAddRuleGroup} variant="primary" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Regras Adicionadas</h4>
              {savedRuleGroups.length === 0 ? (
                <div className="text-sm text-gray-500">Nenhuma regra adicionada</div>
              ) : (
                savedRuleGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white border border-gray-200 rounded p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-2 text-blue-700">{group.nome}</p>
                        <div className="space-y-2">
                          {group.conditions.map((condition, idx) => (
                            <div key={condition.id}>
                              {idx > 0 && (
                                <div className="flex items-center my-1">
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                    E
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="font-medium">
                                  {condition.tabela}.{condition.atributo}
                                </span>
                                <span className="text-gray-400">&gt;</span>
                                <span>{condition.operacao}</span>
                                <span className="font-medium">{condition.valor}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {group.periods.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-xs font-medium text-gray-600">📅 Períodos configurados:</p>
                            {group.periods.map((period, idx) => (
                              <div key={idx} className="text-xs text-gray-600 ml-4">
                                • Dia {period.dataInicio} às {period.horaInicio} até Dia {period.dataFim} às {period.horaFim}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => handleEditRuleGroup(group.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRuleGroup(group.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right section - Period configuration */}
        <div className="lg:w-80">
          <PeriodCampaignField 
            onPeriodAdd={handlePeriodAdd}
            savedPeriods={savedPeriods}
            onPeriodRemove={handlePeriodRemove}
          />
        </div>
      </div>
    </div>
  )
}