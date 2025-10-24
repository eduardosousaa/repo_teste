"use client";

import { useMemo } from "react";
import FilterField from "@/components/filterField/FilterField";
import { 
    NegationConfig, 
    WEEK_DAYS_OPTIONS, 
    DayOfWeek,
    ValidationErrors
} from "@/interfaces/Negation";

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => ({
	value: i + 1,
	label: `${i + 1}`,
}));

interface SchedulingFormProps {
    config: NegationConfig;
    handleInputChange: (name: keyof NegationConfig, value: string | number | boolean) => void;
    errors: ValidationErrors;
}

export default function SchedulingForm({
	config,
	handleInputChange,
	errors,
}: SchedulingFormProps) {

	const weeklyDayOptions = WEEK_DAYS_OPTIONS.map(day => ({ value: day.value, label: day.label }));
    
    const filteredWeeklyEndOptions = useMemo(() => {
        if (!config.weeklyDayStart) return [];
        
        const startIndex = WEEK_DAYS_OPTIONS.findIndex(d => d.value === config.weeklyDayStart);
        if (startIndex === -1) return [];

        return WEEK_DAYS_OPTIONS.slice(startIndex).map(day => ({ 
            value: day.value as DayOfWeek, 
            label: day.label 
        }));
    }, [config.weeklyDayStart]);

	const monthlyDayOptions = MONTH_DAYS;


	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col space-y-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Agendamento de Envios Automáticos
			</h3>

			<div>
				<label className="mb-2 text-sm font-medium text-gray-700 block">
					Frequência de Envio
				</label>
				<div className="space-y-2">

					<div className="flex items-center">
						<input
							id="freq-daily"
							name="sendFrequency"
							type="radio"
							checked={config.sendFrequency === "DAILY"}
							onChange={() => handleInputChange("sendFrequency", "DAILY")}
							className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
						/>
						<label
							htmlFor="freq-daily"
							className="ml-3 block text-sm font-medium text-gray-700"
						>
							Diário
						</label>
					</div>

					<div className="flex items-center">
						<input
							id="freq-weekly"
							name="sendFrequency"
							type="radio"
							checked={config.sendFrequency === "WEEKLY"}
							onChange={() => handleInputChange("sendFrequency", "WEEKLY")}
							className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
						/>
						<label
							htmlFor="freq-weekly"
							className="ml-3 block text-sm font-medium text-gray-700"
						>
							Semanal
						</label>
					</div>

					<div className="flex items-center">
						<input
							id="freq-monthly"
							name="sendFrequency"
							type="radio"
							checked={config.sendFrequency === "MONTHLY"}
							onChange={() => handleInputChange("sendFrequency", "MONTHLY")}
							className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
						/>
						<label
							htmlFor="freq-monthly"
							className="ml-3 block text-sm font-medium text-gray-700"
						>
							Mensal
						</label>
					</div>
				</div>
			</div>

			{config.sendFrequency === "WEEKLY" && (
				<div>
					<label className="mb-2 text-sm font-medium text-gray-700 block">
						Dia
					</label>
					<div className="grid grid-cols-2 gap-4">
						<FilterField
							label="Dia Inicial"
							name="weeklyDayStart"
							type="select"
							value={config.weeklyDayStart || ""}
							onChange={(value) => handleInputChange("weeklyDayStart", value)}
							options={weeklyDayOptions} 
							placeholder="Selecione o dia"
							error={errors.weeklyDayStart}
						/>
						<FilterField
							label="Dia final"
							name="weeklyDayEnd"
							type="select"
							value={config.weeklyDayEnd || ""}
							onChange={(value) => handleInputChange("weeklyDayEnd", value)}
							options={filteredWeeklyEndOptions} 
							placeholder="Selecione o dia"
                            disabled={!config.weeklyDayStart}
							error={errors.weeklyDayEnd}
						/>
					</div>
				</div>
			)}
			
			{config.sendFrequency === "MONTHLY" && (
				<div>
					<div className="grid grid-cols-2 gap-4">
						<FilterField
							label="Dia Inicial"
							name="monthlyDayStart"
							type="select"
							value={config.monthlyDayStart}
							onChange={(value) =>
								handleInputChange("monthlyDayStart", Number(value))
							}
							options={monthlyDayOptions}
							error={errors.monthlyDayStart}
						/>
						<FilterField
							label="Dia final"
							name="monthlyDayEnd"
							type="select"
							value={config.monthlyDayEnd}
							onChange={(value) =>
								handleInputChange("monthlyDayEnd", Number(value))
							}
							options={MONTH_DAYS}
							error={errors.monthlyDayEnd}
						/>
					</div>
				</div>
			)}
			
			<div>
				<label className="mb-2 text-sm font-medium text-gray-700 block">
					Horário de Execução
				</label>
				<div className="grid grid-cols-2 gap-4">
					<FilterField
						label="Início"
						name="startTime"
						type="time"
						value={config.startTime}
						onChange={(value) => handleInputChange("startTime", value)}
						placeholder="--:--"
						error={errors.startTime}
					/>
					<FilterField
						label="Fim"
						name="endTime"
						type="time"
						value={config.endTime}
						onChange={(value) => handleInputChange("endTime", value)}
						placeholder="--:--"
						error={errors.endTime}
					/>
				</div>
			</div>
		</div>
	);
}