"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function CoberturaPage() {
    return (
        <DefaultLayout
            headerTitle="Cobertura de Contatos"
            headerSubtitle="Página de cobertura de contatos"
            menuGroups={menuGroups}
            footerText="Sistema de Notificações v1.0"
        >
            <h1>Cobertura</h1>
        </DefaultLayout>
    )
}
