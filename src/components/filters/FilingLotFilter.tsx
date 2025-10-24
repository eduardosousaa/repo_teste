"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { FilingLotFilterData } from "@/interfaces/FilingLot";

export default function FilingLotFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: FilingLotFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<FilingLotFilterData>({
		cda: "",
		cpfCnpj: "",
		iERenavam: "",
		lotName: "",
		createdAt: "",
	});

	const handleInputChange = (
		name: keyof FilingLotFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const handleClearFilters = () => {
		const clearedFilters: FilingLotFilterData = {
			cda: "",
			cpfCnpj: "",
			iERenavam: "",
			lotName: "",
			createdAt: "",
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
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Filtros de Lotes
			</h3>

			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-4 mb-6">
					<FilterField
						label="CDA"
						name="cda"
						type="text"
						value={filters.cda || ""}
						onChange={(value) => handleInputChange("cda", value)}
						placeholder="Digite o CDA"
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

					<FilterField
						label="Nome do Lote"
						name="lotName"
						type="text"
						value={filters.lotName || ""}
						onChange={(value) => handleInputChange("lotName", value)}
						placeholder="Digite o nome do lote"
					/>

					<FilterField
						label="Data de Criação"
						name="createdAt"
						type="date"
						value={filters.createdAt || ""}
						onChange={(value) => handleInputChange("createdAt", value)}
						placeholder="Selecione a data"
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
				<ActionButton label="Aplicar Filtros" variant="primary" onClick={handleApplyFilters} />
			</div>
		</div>
	);
}
