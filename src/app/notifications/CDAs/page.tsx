"use client"

import DefaultLayout from "@/components/layout/DefaultLayout"
import { menuGroups } from "@/config/menuConfig"

export default function CDAsPage() {
    return (
        <DefaultLayout
            headerTitle="Gestão de CDAs"
            headerSubtitle="Página de gestão de CDAs"
            menuGroups={menuGroups}
            footerText="Sistema de Petições v1.0"
        >
            <h1>Gestão de CDAs</h1>
        </DefaultLayout>
    )
}
