"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import FilingLotCreateSection from "@/components/sections/FilingLotCreateSection";
import { menuGroups } from "@/config/menuConfig";

export default function Page() {
	return (
		<DefaultLayout
			headerTitle="Criar Lote"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<FilingLotCreateSection />
		</DefaultLayout>
	);
}
