"use client"
import ActionButton from '../actionButton/ActionButton'
import FilterField from '@/components/filterField/FilterField'
import { useState } from "react"

interface NotificationsCampanhaFilterProps {
  onFilterChange: (filters: { [key: string]: string | number }) => void
}

export default function NotificationsCampanhaFilter({ onFilterChange }: NotificationsCampanhaFilterProps) {
  const [filters, setFilters] = useState<{ [key: string]: string | number }>({
    nome: "",
    status: "",
    campanhaTipo: "",
  })

  const handleInputChange = (name: string, value: string | number) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    // Aplica o filtro em tempo real
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = { nome: "", status: "", campanhaTipo: "" }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FilterField
          label="Nome da Campanha"
          name="nome"
          type="text"
          value={filters.nome as string}
          onChange={(value) => handleInputChange("nome", value)}
        />

        <FilterField
          label="Status"
          name="status"
          type="select"
          options={[
            { value: "", label: "Todos os status" },
            { value: "ACTIVE", label: "Ativa" },
            { value: "INACTIVE", label: "Inativa" },
            { value: "ARCHIVED", label: "Arquivada" },
          ]}
          value={filters.status as string}
          onChange={(value) => handleInputChange("status", value)}
        />

        <FilterField
          label="Tipo de Campanha"
          name="campanhaTipo"
          type="select"
          options={[
            { value: "", label: "Todos os tipos" },
            { value: "NATIVA", label: "Nativa" },
            { value: "PERSONALIZADA", label: "Personalizada" },
          ]}
          value={filters.campanhaTipo as string}
          onChange={(value) => handleInputChange("campanhaTipo", value)}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpar Filtros
        </button>
        <ActionButton 
          label="Aplicar Filtros" 
          onClick={handleApplyFilters}
          variant="primary"
        />
      </div>
    </div>
  )
}