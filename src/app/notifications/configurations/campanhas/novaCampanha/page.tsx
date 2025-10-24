"use client"
import { useState, useEffect } from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import FilterField from "@/components/filterField/FilterField"
import NotificationsCommunicationChannelsSection from "@/components/sections/NotificationsCommunicationChannelsSection"
import NotificationsNewCampaignSection from "@/components/sections/NotificationsNewCampaignSection"
import ActionButton from "@/components/actionButton/ActionButton"
import { TemplateData, RegraData } from "@/interfaces/Notifications"

const API_BASE_URL = "https://api-gedai.smartdatasolutions.com.br/notificacoes/campanha"

export default function NovaCampanhaPage() {
  const [campaignName, setCampaignName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [templatesData, setTemplatesData] = useState<TemplateData[]>([])
  const [regrasData, setRegrasData] = useState<RegraData[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        setError("Token de autenticação não encontrado")
      }
    }
    getToken()
  }, [])

  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      setError("Por favor, insira um nome para a campanha")
      return
    }

    if (templatesData.length === 0) {
      setError("Por favor, configure pelo menos um canal de comunicação")
      return
    }

    if (regrasData.length === 0) {
      setError("Por favor, adicione pelo menos uma regra")
      return
    }

    if (!token) {
      setError("Token de autenticação não encontrado")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const payload = {
        nome: campaignName,
        regras: regrasData,
        templates: templatesData,
      }

      console.log("Payload enviado:", JSON.stringify(payload, null, 2))

      // Chama diretamente a API externa
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erro da API externa:", errorText)
        throw new Error(`Falha ao criar campanha: ${response.status}${errorText ? ` - ${errorText}` : ''}`)
      }

      // Verifica se há conteúdo na resposta
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      
      let result = null
      
      // Só tenta fazer parse do JSON se houver conteúdo
      if (contentType?.includes('application/json') && contentLength !== '0') {
        const responseText = await response.text()
        
        // Só faz parse se houver texto
        if (responseText && responseText.trim().length > 0) {
          try {
            result = JSON.parse(responseText)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (parseError) {
            console.warn("Resposta não é JSON válido, mas request foi bem-sucedido")
          }
        }
      }

      console.log("Campanha criada com sucesso:", result?.nome || campaignName)

      setShowSuccess(true)
      setCampaignName("")
      setTemplatesData([])
      setRegrasData([])

      setTimeout(() => {
        setShowSuccess(false)
        // Redirecionar para a lista de campanhas após sucesso
        window.location.href = "/notifications/configurations/campanhas"
      }, 2000)
    } catch (error) {
      console.error("Erro ao criar campanha:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar campanha. Tente novamente.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <DefaultLayout
      headerTitle="Nova Campanha"
      headerSubtitle="Crie uma nova campanha"
      haveActionButtons={false}
      menuGroups={menuGroups}
      footerText="Sistema de Notificações v1.0"
    >
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Campanha criada com sucesso! Redirecionando...</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Campo nome da campanha */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <FilterField
          label="Nome da Campanha"
          name="nomeCampanha"
          type="text"
          value={campaignName}
          onChange={(value) => setCampaignName(typeof value === "string" ? value : String(value))}
        />
      </div>

      {/* Seção de regras */}
      <NotificationsNewCampaignSection
        onDataChange={setRegrasData}
      />

      {/* Seção de canais de comunicação */}
      <NotificationsCommunicationChannelsSection
        onDataChange={setTemplatesData}
      />

      <div className="flex justify-end mt-6 space-x-4">
        <ActionButton
          label="Cancelar"
          onClick={() => window.location.href = "/notifications/configurations/campanhas"}
          variant="secondary"
          disabled={isCreating}
        />

        <ActionButton
          label={isCreating ? "Criando..." : "Criar Campanha"}
          onClick={handleCreateCampaign}
          variant="primary"
          disabled={isCreating || !campaignName.trim()}
        />
      </div>
    </DefaultLayout>
  )
}