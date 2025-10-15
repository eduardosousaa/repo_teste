"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"
import PetitionModelForm from "@/components/forms/PetitionModelForm"

export default function Page() {
  return (
    <DefaultLayout
      headerTitle="Criar/Editar Modelo de Petição"
      headerSubtitle="Defina o conteúdo, regras e histórico do modelo"
      menuGroups={menuGroups}
      footerText="Sistema de Petições v1.0"
    >
      <div className="p-6">
        <PetitionModelForm />
      </div>
    </DefaultLayout>
  )
}
