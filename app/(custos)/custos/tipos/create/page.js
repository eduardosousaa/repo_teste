'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { CardHeader, CardBody, Form, Row, Col, Button, Alert } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import InputForm from '../../../../../src/Components/ElementsUI/InputForm';
import LoadingGif from '../../../../../src/Components/ElementsUI/LoadingGif';
import Constantes from '../../../../../src/Constantes';
import { parseCookies } from 'nookies';

import styles from '../tipocustos.module.css';

export default function Create() {
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

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');

    const validateRequiredFields = (data) => {
        if (!data.name || String(data.name).trim() === '') {
            throw new Error('O campo Nome é obrigatório.');
        }
    };

    async function submit(data) {
        setLoading(true);
        setApiError('');
        setApiSuccess('');

        try {
            validateRequiredFields(data);

            const typeCostObject = {
                name: data.name,
                category: data.category,
            };

            const endpointUrl = Constantes.urlBackCosts + '/other_costs/type';
            const response = await fetch(endpointUrl, {
                method: 'POST',
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

            setApiSuccess(result.message);
            router.push('/custos/tipos');
        } catch (error) {
            console.error('Erro ao cadastrar tipo de custo:', error);
            setApiError(error.message || 'Erro ao cadastrar tipo de custo.');
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
                <h1 className={styles.header_h1}>Cadastro de Tipo de Custo</h1>
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
            </CardBody>
        </>
    );
}