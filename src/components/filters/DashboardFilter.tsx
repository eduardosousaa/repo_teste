"use client";

import { useState } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { DashboardFilterData } from "@/interfaces/Dashboard";

export default function DashboardFilter({
  onFilterChange,
  onClear,
}: {
  onFilterChange: (filters: DashboardFilterData) => void;
  onClear?: () => void;
}) {
  const [filters, setFilters] = useState<DashboardFilterData>({
    period: "",
    tribute: "",
    status: "",
    category: "",
  });

  const handleInputChange = (name: keyof DashboardFilterData, value: string | number) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: DashboardFilterData = {
      period: "",
      tribute: "",
      status: "",
      category: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    if (onClear) onClear();
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros da Dashboard</h3>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <FilterField
          label="Período da Dívida"
          name="period"
          type="select"
          value={filters.period || ""}
          onChange={(value) => handleInputChange("period", value)}
          options={[
            { label: "2025-01", value: "2025-01" },
            { label: "2025-02", value: "2025-02" },
          ]}
          placeholder="Selecione o período"
        />

        <FilterField
          label="Tributo"
          name="tribute"
          type="select"
          value={filters.tribute || ""}
          onChange={(value) => handleInputChange("tribute", value)}
          options={[
            { label: "ICMS", value: "icms" },
            { label: "IPVA", value: "ipva" },
          ]}
          placeholder="Selecione o tributo"
        />

        <FilterField
          label="Situação Cadastral"
          name="status"
          type="select"
          value={filters.status || ""}
          onChange={(value) => handleInputChange("status", value)}
          options={[
            { label: "Ativo", value: "ativo" },
            { label: "Inativo", value: "inativo" },
          ]}
          placeholder="Selecione a situação"
        />

        <FilterField
          label="Categoria Contribuinte"
          name="category"
          type="select"
          value={filters.category || ""}
          onChange={(value) => handleInputChange("category", value)}
          options={[
            { label: "Pessoa Física", value: "pf" },
            { label: "Pessoa Jurídica", value: "pj" },
          ]}
          placeholder="Selecione a categoria"
        />
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Limpar Filtros
        </button>
        <ActionButton
          label="Aplicar Filtros"
          variant="black"
          onClick={handleApplyFilters}
        />
      </div>
    </div>
  );
}
