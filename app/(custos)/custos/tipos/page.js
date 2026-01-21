'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { Row, Col, Form, Button, CardHeader, CardBody, CardFooter, Alert } from "reactstrap";
import { FaPlus, FaPen, FaTrash, FaFilter, FaEraser } from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import { BsPencilSquare } from "react-icons/bs";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { parseCookies } from 'nookies';
import Constantes from '../../../../src/Constantes';
import { AuthContext } from '../../../../src/Context/AuthContext';
import styles from './tipocustos.module.css';
import LoadingGif from '../../../../src/Components/ElementsUI/LoadingGif';
import TableStyle from '../../../../src/Components/ElementsUI/TableStyle';
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import ModalStyle from '../../../../src/Components/ElementsUI/ModalStyle';
import AlertMessage from '../../../../src/Components/ElementsUI/AlertMessage';
import InputForm from "../../../../src/Components/ElementsUI/InputForm";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";


export default function Page() {
    const { "token2": token2 } = parseCookies();
    const { permissions } = useContext(AuthContext);
    
    function checkPermission(name) {
        return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
    }
    
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState('');
    const [costTypes, setCostTypes] = useState([]);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [alert, setAlert] = useState({});
    const [activeAlert, setActiveAlert] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(true);

    const [number, setNumber] = useState(0);
    const [size, setSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            busca: '',
            category: ''
        }
    });

    const filters = watch();

    const categoryOptions = useMemo(() => [
        { id: '', name: '--Todas as Categorias--' },
        { id: 'DESPESAS_FIXAS', name: 'Despesas Fixas' },
        { id: 'DESPESAS_VARIAVEIS', name: 'Despesas Variáveis' },
        { id: 'INVESTIMENTOS', name: 'Investimentos' },
        { id: 'SERVICOS', name: 'Serviços' },
        { id: 'DIVERSOS', name: 'Diversos' },
    ], []);

    const onDismissAlert = () => setIsAlertOpen(false);
    function showAlert(type, text) {
        setIsAlertOpen(false);
        setAlert({ type: type, text: text });
        setIsAlertOpen(true);
        setActiveAlert(true);
    }

    const fetchCostTypes = async (page = 0, pageSize = size, currentFilters = filters) => {
        setLoading(true);
        setApiError('');
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString(),
            });

            if (currentFilters.name !== "") {
                params.append('name', currentFilters.name);
            }

            if (currentFilters.category !== "") {
                params.append('category', currentFilters.category);
            }

            const response = await fetch(Constantes.urlBackCosts + `other_costs/type?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Raw error response text (Tipos Custos):", errorText);
                let errorMessage = `Erro na requisição: ${response.status} - ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.message) errorMessage = errorData.message;
                    else if (errorData.error) errorMessage = errorData.error;
                } catch (e) { }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setCostTypes(Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : []);
            setNumber(data.page.number);
            setSize(data.page.size);
            setTotalElements(data.page.totalElements);
            setTotalPages(data.page.totalPages);

        } catch (error) {
            console.error('Erro ao buscar tipos de custo:', error);
            setApiError(error.message || 'Erro ao carregar os tipos de custo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        setApiError('');
        try {
            if (!id) {
                throw new Error("ID do registro para remoção não encontrado.");
            }

             const endpointUrl = Constantes.urlBackCosts + `other_costs/type/archive/${itemToDeleteId}`;
             console.log("Tentando arquivar Outro Custo (PATCH):", endpointUrl);
 
             const response = await fetch(endpointUrl, {
                 method: 'PATCH',
                 headers: {
                     'accept': '*/*',
                     "Authorization": "Bearer " + token2,
                     "Module": "COSTS",
                 },
             });
 
             if (!response.ok) {
                 const errorText = await response.text();
                 showAlert('danger', 'Erro em excluir tipo de custo.');
                 console.error("Raw error response text (Arquivar Tipo Custo):", errorText);
                 setApiError(error.message || 'Erro ao excluir o tipo de custo.');
                 let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                 try {
                     const errorData = JSON.parse(errorText);
                     if (errorData.message) errorMessage = errorData.message;
                     else if (errorData.error) errorMessage = errorData.error;
                 } catch (parseError) { }
                 throw new Error(errorMessage);
             }
 
            showAlert('success', 'Tipo de custo excluído com sucesso.');
            fetchCostTypes(number, size, {name: filters.busca});
            setOpenDeleteModal(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token2) {
            fetchCostTypes(number, size, {name: filters.busca,category: filters.category});
        }
    }, [token2, number, size/* , filters.busca */]);

    function actionButtons(id) {
        return (
            <div style={{ display: "flex", gap: "2%", flexWrap: "wrap",
                         ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
                { checkPermission("Type_Costs_Read") && <>
                <div className={styles.balloon_div}>
                    <Button className={styles.button} onClick={() => router.push(`/custos/tipos/create/edit/${id}`)}><BsPencilSquare/></Button>
                    <div className={styles.balloon_aviso_div}>
                        <div className={styles.balloon_aviso_border}>
                            <div className={styles.balloon_aviso_text}>Editar</div>
                        </div>
                    </div>
                </div>
                <div className={styles.balloon_div}>
                    <Button className={styles.button} onClick={() => { setItemToDeleteId(id); setOpenDeleteModal(true); }}><BiTrash/></Button>
                    <div className={styles.balloon_aviso_div}>
                        <div className={styles.balloon_aviso_border}>
                            <div className={styles.balloon_aviso_text}>Excluir</div>
                        </div>
                    </div>
                </div></>}
            </div>
        );
    }

    const dataForTable = useMemo(() => {

        const getCategoryName = (categoryId) => {
            const category = categoryOptions.find(opt => opt.id === categoryId);
            return category ? category.name : 'N/A';
        };

        return costTypes.map(item => ({
            Nome: item.name || 'N/A',
            Categoria: getCategoryName(item.category),
            Ações: actionButtons(item.id),
        }));
    }, [costTypes, styles.button, styles.balloon_div]);


    const onSubmit = (data) => {
        console.log(data);
        setNumber(0);
        fetchCostTypes(0, size, {name: data.busca, category: data.category });
    };

    const limparFiltros = () => {
        reset({ busca: '',category: ''});
        setNumber(0);
        fetchCostTypes(0, size, { name: '', category:  ''});
    };

    const handlePageChange = (newPage) => {
        setNumber(newPage);
    };

    const handleSizeChange = (newSize) => {
        setSize(parseInt(newSize));
        setNumber(0);
    };

    useEffect(() => {
  
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return (
        <>
            {loading && <LoadingGif />}

            <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                <h1 className={styles.header_h1}>Tipos de Custo</h1>
                {checkPermission("Type_Costs_Read") && <Button
                    className={styles.header_button}
                    onClick={() => router.push('/custos/tipos/create')}
                    style={{ marginLeft: "auto" }}
                >
                    Cadastrar <FaPlus />
                </Button>}
            </CardHeader>
            <CardBody style={{ width: "90%" }}>
                {activeAlert && (
                    <AlertMessage
                        type={alert.type}
                        text={alert.text}
                        isOpen={isAlertOpen}
                        toggle={onDismissAlert}
                    />
                )}
                {apiError && (
                    <Alert color="danger" className="mb-3">
                        <strong>Erro:</strong> {apiError}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="d-flex mt-3">
                        <Col sm="4">
                            <InputForm
                                id="busca"
                                name="busca"
                                label="Nome"
                                placeholder="Pesquisar por nome"
                                type="text"
                                register={register}
                                errors={errors}
                            />
                        </Col>
                        <Col sm="4">
                            <InputForm
                                id="category"
                                name="category"
                                label="Categoria*"
                                placeholder="--Selecione--"
                                register={register}
                                type="select"
                                options={categoryOptions}
                                errors={errors}
                            />
                        </Col>
                    </Row>
                    {/* <Row style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}> */}
                    <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
                        <Button type="button" onClick={limparFiltros} style={{ backgroundColor: "#009E8B", width: "150px" }}>
                            Limpar <FaEraser />
                        </Button>

                        <Button type="submit" style={{ backgroundColor: "#009E8B", width: "150px"}}>
                            Filtrar <FaFilter />
                        </Button>
                    </Row>
                </Form>
            </CardBody>
            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                {!loading && costTypes.length === 0 ? (
                    <div className="text-center p-4">
                        <p>Nenhum tipo de custo cadastrado.</p>
                    </div>
                ) : (<>
                     {windowWidth > 795 && 
                         <TableStyle
                             columnNames={["Nome", "Categoria","Ações"]}
                             data={dataForTable}
                         />}
                     {windowWidth <= 795 &&  
                         <IndexCardsStyle names={["Nome", "Categoria","Ações"]} 
                                          data={dataForTable}/>}

               </>)}
            </CardBody>

            <CardFooter style={{ width: "90%", backgroundColor: "transparent" }}>
                <PaginationStyle
                    number={number}
                    setNumber={handlePageChange}
                    size={size}
                    setSize={handleSizeChange}
                    pageElements={costTypes.length}
                    totalElements={totalElements}
                    totalPages={totalPages}
                />
            </CardFooter>


            <ModalStyle
                open={openDeleteModal}
                title={`Confirmar exclusão`}
                onClick={() => handleDelete(itemToDeleteId)}
                toggle={() => setOpenDeleteModal(!openDeleteModal)}
            >
                Você tem certeza que deseja excluir este tipo de custo? Esta ação não pode ser desfeita.
            </ModalStyle>
        </>
    );
}