"use client";

import DefaultLayout from "@/components/layout/DefaultLayout";
import PetitionModelSection from "@/components/sections/PetitionModelSection";
import { menuGroups } from "@/config/menuConfig";
import ActionButton from "@/components/actionButton/ActionButton";
import { useRouter } from "next/navigation";
export default function Page() {
	const router = useRouter();
	return (
		<DefaultLayout
			headerTitle="Gestão de Modelos de Petição"
			headerSubtitle=""
			menuGroups={menuGroups}
			footerText="Sistema de Petições v1.0"
			haveActionButtons
			actionButtons={[
				<ActionButton
					key="create-model"
					label="Criar novo modelo"
					variant="secondary"
					onClick={() => router.push("/configuration/petition-models/create")}
				/>,
			]}
		><PetitionModelSection /></DefaultLayout>
	);
}
