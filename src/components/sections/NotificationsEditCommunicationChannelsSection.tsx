"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import NotificationsCommunicationChannelCard from "../cards/NotificationsCommunicationChannelCard"
import NotificationsCreateEditTemplateModal from "../modals/NotificationsCreateEditTemplateModal"
import ActionButton from "../actionButton/ActionButton"
import ToggleSwitch from "../toggleSwitch/ToggleSwitch"
import { TemplateData, ChannelData} from "@/interfaces/Notifications"

interface NotificationsEditCommunicationChannelsSectionProps {
  onDataChange: (templates: TemplateData[]) => void
  initialTemplates: TemplateData[]
}

export default function NotificationsEditCommunicationChannelsSection({ onDataChange, initialTemplates }: NotificationsEditCommunicationChannelsSectionProps) {
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

  // Mapeia os canais da API para IDs locais - movido para useMemo para ser estável
  const channelApiToLocalMap: Record<string, string> = useMemo(() => ({
    "EMAIL": "email",
    "SMS": "sms",
    "WHATSAPP": "whatsapp",
  }), [])

  // Carrega templates iniciais
  useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      const templatesMap: Record<string, TemplateData> = {}
      
      initialTemplates.forEach(template => {
        const channelId = channelApiToLocalMap[template.canalComunicacao]
        if (channelId) {
          templatesMap[channelId] = template
        }
      })

      setTemplates(templatesMap)

      // Atualiza o status dos canais baseado nos templates
      setChannels(prev => prev.map(channel => {
        const template = templatesMap[channel.id]
        return {
          ...channel,
          isActive: template ? template.status === "ACTIVE" : channel.isActive
        }
      }))
    }
  }, [initialTemplates, channelApiToLocalMap])

  // Atualiza o componente pai sempre que templates mudarem
  useEffect(() => {
    const allTemplates = Object.values(templates)
    console.log("Templates sendo enviados:", allTemplates)
    onDataChange(allTemplates)
  }, [templates, onDataChange])

  const handleToggle = useCallback((channelId: string) => {
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
  }, [])

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
      assunto: templateData.assunto || "",
      canalComunicacao: channelMap[channelId],
      texto: templateData.texto || "",
      status: channel?.isActive ? "ACTIVE" : "INACTIVE"
    }

    setTemplates((prev) => ({
      ...prev,
      [channelId]: newTemplate,
    }))

    console.log("Template salvo/atualizado com sucesso:", newTemplate)
  }

  const handleDeleteTemplate = (channelId: string) => {
    if (confirm("Tem certeza que deseja remover este template?")) {
      setTemplates((prev) => {
        const newTemplates = { ...prev }
        delete newTemplates[channelId]
        return newTemplates
      })
      console.log(`Template ${channelId} removido`)
    }
  }

  const handleEditar = (channel: ChannelData) => {
    const existingTemplate = templates[channel.id]
    if (existingTemplate) {
      openModal(channel, true, existingTemplate)
    } else {
      alert("Nenhum template encontrado para editar")
    }
  }

  const handleCriar = (channel: ChannelData) => {
    openModal(channel, false, undefined)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Canais de comunicação</h2>
        <div className="text-sm text-gray-500">
          {Object.keys(templates).length} de {channels.length} templates configurados
        </div>
      </div>
      
      <div className="space-y-3">
        {channels.map((channel) => {
          const template = templates[channel.id]
          return (
            <NotificationsCommunicationChannelCard
              key={channel.id}
              channelName={channel.name}
              description={channel.description}
              iconUrl={channel.iconUrl}
              isEditable={true}
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
                template && (
                  <ActionButton
                    key="remover"
                    label="Remover"
                    onClick={() => handleDeleteTemplate(channel.id)}
                    variant="secondary" />
                ),
              ].filter(Boolean)}
              ToggleSwitch={<ToggleSwitch enabled={channel.isActive} onToggle={() => handleToggle(channel.id)} />} campanhaId={""} canalComunicacao={""}            />
          )
        })}
      </div>

      {/* Info box */}
      {Object.keys(templates).length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Dica:</strong> Configure ao menos um template para que a campanha possa enviar notificações.
          </p>
        </div>
      )}

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