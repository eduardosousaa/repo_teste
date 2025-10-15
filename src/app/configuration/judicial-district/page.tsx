"use client";

import ActionButton from "@/components/actionButton/ActionButton";
import DefaultLayout from "@/components/layout/DefaultLayout";
import JudicialDistrictSection from "@/components/sections/JudicialDistrictSection";
import { menuGroups } from "@/config/menuConfig";

export default function Page() {
    return (
        <DefaultLayout
            headerTitle="Gestão de Comarcas"
            headerSubtitle=""
            menuGroups={menuGroups}
            footerText="Sistema de Petições v1.0"
            haveActionButtons
            actionButtons={[
               <ActionButton
					key="create-model"
					label="Sincronizar comarcas"
					variant="secondary"
					onClick={() => console.log("Sincronizar comarcas")}
				/>,
                <ActionButton
					key="create-model"
					label="Não mapeados"
					variant="secondary"
					onClick={() => console.log("Ver relatório")}
				/>,
            ]}
        ><JudicialDistrictSection /></DefaultLayout>
    );
}
