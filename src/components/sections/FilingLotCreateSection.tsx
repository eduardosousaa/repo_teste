"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import SuperTable from "@/components/tables/SuperTable";
import FilingLotSimulationFilter from "../filters/FilingLotSimulationFilter";
import FilingLotCdaFilter from "../filters/FilingLotCdaFilter";
import {
	FilingLotSimulationFilterData,
	FilingLotCdaFilterData,
	FilingLotCdaTableData,
} from "@/interfaces/FilingLot";

export default function FilingLotCreateSection() {
	const [data, setData] = useState<FilingLotCdaTableData[]>([]);
	const [loading, setLoading] = useState(false);

	const handleSimulationFilterChange = (filters: FilingLotSimulationFilterData) => {
		console.log("Simulação →", filters);
	};

	const handleCdaFilterChange = (filters: FilingLotCdaFilterData) => {
		console.log("Filtro CDA →", filters);
	};

	const handleClearCda = () => {
		setData([]);
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

	const actions = [
		{
			label: "Editar",
			onClick: (row: FilingLotCdaTableData) => console.log("Editar CDA", row),
			render: (row: FilingLotCdaTableData) => (
				<ActionButton
					label="Editar"
					variant="secondary"
					onClick={() => console.log("Editar CDA", row)}
				/>
			),
		},
	];

	return (
		<div className="space-y-6">
			<FilingLotSimulationFilter
				onFilterChange={handleSimulationFilterChange}
				onClear={() => console.log("Limpar simulação")}
			/>

			<div className="bg-yellow-100 p-4 rounded flex gap-6">
				<div className="bg-white p-4 rounded shadow flex-1 text-center">
					<p className="font-semibold text-blue-700">CDAs Elegíveis</p>
					<p className="text-2xl font-bold">152</p>
				</div>
				<div className="bg-white p-4 rounded shadow flex-1 text-center">
					<p className="font-semibold text-blue-700">CDAs Inelegíveis</p>
					<p className="text-2xl font-bold">48</p>
				</div>
			</div>

			<FilingLotCdaFilter onFilterChange={handleCdaFilterChange} onClear={handleClearCda} />

			<SuperTable<FilingLotCdaTableData>
				data={data}
				columns={columns}
				actions={actions}
				isLoading={loading}
				selectable={true}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
			/>
		</div>
	);
}
