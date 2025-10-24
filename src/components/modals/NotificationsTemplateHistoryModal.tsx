"use client"
import { X, FileText, CheckCircle, XCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { TemplateData, PageInfo, TemplateHistoryResponse } from "@/interfaces/Notifications"


interface NotificationsTemplateHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  campanhaId: string
  canalComunicacao: string
}

export default function NotificationsTemplateHistoryModal({
  isOpen,
  onClose,
  campanhaId,
  canalComunicacao,
}: NotificationsTemplateHistoryModalProps) {
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(
    async (page: number = 0) => {
      if (!isOpen || !campanhaId) return

      try {
        setIsLoading(true)
        setError(null)

        // Pega o token do cookie
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
        
        if (!token) {
          throw new Error('Token não encontrado. Faça login novamente.')
        }

        // Valida parâmetros obrigatórios
        if (!campanhaId) {
          throw new Error('ID da campanha é obrigatório')
        }
        
        if (!canalComunicacao) {
          throw new Error('Canal de comunicação é obrigatório')
        }

        // Constrói a URL da API externa com os parâmetros
        const apiUrl = new URL('https://api-gedai.smartdatasolutions.com.br/notificacoes/campanha/templates')
        apiUrl.searchParams.set('page', page.toString())
        apiUrl.searchParams.set('size', '10')
        apiUrl.searchParams.set('id', campanhaId)
        apiUrl.searchParams.set('canalComunicacao', canalComunicacao)

        console.log('[Template History] Buscando:', apiUrl.toString())

        const response = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: { 
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[Template History] Erro da API:', errorText)
          throw new Error(`API retornou status ${response.status}: ${errorText}`)
        }

        const data: TemplateHistoryResponse = await response.json()
        setTemplates(data.content || [])
        setPageInfo(data.page)
        setCurrentPage(page)
        
        console.log('[Template History] Templates carregados com sucesso, total:', data.page?.totalElements || 0)
      } catch (err) {
        console.error("Erro ao buscar templates:", err)
        setError(err instanceof Error ? err.message : "Erro ao carregar templates")
      } finally {
        setIsLoading(false)
      }
    },
    [isOpen, campanhaId, canalComunicacao] // dependências
  )

  // ✅ useEffect agora inclui fetchTemplates com segurança
  useEffect(() => {
    if (isOpen) {
      fetchTemplates(0)
    } else {
      setTemplates([])
      setPageInfo(null)
      setCurrentPage(0)
      setError(null)
    }
  }, [isOpen, fetchTemplates])

  const handleNextPage = () => {
    if (pageInfo && currentPage < pageInfo.totalPages - 1) {
      fetchTemplates(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      fetchTemplates(currentPage - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Histórico de Templates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Canal: <span className="font-medium">{canalComunicacao}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum template encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {template.nome}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            template.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {template.status === "ACTIVE" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {template.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      {template.assunto && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 block mb-1">Assunto:</span>
                          <p className="text-sm text-gray-700 font-medium">{template.assunto}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Conteúdo:</span>
                    <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {template.texto}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {pageInfo && pageInfo.totalElements > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-medium">
                  {currentPage * pageInfo.size + 1}-
                  {Math.min((currentPage + 1) * pageInfo.size, pageInfo.totalElements)}
                </span>{" "}
                de <span className="font-medium">{pageInfo.totalElements}</span> templates
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage + 1} de {pageInfo.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= pageInfo.totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}