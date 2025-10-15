"use client";

import { useState } from "react";
import ReactECharts from "echarts-for-react";
import DashboardFilter from "../filters/DashboardFilter";
import { DashboardFilterData } from "@/interfaces/Dashboard";

export default function DashboardSection() {
  const [filters, setFilters] = useState<DashboardFilterData>({});

  const handleFilterChange = (f: DashboardFilterData) => {
    console.log("Aplicar filtro da dashboard →", f);
    setFilters(f);
    // TODO: chamada backend para atualizar KPIs e gráficos
  };

  const handleClear = () => {
    console.log("Limpar filtros da dashboard");
    setFilters({});
    // TODO: resetar gráficos/KPIs
  };

  // ==== MOCKS ECHARTS ====
  const lineOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Valor Ajuizado (Acumulado)", "Valor Recuperado (Acumulado)"] },
    xAxis: { type: "category", data: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"] },
    yAxis: { type: "value" },
    series: [
      { name: "Valor Ajuizado (Acumulado)", type: "line", smooth: true, data: [2, 5, 7, 8, 6, 9, 7] },
      { name: "Valor Recuperado (Acumulado)", type: "line", smooth: true, data: [1, 3, 4, 6, 5, 7, 6] },
    ],
  };

  const barValueOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["0 - R$50.000", "R$50.000 - R$100.000"] },
    yAxis: { type: "value" },
    series: [{ name: "CDAs", type: "bar", data: [1250, 320], itemStyle: { color: "#f59e0b" } }],
  };

  const barDaysOption = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["10", "20", "30", "40", "50", "60", "70", "80"] },
    yAxis: { type: "value" },
    series: [{ name: "CDAs", type: "bar", data: [20, 28, 35, 40, 32, 28, 25, 22], itemStyle: { color: "#22c55e" } }],
  };

  return (
    <div className="space-y-6">
      <DashboardFilter onFilterChange={handleFilterChange} onClear={handleClear} />

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-indigo-100 p-4 rounded text-center">
          <p>Total de petições</p>
          <p className="text-xl font-bold">R$ 5.2M</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded text-center">
          <p>% Conversão de Petições</p>
          <p className="text-xl font-bold">10%</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded text-center">
          <p>% Conversão de CDAs</p>
          <p className="text-xl font-bold">30%</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded text-center">
          <p>Tempo de Ajuizamento</p>
          <p className="text-xl font-bold">30 dias</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded text-center">
          <p>CDAs Total Ajuizadas</p>
          <p className="text-xl font-bold">R$850k</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Valor ajuizado vs. recuperado</h2>
          <ReactECharts option={lineOption} style={{ height: 300 }} />
        </div>
        <div className="space-y-4">
          <div className="bg-green-100 p-4 rounded shadow">
            <p>Valor Total Ajuizado</p>
            <p className="text-2xl font-bold">10.000</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <p>Valor Recuperado</p>
            <p className="text-2xl font-bold">20%</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <p>Total Recuperado</p>
            <p className="text-2xl font-bold">R$850k</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <p>Tempo de Recuperação</p>
            <p className="text-2xl font-bold">400 dias</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Conversão por Faixa de Valor</h2>
          <ReactECharts option={barValueOption} style={{ height: 300 }} />
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Dias para ajuizamento</h2>
          <ReactECharts option={barDaysOption} style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
}
