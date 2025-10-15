"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import PendencySection from "@/components/sections/PendencySection";
import { menuGroups } from "@/config/menuConfig";

export default function Page() {
	return (
		<DefaultLayout
			headerTitle="Painel de Pendências"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
		>
			<PendencySection />
		</DefaultLayout>
	);
}
