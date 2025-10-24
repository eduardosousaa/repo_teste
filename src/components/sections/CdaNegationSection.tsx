"use client";

import { useState } from "react";
import SuperTable from "@/components/tables/SuperTable";
import ActionButton from "@/components/actionButton/ActionButton";
import CdaNegationFilter from "../filters/CdaNegationFilter";
import CdaNegationTabs from "../tabs/CdaNegationTabs";
import {
	NegationCdaFilterData,
	NegationCdaTableData,
	MOCK_ELIGIBLE_CDAS,
	MOCK_INELIGIBLE_CDAS,
} from "@/interfaces/NegationCda";
import { Plus } from "lucide-react";

export default function CdaNegationSection() {
	const [activeTab, setActiveTab] = useState<"eligible" | "ineligible">(
		"eligible"
	);
	const [loading, setLoading] = useState(false);
    const [selectedCdaIds, setSelectedCdaIds] = useState<Array<number | string>>([]);
	const [data, setData] = useState<NegationCdaTableData[]>(MOCK_ELIGIBLE_CDAS);

	const handleFilterChange = (filters: NegationCdaFilterData) => {
		console.log(`Filtros aplicados na aba ${activeTab}:`, filters);
		
        setLoading(true);
        setTimeout(() => {
            const mockData = activeTab === "eligible" ? MOCK_ELIGIBLE_CDAS : MOCK_INELIGIBLE_CDAS;
            setData(mockData); 
            setLoading(false);
        }, 500);
	};

	const handleClear = () => {
		console.log("Filtros limpos");
        const mockData = activeTab === "eligible" ? MOCK_ELIGIBLE_CDAS : MOCK_INELIGIBLE_CDAS;
		setData(mockData);
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab as "eligible" | "ineligible");
        setSelectedCdaIds([]);

		if (tab === "eligible") {
			setData(MOCK_ELIGIBLE_CDAS);
		} else {
			setData(MOCK_INELIGIBLE_CDAS);
		}
	};

	const eligibleColumns = [
		{ header: "Nº CDA", accessor: "cdaNumber" },
        { header: "Devedor", accessor: "devedor" },
		{ header: "Valor", accessor: "valorAtualizado", 
            render: (value: unknown) => {
                const val = value as number | null;
                return val
                    ? `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                    : "-";
            },
        },
    ];

    const ineligibleColumns = [
        { header: "Nº CDA", accessor: "cdaNumber" },
        { header: "Motivo(s) da Inelegibilidade", accessor: "motivoInelegibilidade" },
    ];

    const negateNowAction = {
        label: "Negativar agora",
        onClick: (row: NegationCdaTableData) => console.log("Negativar CDA:", row.cdaNumber),
        render: (row: NegationCdaTableData) => (
            <ActionButton
                label="Negativar agora"
                variant="primary"
                onClick={() => console.log("Negativar CDA:", row.cdaNumber)}
            />
        ),
    };

    const eligibleActions = [negateNowAction];


	return (
		<div className="space-y-6">
			<CdaNegationTabs onChange={handleTabChange} />

			<CdaNegationFilter onFilterChange={handleFilterChange} onClear={handleClear} />

            {activeTab === "eligible" && (
                <div className="mt-4">
                    <ActionButton 
                        label={`Adicionar ${selectedCdaIds.length} à fila de envio`}
                        variant="secondary"
                        onClick={() => console.log("Adicionar CDAs à fila de envio:", selectedCdaIds)}
                        disabled={selectedCdaIds.length === 0}
                    >
                         <Plus size={16} />
                    </ActionButton>
                </div>
            )}
            
			<SuperTable<NegationCdaTableData>
				data={data}
                columns={activeTab === "eligible" ? eligibleColumns : ineligibleColumns}
                actions={activeTab === "eligible" ? eligibleActions : []}
				isLoading={loading}
				selectable={activeTab === "eligible"}
                onSelectionChange={setSelectedCdaIds}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
                emptyMessage={activeTab === "eligible" ? "Nenhuma CDA elegível encontrada." : "Nenhuma CDA inelegível encontrada."}
                showTotalCount={true}
                totalCountLabel={`Total de CDAs ${activeTab === "eligible" ? "Elegíveis" : "Inelegíveis"}`}
			/>
		</div>
	);
}