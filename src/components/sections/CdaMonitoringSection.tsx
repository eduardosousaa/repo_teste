"use client";

import { useState } from "react";
import SuperTable from "@/components/tables/SuperTable";
import CdaMonitoringFilter from "../filters/CdaMonitoringFilter";
import CdaNegationTabs from "../tabs/CdaNegationTabs";
import {
	CdaMonitoringFilterData,
	CdaMonitoringTableData,
	MOCK_PROCESSING_CDAS,
	MOCK_PROCESSED_CDAS,
} from "@/interfaces/NegationMonitoring";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

const MONITORING_TABS = [
  { key: "processing", label: "Em processamento", count: 1240 },
  { key: "processed", label: "Processados", count: 2310 },
];

export default function CdaMonitoringSection() {
	const [activeTab, setActiveTab] = useState<"processing" | "processed">(
		"processing"
	);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<CdaMonitoringTableData[]>(MOCK_PROCESSING_CDAS);

	const handleFilterChange = (filters: CdaMonitoringFilterData) => {
		console.log(`Filtros aplicados na aba ${activeTab}:`, filters);
		
        // Simulação de pesquisa com mock
        setLoading(true);
        setTimeout(() => {
            const mockData = activeTab === "processing" ? MOCK_PROCESSING_CDAS : MOCK_PROCESSED_CDAS;
            // Aqui você aplicaria o filtro de verdade...
            setData(mockData); 
            setLoading(false);
        }, 500);
	};

	const handleClear = () => {
		console.log("Filtros limpos");
        const mockData = activeTab === "processing" ? MOCK_PROCESSING_CDAS : MOCK_PROCESSED_CDAS;
		setData(mockData);
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab as "processing" | "processed");
		// Troca o mock de dados ao trocar de aba
		if (tab === "processing") {
			setData(MOCK_PROCESSING_CDAS);
		} else {
			setData(MOCK_PROCESSED_CDAS);
		}
	};

    // ----------------------------------------------------
    // COLUNAS DA TABELA (Conforme protótipo)
    // ----------------------------------------------------
	const columns = [
		{ header: "Nº CDA", accessor: "cdaNumber" },
        { header: "Devedor", accessor: "devedor" },
        { header: "Status SEFAZ", accessor: "statusSefaz" },
        { header: "Última Op. SEFAZ", accessor: "ultimaOpSefaz" },
        { header: "Status CENPROT", accessor: "statusCenprot" },
        { header: "Última Op. CENPROT", accessor: "ultimaOpCenprot" },
        { header: "Status CADIN", accessor: "statusCadin" },
        { header: "Última Op. CADIN", accessor: "ultimaOpCadin" },
        { header: "Ações", accessor: "id", 
            render: (value: unknown, row: CdaMonitoringTableData) => (
                <button 
                    onClick={() => console.log("Ação/Detalhe para CDA:", row.cdaNumber)}
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                    title="Detalhes"
                >
                    ...
                </button>
            ),
        },
	];

    // Card de KPI reutilizável
    const KpiCard = ({ title, value, icon, iconColor, bgColor }: { title: string, value: number, icon: React.ReactNode, iconColor: string, bgColor: string }) => (
        <div className={`bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between shadow-sm ${bgColor}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-700">{title}</p>
                <div className={`p-2 rounded-full ${iconColor}`}>{icon}</div>
            </div>
            <p className={`text-2xl font-bold mt-2 ${title.includes("Falha") ? "text-red-600" : "text-gray-900"}`}>{value.toLocaleString('pt-BR')}</p>
        </div>
    );
    
    // Custom Tabs - Reutilizando o estilo do CdaNegationTabs, mas com a lógica de monitoramento
    const MonitoringTabs = ({ onChange }: { onChange: (tab: string) => void }) => (
        <div className="flex justify-start border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
            {MONITORING_TABS.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={`text-center py-3 px-6 text-sm font-medium transition-colors border-b-2 cursor-pointer
                        ${
                            activeTab === tab.key
                                ? "border-blue-500 text-gray-900 font-semibold"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }
                    `}
                >
                    {tab.label} <span className="ml-1 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tab.count.toLocaleString('pt-BR')}</span>
                </button>
            ))}
        </div>
    );


	return (
		<div className="space-y-6">
			{/* 1. KPIs (Cards) */}
			<div className="grid grid-cols-3 gap-6">
                <KpiCard 
                    title="Em processamento" 
                    value={1240} 
                    icon={<Clock size={20} className="text-orange-500" />} 
                    iconColor="bg-orange-100" 
                    bgColor="bg-white"
                />
                <KpiCard 
                    title="Processados com sucesso" 
                    value={2310} 
                    icon={<CheckCircle size={20} className="text-green-600" />} 
                    iconColor="bg-green-100" 
                    bgColor="bg-white"
                />
                <KpiCard 
                    title="Com falha" 
                    value={100} 
                    icon={<AlertTriangle size={20} className="text-red-500" />} 
                    iconColor="bg-red-100" 
                    bgColor="bg-white"
                />
			</div>

			{/* 2. Abas */}
            <MonitoringTabs onChange={handleTabChange} />

			{/* 3. Filtros */}
			<CdaMonitoringFilter onFilterChange={handleFilterChange} onClear={handleClear} />

			{/* 4. Tabela */}
			<SuperTable<CdaMonitoringTableData>
				data={data}
                columns={columns}
				isLoading={loading}
				selectable={false}
				pagination={{ enabled: true, pageSize: 10, position: "center" }}
                showTotalCount={true}
                totalCountLabel={`CDAs em ${activeTab === "processing" ? "Processamento" : "Processados"}`}
			/>
		</div>
	);
}