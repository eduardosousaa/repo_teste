"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function QualidadePage() {
    return (
        <DefaultLayout
            headerTitle="Qualidade de Contatos"
            headerSubtitle="Página de qualidade de contatos"
            menuGroups={menuGroups}
            footerText="Sistema de Notificações v1.0"
        >
            <h1>Qualidade de Contatos</h1>
        </DefaultLayout>
    )
}
