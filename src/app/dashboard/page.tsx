"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import DashboardSection from "@/components/sections/DashboardSection";
import { menuGroups } from "@/config/menuConfig";
import ActionButton from "@/components/actionButton/ActionButton";

export default function Page() {
	return (
		<DefaultLayout
			headerTitle="Dashboard de Ajuizamento"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
			haveActionButtons
			actionButtons={[
				<ActionButton
					key="export"
					label="Exportar Dados"
					variant="secondary"
					onClick={() => console.log("Exportar dados da dashboard")}
				/>,
			]}
		>
			<DashboardSection />
		</DefaultLayout>
	);
}
