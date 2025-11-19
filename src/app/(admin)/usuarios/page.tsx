// src/app/(admin)/usuarios/page.jsx
"use client";

import React, { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';
import Pagination from '@/components/ui/Pagination';
import CreateUserModal from '@/components/modules/admin/CreateUserModal';
// Importa o hook para lidar com a paginação da listagem
import { usePagedFetch } from '@/lib/hooks/usePagedFetch'; 

// Opções de Status e Perfil (mockados para o filtro)
const STATUS_OPTIONS = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
];

export default function GestaoUsuariosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ nome: '', perfil: '', status: '' });
    
    // Simula a URL da API e usa o hook de paginação
    const { page, setPage, data, totalPages, loading } = usePagedFetch(
        '/api/users', // Substitua pela sua API de usuários
        1, 10, filters
    );

    // Dados mockados para exibição da tabela (substitua por 'data' do usePagedFetch)
    const mockUsers = [
        { id: 1, nome: 'João Silva', email: 'joao.silva@email.com', perfil: 'Administrador', status: 'Ativo' },
        { id: 2, nome: 'Maria Santos', email: 'maria.santos@email.com', perfil: 'Professor', status: 'Inativo' },
        { id: 3, nome: 'Pedro Costa', email: 'pedro.costa@email.com', perfil: 'Gestor Central', status: 'Ativo' },
        // ...
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gestão de Usuários</h1>
                    <p style={{ color: 'gray' }}>Gerencie os usuários do sistema</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: '#1890ff', color: 'white', borderRadius: 6, fontWeight: 'bold' }}
                >
                    Novo Usuário +
                </button>
            </div>

            {/* FILTROS */}
            <div style={{ padding: '1rem', border: '1px solid #e6e6e6', borderRadius: 8, marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Filtros</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <FormInput 
                            label="Nome/Email" 
                            placeholder="Buscar por nome ou email" 
                            value={filters.nome}
                            onChange={(val) => setFilters({ ...filters, nome: val })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <FormSelect 
                            label="Perfil" 
                            options={[{ value: 'todos', label: 'Todos os perfis' }]} 
                            value={filters.perfil}
                            onChange={(val) => setFilters({ ...filters, perfil: val })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <FormSelect 
                            label="Status" 
                            options={STATUS_OPTIONS} 
                            value={filters.status}
                            onChange={(val) => setFilters({ ...filters, status: val })}
                        />
                    </div>
                </div>
            </div>

            {/* LISTAGEM DE USUÁRIOS */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lista de Usuários</h2>
            {loading && <p>Carregando usuários...</p>}
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #e6e6e6' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Nome</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Perfil</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Status</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {mockUsers.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '0.75rem 0' }}>
                                <div style={{ fontWeight: 'bold' }}>{user.nome}</div>
                                <small style={{ color: 'gray' }}>{user.email}</small>
                            </td>
                            <td style={{ padding: '0.75rem 0' }}>{user.perfil}</td>
                            <td style={{ padding: '0.75rem 0' }}>{user.status}</td>
                            <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>
                                <button style={{ border: '1px solid #d9d9d9', padding: '0.25rem 0.5rem', borderRadius: 4 }}>✏️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <small>Mostrando 1-10 de 47 usuários</small>
                {/* PAGINAÇÃO */}
                <Pagination page={page} setPage={setPage} totalPages={totalPages} />
            </div>

            {/* MODAL */}
            <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}