"use client"

import { CampanhaData } from "../../interfaces/Notifications"
import ActionButton from "../actionButton/ActionButton"

interface NotificationsCampanhaDeleteModalProps {
  isOpen: boolean
  campanha: CampanhaData | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function NotificationsCampanhaDeleteModal({ 
  isOpen, 
  campanha, 
  onConfirm, 
  onCancel}: NotificationsCampanhaDeleteModalProps) {
  if (!isOpen || !campanha) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.5" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
              />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Excluir Campanha
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Tem certeza que deseja excluir a campanha?
          </p>
          <div className="bg-gray-50 rounded-md p-3 border">
            <p className="font-medium text-gray-900">{campanha.nome}</p>
            <p className="text-sm text-gray-500">
              {campanha.status}
            </p>
          </div>
          <p className="text-sm text-red-600 mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
            <ActionButton 
              key="cancelar" 
              label="Cancelar" 
              variant="secondary"
              onClick={onCancel} 
            />
            <ActionButton 
              key="excluir" 
              label="Excluir" 
              variant="danger"
              onClick={onConfirm} 
            />
        </div>
      </div>
    </div>
  )
}