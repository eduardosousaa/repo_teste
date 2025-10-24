'use client'

import React from "react"
import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import SuperTable from "@/components/tables/SuperTable"
import ActionButton from "@/components/actionButton/ActionButton"
import NotificationsEditContactModal from "../../../../components/modals/NotificationsEditContactModal"
import NewContactSection from "@/components/sections/NotificationsNewContactSection"
import { EditActionButton } from "@/components/actionButton/EditActionButton"
import { DeleteActionButton } from "@/components/actionButton/DeleteActionButton"
import { ContactAPI } from "@/interfaces/Notifications"
import { useState, useEffect } from "react"

const API_BASE_URL = "https://api-gedai.smartdatasolutions.com.br/notificacoes/comunicacao-interna"

export default function ComunicacaoInternaPage() {
    const [contactsData, setContactsData] = useState<ContactAPI[]>([])
    const [filteredData, setFilteredData] = useState<ContactAPI[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [contactToDelete, setContactToDelete] = useState<ContactAPI | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [contactToEdit, setContactToEdit] = useState<ContactAPI | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
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

    const fetchContacts = async () => {
        if (!token) {
            setError("Token de autenticação não encontrado")
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
                throw new Error(`Falha ao carregar contatos: ${response.status}`)
            }
            
            const data = await response.json()
            
            console.log("Dados recebidos da API:", data)
            
            // A API pode retornar { content: [...] } ou diretamente [...]
            let safeData: ContactAPI[] = []
            
            if (Array.isArray(data)) {
                safeData = data
            } else if (data?.content && Array.isArray(data.content)) {
                safeData = data.content
            } else {
                console.warn("API retornou dados em formato inesperado:", data)
                safeData = []
            }
            
            setContactsData(safeData)
            setFilteredData(safeData)
            
        } catch (error) {
            console.error("Erro ao buscar contatos:", error)
            setError("Erro ao carregar contatos. Tente novamente.")
            setContactsData([])
            setFilteredData([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (token) {
            fetchContacts()
        }
    }, [token])

    // Auto-hide success and error messages after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    const handleDeleteContact = (id: string) => {
        const contact = contactsData.find(c => String(c.id) === id)
        if (contact) {
            setContactToDelete(contact)
            setIsDeleteModalOpen(true)
        }
    }

    const handleEditContact = (id: string) => {
        const contact = contactsData.find(c => String(c.id) === id)
        if (contact) {
            setContactToEdit(contact)
            setIsEditModalOpen(true)
        }
    }

    const handleConfirmDelete = async () => {
        if (!contactToDelete || !token) return

        try {
            setIsSubmitting(true)
            setError(null)
            
            const response = await fetch(`${API_BASE_URL}/${contactToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                let errorData
                try {
                    errorData = JSON.parse(errorText)
                } catch {
                    errorData = { message: errorText }
                }
                throw new Error(errorData.message || `Falha ao deletar contato: ${response.status}`)
            }

            // Fechar modal primeiro
            setIsDeleteModalOpen(false)
            setContactToDelete(null)
            
            // Mostrar mensagem de sucesso
            setSuccessMessage("Contato deletado com sucesso!")
            
            // Recarregar dados da API
            await fetchContacts()
            
        } catch (error) {
            console.error("Erro ao deletar contato:", error)
            setError(error instanceof Error ? error.message : "Erro ao deletar contato. Tente novamente.")
            setIsDeleteModalOpen(false)
            setContactToDelete(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveEdit = async (updatedContact: ContactAPI) => {
        if (!contactToEdit || !token) return

        try {
            setIsSubmitting(true)
            setError(null)
            
            // Garantir que enviamos identificacao e email
            const payload = {
                identificacao: updatedContact.identificacao,
                email: updatedContact.email
            }
            
            const response = await fetch(`${API_BASE_URL}/${contactToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text()
                let errorData
                try {
                    errorData = JSON.parse(errorText)
                } catch {
                    errorData = { message: errorText }
                }
                throw new Error(errorData.message || errorData.details || `Falha ao atualizar contato: ${response.status}`)
            }

            // Fechar modal primeiro
            setIsEditModalOpen(false)
            setContactToEdit(null)
            
            // Mostrar mensagem de sucesso
            setSuccessMessage("Contato atualizado com sucesso!")
            
            // Recarregar dados da API
            await fetchContacts()
            
        } catch (error) {
            console.error("Erro ao atualizar contato:", error)
            setError(error instanceof Error ? error.message : "Erro ao atualizar contato. Tente novamente.")
            setIsEditModalOpen(false)
            setContactToEdit(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
        setContactToDelete(null)
    }

    const handleCancelEdit = () => {
        setIsEditModalOpen(false)
        setContactToEdit(null)
    }

    const handleAddContact = async (newContact: Omit<ContactAPI, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!token) {
            setError("Token de autenticação não encontrado")
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)
            
            const payload = {
                identificacao: newContact.identificacao,
                email: newContact.email.trim()
            }
            
            // Validar dados
            if (!payload.identificacao || payload.identificacao.trim().length === 0) {
                throw new Error("Identificação/Nome é obrigatório")
            }
            
            if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
                throw new Error("Email deve ter um formato válido")
            }
            
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text()
                let errorData
                try {
                    errorData = JSON.parse(errorText)
                } catch {
                    errorData = { message: errorText }
                }
                throw new Error(errorData.message || errorData.details || `Falha ao criar contato: ${response.status}`)
            }

            // Mostrar mensagem de sucesso
            setSuccessMessage("Contato adicionado com sucesso!")
            
            // Recarregar dados da API
            await fetchContacts()
            
        } catch (error) {
            console.error("Erro ao adicionar contato:", error)
            setError(error instanceof Error ? error.message : "Erro ao adicionar contato. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const columns: { header: string; accessor: string }[] = [
        { header: "Nome", accessor: "identificacao" },
        { header: "Email", accessor: "email" },
    ]

    return (
        <DefaultLayout
            headerTitle="Comunicação Interna"
            headerSubtitle="Seja bem vindo!"
            menuGroups={menuGroups}
            footerText="Sistema de Petições v1.0"
            actionButtons={[]}
        >
            {/* Mensagem de Sucesso */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{successMessage}</p>
                        </div>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-100 inline-flex h-8 w-8"
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-100 inline-flex h-8 w-8"
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            
            <NewContactSection 
                onContactSaved={handleAddContact}
                isLoading={isSubmitting}
            />

            <SuperTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
                actions={[
                    {
                        icon: "/icons/edit.svg",
                        label: "Editar",
                        onClick: (row: ContactAPI) => handleEditContact(String(row.id)),
                        className: "text-blue-600 hover:text-blue-900",
                        hoverClassName: "bg-blue-50",
                        show: () => true,
                        render: (row: ContactAPI) => <EditActionButton onClick={() => handleEditContact(String(row.id))} />
                    },
                    {
                        icon: "/icons/delete.svg",
                        label: "Deletar",
                        onClick: (row: ContactAPI) => handleDeleteContact(String(row.id)),
                        className: "text-red-600 hover:text-red-900",
                        hoverClassName: "bg-red-50",
                        show: () => true,
                        render: (row: ContactAPI) => <DeleteActionButton onClick={() => handleDeleteContact(String(row.id))} />
                    }
                ]}
                emptyMessage="Nenhum contato encontrado."
            />

            {/* Modal de Confirmação de Exclusão */}
            {isDeleteModalOpen && contactToDelete && (
                <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-2">Confirmar Exclusão</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Tem certeza que deseja excluir o contato <strong>{contactToDelete.identificacao}</strong>? 
                                    Esta ação não pode ser desfeita.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 space-x-2">
                                <ActionButton
                                    key="cancelar"
                                    label="Cancelar"
                                    variant="secondary"
                                    onClick={handleCancelDelete}
                                    disabled={isSubmitting}
                                />
                                <ActionButton
                                    key="confirmar"
                                    label={isSubmitting ? "Deletando..." : "Confirmar"}
                                    variant="danger"
                                    onClick={handleConfirmDelete}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edição */}
            {isEditModalOpen && contactToEdit && (
                <NotificationsEditContactModal
                    contact={contactToEdit}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    isLoading={isSubmitting}
                />
            )}
        </DefaultLayout>
    )
}