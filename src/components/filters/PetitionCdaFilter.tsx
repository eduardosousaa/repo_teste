"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { PetitionCdaFilterData } from "@/interfaces/PetitionModels";

export default function PetitionCdaFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: PetitionCdaFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<PetitionCdaFilterData>({
		origin: "",
		emissionDate: "",
		cnpjStatus: "",
		tribute: "",
		updatedValue: undefined,
		cdaNumber: "",
		cpfCnpj: "",
		iERenavam: "",
	});

	const handleInputChange = (
		name: keyof PetitionCdaFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleClearFilters = () => {
		const cleared: PetitionCdaFilterData = {
			origin: "",
			emissionDate: "",
			cnpjStatus: "",
			tribute: "",
			updatedValue: undefined,
			cdaNumber: "",
			cpfCnpj: "",
			iERenavam: "",
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
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de CDA</h3>

			<div className="grid grid-cols-4 gap-4 mb-6">
				<FilterField
					label="Origem"
					name="origin"
					type="text"
					value={filters.origin || ""}
					onChange={(value) => handleInputChange("origin", value)}
					placeholder="Digite a origem"
				/>

				<FilterField
					label="Data de Emissão"
					name="emissionDate"
					type="date"
					value={filters.emissionDate || ""}
					onChange={(value) => handleInputChange("emissionDate", value)}
					placeholder="Selecione a data"
				/>

				<FilterField
					label="Situação CNPJ"
					name="cnpjStatus"
					type="text"
					value={filters.cnpjStatus || ""}
					onChange={(value) => handleInputChange("cnpjStatus", value)}
					placeholder="Digite a situação"
				/>

				<FilterField
					label="Tributo"
					name="tribute"
					type="text"
					value={filters.tribute || ""}
					onChange={(value) => handleInputChange("tribute", value)}
					placeholder="Digite o tributo"
				/>

				<FilterField
					label="Valor Atualizado"
					name="updatedValue"
					type="number"
					value={filters.updatedValue ?? ""}
					onChange={(value) => handleInputChange("updatedValue", value)}
					placeholder="Digite o valor"
				/>

				<FilterField
					label="Nº CDA"
					name="cdaNumber"
					type="text"
					value={filters.cdaNumber || ""}
					onChange={(value) => handleInputChange("cdaNumber", value)}
					placeholder="Digite o número da CDA"
				/>

				<FilterField
					label="CPF / CNPJ"
					name="cpfCnpj"
					type="text"
					value={filters.cpfCnpj || ""}
					onChange={(value) => handleInputChange("cpfCnpj", value)}
					placeholder="Digite CPF ou CNPJ"
				/>

				<FilterField
					label="IE / Renavam"
					name="iERenavam"
					type="text"
					value={filters.iERenavam || ""}
					onChange={(value) => handleInputChange("iERenavam", value)}
					placeholder="Digite IE ou Renavam"
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
					variant="black"
					onClick={handleApplyFilters}
				/>
			</div>
		</div>
	);
}
