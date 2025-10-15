"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import FilingLotSection from "@/components/sections/FilingLotSection";
import { menuGroups } from "@/config/menuConfig";
import ActionButton from "@/components/actionButton/ActionButton";
import { useRouter } from "next/navigation";

export default function Page() {
	const router = useRouter();
	return (
		<DefaultLayout
			headerTitle="Painel de Ajuizamento"
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
			haveActionButtons
			actionButtons={[
				<ActionButton
					key="create-lot"
					label="Criar novo lote"
					variant="secondary"
					onClick={() => router.push("/lot/create")}
				/>,
			]}
		>
			<FilingLotSection />
		</DefaultLayout>
	);
}
