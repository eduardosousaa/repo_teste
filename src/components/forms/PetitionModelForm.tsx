/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import VersionHistory from "@/components/sidebar/VersionHistory";

type Regra = {
  atributo: string;
  operacao: string;       // ex: ">"
  operacaoLabel: string;  // ex: "maior que"
  valor: string | number;
  logico?: "AND" | "OR" | "";
};

const ATRIBUTOS = [
  { value: "cda.valor_total", label: "cda.valor_total" },
  { value: "cda.valor", label: "cda.valor" },
  { value: "cta.valor_total", label: "cta.valor_total" },
  { value: "cta.qtd_itens", label: "cta.qtd_itens" },
];

const OPERACOES = [
  { value: ">", label: ">  maior que" },
  { value: "<", label: "<  menor que" },
  { value: "=", label: "=  igual a" },
  { value: ">=", label: ">= maior ou igual" },
  { value: "<=", label: "<= menor ou igual" },
  { value: "<>", label: "<> diferente de" },
];

export default function PetitionModelForm() {
  const [rules, setRules] = useState<Regra[]>([]);

  // estados do formulário de nova regra
  const [atributo, setAtributo] = useState("");
  const [operacao, setOperacao] = useState("");
  const [valor, setValor] = useState<string>("");
  const [logico, setLogico] = useState<Regra["logico"]>("");

  const operacaoLabel = useMemo(
    () => OPERACOES.find(o => o.value === operacao)?.label ?? "",
    [operacao]
  );

  const canAdd = atributo && operacao && valor !== "";

  const handleAddRule = () => {
    if (!canAdd) return;
    const nova: Regra = {
      atributo,
      operacao,
      operacaoLabel: operacaoLabel || operacao,
      valor,
      logico: logico || "",
    };
    setRules(prev => [...prev, nova]);

    // limpa inputs
    setAtributo("");
    setOperacao("");
    setValor("");
    setLogico("");
  };

  const handleRemoveRule = (idx: number) => {
    setRules(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // aqui você envia pro backend
    console.log({ rules });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h1 className="text-2xl font-semibold">Criar/Editar Modelo de Petição</h1>
        <div className="flex gap-2">
          <VersionHistory />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Conteúdo do Modelo</h2>
        <textarea
          rows={8}
          className="w-full border border-gray-300 rounded p-3"
          placeholder="Aqui vai o conteúdo do modelo"
        />
      </div>

      <div className="bg-white py-2 px-6 border rounded-lg">
        <h2 className="font-semibold mb-4">Regras de Utilização</h2>

        <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5">
              <label className="block text-sm font-medium mb-1">Escolha o atributo</label>
              <select
                value={atributo}
                onChange={(e) => setAtributo(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 bg-white"
              >
                <option value="">Selecione</option>
                {ATRIBUTOS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label className="block text-sm font-medium mb-1">Escolha a operação</label>
              <select
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 bg-white"
              >
                <option value="">Selecione</option>
                {OPERACOES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <label className="block text-sm font-medium mb-1">Digite o Valor</label>
              <input
                type="number"
                inputMode="decimal"
                placeholder="Valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full rounded border border-gray-300 p-2 bg-white"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-12">
            <div className="col-span-5">
              <label className="block text-sm font-medium mb-1">Operador Lógico</label>
              <select
                value={logico}
                onChange={(e) => setLogico(e.target.value as Regra["logico"])}
                className="w-full rounded border border-gray-300 p-2 bg-white"
              >
                <option value="">Selecione</option>
                <option value="AND">E</option>
                <option value="OR">OU</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAddRule}
            disabled={!canAdd}
            className={`mt-4 px-4 py-2 rounded border  ${
              canAdd
                ? "bg-white hover:bg-gray-50 border-gray-300 cursor-pointer"
                : "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
            }`}
          >
            Add regra
          </button>

          <div className="mt-4 bg-white rounded-lg overflow-hidden border">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700">
              <div className="col-span-5">Escolha o atributo</div>
              <div className="col-span-4">Escolha a operação</div>
              <div className="col-span-2">Digite o Valor</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {rules.length === 0 ? (
              <div className="px-4 py-4 text-sm text-gray-500">Nenhuma regra adicionada.</div>
            ) : (
              rules.map((r, i) => (
                <div
                  key={`${r.atributo}-${i}`}
                  className="grid grid-cols-12 gap-3 px-4 py-3 border-t items-center"
                >
                  <div className="col-span-5">{r.atributo}</div>
                  <div className="col-span-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono">{r.operacao}</span>
                      <span className="text-gray-600">{r.operacaoLabel.replace(/^[<>=]+/, "").trim()}</span>
                    </span>
                    {r.logico ? <span className="ml-2 text-xs text-gray-500 font-semibold">{r.logico}</span> : null}
                  </div>
                  <div className="col-span-2">{r.valor}</div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleRemoveRule(i)}
                      className="text-red-600 text-sm hover:underline cursor-pointer"
                      title="Remover"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-black text-white rounded cursor-pointer"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
