'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { CardHeader, CardBody, Form, Row, Col, Button, Alert } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import InputForm from '../../../../../../../src/Components/ElementsUI/InputForm';
import LoadingGif from '../../../../../../../src/Components/ElementsUI/LoadingGif';
import Constantes from '../../../../../../../src/Constantes';
import { parseCookies } from 'nookies';

import styles from '../../../tipocustos.module.css';

export default function Edit() {
    const { id: typeCostId } = useParams();
    const { "token2": token2 } = parseCookies();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            name: '',
        }
    });

    const categoryOptions = useMemo(() => [
            { id: '', name: '--Selecione a Categoria--' },
            { id: 'DESPESAS_FIXAS', name: 'Despesas Fixas' },
            { id: 'DESPESAS_VARIAVEIS', name: 'Despesas Variáveis' },
            { id: 'INVESTIMENTOS', name: 'Investimentos' },
            { id: 'SERVICOS', name: 'Serviços' },
            { id: 'DIVERSOS', name: 'Diversos' },
        ], []);

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');

    const fetchCostTypeDetails = async () => {
        /* setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const mockData = [
                { id: '1', name: 'Impostos' },
                { id: '2', name: 'Consumíveis' },
                { id: '3', name: 'Mão de Obra' },
                { id: '4', name: 'Outros (Geral)' },
            ];

            const data = mockData.find(item => item.id === typeCostId);

            if (!data) {
                throw new Error('Tipo de custo não encontrado (mock).');
            }

            setValue('name', data.name);
        } catch (error) {
            console.error('Erro ao buscar detalhes do tipo de custo (mock):', error);
            setApiError(error.message || 'Erro ao carregar detalhes do tipo de custo.');
        } finally {
            setLoading(false);
        } */

        
        setLoading(true);
        try {
            const response = await fetch(Constantes.urlBackCosts + `other_costs/type/${typeCostId}`, {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setValue('name', data.name);
            setValue('category', data.category);
        } catch (error) {
            console.error('Erro ao buscar detalhes do tipo de custo:', error);
            setApiError(error.message || 'Erro ao carregar detalhes do tipo de custo.');
        } finally {
            setLoading(false);
        }
       
    };

    useEffect(() => {
        if (token2 && typeCostId) {
            fetchCostTypeDetails();
        }
    }, [token2, typeCostId]);

    const validateRequiredFields = (data) => {
        if (!data.name || String(data.name).trim() === '') {
            throw new Error('O campo Nome é obrigatório.');
        }
    };

    async function submit(data) {
        /* setLoading(true);
        setApiError('');
        setApiSuccess('');

        try {
            validateRequiredFields(data);

            const typeCostObject = {
                id: typeCostId,
                name: data.name,
            };

            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Dados mockados para PUT:', typeCostObject);

            setApiSuccess('Tipo de custo atualizado com sucesso (mock)!');
            router.push('/custos/tipos');
        } catch (error) {
            console.error('Erro ao atualizar tipo de custo (mock):', error);
            setApiError(error.message || 'Erro ao atualizar tipo de custo.');
        } finally {
            setLoading(false);
        } */

        
        setLoading(true);
        setApiError('');
        setApiSuccess('');

        try {
            validateRequiredFields(data);

            const typeCostObject = {
                id: typeCostId,
                name: data.name,
                category: data.category,
            };

            const endpointUrl = Constantes.urlBackCosts + `/other_costs/type/${typeCostId}`;
            const response = await fetch(endpointUrl, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
                body: JSON.stringify(typeCostObject)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }
            
            const successResponseText = await response.text();
            let result = { message: 'Tipo de custo cadastrado com sucesso!' };
            try {
                if (successResponseText.trim() !== '') {
                    const parsedSuccess = JSON.parse(successResponseText);
                    result = parsedSuccess.message ? parsedSuccess : result;
                }
            } catch (parseError) { console.warn("Resposta de sucesso não é JSON válido.", parseError); }

            router.push('/custos/tipos');
        } catch (error) {
            console.error('Erro ao atualizar tipo de custo:', error);
            setApiError(error.message || 'Erro ao atualizar tipo de custo.');
        } finally {
            setLoading(false);
        }
       
    }

    return (
        <>
            {loading && <LoadingGif />}

            <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                <IoArrowBackCircleSharp style={{ width: "45px", height: "70px", color: "#009E8B", cursor: "pointer" }}
                    onClick={() => { router.back() }} />
                <h1 className={styles.header_h1}>Editar Tipo de Custo</h1>
            </CardHeader>

            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                {apiError && (
                    <Alert color="danger" className="mx-3">
                        <strong>Erro:</strong> {apiError}
                    </Alert>
                )}
                {apiSuccess && (
                    <Alert color="success" className="mx-3">
                        <strong>Sucesso:</strong> {apiSuccess}
                    </Alert>
                )}

                {loading ? (
                    <div className="text-center p-4">
                        <p>Carregando dados para edição...</p>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit(submit)}>
                        <Row className="d-flex mt-3">
                            <Col sm="6">
                                <InputForm
                                    id="name"
                                    name="name"
                                    label="Nome*"
                                    placeholder="Digite o nome do tipo de custo"
                                    register={register}
                                    required={true}
                                    type="text"
                                    errors={errors}
                                    value={watch('name')}
                                    onChange={(e) => setValue('name', e.target.value)}
                                />
                            </Col>
                            <Col sm="6">
                                <InputForm
                                    id="category"
                                    name="category"
                                    label="Categoria*"
                                    placeholder="--Selecione--"
                                    register={register}
                                    required={true}
                                    type="select"
                                    options={categoryOptions}
                                    value={watch('category')}
                                    onChange={(e) => setValue('category', e.target.value)}
                                    errors={errors}
                                />
                            </Col>
                        </Row>
                        <Row className="d-flex mt-4 justify-content-end">
                            <Row className="d-flex mt-3 justify-content-end">
                                <Button type="submit"
                                    style={{ backgroundColor: "#009E8B", width: "100px", height: "60px" }}>
                                    Salvar
                                </Button>
                            </Row>
                        </Row>
                    </Form>
                )}
            </CardBody>
        </>
    );
}