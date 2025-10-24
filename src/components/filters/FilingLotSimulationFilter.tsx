"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { FilingLotSimulationFilterData } from "@/interfaces/FilingLot";

export default function FilingLotSimulationFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: FilingLotSimulationFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<FilingLotSimulationFilterData>({
		debtType: "",
		minValue: undefined,
		maxValue: undefined,
		emissionDate: "",
	});

	const handleInputChange = (
		name: keyof FilingLotSimulationFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleClearFilters = () => {
		const cleared: FilingLotSimulationFilterData = {
			debtType: "",
			minValue: undefined,
			maxValue: undefined,
			emissionDate: "",
		};
		setFilters(cleared);
		onFilterChange(cleared);
		if (onClear) onClear();
	};

	const handleApplyFilters = () => {
		onFilterChange(filters);
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Filtros de Simulação
			</h3>

			<div className="grid grid-cols-4 gap-4 mb-6">
				<FilterField
					label="Tipo de Dívida"
					name="debtType"
					type="text"
					value={filters.debtType || ""}
					onChange={(value) => handleInputChange("debtType", value)}
					placeholder="Digite o tipo"
				/>

				<FilterField
					label="Valor Mínimo"
					name="minValue"
					type="number"
					value={filters.minValue ?? ""}
					onChange={(value) => handleInputChange("minValue", value)}
					placeholder="Valor mínimo"
				/>

				<FilterField
					label="Valor Máximo"
					name="maxValue"
					type="number"
					value={filters.maxValue ?? ""}
					onChange={(value) => handleInputChange("maxValue", value)}
					placeholder="Valor máximo"
				/>

				<FilterField
					label="Data de Emissão"
					name="emissionDate"
					type="date"
					value={filters.emissionDate || ""}
					onChange={(value) => handleInputChange("emissionDate", value)}
					placeholder="Selecione a data"
				/>
			</div>

			<div className="flex gap-3 justify-end">
				<button
					onClick={handleClearFilters}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
				>
					Limpar Filtros
				</button>

				<ActionButton
					label="Aplicar Filtros"
					variant="primary"
					onClick={handleApplyFilters}
				/>
			</div>
		</div>
	);
}
