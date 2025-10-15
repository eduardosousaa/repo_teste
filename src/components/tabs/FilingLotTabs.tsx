"use client";

import { useState } from "react";

const tabs = [
  { key: "lots", label: "Lotes p/ Validação", enabled: true },
  { key: "generated", label: "Petições Geradas", enabled: true },
  { key: "signed", label: "Petições Assinadas", enabled: true },
  { key: "sent", label: "Petições Enviadas", enabled: true },
];

export default function FilingLotTabs({
  onChange,
}: {
  onChange?: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState("lots");

  const handleTabClick = (tab: string, enabled: boolean) => {
    if (!enabled) return;
    setActiveTab(tab);
    if (onChange) onChange(tab);
  };

  return (
    <div className="flex justify-between border-b border-gray-200 bg-white rounded-t-lg shadow-sm ">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          disabled={!tab.enabled}
          onClick={() => handleTabClick(tab.key, tab.enabled)}
          className={`flex-1 text-center py-3 text-sm font-medium transition-colors border-b-2 cursor-pointer
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
