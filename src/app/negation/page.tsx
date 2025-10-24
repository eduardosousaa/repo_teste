"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import NegationModuleSection from "@/components/sections/NegationModuleSection";
import { menuGroups } from "@/config/menuConfig";

export default function NegationPage() {
	return (
		<DefaultLayout
			headerTitle="Configurações do Módulo de Negativação"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<NegationModuleSection />
		</DefaultLayout>
	);
}