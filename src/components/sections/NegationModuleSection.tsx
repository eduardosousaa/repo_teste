"use client";

import { useState, useEffect } from "react";
import ActionButton from "@/components/actionButton/ActionButton";
import { NegationConfig, initialNegationConfig, ValidationErrors, Tributo, DayOfWeek } from "@/interfaces/Negation";
import { getNegationConfig, saveNegationConfig, getTributos } from "@/sharedComponents/service/NegationService";

import EligibilityCriteriaForm from "./negation/EligibilityCriteriaForm";
import SchedulingForm from "./negation/SchedulingForm";

export default function NegationModuleSection() {
    const [config, setConfig] = useState<NegationConfig>(initialNegationConfig);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(true);
    const [availableTributos, setAvailableTributos] = useState<Tributo[]>([]);


    // LÓGICA DE BUSCA DE DADOS INICIAIS (API)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                // 1. Busca a lista de tributos (primeiro)
                const tributos = await getTributos();
                setAvailableTributos(tributos);

                // 2. Busca a configuração salva, usando a lista de tributos
                const apiConfig = await getNegationConfig(tributos);

                // 3. Mescla e define o estado inicial
                setConfig(prev => ({
                    ...initialNegationConfig, // Garante que todos os campos têm um default
                    ...apiConfig, // Sobrescreve com o que veio da API
                    selectedTributos: apiConfig.selectedTributos || [] // Garante que selectedTributos é um array
                }));

            } catch (error) {
                console.error("Falha ao carregar dados iniciais. Usando defaults.", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []); 

    // --- HANDLERS E VALIDAÇÃO ---

    const handleInputChange = (
        name: keyof NegationConfig,
        value: string | number | boolean
    ) => {
        setConfig((prev) => ({ ...prev, [name]: value }));
        // Limpa o erro ao digitar
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Handler para seleção múltipla de tributos
    const handleTributoChange = (tributoName: string, isChecked: boolean) => {
        setConfig(prev => {
            const currentTributos = prev.selectedTributos;
            if (isChecked) {
                // Adiciona o tributo
                return { ...prev, selectedTributos: Array.from(new Set([...currentTributos, tributoName])) };
            } else {
                // Remove o tributo
                return { ...prev, selectedTributos: currentTributos.filter(t => t !== tributoName) };
            }
        });
        if (errors.selectedTributos) {
            setErrors(prev => ({ ...prev, selectedTributos: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: ValidationErrors = {};

        // 1. Validação do Tipo de Imposto (Tributo) - Deve ter pelo menos um selecionado
        if (config.selectedTributos.length === 0) {
            newErrors.selectedTributos = "Selecione pelo menos um tipo de imposto/tributo.";
        }
        
        // 2. Validação Semanal: Dia Inicial <= Dia Final
        if (config.sendFrequency === "WEEKLY" && config.weeklyDayStart && config.weeklyDayEnd) {
            const weekDaysMap: Record<DayOfWeek, number> = {
                "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3, "Quinta-feira": 4, 
                "Sexta-feira": 5, "Sábado": 6, "Domingo": 7 
            };
            const startDayIndex = weekDaysMap[config.weeklyDayStart];
            const endDayIndex = weekDaysMap[config.weeklyDayEnd];
            
            if (startDayIndex > endDayIndex) {
                newErrors.weeklyDayEnd = "O Dia Final deve ser igual ou posterior ao Dia Inicial.";
            }
        }
        
        // 3. Validação Mensal: Dia Inicial <= Dia Final
        if (config.sendFrequency === "MONTHLY") {
            if (config.monthlyDayStart > config.monthlyDayEnd) {
                newErrors.monthlyDayEnd = "O Dia Final deve ser igual ou posterior ao Dia Inicial.";
            }
        }

        // 4. Validação de Horário: Início < Fim
        if (config.startTime && config.endTime) {
            if (config.startTime >= config.endTime) {
                newErrors.endTime = "O horário de Fim deve ser posterior ao horário de Início.";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).every(key => !newErrors[key]);
    }

    // LÓGICA DE SALVAR CONFIGURAÇÃO
    const handleSave = async () => {
        if (!validate()) {
            alert("Por favor, corrija os erros de validação antes de salvar.");
            return;
        }

        setIsLoading(true);
		try {
			// CHAMA A API PARA SALVAR
			await saveNegationConfig(config, availableTributos);
			alert("Configurações salvas com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar configurações:", error);
			alert("Falha ao salvar. Verifique o console para mais detalhes.");
		} finally {
            setIsLoading(false);
        }
    };
    

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Carregando configurações...</div>;
    }

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Coluna da Esquerda: Critérios de Elegibilidade */}
				<EligibilityCriteriaForm 
                    config={config} 
                    setConfig={setConfig}
                    handleInputChange={handleInputChange} 
                    errors={errors}
                    availableTributos={availableTributos}
                    handleTributoChange={handleTributoChange}
                />

				{/* Coluna da Direita: Agendamento de Envio */}
				<SchedulingForm 
                    config={config} 
                    handleInputChange={handleInputChange} 
                    errors={errors}
                />
			</div>

			<div className="flex justify-end mt-4">
				<ActionButton
					label="Salvar Configurações"
					variant="primary"
					onClick={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
				/>
			</div>
		</div>
	);
}