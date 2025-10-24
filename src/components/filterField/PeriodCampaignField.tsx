"use client"
import { useState } from "react"
import ActionButton from "../actionButton/ActionButton"
import { Trash2 } from "lucide-react"
import { RegraPeriodoData } from "@/interfaces/Notifications"

interface Props {
  onPeriodAdd: (period: RegraPeriodoData) => void
  savedPeriods: RegraPeriodoData[]
  onPeriodRemove?: (index: number) => void
}

export default function PeriodCampaignField({ onPeriodAdd, savedPeriods, onPeriodRemove }: Props) {
  const [startDay, setStartDay] = useState("")
  const [endDay, setEndDay] = useState("")
  const [startTime, setStartTime] = useState("00:00")
  const [endTime, setEndTime] = useState("23:59")

  const handleAddPeriod = () => {
    // Validações
    if (!startDay || !endDay || !startTime || !endTime) {
      alert("Preencha todos os campos do período")
      return
    }

    const startDayNum = parseInt(startDay)
    const endDayNum = parseInt(endDay)

    if (isNaN(startDayNum) || isNaN(endDayNum)) {
      alert("Os dias devem ser números válidos")
      return
    }

    if (startDayNum < 1 || startDayNum > 31) {
      alert("O dia de início deve estar entre 1 e 31")
      return
    }

    if (endDayNum < 1 || endDayNum > 31) {
      alert("O dia de término deve estar entre 1 e 31")
      return
    }

    if (startDayNum > endDayNum) {
      alert("O dia de início não pode ser maior que o dia de término")
      return
    }

    // Se os dias são iguais, verificar as horas
    if (startDayNum === endDayNum) {
      const [startHour, startMin] = startTime.split(':').map(Number)
      const [endHour, endMin] = endTime.split(':').map(Number)
      
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      
      if (startMinutes >= endMinutes) {
        alert("A hora de início deve ser anterior à hora de término quando os dias são iguais")
        return
      }
    }

    const newPeriod: RegraPeriodoData = {
      id: Date.now().toString(),
      dataInicio: startDay.padStart(2, "0"),
      horaInicio: startTime,
      dataFim: endDay.padStart(2, "0"),
      horaFim: endTime,
    }
    
    onPeriodAdd(newPeriod)
    
    // Reset fields
    setStartDay("")
    setEndDay("")
    setStartTime("00:00")
    setEndTime("23:59")
  }

  const handleRemovePeriod = (index: number) => {
    if (onPeriodRemove) {
      onPeriodRemove(index)
    }
  }

  return (
    <div className="space-y-4">
      {/* Period form fields */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Adicionar Período</h4>
        <div className="space-y-4">
          {/* Start and End Day */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de início *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                placeholder="1-31"
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de Término *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={endDay}
                onChange={(e) => setEndDay(e.target.value)}
                placeholder="1-31"
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de início *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Término *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-500">
            * Configure o período do mês em que a regra estará ativa
          </p>

          {/* Add button */}
          <div className="flex justify-end pt-2">
            <ActionButton 
              label="Adicionar Período" 
              onClick={handleAddPeriod}
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* Saved periods display */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Períodos Configurados
          {savedPeriods.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({savedPeriods.length})
            </span>
          )}
        </h4>
        {savedPeriods.length === 0 ? (
          <div className="text-sm text-gray-500 italic">
            Nenhum período adicionado. A regra será aplicada o mês inteiro.
          </div>
        ) : (
          <div className="space-y-2">
            {savedPeriods.map((period, index) => (
              <div 
                key={period.id || index} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="font-medium text-blue-600">📅</span>
                  <span>
                    Dia <strong>{period.horaInicio}</strong> às <strong>{period.dataInicio}</strong>
                    {' '} até dia <strong>{period.dataFim}</strong> às <strong>{period.horaFim}</strong>
                  </span>
                </div>
                {onPeriodRemove && (
                  <button
                    onClick={() => handleRemovePeriod(index)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remover período"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}