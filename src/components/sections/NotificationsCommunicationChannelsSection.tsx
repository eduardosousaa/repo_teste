"use client"
import { useState, useEffect } from "react"
import NotificationsCommunicationChannelCard from "@/components/cards/NotificationsCommunicationChannelCard"
import NotificationsCreateEditTemplateModal from "../modals/NotificationsCreateEditTemplateModal"
import ActionButton from "../actionButton/ActionButton"
import ToggleSwitch from "../toggleSwitch/ToggleSwitch"
import { TemplateData, ChannelData} from "@/interfaces/Notifications"

interface NotificationsCommunicationChannelsSectionProps {
  onDataChange: (templates: TemplateData[]) => void
}

export default function NotificationsCommunicationChannelsSection({ onDataChange }: NotificationsCommunicationChannelsSectionProps) {
  const [channels, setChannels] = useState<ChannelData[]>([
    {
      id: "email",
      name: "Email",
      description: "Envio de campanhas por email",
      iconUrl: "/icons/email.svg",
      isActive: true,
    },
    {
      id: "sms",
      name: "SMS",
      description: "Envio de campanhas por SMS",
      iconUrl: "/icons/sms.svg",
      isActive: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      description: "Envio de campanhas por WhatsApp",
      iconUrl: "/icons/whatsapp.svg",
      isActive: true,
    },
  ])

  const [templates, setTemplates] = useState<Record<string, TemplateData>>({})

  const [modalState, setModalState] = useState({
    isOpen: false,
    isEditing: false,
    selectedChannel: null as ChannelData | null,
    templateData: undefined as TemplateData | undefined,
  })

  // Atualiza o componente pai sempre que templates mudarem
  useEffect(() => {
    // Envia todos os templates com seus status atualizados
    const allTemplates = Object.values(templates)
    console.log("Templates sendo enviados:", allTemplates)
    onDataChange(allTemplates)
  }, [onDataChange, templates])

  const handleToggle = (channelId: string) => {
    // Atualiza o status do canal
    setChannels((prev) =>
      prev.map((channel) => (channel.id === channelId ? { ...channel, isActive: !channel.isActive } : channel)),
    )

    // Atualiza o status do template correspondente
    setTemplates((prev) => {
      const template = prev[channelId]
      if (template) {
        return {
          ...prev,
          [channelId]: {
            ...template,
            status: template.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
          }
        }
      }
      return prev
    })
  }

  const openModal = (channel: ChannelData, isEditing: boolean, templateData?: TemplateData) => {
    setModalState({
      isOpen: true,
      isEditing,
      selectedChannel: channel,
      templateData,
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      isEditing: false,
      selectedChannel: null,
      templateData: undefined,
    })
  }

  const handleSaveTemplate = (channelId: string, templateData: TemplateData) => {
    const channelMap: Record<string, "SMS" | "EMAIL" | "WHATSAPP"> = {
      sms: "SMS",
      email: "EMAIL",
      whatsapp: "WHATSAPP",
    }

    const channel = channels.find(ch => ch.id === channelId)

    const newTemplate: TemplateData = {
      nome: templateData.nome || `template_${channelId}`,
      canalComunicacao: channelMap[channelId],
      texto: templateData.texto || "",
      assunto: templateData.assunto || "",
      status: channel?.isActive ? "ACTIVE" : "INACTIVE"
    }

    setTemplates((prev) => ({
      ...prev,
      [channelId]: newTemplate,
    }))

    console.log("Template salvo com sucesso:", newTemplate)
  }


  const handleEditar = (channel: ChannelData) => {
    const existingTemplate = templates[channel.id]
    if (existingTemplate) {
      openModal(channel, true, existingTemplate)
    } else {
      console.warn("Nenhum template encontrado para editar")
    }
  }

  const handleCriar = (channel: ChannelData) => {
    openModal(channel, false, undefined)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Canais de comunicação</h2>
      <div className="space-y-3">
        {channels.map((channel) => {
          const template = templates[channel.id]
          return (
            <NotificationsCommunicationChannelCard
              key={channel.id}
              channelName={channel.name}
              description={channel.description}
              iconUrl={channel.iconUrl}
              isActive={channel.isActive}
              onToggle={() => handleToggle(channel.id)}
              hasTemplate={!!template}
              templateInfo={template ? {
                assunto: template.assunto,
                nome: template.nome,
                preview: template.texto.substring(0, 100) + (template.texto.length > 100 ? "..." : "")
              } : undefined}
              ActionButtons={[
                <ActionButton
                  key="editar"
                  label="Editar"
                  onClick={() => handleEditar(channel)}
                  variant="secondary"
                  disabled={!template} />,
                <ActionButton
                  key="criar"
                  label={template ? "Recriar" : "Criar"}
                  onClick={() => handleCriar(channel)}
                  variant="primary" />,
              ]}
              ToggleSwitch={<ToggleSwitch enabled={channel.isActive} onToggle={() => handleToggle(channel.id)} />} campanhaId={""} canalComunicacao={""}            />
          )
        })}
      </div>
      {modalState.selectedChannel && (
        <NotificationsCreateEditTemplateModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          isEditing={modalState.isEditing}
          type={modalState.selectedChannel.id as "email" | "sms" | "whatsapp"}
          templateData={modalState.templateData}
          onSave={(data) => {
            handleSaveTemplate(modalState.selectedChannel!.id, data)
            closeModal()
          }}
        />
      )}
    </div>
  )
}