import type { MenuGroup } from "@/sharedComponents/sideBar/types";

export const menuGroups: MenuGroup[] = [
		{
		title: "Notificações",
		items: [
		{
			name: "CDAs",
			path: "/notifications/CDAs",
			subtitle: "Consulta de Dívidas Ativas",
			hasDropdown: false,
		},
		{ 
			name: "Histórico de notificações", 
			path: "/notifications/historico",
			subtitle: "Envios realizados", 
			hasDropdown: false,
		},
		{ 
			name: "Dashboard", 
			path: "/notifications/dashboard",
			subtitle: "Visão geral das métricas",
			hasDropdown: false,
		},
		{
			name: "Configurações",
			path: "/configuracoes",
			subtitle: "Gerenciar configurações",
			hasDropdown: true, 
			children: [
				{ 
					name: "Campanhas", 
					path: "/notifications/configurations/campanhas", 
				},
				{ 
					name: "Fontes de dados", 
					path: "/notifications/configurations/fonteDados" 
				},
				{ 
					name: "Comunicação Interna", 
					path: "/notifications/configurations/comunicacaoInterna" 
				}
			],
		},
		{
			name: "Contatos",
			path: "/contatos",
			subtitle: "Gerenciar contatos",
			hasDropdown: true, 
			children: [
				{ 
					name: "Dados por CPF/CNPJ", 
					path: "/notifications/contatos/dados", 
				},
				{ 
					name: "Qualidade de Contatos", 
					path: "/notifications/contatos/qualidade" 
				},
				{ 
					name: "Cobertura de Contatos", 
					path: "/notifications/contatos/cobertura" 
				}
			],
		},
		],
	},
	{
		title: "Configurações",
		items: [
			{
				name: "Parâmetros Gerais",
				path: "/configuration/initial-params",
				hasDropdown: false,
			},
			{
				name: "Comarcas",
				path: "/configuration/judicial-district",
				hasDropdown: false,
			},
			{
				name: "Modelos de Petição",
				path: "/configuration/petition-models",
				hasDropdown: false,
			},
		],
	},
	{
		title: "Ajuizamento",
		items: [
			{
				name: "Painel de Ajuizamento",
				path: "/lot/panel",
				hasDropdown: false,
			},
			{
				name: "Nova Petição Manual",
				path: "/manual-petition",
				hasDropdown: false,
			},
		],
	},
	{
		title: "Monitoramento",
		items: [
			{
				name: "Painel de Pendências",
				path: "/pendency/panel",
				hasDropdown: false,
			},
			{
				name: "Dashboard de Eficácia",
				path: "/dashboard",
				hasDropdown: false,
			},
		],
	},
	{
		title: "Protesto",
		items: [
			{
				name: "Monitoramento de CDAs",
				path: "/cda-monitoring", 
				hasDropdown: false,
			},
			{
				name: "CDAs para Negativação",
				path: "/cda-negation",
				hasDropdown: false,
			},
			{
				name: "Configurações de Negativação",
				path: "/negation",
				hasDropdown: false,
			},
		],
	},
];
