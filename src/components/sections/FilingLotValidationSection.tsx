"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import SuperTable from "@/components/tables/SuperTable";
import FilingLotValidationFilter from "../filters/FilingLotValidationFilter";
import {
	FilingLotSimulationFilterData,
	FilingLotValidationTableData,
} from "@/interfaces/FilingLot";

export default function FilingLotValidationSection() {
	const [data, setData] = useState<FilingLotValidationTableData[]>([]);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (filters: FilingLotSimulationFilterData) => {
		console.log("Filtros aplicados:", filters);
		// TODO: backend
	};

	const handleClear = () => {
		setData([]);
	};

	const columns = [
		{ header: "Devedor", accessor: "debtor" },
		{ header: "Raiz CNPJ", accessor: "cnpjRoot" },
		{ header: "CDA", accessor: "cda" },
		{ header: "Valor", accessor: "value" },
		{ header: "Tipo de dívida", accessor: "debtType" },
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-2 gap-4">
				<div className="bg-white p-4 rounded shadow text-center">
					<p className="font-semibold text-blue-700">CDA’s no lote</p>
					<p className="text-2xl font-bold">152</p>
				</div>
				<div className="bg-white p-4 rounded shadow text-center">
					<p className="font-semibold text-blue-700">Valor total</p>
					<p className="text-2xl font-bold">R$ 48.000,00</p>
				</div>
			</div>

			<FilingLotValidationFilter
				onFilterChange={handleFilterChange}
				onClear={handleClear}
			/>

			<div className="bg-white p-4 rounded shadow space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<input type="checkbox" />
						<span>Selecionar todos</span>
					</div>
					<div>
						<span className="font-medium">
							Total de CDAs selecionadas: 12 | Valor total: R$ 70.000,00
						</span>
					</div>
				</div>

				<SuperTable<FilingLotValidationTableData>
					data={data}
					columns={columns}
					isLoading={loading}
					selectable={true}
					pagination={{ enabled: true, pageSize: 10, position: "center" }}
				/>

				<div className="flex gap-2">
					<ActionButton
						label="Aprovar Itens Selecionados"
						variant="primary"
						onClick={() => console.log("Aprovar selecionados")}
					/>
					<ActionButton
						label="Reprovar lote"
						variant="danger"
						onClick={() => console.log("Reprovar lote")}
					/>
				</div>
			</div>
		</div>
	);
}
