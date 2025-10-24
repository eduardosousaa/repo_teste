"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { NegationCdaFilterData, MOCK_TRIBUTE_OPTIONS } from "@/interfaces/NegationCda";

export default function CdaNegationFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: NegationCdaFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<NegationCdaFilterData>({
		cdaNumber: "",
		iERenavam: "",
		tribute: "",
		cpfCnpj: "",
		emissionDate: "",
		minValue: undefined,
		maxValue: undefined,
	});

	const handleInputChange = (
		name: keyof NegationCdaFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
	};

	const handleClearFilters = () => {
		const cleared: NegationCdaFilterData = {
			cdaNumber: "",
			iERenavam: "",
			tribute: "",
			cpfCnpj: "",
			emissionDate: "",
			minValue: undefined,
			maxValue: undefined,
		};
		setFilters(cleared);
		onClear?.();
	};

	const handleApplyFilters = () => {
		onFilterChange(filters);
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
			<div className="grid grid-cols-3 gap-4 mb-4">
				<FilterField
					label="Nº CDA"
					name="cdaNumber"
					type="text"
					value={filters.cdaNumber || ""}
					onChange={(value) => handleInputChange("cdaNumber", value)}
					placeholder="Digite o Devedor"
				/>

				<FilterField
					label="IE/Renavam"
					name="iERenavam"
					type="text"
					value={filters.iERenavam || ""}
					onChange={(value) => handleInputChange("iERenavam", value)}
					placeholder="Digite o IE/Renavam"
				/>

				<FilterField
					label="Tributo"
					name="tribute"
					type="select"
					value={filters.tribute || ""}
					onChange={(value) => handleInputChange("tribute", value)}
					options={MOCK_TRIBUTE_OPTIONS}
					placeholder="Selecione o Tributo"
				/>
			</div>

			<div className="grid grid-cols-3 gap-4 mb-6">
				<FilterField
					label="CPF/CNPJ"
					name="cpfCnpj"
					type="text"
					value={filters.cpfCnpj || ""}
					onChange={(value) => handleInputChange("cpfCnpj", value)}
					placeholder="Digite CPF/CNPJ"
				/>

				<FilterField
					label="Data de emissão"
					name="emissionDate"
					type="date"
					value={filters.emissionDate || ""}
					onChange={(value) => handleInputChange("emissionDate", value)}
					placeholder="dd/mm/aaaa"
				/>

				<div className="flex flex-col">
					<label className="mb-2 text-sm font-medium text-gray-700 block">
						Faixa de valor
					</label>

					<div className="flex gap-2">
						<FilterField
							label="Valor min"
							name="minValue"
							type="number"
							value={filters.minValue ?? ""}
							onChange={(value) => handleInputChange("minValue", value)}
							placeholder="Valor min"
							labelClassName="sr-only"
						/>
						<FilterField
							label="Valor máx"
							name="maxValue"
							type="number"
							value={filters.maxValue ?? ""}
							onChange={(value) => handleInputChange("maxValue", value)}
							placeholder="Valor máx"
							labelClassName="sr-only"
						/>
					</div>
				</div>
			</div>

			<div className="flex gap-3">
				<ActionButton label="Pesquisar" variant="primary" onClick={handleApplyFilters} />
				<button
					onClick={handleClearFilters}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
				>
					Limpar
				</button>
			</div>
		</div>
	);
}