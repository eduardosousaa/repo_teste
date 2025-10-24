"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { CdaMonitoringFilterData, MOCK_SELECT_OPTIONS } from "@/interfaces/NegationMonitoring";

export default function CdaMonitoringFilter({
	onFilterChange,
	onClear,
}: {
	onFilterChange: (filters: CdaMonitoringFilterData) => void;
	onClear?: () => void;
}) {
	const [filters, setFilters] = useState<CdaMonitoringFilterData>({
		cdaNumber: "",
		iERenavam: "",
		tribute: "",
		situacao: "",
		cpfCnpj: "",
		emissionDate: "",
		periodo: "",
		minValue: undefined,
		maxValue: undefined,
		status: "",
		statusCENPROT: "",
		statusCADIN: "",
		statusSEFAZ: "",
		ultimaOpStatus: "",
	});

	const handleInputChange = (
		name: keyof CdaMonitoringFilterData,
		value: string | number
	) => {
		const newFilters = { ...filters, [name]: value };
		setFilters(newFilters);
	};

	const handleClearFilters = () => {
		const cleared: CdaMonitoringFilterData = {
			cdaNumber: "",
			iERenavam: "",
			tribute: "",
			situacao: "",
			cpfCnpj: "",
			emissionDate: "",
			periodo: "",
			minValue: undefined,
			maxValue: undefined,
			status: "",
			statusCENPROT: "",
			statusCADIN: "",
			statusSEFAZ: "",
			ultimaOpStatus: "",
		};
		setFilters(cleared);
		onClear?.();
	};

	const handleApplyFilters = () => {
		onFilterChange(filters);
	};

	const mockStatusOptions = [
		{ value: "", label: "Selecione" },
		{ value: "ativo", label: "Ativo" },
		{ value: "inativo", label: "Inativo" },
	];
	
	const mockTributeOptions = [
		{ value: "", label: "Selecione o Tributo" },
		{ value: "ICMS", label: "ICMS" },
		{ value: "IPVA", label: "IPVA" },
	];

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
			{/* Linha 1: 4 Colunas */}
			<div className="grid grid-cols-4 gap-4 mb-6">
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
					options={mockTributeOptions}
					placeholder="Selecione o Tributo"
				/>

				<FilterField
					label="Situação"
					name="situacao"
					type="select"
					value={filters.situacao || ""}
					onChange={(value) => handleInputChange("situacao", value)}
					options={mockStatusOptions} // Mocks de situação simples
					placeholder="Selecione a situação"
				/>
			</div>

			{/* Linha 2: 5 Colunas (4 inputs + 1 grupo de inputs) */}
			<div className="grid grid-cols-5 gap-4 mb-6">
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
				
				<FilterField
					label="Período"
					name="periodo"
					type="date"
					value={filters.periodo || ""}
					onChange={(value) => handleInputChange("periodo", value)}
					placeholder="dd/mm/aaaa"
				/>

				{/* Faixa de Valor Agrupada (2 inputs) - 2 colunas no grid de 5 */}
				<div className="flex flex-col col-span-2"> 
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
			
			{/* Linha 3: 5 Colunas (Status) */}
			<div className="grid grid-cols-5 gap-4 mb-6">
				<FilterField
					label="Status"
					name="status"
					type="select"
					value={filters.status || ""}
					onChange={(value) => handleInputChange("status", value)}
					options={mockStatusOptions}
					placeholder="Selecione"
				/>
				<FilterField
					label="Status CENPROT"
					name="statusCENPROT"
					type="select"
					value={filters.statusCENPROT || ""}
					onChange={(value) => handleInputChange("statusCENPROT", value)}
					options={mockStatusOptions}
					placeholder="Selecione"
				/>
				<FilterField
					label="Status CADIN"
					name="statusCADIN"
					type="select"
					value={filters.statusCADIN || ""}
					onChange={(value) => handleInputChange("statusCADIN", value)}
					options={mockStatusOptions}
					placeholder="Selecione"
				/>
				<FilterField
					label="Status SEFAZ"
					name="statusSEFAZ"
					type="select"
					value={filters.statusSEFAZ || ""}
					onChange={(value) => handleInputChange("statusSEFAZ", value)}
					options={mockStatusOptions}
					placeholder="Selecione"
				/>
				<FilterField
					label="Status da Última Operação"
					name="ultimaOpStatus"
					type="select"
					value={filters.ultimaOpStatus || ""}
					onChange={(value) => handleInputChange("ultimaOpStatus", value)}
					options={mockStatusOptions}
					placeholder="Selecione"
				/>
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