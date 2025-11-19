// src/components/modules/admin/CreateUserModal.jsx

"use client";

import React, { useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import FormSelect from '@/components/ui/FormSelect';

// Placeholder de Perfis de Acesso (Baseado no RF02/RNF-01 e Tela 1.1)
const PROFILE_OPTIONS = [
    { value: 'admin', label: 'Administrador' },
    { value: 'gestor_central', label: 'Gestor Central' },
    { value: 'gestor_escolar', label: 'Gestor Escolar' },
    { value: 'professor', label: 'Professor' },
    { value: 'aluno_responsavel', label: 'Aluno/Responsável' },
];

export default function CreateUserModal({ isOpen, onClose }) {
    // Estado simples para demonstração
    const [user, setUser] = useState({
        nome: '',
        cpf: '',
        emailPessoal: '',
        emailCorporativo: '',
        perfil: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Novo Usuário a ser criado:', user);
        // Lógica de API para cadastrar e enviar convite (RF07)
        onClose(); 
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 8, maxWidth: 600, width: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Criar Novo Usuário</h2>
                
                {/* Alerta de Primeiro Acesso (RF07) */}
                <div style={{ padding: '0.75rem', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 4, marginBottom: '1rem' }}>
                    O usuário receberá um e-mail com um link para definir sua senha de acesso.
                </div>

                <form onSubmit={handleSubmit}>
                    <FormInput 
                        label="Nome completo *" 
                        id="nome" 
                        placeholder="Ex: João da Silva" 
                        value={user.nome} 
                        onChange={(val) => setUser({ ...user, nome: val })} 
                        required 
                    />
                    <FormInput 
                        label="CPF *" 
                        id="cpf" 
                        placeholder="000.000.000-00" 
                        value={user.cpf} 
                        onChange={(val) => setUser({ ...user, cpf: val })} 
                        required 
                    />
                    {/* ... outros campos ... */}
                    <FormSelect 
                        label="Perfil de acesso *" 
                        id="perfil" 
                        options={PROFILE_OPTIONS}
                        value={user.perfil}
                        onChange={(val) => setUser({ ...user, perfil: val })}
                        placeholder="Selecione um perfil"
                        required
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                            Cancelar
                        </button>
                        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#1890ff', color: 'white', borderRadius: 4 }}>
                            Salvar e enviar convite
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}