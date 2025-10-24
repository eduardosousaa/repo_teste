"use client"

import { useState } from "react"
import ActionButton from "../actionButton/ActionButton"
import { TemplateData } from "@/interfaces/Notifications"

interface NotificationsEmailTemplateFormProps {
  isEditing: boolean
  templateData?: TemplateData
  onClose: () => void
  onSave?: (data: TemplateData) => void
}

interface DatabaseTable {
  name: string
  displayName: string
  icon: string
  attributes: { name: string; displayName: string }[]
}

const NotificationsEmailTemplateForm = ({ templateData, onClose, onSave }: NotificationsEmailTemplateFormProps) => {
  const [templateName, setTemplateName] = useState(templateData?.nome || "")
  const [content, setContent] = useState(templateData?.texto || "")
  const [subject, setSubject] = useState(templateData?.assunto || "")
  const [expandedTables, setExpandedTables] = useState<string[]>([])

  const databaseTables: DatabaseTable[] = [
    {
      name: "cda",
      displayName: "Variáveis de Destinatário",
      icon: "👤",
      attributes: [
        { name: "nome", displayName: "Nome" },
        { name: "email", displayName: "E-mail" },
        { name: "telefone", displayName: "Telefone" },
        { name: "cpf", displayName: "CPF" },
        { name: "endereco", displayName: "Endereço" },
        { name: "valor_total", displayName: "Valor Total" },
      ],
    },
    {
      name: "campanha",
      displayName: "Variáveis de Campanha",
      icon: "📢",
      attributes: [
        { name: "nome", displayName: "Nome da Campanha" },
        { name: "descricao", displayName: "Descrição" },
        { name: "data_inicio", displayName: "Data de Início" },
        { name: "data_fim", displayName: "Data de Fim" },
        { name: "tipo", displayName: "Tipo de Campanha" },
      ],
    },
    {
      name: "empresa",
      displayName: "Variáveis da Empresa",
      icon: "🏢",
      attributes: [
        { name: "nome", displayName: "Nome da Empresa" },
        { name: "logo", displayName: "Logo" },
        { name: "endereco", displayName: "Endereço" },
        { name: "telefone", displayName: "Telefone" },
        { name: "email", displayName: "E-mail" },
      ],
    },
  ]

  const insertVariable = (tableName: string, attributeName: string) => {
    const variable = `{${tableName}.${attributeName}}`
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement

    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + variable + content.substring(end)
      setContent(newContent)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else {
      setContent((prev: string) => prev + variable)
    }
  }

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => (prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]))
  }

  const handleSave = () => {
    if (!templateName.trim() || !content.trim()) {
      alert("Por favor, preencha o nome do template e o conteúdo")
      return
    }

    const templateData: TemplateData = {
      nome: templateName,
      canalComunicacao: "EMAIL",
      assunto: subject,
      texto: content,
      status: "ACTIVE",
    }

    console.log("Salvando template:", templateData)
    
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
            placeholder="Ex: template_email_cobranca"
          />
        </div>

        {/* Subject Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Assunto do E-mail</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o assunto do e-mail"
          />
        </div>

        {/* Text Editor */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Editor de texto <span className="text-red-500">*</span>
            </label>
            {/* Toolbar */}
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <strong>B</strong>
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <em>I</em>
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                <u>U</u>
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">🔗</button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-80 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Monte o conteúdo do template. Utilize as variáveis disponíveis no painel lateral para personalizar a mensagem."
          />
        </div>
      </div>

      {/* Right Side - Variables */}
      <div className="w-80 p-6 bg-gray-50 overflow-y-scroll">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Variáveis Disponíveis</h3>

        {databaseTables.map((table) => (
          <div key={table.name} className="mb-4">
            <button
              onClick={() => toggleTable(table.name)}
              className="flex items-center justify-between w-full p-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <span className="text-sm">{table.icon}</span>
                <div className="ml-2">
                  <p className="text-sm font-medium text-gray-900">{table.displayName}</p>
                  <p className="text-xs text-gray-500">({table.name.toUpperCase()})</p>
                </div>
              </div>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  expandedTables.includes(table.name) ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedTables.includes(table.name) && (
              <div className="mt-2 space-y-1 pl-4">
                {table.attributes.map((attribute) => (
                  <button
                    key={attribute.name}
                    onClick={() => insertVariable(table.name, attribute.name)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-white hover:text-gray-900 rounded transition-colors"
                  >
                    <span className="font-mono text-xs text-blue-600">{`{${table.name}.${attribute.name}}`}</span>
                    <span className="ml-2">{attribute.displayName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
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
            onClick={() => console.log("Pré-visualizar", { templateName, subject, content })}
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

export default NotificationsEmailTemplateForm