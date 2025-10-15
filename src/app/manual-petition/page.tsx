"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import PetitionCdaSection from "@/components/sections/PetitionCdaSection";
import { menuGroups } from "@/config/menuConfig";
import ActionButton from "@/components/actionButton/ActionButton";

export default function Page() {
	return (
		<DefaultLayout
			headerTitle="Gerar Petições"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
			haveActionButtons
			actionButtons={[
				<ActionButton
					key="back"
					label="Voltar"
					variant="secondary"
					onClick={() => console.log("Voltar para listagem")}
				/>,
				<ActionButton
					key="export"
					label="Exportar"
					variant="primary"
					onClick={() => console.log("Exportar tabela")}
				/>,
			]}
		>
			<PetitionCdaSection />
		</DefaultLayout>
	);
}
