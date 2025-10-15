"use client";
import { useState } from "react";
import JudicialDistrictFilter from "../filters/JudicialDistrictFilter";
import SuperTable from "@/components/tables/SuperTable";
import {
	JudicialDistrictFilterData,
	JudicialDistrictTableData,
} from "@/interfaces/JudicialDistrict";

export default function JudicialDistrictSection() {
	const [data, setData] = useState<JudicialDistrictTableData[]>([]);
	const [filteredData, setFilteredData] = useState<JudicialDistrictTableData[]>(
		[]
	);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (filters: JudicialDistrictFilterData) => {
		if (!data) return;
		setLoading(true);

		const filtered = data.filter((item) => {
			return (
				(!filters.city ||
					item.city?.toLowerCase().includes(filters.city.toLowerCase())) &&
				(!filters.judicialDistrict ||
					item.judicialDistrict
						?.toLowerCase()
						.includes(filters.judicialDistrict.toLowerCase()))
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
			header: "Cidade",
			accessor: "city",
		},
		{
			header: "Comarca",
			accessor: "judicialDistrict",
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">Mapeados</h1>
						<span className="text-2xl font-bold text-gray-900 bg-gray-100 rounded-lg px-3 py-2">
							220/224
						</span>
					</div>
				</div>
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-900">Sem Cobertura</h1>
						<span className="text-2xl font-bold text-gray-900 bg-gray-100 rounded-lg px-3 py-2">
							4
						</span>
					</div>
				</div>
			</div>

			<JudicialDistrictFilter
				onFilterChange={handleFilterChange}
				onClear={handleClear}
			/>

			<SuperTable<JudicialDistrictTableData>
				title="Tabelas de município e comarcas"
				data={filteredData.length ? filteredData : data}
				columns={columns}
				isLoading={loading}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
				showTotalCount={false}
			/>
			<div className="flex justify-end mt-4">
				<button className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer">
					Salvar
				</button>
			</div>
		</div>
	);
}
