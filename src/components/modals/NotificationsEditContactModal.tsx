'use client'
import React from "react"
import ActionButton from "../actionButton/ActionButton"
import FilterField from '../../components/filterField/FilterField'
import { ContactAPI } from "../../interfaces/Notifications"
import { useState } from "react"

interface NotificationsEditContactModalProps {
  contact: ContactAPI
  onSave: (contact: ContactAPI) => void
  onCancel: () => void
  isLoading: boolean
}

export default function NotificationsEditContactModal({ contact, onSave, onCancel, isLoading }: NotificationsEditContactModalProps) {
  const [formData, setFormData] = useState(contact)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ContactAPI, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: String(value) // Converte para string
    }))

    // Limpar erro de validação quando o usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ""
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.identificacao?.trim()) {
      errors.identificacao = "Nome é obrigatório"
    }

    if (!formData.email?.trim()) {
      errors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h2 className="text-xl font-semibold mb-4">Editar Contato</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-2">
            <FilterField
              label="Digite o nome"
              name="Nome"
              type="text"
              value={formData.identificacao}
              onChange={(value) => handleInputChange("identificacao", value)}
            />
            {validationErrors.identificacao && (
              <p className="text-red-500 text-sm">{validationErrors.identificacao}</p>
            )}
            
            <FilterField
              label="Digite o email"
              name="Email"
              type="text"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm">{validationErrors.email}</p>
            )}
          </div>

          <div className="flex gap-4">
            <ActionButton
              key="salvar"
              label={isLoading ? "Salvando..." : "Salvar"}
              variant="danger"
              onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
              disabled={isLoading}
            />

            <ActionButton
              key="cancelar"
              label="Cancelar"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  )
}