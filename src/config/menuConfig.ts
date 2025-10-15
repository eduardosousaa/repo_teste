import type { MenuGroup } from "@/sharedComponents/sideBar/types";

export const menuGroups: MenuGroup[] = [
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
];
