"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function DashboardPage() {
    return (
        <DefaultLayout
            headerTitle="Dashboard de Notificações"
            headerSubtitle="Página de Informações de notificações"
            menuGroups={menuGroups}
            footerText="Sistema de Notificações v1.0"
        >
            <h1>Dashboard de Notificações</h1>
        </DefaultLayout>
    )
}
