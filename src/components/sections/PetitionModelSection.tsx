"use client";

import { useState } from "react";
import PetitionModelsFilter from "../filters/PetitionModelsFilter";
import SuperTable from "@/components/tables/SuperTable";
import {
	PetitionModelsFilterData,
	PetitionModelsTableData,
} from "@/interfaces/PetitionModels";
import ActionButton from "@/components/actionButton/ActionButton";

export default function PetitionModelSection() {
	const [data, setData] = useState<PetitionModelsTableData[]>([]);
	const [filteredData, setFilteredData] = useState<PetitionModelsTableData[]>(
		[]
	);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (filters: PetitionModelsFilterData) => {
		if (!data) return;
		setLoading(true);

		// TODO: Ajustar filtro com backend
		const filtered = data.filter((item) => {
			return (
				(!filters.modelName ||
					item.modelName
						?.toLowerCase()
						.includes(filters.modelName.toLowerCase())) &&
				(!filters.type ||
					item.activeVersion
						?.toLowerCase()
						.includes(filters.type.toLowerCase())) &&
				(!filters.status ||
					item.status?.toLowerCase() === filters.status.toLowerCase())
			);
		});

		setFilteredData(filtered);
		setLoading(false);
	};

	const handleClear = () => {
		setFilteredData(data);
		setLoading(false);
	};

	const columns = [
		{
			header: "Nome do Modelo",
			accessor: "modelName",
		},
		{
			header: "Versão Ativa",
			accessor: "activeVersion",
		},
		{
			header: "Status",
			accessor: "status",
			render: (value: unknown) => {
				const status = value as string | null;
				if (!status) return "-";
				const classes =
					status === "Ativo"
						? "bg-green-100 text-green-800"
						: status === "Inativo"
							? "bg-red-100 text-red-800"
							: "bg-gray-100 text-gray-800";
				return (
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes}`}
					>
						{status}
					</span>
				);
			},
		},
	];

	const actions = [
		{
			label: "Editar",
			onClick: (row: PetitionModelsTableData) =>
				console.log("Editar modelo", row.modelName),
			render: (row: PetitionModelsTableData) => (
				<ActionButton
					label="Editar"
					variant="primary"
					onClick={() => console.log("Editar modelo", row.modelName)}
				/>
			),
		},
		{
			label: "Excluir",
			onClick: (row: PetitionModelsTableData) =>
				console.log("Excluir modelo", row.modelName),
			render: (row: PetitionModelsTableData) => (
				<ActionButton
					label="Excluir"
					variant="danger"
					onClick={() => console.log("Excluir modelo", row.modelName)}
				/>
			),
		},
	];

	return (
		<div className="space-y-6">
			<PetitionModelsFilter
				onFilterChange={handleFilterChange}
				onClear={handleClear}
			/>

			<SuperTable<PetitionModelsTableData>
				title="Modelos de Petição"
				data={filteredData.length ? filteredData : data}
				columns={columns}
				actions={actions}
				isLoading={loading}
				selectable={true}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
				showTotalCount={false}
				totalCountLabel="Total de modelos"
			/>
		</div>
	);
}
