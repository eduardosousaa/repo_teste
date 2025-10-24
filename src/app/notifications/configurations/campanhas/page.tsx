"use client"
import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import ActionButton from "@/components/actionButton/ActionButton"
import NotificationsCampanhaFilter from "@/components/filters/NotificationsCampanhaFilter"
import SuperTable from "@/components/tables/SuperTable"
import ToggleSwitch from "@/components/toggleSwitch/ToggleSwitch"
import NotificationsCampanhaDeleteModal from "../../../../components/modals/NotificationsCampanhaDeleteModal"
import { useState, useEffect } from "react"
import { CampanhaData } from "@/interfaces/Notifications"

const API_BASE_URL = "https://api-gedai.smartdatasolutions.com.br/notificacoes/campanha"

export default function CampanhasPage() {
  const [campanhasData, setCampanhasData] = useState<CampanhaData[]>([])
  const [filteredData, setFilteredData] = useState<CampanhaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  // Estados para o modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [campanhaToDelete, setCampanhaToDelete] = useState<CampanhaData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Buscar campanhas da API
  const fetchCampanhas = async () => {
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const apiUrl = new URL(API_BASE_URL)
      apiUrl.searchParams.set('page', '0')
      apiUrl.searchParams.set('size', '100')

      const response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Falha ao carregar campanhas: ${response.status}`)
      }

      const data = await response.json()
      const campanhas = Array.isArray(data) ? data : data.content || []
      setCampanhasData(campanhas)
      setFilteredData(campanhas)
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error)
      setError("Erro ao carregar campanhas. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCampanhas()
    }
  }, [token])

  const handleNovaCampanha = () => {
    window.location.href = "/notifications/configurations/campanhas/novaCampanha"
  }

  const handleFilterChange = (filters: { [key: string]: string | number }) => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered = campanhasData

      // Filtro por nome
      if (filters.nome) {
        filtered = filtered.filter((c) =>
          c.nome.toLowerCase().includes((filters.nome as string).toLowerCase())
        )
      }

      // Filtro por status (aceita múltiplos formatos)
      if (filters.status) {
        filtered = filtered.filter((c) => {
          const status = (c.status as string).toLowerCase()
          const filterStatus = (filters.status as string).toLowerCase()
          
          // Normaliza os valores para comparação
          if (filterStatus === "ativa" || filterStatus === "active") {
            return status === "ativa" || status === "active"
          }
          if (filterStatus === "inativa" || filterStatus === "inactive") {
            return status === "inativa" || status === "inactive"
          }
          if (filterStatus === "archived") {
            return status === "archived"
          }
          
          return status === filterStatus
        })
      }

      // Filtro por tipo de campanha (campanhaTipo, não template)
      if (filters.campanhaTipo) {
        filtered = filtered.filter((c) => 
          c.campanhaTipo === filters.campanhaTipo
        )
      }

      setFilteredData(filtered)
      setIsLoading(false)
    }, 300)
  }

  const handleDeleteCampanha = (id: number) => {
    const campanha = campanhasData.find((c) => c.id === id)
    if (campanha) {
      setCampanhaToDelete(campanha)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!campanhaToDelete || !token) return

    try {
      setIsDeleting(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/${campanhaToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao deletar campanha: ${response.status} - ${errorText}`)
      }

      await fetchCampanhas()
      setIsDeleteModalOpen(false)
      setCampanhaToDelete(null)
    } catch (error) {
      console.error("Erro ao deletar campanha:", error)
      setError(error instanceof Error ? error.message : "Erro ao deletar campanha.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setCampanhaToDelete(null)
  }

  const handleEditCampanha = (id: number) => {
    // Encontrar a campanha completa
    const campanha = campanhasData.find((c) => c.id === id)
    
    if (campanha) {
      // Criar query params com os dados da campanha
      const queryParams = new URLSearchParams({
        id: String(campanha.id),
      })

      // Navegar apenas com query params (sem ID na rota)
      window.location.href = `/notifications/configurations/campanhas/editarCampanha?${queryParams.toString()}`
    } else {
      // Fallback: navegar só com o ID
      window.location.href = `/configuration/campanhas/editarCampanha?id=${id}`
    }
  }

  const handleToggleCampanhaStatus = async (id: number, currentStatus: string) => {
    if (!token) return

    const newStatus = currentStatus === "ativa" || currentStatus === "ACTIVE" ? "inativa" : "ativa"

    try {
      setError(null)

      // Atualizar UI otimista
      const updated = campanhasData.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      )
      setCampanhasData(updated)
      setFilteredData(updated)

      const response = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Falha ao alterar status: ${response.status} - ${errorText}`)
      }

      console.log(`Campanha ${newStatus} com sucesso`)
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      setError(error instanceof Error ? error.message : "Erro ao alterar status")
      await fetchCampanhas() // rollback
    }
  }

  // Renderizadores
  const renderTemplates = (row: CampanhaData) =>
    !row.campanhaTemplates?.length
      ? <span className="text-gray-400">Nenhum template</span>
      : <span>{row.campanhaTemplates.map((t) => t.nome).join(", ")}</span>

  const columns = [
    { header: "Nome", accessor: "nome" as keyof CampanhaData },
    { header: "Tipo de Campanha", accessor: "campanhaTipo" as keyof CampanhaData },
    { header: "Templates", accessor: "campanhaTemplates" as keyof CampanhaData, render: renderTemplates },
    { header: "Criado em", accessor: "created" as keyof CampanhaData },
  ]

  return (
    <DefaultLayout
      headerTitle="Campanhas"
      headerSubtitle="Seja bem vindo!"
      haveActionButtons
      menuGroups={menuGroups}
      footerText="Sistema de Notificações v1.0"
      actionButtons={[
        <ActionButton
          key="nova-campanha"
          label="Nova campanha"
          variant="primary"
          onClick={handleNovaCampanha}
        />
      ]}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <NotificationsCampanhaFilter onFilterChange={handleFilterChange} />

      <SuperTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage="Nenhuma campanha encontrada."
        actions={[
          {
            label: "Editar",
            icon: "/icons/edit.svg",
            onClick: (row) => handleEditCampanha(row.id as number),
          },
          {
            label: "Deletar",
            icon: "/icons/delete.svg",
            onClick: (row) => handleDeleteCampanha(row.id as number),
          },
          {
            label: "Ativar/Desativar",
            render: (row: CampanhaData) => (
              <div className="flex items-center gap-2">
                <ToggleSwitch
                  enabled={row.status === "ativa" || row.status === "ACTIVE"}
                  onToggle={() => handleToggleCampanhaStatus(row.id as number, row.status as string)} />
                <span className="text-sm text-gray-600">
                  {row.status === "ativa" || row.status === "ACTIVE"
                    ? "Ativa"
                    : row.status === "ARCHIVED"
                      ? "Arquivada"
                      : "Inativa"}
                </span>
              </div>
            ),
            onClick: function (): void {
              throw new Error("Function not implemented.")
            }
          },
        ]}
      />

      <NotificationsCampanhaDeleteModal
        isOpen={isDeleteModalOpen}
        campanha={campanhaToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </DefaultLayout>
  )
}