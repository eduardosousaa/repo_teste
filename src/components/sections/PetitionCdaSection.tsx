"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import SuperTable from "@/components/tables/SuperTable";
import PetitionCdaFilter from "../filters/PetitionCdaFilter";
import {
	PetitionCdaFilterData,
	PetitionCdaTableData,
	PetitionModelOption,
} from "@/interfaces/PetitionModels";

export default function PetitionCdaSection() {
	const [data, setData] = useState<PetitionCdaTableData[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState<string | null>(null);

	const modelOptions: PetitionModelOption[] = [
		{ value: "1", label: "Modelo ICMS" },
		{ value: "2", label: "Modelo IPVA" },
		{ value: "3", label: "Modelo Dívida Ativa" },
	];

	const handleFilterChange = (filters: PetitionCdaFilterData) => {
		console.log("Filtros aplicados:", filters);
	};

	const handleClear = () => {
		console.log("Filtros limpos");
		setData([]);
		setSelectedModel(null);
	};

	const handleSearch = () => {
		setLoading(true);
		setTimeout(() => {
			setData([
				{
					id: 1,
					origin: "SEFAZ",
					cdaNumber: "12345",
					cpfCnpj: "123.456.789-00",
					iERenavam: "987654",
					emissionDate: "2025-09-01",
					cnpjStatus: "Ativo",
					updatedValue: 2500.75,
					tribute: "ICMS",
				},
			]);
			setLoading(false);
		}, 1000);
	};

	const columns = [
		{ header: "Origem", accessor: "origin" },
		{ header: "Nº CDA", accessor: "cdaNumber" },
		{ header: "CPF/CNPJ", accessor: "cpfCnpj" },
		{ header: "IE/Renavam", accessor: "iERenavam" },
		{ header: "Data de Emissão", accessor: "emissionDate" },
		{ header: "Situação CNPJ", accessor: "cnpjStatus" },
		{ header: "Valor Atualizado", accessor: "updatedValue" },
		{ header: "Tributo", accessor: "tribute" },
	];

	return (
		<div className="space-y-6">
			<PetitionCdaFilter onFilterChange={handleFilterChange} onClear={handleClear} />

			<div className="bg-white p-4 rounded shadow">
				<h2 className="text-lg font-semibold mb-2">Modelo</h2>
				<select
					className="border p-2 rounded w-64"
					value={selectedModel ?? ""}
					onChange={(e) => setSelectedModel(e.target.value)}
				>
					<option value="">Selecionar Modelo</option>
					{modelOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>

				<div className="mt-4 flex gap-2">
					<ActionButton label="Pesquisar" variant="primary" onClick={handleSearch} />
					<ActionButton label="Limpar" variant="secondary" onClick={handleClear} />
				</div>
			</div>

			<SuperTable<PetitionCdaTableData>
				data={data}
				columns={columns}
				isLoading={loading}
				selectable={true}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
			/>
		</div>
	);
}
