"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import CdaNegationSection from "@/components/sections/CdaNegationSection";
import { menuGroups } from "@/config/menuConfig";

export default function CdaNegationPage() {
	return (
		<DefaultLayout
			headerTitle="CDAs para Negativação"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<CdaNegationSection />
		</DefaultLayout>
	);
}