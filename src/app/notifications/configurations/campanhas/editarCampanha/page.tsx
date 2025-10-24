'use client'
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import FilterField from '@/components/filterField/FilterField'
import ActionButton from "@/components/actionButton/ActionButton"
import NotificationsEditCampaignSection from "@/components/sections/NotificationsEditCampaginSection"
import NotificationsEditCommunicationChannelsSection from '@/components/sections/NotificationsEditCommunicationChannelsSection'
import { CampanhaData, RegraData, TemplateData } from '@/interfaces/Notifications'

const API_BASE_URL = "https://api-gedai.smartdatasolutions.com.br/notificacoes/campanha"

export default function EditarCampanhaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campanhaId = searchParams.get('id')
  
  const [campanha, setCampanha] = useState<CampanhaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    status: ''
  })
  const [regras, setRegras] = useState<RegraData[]>([])
  const [templates, setTemplates] = useState<TemplateData[]>([])

  // Buscar token dos cookies
  useEffect(() => {
    const getToken = () => {
      const tokenValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      
      if (tokenValue) {
        setToken(tokenValue)
        console.log('[EditarCampanha] Token encontrado')
      } else {
        console.error("Token de autenticação não encontrado")
        alert('Erro de autenticação. Faça login novamente.')
        router.push('/login')
      }
    }
    getToken()
  }, [router])

  // Carregar dados da campanha diretamente da API externa
  useEffect(() => {
    const fetchCampanha = async () => {
      // ✅ Validações importantes
      if (!token) {
        console.log('[EditarCampanha] Aguardando token...')
        return
      }

      if (!campanhaId) {
        console.error('[EditarCampanha] ID da campanha não encontrado nos query params')
        alert('ID da campanha não encontrado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Construir URL da API externa
        const apiUrl = new URL(API_BASE_URL)
        apiUrl.searchParams.set('page', '0')
        apiUrl.searchParams.set('size', '100')
        
        console.log('[EditarCampanha] Buscando campanhas da API:', apiUrl.toString())
        console.log('[EditarCampanha] Procurando campanha com ID:', campanhaId)
        
        const response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`API retornou status ${response.status}`)
        }
        
        const data = await response.json()
        const campanhas = Array.isArray(data) ? data : data.content || []
        
        console.log('[EditarCampanha] Total de campanhas retornadas:', campanhas.length)
        
        // ✅ Buscar campanha pelo ID dos query params
        const campanhaEncontrada = campanhas.find(
          (c: CampanhaData) => String(c.id) === String(campanhaId)
        )
        
        if (campanhaEncontrada) {
          console.log('📥 [EditarCampanha] Campanha carregada:', JSON.stringify(campanhaEncontrada, null, 2))
          setCampanha(campanhaEncontrada)
          setFormData({
            nome: campanhaEncontrada.nome || '',
            status: campanhaEncontrada.status || ''
          })
          setRegras(campanhaEncontrada.campanhaRegras || [])
          setTemplates(campanhaEncontrada.campanhaTemplates || [])
        } else {
          console.error('[EditarCampanha] Campanha não encontrada com ID:', campanhaId)
          alert('Campanha não encontrada')
        }
      } catch (error) {
        console.error('Erro ao carregar campanha:', error)
        alert('Erro ao carregar campanha. Verifique sua conexão.')
      } finally {
        setLoading(false)
      }
    }

    // ✅ Só executa quando tiver tanto token quanto ID
    if (token && campanhaId) {
      fetchCampanha()
    } else if (!campanhaId && token) {
      // Se não tem ID mas tem token, para o loading
      setLoading(false)
    }
  }, [campanhaId, token]) // ✅ Dependências corretas

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: String(value)
    }))
  }

  const handleRegrasChange = (novasRegras: RegraData[]) => {
    console.log('📝 [EditarCampanha] Regras atualizadas:', JSON.stringify(novasRegras, null, 2))
    setRegras(novasRegras)
  }

  const handleTemplatesChange = (novosTemplates: TemplateData[]) => {
    setTemplates(novosTemplates)
  }

  const handleSave = async () => {
    if (!campanha || !token) return
    
    // Validação
    if (!formData.nome.trim()) {
      alert('O nome da campanha é obrigatório')
      return
    }

    // Validação das regras
    const regrasInvalidas = regras.filter(regra => 
      !regra.nome || 
      !regra.campanhaRegraRelacionamentos || 
      regra.campanhaRegraRelacionamentos.length === 0 ||
      regra.campanhaRegraRelacionamentos.some(rel => !rel.tabelaRef || !rel.colunaRef || !rel.valor)
    )

    if (regrasInvalidas.length > 0) {
      alert('Todas as regras devem ter nome e pelo menos uma condição válida (tabela, atributo e valor)')
      console.error('❌ Regras inválidas:', regrasInvalidas)
      return
    }
    
    setSaving(true)
    try {
      // Mapear estrutura para a API externa
      const dadosParaSalvar = {
        nome: formData.nome,
        regras: regras,
        templates: templates.map(template => ({
          nome: template.nome || '',
          canalComunicacao: template.canalComunicacao || 'SMS',
          texto: template.texto || '',
          assunto: template.assunto || '',
          status: template.status || 'ACTIVE'
        }))
      }
      
      console.log('📤 [EditarCampanha] Dados para salvar:', JSON.stringify(dadosParaSalvar, null, 2))
      
      // Chamar API PUT diretamente
      const response = await fetch(`${API_BASE_URL}/${campanha.id}`, {
        method: 'PUT',
        headers: { 
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaSalvar)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[EditarCampanha] Erro da API externa:", errorText)
        throw new Error(`API retornou status ${response.status}: ${errorText}`)
      }

      // Verifica se há conteúdo na resposta
      const contentType = response.headers.get('content-type')
      const contentLength = response.headers.get('content-length')
      
      let data = null
      
      // Só tenta fazer parse do JSON se houver conteúdo
      if (contentType?.includes('application/json') && contentLength !== '0') {
        const responseText = await response.text()
        
        if (responseText && responseText.trim().length > 0) {
          try {
            data = JSON.parse(responseText)
          } catch (parseError) {
            console.warn("[EditarCampanha] Resposta não é JSON válido, mas request foi bem-sucedido")
          }
        }
      }
      
      console.log("[EditarCampanha] Campanha atualizada com sucesso:", campanha.id, data)
      alert('Campanha atualizada com sucesso!')
      router.push('/notifications/configurations/campanhas')
    } catch (error) {
      console.error('❌ [EditarCampanha] Erro ao salvar campanha:', error)
      alert(`Erro ao salvar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/notifications/configurations/campanhas')
  }

  // ✅ Melhor tratamento de loading
  if (loading) {
    return (
      <DefaultLayout
        headerTitle="Editar Campanha"
        headerSubtitle="Página para edição de campanhas"
        menuGroups={menuGroups}
        footerText="Sistema de Petições v1.0"
      >
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando campanha...</p>
            {!token && <p className="text-sm text-gray-400 mt-2">Aguardando autenticação...</p>}
            {!campanhaId && token && <p className="text-sm text-gray-400 mt-2">ID da campanha não encontrado</p>}
          </div>
        </div>
      </DefaultLayout>
    )
  }

  if (!campanha) {
    return (
      <DefaultLayout
        headerTitle="Editar Campanha"
        headerSubtitle="Página para edição de campanhas"
        menuGroups={menuGroups}
        footerText="Sistema de Petições v1.0"
      >
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <div className="text-center">
            <p className="text-xl mb-4">Campanha não encontrada</p>
            <p className="text-gray-600 mb-4">
              {!campanhaId ? 'ID da campanha não foi fornecido.' : `ID buscado: ${campanhaId}`}
            </p>
            <button 
              onClick={() => router.push('/notifications/configurations/campanhas')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Voltar para campanhas
            </button>
          </div>
        </div>
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout
      headerTitle="Editar Campanha"
      headerSubtitle={`Editando: ${campanha.nome}`}
      menuGroups={menuGroups}
      footerText="Sistema de Petições v1.0"
    >
      <div className="space-y-6">
        {/* Campo nome da campanha */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <FilterField 
            label="Nome da Campanha" 
            name="nome" 
            type="text" 
            value={formData.nome}
            onChange={(value) => handleInputChange('nome', value)}
          />
        </div>

        {/* Seção de edição de regras */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Regras da Campanha</h3>
          <NotificationsEditCampaignSection
            onDataChange={handleRegrasChange}
            initialRegras={campanha.campanhaRegras || []}
          />
        </div>

        {/* Seção de canais de comunicação */}
        <NotificationsEditCommunicationChannelsSection
          onDataChange={handleTemplatesChange}
          initialTemplates={campanha.campanhaTemplates || []}
        />

        {/* Botões de ação */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex gap-4 justify-end">
            <ActionButton
              label="Cancelar"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
              loading={false}
            />
            <ActionButton
              label={saving ? "Salvando..." : "Salvar Alterações"}
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              loading={saving}
            />
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}