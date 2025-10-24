"use client"

import { useState, useEffect } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import ActionButton from "@/components/actionButton/ActionButton"
import NotificationsCDADataSourceSection from "@/components/sections/NotificationsCDADataSourceSection"
import NotificationsDevedoresDataSourceSection from "@/components/sections/NotificationsDevedoresDataSourceSection"
import NotificationsRFBDataSourceSection from "@/components/sections/NotificationsRFBDataSourceSection"
import { FrequenciaItem, CDADataSourceData, DevedoresDataSourceData, RFBDataSourceData} from "@/interfaces/Notifications"

const API_BASE_URL = "https://api-gedai.smartdatasolutions.com.br/notificacoes/fonte-dados"

type FonteDadosData = CDADataSourceData | DevedoresDataSourceData | RFBDataSourceData

interface APIResponse {
  dadosTipo: string
  fonteDadosTipo: string
  frequenciaTipo: string
  fonteDadosFrequencias?: FrequenciaItem[]
  frequencia?: FrequenciaItem[]
  usuario: string
  senha?: string
}

// Função para fazer parse seguro de JSON
const safeJsonParse = async (response: Response): Promise<unknown> => {
  const text = await response.text()
  console.log("[fonteDados] Raw response text:", text)
  
  if (!text || text.trim() === '') {
    console.log("[fonteDados] Response is empty")
    return null
  }
  
  try {
    return JSON.parse(text)
  } catch (e) {
    console.error("[fonteDados] Failed to parse JSON:", e)
    return null
  }
}

// Função para validar dados
const validateFonteDados = (data: FonteDadosData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Validar dadosTipo
  const validDadosTipo = ['CDA', 'DEVEDOR', 'DEVEDORES', 'RFB']
  if (!data.dadosTipo || !validDadosTipo.includes(data.dadosTipo)) {
    errors.push(`dadosTipo deve ser um de: ${validDadosTipo.join(', ')}`)
  }
  
  // Validar fonteDadosTipo
  const validFonteDadosTipo = ['API', 'RPA']
  if (!data.fonteDadosTipo || !validFonteDadosTipo.includes(data.fonteDadosTipo)) {
    errors.push(`fonteDadosTipo deve ser um de: ${validFonteDadosTipo.join(', ')}`)
  }
  
  // Validar frequenciaTipo
  const validFrequenciaTipo = ['DIARIO', 'SEMANAL', 'MENSAL']
  if (!data.frequenciaTipo || !validFrequenciaTipo.includes(data.frequenciaTipo)) {
    errors.push(`frequenciaTipo deve ser um de: ${validFrequenciaTipo.join(', ')}`)
  }
  
  // Validar frequencia array
  if (!Array.isArray(data.frequencia) || data.frequencia.length === 0) {
    errors.push('frequencia deve ser um array não vazio')
  } else {
    data.frequencia.forEach((freq: FrequenciaItem, index: number) => {
      // Validar horario
      if (!freq.horario || typeof freq.horario !== 'string') {
        errors.push(`frequencia[${index}].horario é obrigatório`)
      } else {
        const timePattern = /^([01]?\d|2[0-3]):[0-5]\d$/
        if (!timePattern.test(freq.horario)) {
          errors.push(`frequencia[${index}].horario deve estar no formato HH:mm ou H:mm`)
        }
      }
      
      // Validar diaSemana e diaAno
      if (typeof freq.diaSemana !== 'number') {
        errors.push(`frequencia[${index}].diaSemana deve ser um número`)
      }
      
      if (typeof freq.diaAno !== 'number') {
        errors.push(`frequencia[${index}].diaAno deve ser um número`)
      }
      
      // Validações específicas por tipo de frequência
      if (data.frequenciaTipo === 'SEMANAL') {
        if (freq.diaSemana < 0 || freq.diaSemana > 6) {
          errors.push(`frequencia[${index}].diaSemana deve estar entre 0 e 6 para SEMANAL`)
        }
        if (freq.diaAno !== 0) {
          errors.push(`frequencia[${index}].diaAno deve ser 0 para SEMANAL`)
        }
      } else if (data.frequenciaTipo === 'MENSAL') {
        if (freq.diaAno < 1 || freq.diaAno > 31) {
          errors.push(`frequencia[${index}].diaAno deve estar entre 1 e 31 para MENSAL`)
        }
        if (freq.diaSemana !== 0) {
          errors.push(`frequencia[${index}].diaSemana deve ser 0 para MENSAL`)
        }
      } else if (data.frequenciaTipo === 'DIARIO') {
        if (freq.diaSemana !== 0) {
          errors.push(`frequencia[${index}].diaSemana deve ser 0 para DIARIO`)
        }
        if (freq.diaAno !== 0) {
          errors.push(`frequencia[${index}].diaAno deve ser 0 para DIARIO`)
        }
      }
    })
  }
  
  // Validar credenciais para API
  if (data.fonteDadosTipo === 'API') {
    if (!data.usuario || typeof data.usuario !== 'string' || data.usuario.trim().length === 0) {
      errors.push('usuario é obrigatório para fonteDadosTipo API')
    }
    
    if (!data.senha || typeof data.senha !== 'string' || data.senha.trim().length === 0) {
      errors.push('senha é obrigatória para fonteDadosTipo API')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default function FonteDadosPage() {
  const [cdaData, setCdaData] = useState<Partial<CDADataSourceData>>({})
  const [devedoresData, setDevedoresData] = useState<Partial<DevedoresDataSourceData>>({})
  const [rfbData, setRfbData] = useState<Partial<RFBDataSourceData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  // Buscar token dos cookies
  useEffect(() => {
    const getToken = () => {
      const cookies = document.cookie.split(';')
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='))
      if (tokenCookie) {
        const tokenValue = tokenCookie.split('=')[1]
        setToken(tokenValue)
      } else {
        console.error("Token de autenticação não encontrado")
      }
    }
    getToken()
  }, [])

  // Buscar dados existentes ao carregar a página
  useEffect(() => {
    const fetchExistingData = async () => {
      if (!token) {
        setIsFetching(false)
        return
      }

      try {
        console.log("Buscando configurações existentes...")
        
        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        })
        
        if (!response.ok) {
          console.error("Erro ao buscar configurações:", response.status)
          setIsFetching(false)
          return
        }

        const data = await safeJsonParse(response)
        console.log("Dados recebidos da API:", data)

        // A API retorna um array de configurações
        if (Array.isArray(data)) {
          data.forEach((config: unknown) => {
            const apiConfig = config as APIResponse
            const dadosTipo = apiConfig.dadosTipo?.toUpperCase()
            
            // Distribui os dados para os states corretos
            switch (dadosTipo) {
              case "CDA":
                {
                  const formattedConfig: Partial<CDADataSourceData> = {
                    fonteDadosTipo: apiConfig.fonteDadosTipo as "API" | "RPA",
                    frequenciaTipo: apiConfig.frequenciaTipo as "SEMANAL" | "MENSAL" | "DIARIO",
                    frequencia: apiConfig.fonteDadosFrequencias || apiConfig.frequencia || [],
                    usuario: apiConfig.usuario,
                    senha: apiConfig.senha || ""
                  }
                  console.log("Carregando dados CDA:", formattedConfig)
                  setCdaData(formattedConfig)
                }
                break
              case "DEVEDOR":
              case "DEVEDORES":
                {
                  const formattedConfig: Partial<DevedoresDataSourceData> = {
                    fonteDadosTipo: apiConfig.fonteDadosTipo as "API" | "RPA",
                    frequenciaTipo: apiConfig.frequenciaTipo as "SEMANAL" | "MENSAL" | "DIARIO",
                    frequencia: apiConfig.fonteDadosFrequencias || apiConfig.frequencia || [],
                    usuario: apiConfig.usuario,
                    senha: apiConfig.senha || ""
                  }
                  console.log("Carregando dados Devedores:", formattedConfig)
                  setDevedoresData(formattedConfig)
                }
                break
              case "RFB":
                {
                  // RFB sempre usa RPA, então fazemos cast correto
                  const formattedConfig: Partial<RFBDataSourceData> = {
                    fonteDadosTipo: "RPA", // RFB sempre é RPA
                    frequenciaTipo: apiConfig.frequenciaTipo as "SEMANAL" | "MENSAL" | "DIARIO",
                    frequencia: apiConfig.fonteDadosFrequencias || apiConfig.frequencia || [],
                    usuario: apiConfig.usuario,
                    senha: apiConfig.senha || ""
                  }
                  console.log("Carregando dados RFB:", formattedConfig)
                  setRfbData(formattedConfig)
                }
                break
              default:
                console.warn("Tipo de dados desconhecido:", dadosTipo)
            }
          })
          
          console.log("✓ Configurações carregadas com sucesso")
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error)
      } finally {
        setIsFetching(false)
      }
    }

    if (token) {
      fetchExistingData()
    }
  }, [token])

  const handleSaveConfigurations = async () => {
    if (!token) {
      alert("Token de autenticação não encontrado")
      return
    }

    setIsLoading(true)
    
    try {
      const results = []
      const errors = []

      // POST 1: CDA
      if (Object.keys(cdaData).length > 0) {
        try {
          console.log("Enviando configurações CDA:", cdaData)
          
          const apiPayload: CDADataSourceData = {
            dadosTipo: "CDA",
            fonteDadosTipo: cdaData.fonteDadosTipo || "API",
            frequenciaTipo: cdaData.frequenciaTipo || "DIARIO",
            frequencia: cdaData.frequencia || [{
              diaSemana: 0,
              diaAno: 0,
              horario: "00:00"
            }],
            usuario: cdaData.usuario || "",
            senha: cdaData.senha || ""
          }
          
          // Validar
          const validation = validateFonteDados(apiPayload)
          if (!validation.isValid) {
            throw new Error(validation.errors.join(", "))
          }
          
          const cdaResponse = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(apiPayload)
          })

          if (!cdaResponse.ok) {
            const errorData = await safeJsonParse(cdaResponse) as { error?: string; message?: string } | null
            throw new Error(errorData?.error || errorData?.message || `Erro ${cdaResponse.status}`)
          }

          const cdaResult = await safeJsonParse(cdaResponse)
          results.push({ section: "CDA", data: cdaResult })
          console.log("✓ CDA salvo com sucesso:", cdaResult)
        } catch (error) {
          console.error("✗ Erro ao salvar CDA:", error)
          errors.push(`CDA: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }

      // POST 2: Devedores
      if (Object.keys(devedoresData).length > 0) {
        try {
          console.log("Enviando configurações Devedores:", devedoresData)
          
          const apiPayload: DevedoresDataSourceData = {
            dadosTipo: "DEVEDOR",
            fonteDadosTipo: devedoresData.fonteDadosTipo || "API",
            frequenciaTipo: devedoresData.frequenciaTipo || "DIARIO",
            frequencia: devedoresData.frequencia || [{
              diaSemana: 0,
              diaAno: 0,
              horario: "00:00"
            }],
            usuario: devedoresData.usuario || "",
            senha: devedoresData.senha || ""
          }
          
          // Validar
          const validation = validateFonteDados(apiPayload)
          if (!validation.isValid) {
            throw new Error(validation.errors.join(", "))
          }
          
          const devedoresResponse = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(apiPayload)
          })

          if (!devedoresResponse.ok) {
            const errorData = await safeJsonParse(devedoresResponse) as { error?: string; message?: string } | null
            throw new Error(errorData?.error || errorData?.message || `Erro ${devedoresResponse.status}`)
          }

          const devedoresResult = await safeJsonParse(devedoresResponse)
          results.push({ section: "Devedores", data: devedoresResult })
          console.log("✓ Devedores salvo com sucesso:", devedoresResult)
        } catch (error) {
          console.error("✗ Erro ao salvar Devedores:", error)
          errors.push(`Devedores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }

      // POST 3: RFB
      if (Object.keys(rfbData).length > 0) {
        try {
          console.log("Enviando configurações RFB:", rfbData)
          
          const apiPayload: RFBDataSourceData = {
            dadosTipo: "RFB",
            fonteDadosTipo: "RPA", // RFB sempre usa RPA
            frequenciaTipo: rfbData.frequenciaTipo || "DIARIO",
            frequencia: rfbData.frequencia || [{
              diaSemana: 0,
              diaAno: 0,
              horario: "00:00"
            }],
            usuario: rfbData.usuario || "",
            senha: rfbData.senha || ""
          }
          
          // Validar
          const validation = validateFonteDados(apiPayload)
          if (!validation.isValid) {
            throw new Error(validation.errors.join(", "))
          }
          
          const rfbResponse = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
              'accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(apiPayload)
          })

          if (!rfbResponse.ok) {
            const errorData = await safeJsonParse(rfbResponse) as { error?: string; message?: string } | null
            throw new Error(errorData?.error || errorData?.message || `Erro ${rfbResponse.status}`)
          }

          const rfbResult = await safeJsonParse(rfbResponse)
          results.push({ section: "RFB", data: rfbResult })
          console.log("✓ RFB salvo com sucesso:", rfbResult)
        } catch (error) {
          console.error("✗ Erro ao salvar RFB:", error)
          errors.push(`RFB: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
        }
      }

      // Exibe resumo
      if (results.length > 0) {
        console.log(`✓ ${results.length} configuração(ões) salva(s) com sucesso`)
        alert(`✓ ${results.length} configuração(ões) salva(s) com sucesso!`)
      }

      if (errors.length > 0) {
        console.error(`✗ ${errors.length} erro(s) encontrado(s):`, errors)
        alert(`✗ Erros encontrados:\n${errors.join('\n')}`)
      }

      if (results.length === 0 && errors.length === 0) {
        alert("⚠ Nenhuma configuração para salvar")
      }

    } catch (error) {
      console.error("Erro geral:", error)
      alert("Erro ao processar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DefaultLayout
      headerTitle="Fontes de dados"
      headerSubtitle="Seja bem vindo!"
      menuGroups={menuGroups}
      footerText="Sistema de Petições v1.0"
    >
      {isFetching ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <NotificationsCDADataSourceSection
            onDataChange={(data) => setCdaData(data as Partial<CDADataSourceData>)} 
            initialData={cdaData}
          />
          <NotificationsDevedoresDataSourceSection
            onDataChange={(data) => setDevedoresData(data as Partial<DevedoresDataSourceData>)}
            initialData={devedoresData}
          />
          <NotificationsRFBDataSourceSection
            onDataChange={(data) => setRfbData(data as Partial<RFBDataSourceData>)}
            initialData={rfbData}
          />

          <div className="pt-4">
            <ActionButton
              key="salvar-configuracoes"
              label={isLoading ? "Salvando..." : "Salvar configurações"}
              variant="primary"
              onClick={handleSaveConfigurations}
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </DefaultLayout>
  )
}