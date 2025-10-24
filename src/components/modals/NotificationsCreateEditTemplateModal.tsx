"use client"
import NotificationsEmailTemplateForm from "../forms/NotificationsEmailTemplateForm"
import NotificationsSmsTemplateForm from "../forms/NotificationsSmsTemplateForm"
import NotificationsWhatsappTemplateForm from "../forms/NotificationsWhatsappTemplateForm"
import { TemplateData } from "@/interfaces/Notifications"

interface NotificationsCreateEditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  isEditing: boolean
  type: "email" | "sms" | "whatsapp"
  templateData?: TemplateData
  campaignName?: string
  onSave?: (data: TemplateData) => void
}

const NotificationsCreateEditTemplateModal = ({
  isOpen,
  onClose,
  isEditing,
  type,
  templateData,
  campaignName = "Nova Campanha",
  onSave,
}: NotificationsCreateEditTemplateModalProps) => {
  if (!isOpen) return null

  const getChannelName = () => {
    return {
      email: "E-mail",
      sms: "SMS",
      whatsapp: "WhatsApp",
    }[type]
  }

  const handleSave = (formData: TemplateData) => {
    // Chama a função onSave passada pelo componente pai
    if (onSave) {
      onSave(formData)
    }
    // Fecha o modal após salvar
    onClose()
  }

  const renderTemplateForm = () => {
    const commonProps = {
      isEditing,
      templateData,
      onClose,
      onSave: handleSave, // Passa a função handleSave para os formulários
    }

    switch (type) {
      case "email":
        return <NotificationsEmailTemplateForm {...commonProps} />
      case "sms":
        return <NotificationsSmsTemplateForm {...commonProps} />
      case "whatsapp":
        return <NotificationsWhatsappTemplateForm {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{campaignName}</h2>
            <p className="text-sm text-gray-600 mt-1">Canal de comunicação: {getChannelName()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Content */}
        <div className="flex-1 overflow-hidden">{renderTemplateForm()}</div>
      </div>
    </div>
  )
}

export default NotificationsCreateEditTemplateModal