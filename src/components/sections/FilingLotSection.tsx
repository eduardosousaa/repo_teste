"use client";

import { useState } from "react";
import SuperTable from "@/components/tables/SuperTable";
import ActionButton from "@/components/actionButton/ActionButton";
import FilingLotFilter from "../filters/FilingLotFilter";
import {
  FilingLotFilterData,
  FilingLotTableData,
} from "@/interfaces/FilingLot";
import FilingLotTabs from "../tabs/FilingLotTabs";

export default function FilingLotSection() {
  const [data, setData] = useState<FilingLotTableData[]>([]);
  const [filteredData, setFilteredData] = useState<FilingLotTableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lots"); 

  const handleFilterChange = (filters: FilingLotFilterData) => {
    if (!data) return;
    setLoading(true);

    // TODO: Ajustar filtro com backend
    const filtered = data.filter((item) => {
      return (
        (!filters.cda ||
          item.id.toString().includes(filters.cda.toLowerCase())) &&
        (!filters.cpfCnpj ||
          (item.lotName || "")
            .toLowerCase()
            .includes(filters.cpfCnpj.toLowerCase())) &&
        (!filters.iERenavam ||
          (item.lotName || "")
            .toLowerCase()
            .includes(filters.iERenavam.toLowerCase())) &&
        (!filters.lotName ||
          (item.lotName || "")
            .toLowerCase()
            .includes(filters.lotName.toLowerCase())) &&
        (!filters.createdAt ||
          (item.createdAt || "")
            .toLowerCase()
            .includes(filters.createdAt.toLowerCase()))
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
      header: "Nome do Lote",
      accessor: "lotName",
    },
    {
      header: "Data de Criação",
      accessor: "createdAt",
      render: (value: unknown) => {
        const date = value as string | null;
        return date ? new Date(date).toLocaleDateString("pt-BR") : "-";
      },
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
      label: "Validar",
      onClick: (row: FilingLotTableData) =>
        console.log("Validar lote", row.lotName),
      render: (row: FilingLotTableData) => (
        <ActionButton
          label="Validar"
          variant="primary"
          onClick={() => console.log("Validar lote", row.lotName)}
        />
      ),
    },
    {
      label: "Excluir",
      onClick: (row: FilingLotTableData) =>
        console.log("Excluir lote", row.lotName),
      render: (row: FilingLotTableData) => (
        <ActionButton
          label="Excluir"
          variant="danger"
          onClick={() => console.log("Excluir lote", row.lotName)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <FilingLotTabs onChange={(tab) => setActiveTab(tab)} />

      <FilingLotFilter
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      {activeTab === "generated" && (
        <div className="flex gap-2">
          <ActionButton
            label="Enviar"
            variant="primary"
            onClick={() => console.log("Enviar petições")}
          />
          <ActionButton
            label="Cancelar"
            variant="danger"
            onClick={() => console.log("Cancelar petições")}
          />
        </div>
      )}

      {activeTab === "signed" && (
        <div className="flex flex-end gap-2">
          <ActionButton
            label="Assinar"
            variant="primary"
            onClick={() => console.log("Assinar petições")}
          />
          <ActionButton
            label="Excluir"
            variant="danger"
            onClick={() => console.log("Excluir petições")}
          />
        </div>
      )}

      <SuperTable<FilingLotTableData>
        data={filteredData.length ? filteredData : data}
        columns={columns}
        actions={actions}
        isLoading={loading}
        selectable={true}
        pagination={{ enabled: true, pageSize: 10, position: "center" }}
        showTotalCount={false}
        totalCountLabel="Total de lotes"
      />
    </div>
  );
}
