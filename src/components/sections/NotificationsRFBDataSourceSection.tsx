"use client"

import { useState } from "react"
import FilterField from '@/components/filterField/FilterField'
import { FrequenciaItem, RFBDataSourceData } from "@/interfaces/Notifications"

interface NotificationsRFBDataSourceSectionProps {
  onDataChange?: (data: RFBDataSourceData) => void
  initialData?: Partial<RFBDataSourceData>
}

export default function NotificationsRFBDataSourceSection({ onDataChange, initialData }: NotificationsRFBDataSourceSectionProps) {
  const [data, setData] = useState<RFBDataSourceData>({
    dadosTipo: "RFB",
    fonteDadosTipo: "RPA",
    frequenciaTipo: "DIARIO",
    frequencia: [{
      diaSemana: 0,
      diaAno: 0,
      horario: "08:30"
    }],
    usuario: "",
    senha: "",
    ...initialData,
  })

  const handleDataChange = <K extends keyof RFBDataSourceData>(field: K, value: RFBDataSourceData[K]) => {
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
        horario: data.frequencia[0]?.horario || "08:30"
      }]
    } else if (tipo === "SEMANAL") {
      novaFrequencia = [{
        diaSemana: 1,
        diaAno: 0,
        horario: data.frequencia[0]?.horario || "08:30"
      }]
    } else { // MENSAL
      novaFrequencia = [{
        diaSemana: 0,
        diaAno: 1,
        horario: data.frequencia[0]?.horario || "08:30"
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
      <h3 className="text-lg font-medium text-gray-600 mb-4">Fonte de Dados de Devedores RFB</h3>

      {/* Credentials - RFB também precisa de credenciais */}
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
          {/* Frequência */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Frequência</label>
            <select
              value={data.frequenciaTipo}
              onChange={(e) => handleFrequenciaTipoChange(e.target.value as RFBDataSourceData["frequenciaTipo"])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Dia da Semana - aparece apenas se SEMANAL */}
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

          {/* Dia do Mês - aparece apenas se MENSAL */}
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

          {/* Placeholder vazio quando DIARIO */}
          {data.frequenciaTipo === "DIARIO" && <div></div>}

          {/* Horário */}
          <FilterField
            label="Horário"
            name="horario"
            type="time"
            value={data.frequencia[0]?.horario || "08:30"}
            onChange={(value: string | number) => handleFrequenciaChange("horario", String(value))}
          />
        </div>
      </div>
    </div>
  )
}