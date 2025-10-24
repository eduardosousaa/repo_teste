"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function DadosPage() {
    return (
        <DefaultLayout
            headerTitle="Dados por CPF/CNPJ"
            headerSubtitle="Página de dados por CPF/CNPJ"
            menuGroups={menuGroups}
            footerText="Sistema de Notificações v1.0"
        >
            <h1>Dados</h1>
        </DefaultLayout>
    )
}
