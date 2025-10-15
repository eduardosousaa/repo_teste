"use client";

import { useState } from "react";
import SuperTable from "@/components/tables/SuperTable";
import ActionButton from "@/components/actionButton/ActionButton";
import PendencyFilter from "../filters/PendencyFilter";
import { PendencyFilterData, PendencyTableData } from "@/interfaces/Pendency";
import PendencyTabs from "../tabs/PendencyTabs";

export default function PendencySection() {
	const [data, setData] = useState<PendencyTableData[]>([]);
	const [filteredData, setFilteredData] = useState<PendencyTableData[]>([]);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (filters: PendencyFilterData) => {
		if (!data) return;
		setLoading(true);

		// TODO: Ajustar filtro com backend
		const filtered = data.filter((item) => {
			return (
				(!filters.cda ||
					(item.cda || "").toLowerCase().includes(filters.cda.toLowerCase())) &&
				(!filters.cpfCnpj ||
					(item.cpfCnpj || "")
						.toLowerCase()
						.includes(filters.cpfCnpj.toLowerCase())) &&
				(!filters.iERenavam ||
					item.id
						.toString()
						.toLowerCase()
						.includes(filters.iERenavam.toLowerCase())) &&
				(!filters.tribute ||
					(item.value || "")
						.toLowerCase()
						.includes(filters.tribute.toLowerCase()))
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
			header: "Nº CDA",
			accessor: "cda",
		},
		{
			header: "CPF/CNPJ",
			accessor: "cpfCnpj",
		},
		{
			header: "Valor",
			accessor: "value",
			render: (value: unknown) => {
				const val = value as string | null;
				return val
					? `R$ ${Number(val).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
					: "-";
			},
		},
		{
			header: "Dias na Fila",
			accessor: "daysPending",
			render: (value: unknown) => {
				const days = value as number | null;
				return days !== null ? `${days} dia(s)` : "-";
			},
		},
	];

	return (
		<div className="space-y-6">
            <PendencyTabs />
			<PendencyFilter
				onFilterChange={handleFilterChange}
				onClear={handleClear}
			/>

			<SuperTable<PendencyTableData>
				data={filteredData.length ? filteredData : data}
				columns={columns}
				isLoading={loading}
				selectable={true}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
				showTotalCount={false}
				totalCountLabel="Total de pendências"
			/>
		</div>
	);
}
