// src/app/page.tsx

import React from 'react';

// Este será o componente que aparecerá na rota "/"
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Acesso ao Sistema
        </h1>
        {/* Placeholder para o seu futuro formulário de login */}
        <form className="mt-8 space-y-6">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full rounded-md border p-3"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full rounded-md border p-3"
            required
          />
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>

        {/* Link para o Primeiro Acesso / Recuperação de Senha (RF07) */}
        <div className="text-center text-sm">
          <a href="/primeiro-acesso" className="font-medium text-blue-600 hover:text-blue-500">
            Esqueci minha senha / Primeiro Acesso
          </a>
        </div>
      </div>
    </div>
  );
}