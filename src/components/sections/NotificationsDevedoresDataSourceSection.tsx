"use client"

import { useState } from "react"
import FilterField from '@/components/filterField/FilterField'
import { FrequenciaItem, DevedoresDataSourceData } from "@/interfaces/Notifications"

interface NotificationsDevedoresDataSourceSectionProps {
  onDataChange?: (data: DevedoresDataSourceData) => void
  initialData?: Partial<DevedoresDataSourceData>
}

export default function NotificationsDevedoresDataSourceSection({ onDataChange, initialData }: NotificationsDevedoresDataSourceSectionProps) {
  const [data, setData] = useState<DevedoresDataSourceData>({
    dadosTipo: "DEVEDOR",
    fonteDadosTipo: "API",
    usuario: "",
    senha: "",
    frequenciaTipo: "SEMANAL",
    frequencia: [{
      diaSemana: 1,
      diaAno: 0,
      horario: "00:00"
    }],
    ...initialData,
  })

  const handleDataChange = <K extends keyof DevedoresDataSourceData>(field: K, value: DevedoresDataSourceData[K]) => {
    const newData = { ...data, [field]: value }
    setData(newData)
    onDataChange?.(newData)
  }

  const handleFrequenciaChange = (field: keyof FrequenciaItem, value: string | number) => {
    const newFrequencia = [...data.frequencia]
    
    if (data.frequenciaTipo === "DIARIO") {
      // DIARIO: diaSemana=0, diaAno=0
      newFrequencia[0] = {
        diaSemana: 0,
        diaAno: 0,
        horario: field === "horario" ? String(value) : newFrequencia[0].horario
      }
    } else if (data.frequenciaTipo === "SEMANAL") {
      // SEMANAL: diaSemana preenchido, diaAno=0
      newFrequencia[0] = {
        diaSemana: field === "diaSemana" ? Number(value) : newFrequencia[0].diaSemana,
        diaAno: 0,
        horario: field === "horario" ? String(value) : newFrequencia[0].horario
      }
    } else if (data.frequenciaTipo === "MENSAL") {
      // MENSAL: diaSemana=0, diaAno preenchido
      newFrequencia[0] = {
        diaSemana: 0,
        diaAno: field === "diaAno" ? Number(value) : newFrequencia[0].diaAno,
        horario: field === "horario" ? String(value) : newFrequencia[0].horario
      }
    }
    
    handleDataChange("frequencia", newFrequencia)
  }

  const handleFrequenciaTipoChange = (tipo: "SEMANAL" | "MENSAL" | "DIARIO") => {
    let novaFrequencia: FrequenciaItem[]
    
    if (tipo === "DIARIO") {
      novaFrequencia = [{
        diaSemana: 0,
        diaAno: 0,
        horario: data.frequencia[0]?.horario || "00:00"
      }]
    } else if (tipo === "SEMANAL") {
      novaFrequencia = [{
        diaSemana: 1,
        diaAno: 0,
        horario: data.frequencia[0]?.horario || "00:00"
      }]
    } else { // MENSAL
      novaFrequencia = [{
        diaSemana: 0,
        diaAno: 1,
        horario: data.frequencia[0]?.horario || "00:00"
      }]
    }
    
    const newData = {
      ...data,
      frequenciaTipo: tipo,
      frequencia: novaFrequencia
    }
    setData(newData)
    onDataChange?.(newData)
  }

  const frequencyOptions = [
    { value: "DIARIO", label: "Diária" },
    { value: "SEMANAL", label: "Semanal" },
    { value: "MENSAL", label: "Mensal" },
  ]

  const dayOptions = [
    { value: 1, label: "Segunda-feira" },
    { value: 2, label: "Terça-feira" },
    { value: 3, label: "Quarta-feira" },
    { value: 4, label: "Quinta-feira" },
    { value: 5, label: "Sexta-feira" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
  ]

  // Gera os dias do mês de 1 a 30
  const monthDayOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Dia ${i + 1}`
  }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h3 className="text-lg font-medium text-gray-600 mb-4">Fonte de Dados de Devedores (CPF/CNPJ)</h3>

      {/* Source Type Selection */}
      <div className="space-y-3">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="devedores-source"
              value="API"
              checked={data.fonteDadosTipo === "API"}
              onChange={() => handleDataChange("fonteDadosTipo", "API")}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">API SEFAZ</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="devedores-source"
              value="RPA"
              checked={data.fonteDadosTipo === "RPA"}
              onChange={() => handleDataChange("fonteDadosTipo", "RPA")}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">RPA (Planilhas)</span>
          </label>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid grid-cols-2 gap-4">
        <FilterField
          label="Usuário"
          name="username"
          type="text"
          value={data.usuario}
          onChange={(value: string | number) => handleDataChange("usuario", String(value))}
        />
        <FilterField
          label="Senha"
          name="password"
          type="text"
          value={data.senha}
          onChange={(value: string | number) => handleDataChange("senha", String(value))}
        />
      </div>

      {/* Scheduling */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Agendamento de Atualização</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Frequência</label>
            <select
              value={data.frequenciaTipo}
              onChange={(e) => handleFrequenciaTipoChange(e.target.value as DevedoresDataSourceData["frequenciaTipo"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Dia da Semana - Aparece apenas quando SEMANAL */}
          {data.frequenciaTipo === "SEMANAL" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dia da Semana</label>
              <select
                value={data.frequencia[0]?.diaSemana || 1}
                onChange={(e) => handleFrequenciaChange("diaSemana", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Campo Dia do Mês - Aparece apenas quando MENSAL */}
          {data.frequenciaTipo === "MENSAL" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dia do Mês</label>
              <select
                value={data.frequencia[0]?.diaAno || 1}
                onChange={(e) => handleFrequenciaChange("diaAno", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {monthDayOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Campo vazio quando DIARIO para manter o grid */}
          {data.frequenciaTipo === "DIARIO" && <div></div>}

          <FilterField
            label="Horário"
            name="horario"
            type="time"
            value={data.frequencia[0]?.horario || "00:00"}
            onChange={(value: string | number) => handleFrequenciaChange("horario", String(value))}
          />
        </div>
      </div>
    </div>
  )
}