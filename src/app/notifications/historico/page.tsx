"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function HistoricoPage() {
    return (
        <DefaultLayout
            headerTitle="Histórico de Notificações"
            headerSubtitle="Página de histórico de notificações"
            menuGroups={menuGroups}
            footerText="Sistema de Notificações v1.0"
        >
            <h1>Histórico de Petições</h1>
        </DefaultLayout>
    )
}
