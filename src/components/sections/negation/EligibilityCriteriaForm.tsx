// src/components/sections/negation/EligibilityCriteriaForm.tsx

"use client";

import { useMemo } from "react";
import { NegationConfig, Tributo, ValidationErrors } from "@/interfaces/Negation";

const CONTRIBUTOR_TYPES = [
	{ type: "contributorTypePF" as const, label: "Pessoa Física" },
	{ type: "contributorTypePJ" as const, label: "Pessoa Jurídica" },
];

interface EligibilityCriteriaFormProps {
    config: NegationConfig;
    setConfig: React.Dispatch<React.SetStateAction<NegationConfig>>;
    handleInputChange: (name: keyof NegationConfig, value: string | number | boolean) => void;
    errors: ValidationErrors;
    availableTributos: Tributo[];
    handleTributoChange: (tributoName: string, isChecked: boolean) => void;
}

export default function EligibilityCriteriaForm({
	config,
	setConfig,
	handleInputChange,
	errors,
	availableTributos,
    handleTributoChange,
}: EligibilityCriteriaFormProps) {

	// CORREÇÃO: Aceitar null ou undefined e garantir que seja number antes de chamar toLocaleString
	const formatCurrency = (value: number | null | undefined): string => {
        const numericValue = value ?? 0; // Se for null ou undefined, usa 0
		return `R$ ${numericValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
	};

	const handleMinCdaValueChange = (rawValue: string | number) => {
		const cleanValue = String(rawValue).replace(/[^0-9]/g, '');
		const numValue = Number(cleanValue) / 100;

		if (isNaN(numValue)) {
			handleInputChange("minCdaValue", 0);
		} else {
			handleInputChange("minCdaValue", numValue);
		}
	};
	
	const displayMinCdaValue = useMemo(() => {
		// A prop 'config.minCdaValue' pode ser null ao carregar a API
		return formatCurrency(config.minCdaValue);
	}, [config.minCdaValue]);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col space-y-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Critérios de Elegibilidade
			</h3>

			<div>
				<label 
					htmlFor="minCdaValue" 
					className="mb-2 text-sm font-medium text-gray-700 block"
				>
					Valor Mínimo da CDA
				</label>
				<input
					id="minCdaValue"
					name="minCdaValue"
					type="text"
					inputMode="decimal"
					value={displayMinCdaValue}
					onChange={(e) => handleMinCdaValueChange(e.target.value)}
					onFocus={(e) => {
						e.target.select();
					}}
					onBlur={() => {
						// Garante que se o valor for nulo/zero, ele volte a ser 0.00 formatado
						if (config.minCdaValue === 0) setConfig(p => ({ ...p, minCdaValue: 0.00 }));
					}}
					placeholder="R$ 0,00"
					className="w-full border rounded-lg px-3 py-2.5 text-sm transition-colors border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
				/>
			</div>

			<div>
				<label className="mb-2 text-sm font-medium text-gray-700 block">
					Tipo de Contribuinte
				</label>
				<div className="space-y-2">
					{CONTRIBUTOR_TYPES.map(({ type, label }) => (
						<div key={type} className="flex items-center">
							<input
								id={`contributor-${type.toLowerCase()}`}
								name={type}
								type="checkbox"
								checked={config[type]}
								onChange={(e) => handleInputChange(type, e.target.checked)}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label
								htmlFor={`contributor-${type.toLowerCase()}`}
								className="ml-3 block text-sm font-medium text-gray-700"
							>
								{label}
							</label>
						</div>
					))}
				</div>
			</div>

			<div>
				<label className="mb-2 text-sm font-medium text-gray-700 block">
					Tipo de Imposto
				</label>
				<div className="space-y-2">
					{availableTributos.map((tributo) => (
						<div key={tributo.id} className="flex items-center">
							<input
								id={`tribute-${tributo.nome.toLowerCase()}`}
								name={`tribute-${tributo.nome}`}
								type="checkbox"
								checked={config.selectedTributos.includes(tributo.nome)}
								onChange={(e) => handleTributoChange(tributo.nome, e.target.checked)}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label
								htmlFor={`tribute-${tributo.nome.toLowerCase()}`}
								className="ml-3 block text-sm font-medium text-gray-700"
							>
								{tributo.nome}
							</label>
						</div>
					))}
				</div>
                {/* O erro de tributo deve usar a chave 'selectedTributos' no container */}
                {errors.selectedTributos && ( 
                    <p className="mt-1 text-xs text-red-600">{errors.selectedTributos}</p>
                )}
			</div>

			<div>
				<label className="mb-2 text-sm font-medium text-gray-700 block">
					Condições de Validação
				</label>
				<div className="space-y-2">
					{[
						{ name: "hasPreviousNotification" as const, label: "Exigir que tenha ocorrido notificação prévia." },
						{ name: "hasValidEmail" as const, label: "Exigir que possua e-mail válido." },
						{ name: "hasValidPhone" as const, label: "Exigir que possua telefone válido." },
						{ name: "hasValidAddress" as const, label: "Exigir que possua endereço válido." },
					].map(({ name, label }) => (
						<div key={name} className="flex items-center">
							<input
								id={`val-${name}`}
								name={name}
								type="checkbox"
								checked={config[name]}
								onChange={(e) => handleInputChange(name, e.target.checked)}
								className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
							/>
							<label
								htmlFor={`val-${name}`}
								className="ml-3 block text-sm font-medium text-gray-700"
							>
								{label}
							</label>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}