"use client";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { useState } from "react";
import { PetitionModelsFilterData } from "@/interfaces/PetitionModels";

export default function PetitionModelsFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: PetitionModelsFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<PetitionModelsFilterData>({
		modelName: "",
		type: "",
		status: "",
	});

	const handleInputChange = (
		name: keyof PetitionModelsFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleClearFilters = () => {
		const clearedFilters: PetitionModelsFilterData = {
			modelName: "",
			type: "",
			status: "",
		};
		setFilters(clearedFilters);
		onFilterChange(clearedFilters);
		if (onClear) onClear();
	};

	const handleApplyFilters = () => {
		onFilterChange(filters);
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-4 mb-6">
					<FilterField
						label="Nome do Modelo"
						name="modelName"
						type="text"
						value={filters.modelName || ""}
						onChange={(value) => handleInputChange("modelName", value)}
						placeholder="Digite o nome do modelo"
					/>

					<FilterField
						label="Tipo"
						name="type"
						type="select"
						value={filters.type || ""}
                        options={[
							{ value: "", label: "Todos" },
							{ value: "Teste tipo", label: "Teste tipo" },
							{ value: "Teste outro tipo", label: "Teste outro tipo" },
							{ value: "Outro teste tipo 2", label: "Outro teste tipo 2" },
						]}
						onChange={(value) => handleInputChange("type", value)}
						placeholder="Selecione o tipo de modelo"
					/>

					<FilterField
						label="Status"
						name="status"
						type="select"
						options={[
							{ value: "", label: "Todos" },
							{ value: "Ativo", label: "Ativo" },
							{ value: "Inativo", label: "Inativo" },
							{ value: "Arquivado", label: "Arquivado" },
						]}
						value={filters.status || ""}
						onChange={(value) => handleInputChange("status", value)}
                        placeholder="Selecione o status"
					/>
				</div>
			</div>

			<div className="flex gap-3 justify-end">
				<button
					onClick={handleClearFilters}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
				>
					Limpar Filtros
				</button>
				<ActionButton label="Aplicar Filtros"  variant="black" onClick={handleApplyFilters} />
			</div>
		</div>
	);
}
