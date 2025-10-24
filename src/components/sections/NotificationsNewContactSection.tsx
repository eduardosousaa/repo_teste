'use client'

import React from "react"
import FilterField from '@/components/filterField/FilterField'
import { ContactAPI } from "@/interfaces/Notifications"
import { useState } from "react"
import ActionButton from "../actionButton/ActionButton"

interface NewContactSectionProps {
    onContactSaved?: (data: Omit<ContactAPI, 'id' | 'createdAt' | 'updatedAt'>) => void
    isLoading?: boolean
}

export default function NewContactSection({ onContactSaved, isLoading }: NewContactSectionProps) {
    const [formData, setFormData] = useState<Omit<ContactAPI, 'id' | 'createdAt' | 'updatedAt'>>({
        identificacao: "",
        email: "",
    })
    
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

    const handleInputChange = (field: keyof ContactAPI, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Limpar erro de validação quando o usuário começar a digitar
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!formData.identificacao.trim()) {
            errors.identificacao = "Nome é obrigatório"
        }

        if (!formData.email.trim()) {
            errors.email = "Email é obrigatório"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Email deve ter um formato válido"
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        // Notificar o componente pai com os dados do formulário
        onContactSaved?.(formData)
        
        // Limpar o formulário após salvar
        setFormData({
            identificacao: "",
            email: "",
        })
        
        // Limpar erros de validação
        setValidationErrors({})
    }

    const isFormEmpty = !formData.identificacao.trim() && !formData.email.trim()
    const hasValidationErrors = Object.keys(validationErrors).length > 0

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar novo contato</h3>
                {hasValidationErrors && (
                    <div className="text-sm text-red-600 mb-2">
                        Corrija os erros antes de salvar
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <FilterField
                        label="Nome"
                        name="identificacao"
                        type="text"
                        value={formData.identificacao}
                        onChange={(value) => handleInputChange("identificacao", String(value))}
                    />
                    {validationErrors.identificacao && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.identificacao}</p>
                    )}
                </div>
                
                <div>
                    <FilterField
                        label="Email"
                        name="email"
                        type="text"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", String(value))}
                    />
                    {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <ActionButton
                    key="save"
                    label={isLoading ? "Salvando..." : "Salvar"}
                    variant="primary"
                    onClick={handleSave}
                    disabled={isFormEmpty || isLoading}
                />
            </div>
        </div>
    )
}