"use client";
import ActionButton from "@/components/actionButton/ActionButton";
import FilterField from "@/components/filterField/FilterField";
import { useState } from "react";
import { JudicialDistrictFilterData } from "@/interfaces/JudicialDistrict";

export default function JudicialDistrictFilter({
  onFilterChange,
  onClear,
}: {
  onFilterChange: (filters: JudicialDistrictFilterData) => void;
  onClear?: () => void;
}) {
  const [filters, setFilters] = useState<JudicialDistrictFilterData>({
    city: "",
    judicialDistrict: "",
  });

  const handleInputChange = (
    name: keyof JudicialDistrictFilterData,
    value: string | number
  ) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: JudicialDistrictFilterData = {
      city: "",
      judicialDistrict: "",
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <FilterField
            label="Cidade"
            name="city"
            type="select"
            value={filters.city || ""}
            onChange={(value) => handleInputChange("city", value)}
            placeholder="Selecione a cidade"
          />

          <FilterField
            label="Comarca"
            name="judicialDistrict"
            type="select"
            value={filters.judicialDistrict || ""}
            onChange={(value) => handleInputChange("judicialDistrict", value)}
            placeholder="Selecione a Comarca"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Limpar Filtros
        </button>
        <ActionButton label="Aplicar Filtros"  variant="black" onClick={handleApplyFilters} />
      </div>
    </div>
  );
}
