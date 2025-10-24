"use client"

import { useState } from "react"
import ActionButton from "../actionButton/ActionButton"
import { TemplateData } from "@/interfaces/Notifications"

interface NotificationsWhatsappTemplateFormProps {
  isEditing: boolean
  templateData?: TemplateData
  onClose: () => void
  onSave?: (data: TemplateData) => void
}

const NotificationsWhatsappTemplateForm = ({ templateData, onClose, onSave }: NotificationsWhatsappTemplateFormProps) => {
  const [templateName, setTemplateName] = useState(templateData?.nome || "")
  const [content, setContent] = useState(templateData?.texto || "")
  const [mediaType, setMediaType] = useState<"none" | "image" | "document">("none")
  const [mediaUrl, setMediaUrl] = useState("")

  const variables = {
    destinatario: ["{cliente.nome}", "{cliente.telefone}", "{cliente.whatsapp}"],
    campanha: ["{campanha.nome}", "{campanha.link}", "{campanha.codigo_promocional}"],
    personalizacao: ["{empresa.nome}", "{empresa.whatsapp}", "{data.atual}", "{hora.atual}"],
  }

  const insertVariable = (variable: string) => {
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

  const handleSave = () => {
    if (!templateName.trim() || !content.trim()) {
      alert("Por favor, preencha o nome do template e a mensagem")
      return
    }

    // Adiciona informações de mídia ao texto se houver
    let fullText = content
    if (mediaType !== "none" && mediaUrl) {
      fullText = `[${mediaType === "image" ? "Imagem" : "Documento"}: ${mediaUrl}]\n\n${content}`
    }

    const templateData: TemplateData = {
      nome: templateName,
      canalComunicacao: "WHATSAPP",
      texto: fullText,
      assunto: "",
      status: "ACTIVE"
    }

    console.log("Salvando template WhatsApp:", templateData)
    
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ex: template_whatsapp_promocao"
          />
        </div>

        {/* Media Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mídia (Opcional)</label>
          <select
            value={mediaType}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setMediaType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="none">Sem mídia</option>
            <option value="image">Imagem</option>
            <option value="document">Documento</option>
          </select>
        </div>

        {/* Media URL Input */}
        {mediaType !== "none" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da {mediaType === "image" ? "Imagem" : "Documento"}
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`Digite a URL da ${mediaType === "image" ? "imagem" : "documento"}`}
            />
          </div>
        )}

        {/* Message Editor */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Mensagem WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <button 
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors" 
                title="Negrito"
                onClick={() => {
                  const textarea = document.querySelector("textarea") as HTMLTextAreaElement
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const selectedText = content.substring(start, end)
                  const newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
                  setContent(newContent)
                }}
              >
                <strong>B</strong>
              </button>
              <button 
                className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors" 
                title="Itálico"
                onClick={() => {
                  const textarea = document.querySelector("textarea") as HTMLTextAreaElement
                  const start = textarea.selectionStart
                  const end = textarea.selectionEnd
                  const selectedText = content.substring(start, end)
                  const newContent = content.substring(0, start) + `_${selectedText}_` + content.substring(end)
                  setContent(newContent)
                }}
              >
                <em>I</em>
              </button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors" title="Emoji">
                😊
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Digite sua mensagem do WhatsApp. Utilize as variáveis disponíveis para personalizar. Você pode usar *negrito*, _itálico_ e emojis."
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 Dica: Use *texto* para negrito, _texto_ para itálico no WhatsApp.
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
                <span className="font-mono text-xs text-green-600">{variable}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variáveis de Campanha */}
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
            <div className="flex items-center">
              <span className="text-sm">💬</span>
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
                <span className="font-mono text-xs text-green-600">{variable}</span>
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
                <span className="font-mono text-xs text-green-600">{variable}</span>
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
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
          />
          <ActionButton
            key="preview"
            label="Pré-visualizar"
            variant="secondary"
            onClick={() => console.log("Pré-visualizar WhatsApp", { templateName, content, mediaType, mediaUrl })}
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

export default NotificationsWhatsappTemplateForm