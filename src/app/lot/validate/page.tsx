"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import FilingLotValidationSection from "@/components/sections/FilingLotValidationSection";
import { menuGroups } from "@/config/menuConfig";
import ActionButton from "@/components/actionButton/ActionButton";

export default function Page() {
	return (
		<DefaultLayout
			headerTitle="Validar Lote"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
			haveActionButtons
			actionButtons={[
				<ActionButton
					key="back"
					label="Voltar"
					variant="secondary"
					onClick={() => console.log("Voltar para listagem de lotes")}
				/>,
			]}
		>
			<FilingLotValidationSection />
		</DefaultLayout>
	);
}
