// src/app/(admin)/layout.tsx

import React from 'react';
import Sidebar from '@/src/components/shared/Sidebar';
import Header from '@/src/components/shared/Header';

// Definição dos itens do menu lateral (Baseado nos requisitos do Módulo Administrativo)
const sidebarItems = [
  { href: '/admin/usuarios', label: 'Gestão de Usuários', icon: '👤' },
  { href: '/admin/servidores', label: 'Gestão de Servidores', icon: '🧑‍🏫' },
  { href: '/admin/unidades', label: 'Unidades Escolares', icon: '🏫' },
  { href: '/admin/cargos', label: 'Cargos e Funções', icon: '💼' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
];

// Definição dos itens do menu superior (para navegação entre Módulos, se necessário)
const headerItems = [
    { href: '/admin', label: 'Administrativo' },
    { href: '/academico', label: 'Acadêmico' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 1. SIDEBAR: Menu Fixo Lateral */}
      <Sidebar items={sidebarItems} /> 
      
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 2. HEADER: Menu de Navegação Superior (Opcional, mas útil para mudar de módulo) */}
        {/* Você pode adaptar o Header.js para ser o header do protótipo com nome/foto */}
        <Header items={headerItems} />

        {/* 3. CONTEÚDO DA PÁGINA: Onde a tela de usuários será renderizada */}
        <main style={{ padding: '1.5rem', flexGrow: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}