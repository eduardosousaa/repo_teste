"use client"
import { useContext } from 'react';
import { AuthContext } from '../../../src/Context/AuthContext';

export default function Page() {

  const { contas } = useContext(AuthContext);

  return (
    <h1>Bem vindo!</h1>

  );
}