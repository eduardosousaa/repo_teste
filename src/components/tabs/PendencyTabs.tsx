"use client";

import { useState } from "react";

const tabs = [
  { key: "pendencies", label: "CDAs Aptas", enabled: true },
  { key: "lots", label: "Lotes p/ Validação", enabled: false },
  { key: "toSign", label: "Petições p/ Assinar", enabled: false },
  { key: "toSend", label: "Petições para Envio/Falha", enabled: false },
];

export default function PendencyTabs({
  onChange,
}: {
  onChange?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("pendencies");

  const handleTabClick = (tab: string, enabled: boolean) => {
    if (!enabled) return;
    setActiveTab(tab);
    if (onChange) onChange(tab);
  };

  return (
    <div className="flex justify-between border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          disabled={!tab.enabled}
          onClick={() => handleTabClick(tab.key, tab.enabled)}
          className={`flex-1 text-center py-3 text-sm font-medium transition-colors border-b-2
            ${
              activeTab === tab.key
                ? "border-blue-500 text-gray-900 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }
            ${!tab.enabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
