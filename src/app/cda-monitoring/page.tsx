"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import CdaMonitoringSection from "@/components/sections/CdaMonitoringSection";
import { menuGroups } from "@/config/menuConfig";

export default function CdaMonitoringPage() {
	return (
		<DefaultLayout
			headerTitle="Painel de Controle e Monitoramento"
			headerSubtitle=""
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<CdaMonitoringSection />
		</DefaultLayout>
	);
}