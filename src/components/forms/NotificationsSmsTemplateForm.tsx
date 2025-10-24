"use client"

import type React from "react"
import { useState } from "react"
import ActionButton from "../actionButton/ActionButton"
import { TemplateData } from "@/interfaces/Notifications"

interface NotificationsSmsTemplateFormProps {
  isEditing: boolean
  templateData?: TemplateData
  onClose: () => void
  onSave?: (data: TemplateData) => void
}

const NotificationsSmsTemplateForm = ({ templateData, onClose, onSave }: NotificationsSmsTemplateFormProps) => {
  const [templateName, setTemplateName] = useState(templateData?.nome || "")
  const [content, setContent] = useState(templateData?.texto || "")
  const [characterCount, setCharacterCount] = useState(content.length)

  const variables = {
    destinatario: ["{cliente.nome}", "{cliente.telefone}", "{cliente.cpf}"],
    campanha: ["{campanha.nome}", "{campanha.codigo}", "{campanha.desconto}"],
    personalizacao: ["{empresa.nome}", "{data.atual}", "{hora.atual}"],
  }

  const insertVariable = (variable: string) => {
    const newContent = content + variable
    if (newContent.length <= 160) {
      setContent(newContent)
      setCharacterCount(newContent.length)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    if (newContent.length <= 160) {
      setContent(newContent)
      setCharacterCount(newContent.length)
    }
  }

  const handleSave = () => {
    if (!templateName.trim() || !content.trim()) {
      alert("Por favor, preencha o nome do template e a mensagem")
      return
    }

    const templateData: TemplateData = {
      nome: templateName,
      canalComunicacao: "SMS",
      texto: content,
      assunto: "",
      status: "ACTIVE"
    }

    console.log("Salvando template SMS:", templateData)
    
    if (onSave) {
      onSave(templateData)
    }
    
    onClose()
  }

  return (
    <div className="flex h-[600px] relative">
      {/* Left Side - Editor */}
      <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
        {/* Template Name Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Template <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: template_sms_cobranca"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Mensagem SMS <span className="text-red-500">*</span>
            </label>
            <div className={`text-sm ${characterCount > 140 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
              {characterCount}/160 caracteres
            </div>
          </div>
          <textarea
            value={content}
            onChange={handleContentChange}
            className="w-full h-80 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite sua mensagem SMS. Utilize as variáveis disponíveis para personalizar. Limite: 160 caracteres."
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 Dica: Mensagens SMS têm limite de 160 caracteres. Use variáveis para personalização.
          </div>
        </div>
      </div>

      {/* Right Side - Variables */}
      <div className="w-80 p-6 bg-gray-50 overflow-y-auto">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Variáveis Disponíveis</h3>

        {/* Variáveis de Destinatário */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center">
              <span className="text-sm">👤</span>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">Variáveis de Destinatário</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {variables.destinatario.map((variable, index) => (
              <button
                key={index}
                onClick={() => insertVariable(variable)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
              >
                <span className="font-mono text-xs text-blue-600">{variable}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variáveis de Campanha */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center">
              <span className="text-sm">📱</span>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">Variáveis de Campanha</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {variables.campanha.map((variable, index) => (
              <button
                key={index}
                onClick={() => insertVariable(variable)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
              >
                <span className="font-mono text-xs text-blue-600">{variable}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variáveis de Personalização */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center">
              <span className="text-sm">⚙️</span>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900">Variáveis de Personalização</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {variables.personalizacao.map((variable, index) => (
              <button
                key={index}
                onClick={() => insertVariable(variable)}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
              >
                <span className="font-mono text-xs text-blue-600">{variable}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
        <div className="flex justify-end space-x-3">
          <ActionButton
            key="cancelar"
            variant="secondary"
            label="Cancelar"
            onClick={onClose}
          />
          <ActionButton
            key="preview"
            variant="secondary"
            label="Pré-visualizar"
            onClick={() => console.log("Pré-visualizar SMS", { templateName, content })}
          />
          <ActionButton
            key="salvar"
            variant="primary"
            label="Salvar Template"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>
  )
}

export default NotificationsSmsTemplateForm