"use client"
import type React from "react"
import { ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react"
import { useState } from "react"
import NotificationsTemplateHistoryModal from "@/components/modals/NotificationsTemplateHistoryModal"
import ActionButton from "../actionButton/ActionButton"

interface NotificationsCommunicationChannelCardProps {
  channelName: string
  description: string
  iconUrl: string
  isEditable?: boolean
  isActive: boolean
  onToggle: () => void
  ActionButtons: React.ReactNode[]
  ToggleSwitch: React.ReactNode
  hasTemplate?: boolean
  templateInfo?: {
    assunto: string
    nome: string
    preview: string
  }
  campanhaId: string
  canalComunicacao: string
}

export default function NotificationsCommunicationChannelCard({
  channelName,
  description,
  isActive,
  isEditable = false,
  ActionButtons,
  ToggleSwitch,
  hasTemplate = false,
  templateInfo,
  campanhaId,
  canalComunicacao,
}: NotificationsCommunicationChannelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between">
          {/* Left side - Channel name and status */}
          <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-900">{channelName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  {isActive ? "Ativo" : "Inativo"}
                </span>
                {ToggleSwitch}
              </div>
            </div>
            
            {/* Template status indicator */}
            <div className="flex items-center gap-2 ml-4">
              {hasTemplate ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Template configurado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Template não configurado</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Action buttons and dropdown */}
          <div className="flex items-center gap-2">
            {/* Botão de Histórico */}
            {isEditable && (
              <ActionButton
                onClick={() => setIsHistoryModalOpen(true)}
                label="Histórico"
                variant="secondary"
              />
            )}
            
            {ActionButtons}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 block mb-1">Status:</span>
                <p className="text-sm font-medium text-gray-900">
                  {isActive ? "Ativo e pronto para uso" : "Inativo - Ative para usar"}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">Template:</span>
                <p className="text-sm font-medium text-gray-900">
                  {hasTemplate ? "Configurado" : "Não configurado"}
                </p>
              </div>
            </div>

            {/* Template info quando existe */}
            {hasTemplate && templateInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="mb-2">
                  <span className="text-xs text-gray-500 block mb-1">Nome do Template:</span>
                  <p className="text-sm font-medium text-gray-900">{templateInfo.nome}</p>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-gray-500 block mb-1">Assunto:</span>
                  <p className="text-sm text-gray-600 line-clamp-3">{templateInfo.assunto}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Preview:</span>
                  <p className="text-sm text-gray-600 line-clamp-3">{templateInfo.preview}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Histórico */}
      <NotificationsTemplateHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        campanhaId={campanhaId}
        canalComunicacao={canalComunicacao}
      />
    </>
  )
}