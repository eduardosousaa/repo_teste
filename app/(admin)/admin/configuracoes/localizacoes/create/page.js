"use client";
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Row, Button, CardHeader, CardBody, Form, Col, Navbar, NavLink, Nav, NavItem } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif"; 
import FormLocalizacao from "../../../../../../src/Components/Forms/FormLocalizacao";
import FormSetor from "../../../../../../src/Components/Forms/FormSetor";
import FormSubsetor from "../../../../../../src/Components/Forms/FormSubsetor";
import { fetchData } from "../../../../../../src/Utils/FetchData";
import styles from '../localizacoes.module.css';

export default function Page() {

    const { "token2": token2 } = parseCookies();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({});
    const [activeAlert, setActiveAlert] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const onDismiss = () => setIsOpen(false);
    const [locationsList, setLocationsList] = useState([]); 
    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            nomeLocalizacao: '',
            description: '',     
            status: '',         
            cep: '',
            estado: '',
            cidade: '',
            numero: '',
            bairro: '',
            rua: '',
            complemento: '', 
            setorNome: '',
            setorDescricao: '',
            localizacaoSetor: null, 
            subsetorNome: '',
            subsetorDescricao: '',
            localizacaoSubsetor: null,
            setorSubsetor: null,
            latitude:"",
            longitude:"",
            responsible: []
        }
    });


    const [activeSection, setActiveSection] = useState('localizacao'); 

    function showAlert(type, text) {
        setIsOpen(false);
        setAlert({ type: type, text: text });
        setIsOpen(true);
        setActiveAlert(true);
    }

const loadLocationsForSelect = async (inputValue = '') => { 
        const params = {
            name: inputValue,
            size: 100,
            typeLocation: 'LOCATION'
        };
        const locationMapper = (data) => {
            return (data.content || []).map(loc => ({
                value: loc.id,
                label: loc.name,
            }));
        };

        return fetchData(
            'stock', 
            'ADMINISTRATION', 
            params, 
            locationMapper, 
            { setLoading, showAlert } 
        );
    };

const loadSectorsForSelect = async (inputValue = '') => {
    const params = {
        name: inputValue,
        size: 100,
        typeLocation: 'SECTOR'
    };
    const locationMapper = (data) =>  {
        return (data.content || []).map(loc => ({
            value: loc.id,
            label: loc.name
        }))
    };
    return fetchData(
        'stock',
        'ADMINISTRATION',
        params,
        locationMapper,
        {setLoading, showAlert}
    )
}

    async function onSubmit(data) {
        setLoading(true);

    console.log("Dados completos do formulário:", data);

    let endpoint;
    let payload = {};
    let successMessage = '';

    switch ( activeSection ) {
        case 'localizacao':
            endpoint = "stock/location";

            if(data.latitude == "" && data.longitude == ""){
                setLoading(false);
                return showAlert("danger", "Confirme no mapa a localização.");
            }

            payload = {
            name: data.nomeLocalizacao,     
            description: data.description || "",                                                
            address: data.rua,               
            zip: data.cep,                    
            neighborhood: data.bairro,        
            number: data.numero,              
            complement: data.complemento,     
            city: data.cidade,               
            state: data.estado,              
            status: data.status,
            latitude: data.latitude,
            longitude: data.longitude,
            responsible: data.responsible   
        };
        successMessage = "Localização cadastrada com sucesso!";
        break;
    case 'setor':
        endpoint = "stock/sector";
        payload = {
            name: data.setorNome,
            description: data.setorDescricao || "", 
            fatherId: data.localizacaoSetor, 
            status: data.status,
            responsible: data.responsible
        };
        successMessage = "Setor cadastrado com sucesso!";    
        break;
    case 'subsetor':
        endpoint = "stock/subsector"; 
        payload = {
            name: data.subsetorNome,
            description: data.subsetorDescricao || "", 
            fatherId: data.setorSubsetorId, 
            status: data.status,
            responsible: data.responsible
        };
        successMessage = "Subsetor cadastrado com sucesso!";
        break;

        default:
            showAlert("Selecione uma das sessões para efetuar um cadastro!");
    };

    try {
        const response = await fetch(Constantes.urlBackAdmin + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION", 
                "Authorization": token2
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 201) {
            showAlert("success", successMessage);
            router.push('/admin/configuracoes/localizacoes');
            
        } else {
            const errorBody = await response.json();
            console.error(`Erro no cadastro de ${activeSection}:`, errorBody);
            showAlert("Error!", errorBody.message || `Erro ao cadastrar ${activeSection}. Verifique os dados.`);
        }
    } catch (error) {
            console.error("Erro na requisição:", error);
            showAlert("danger", "Erro de conexão ou servidor. Tente novamente mais tarde.");
    } finally {
            setLoading(false);
        }
    }
/* 
    const goToNextSection = () => {
        if (activeSection === 'localizacao') setActiveSection('setor');
        else if (activeSection === 'setor') setActiveSection('subsetor');
    };

    const goToPreviousSection = () => {
        if (activeSection === 'setor') setActiveSection('localizacao');
        else if (activeSection === 'subsetor') setActiveSection('setor');
    };

    
 */
    return (
        <>
            {loading && <LoadingGif />}
            <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                <IoArrowBackCircleSharp
                    style={{ width: "45px", height: "70px", color: "#009E8B", cursor: "pointer" }}
                    onClick={() => { router.back() }}
                />
                <h1 className={styles.header_h1}>Cadastro de Localização, Setor e Subsetor</h1>
            </CardHeader>

            <Nav tabs className={styles.navbar}>
           <NavItem style={{cursor:"pointer"}}>
             <NavLink active={activeSection == "localizacao"} onClick={() => {setActiveSection("localizacao");}} 
                      className={styles.navlink}>Localização</NavLink>
           </NavItem>
           <NavItem style={{cursor:"pointer"}}>
           <NavLink active={activeSection == "setor"} onClick={() => {setActiveSection("setor");}}
                    className={styles.navlink}>Setor</NavLink>
           </NavItem>
           <NavItem style={{cursor:"pointer"}}>
           <NavLink active={activeSection == "subsetor"} onClick={() => {setActiveSection("subsetor");}}
                    className={styles.navlink}>Subsetor</NavLink>
           </NavItem>
        </Nav>

            <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
               {/*  <div className="d-flex justify-content-start mb-4" style={{ borderBottom: '1px solid #dee2e6' }}>
                  <Button
                        onClick={() => setActiveSection('localizacao')}
                        style={{
                            borderRadius: '0', border: 'none',
                            backgroundColor: activeSection === 'localizacao' ? '#009E8B' : 'transparent',
                            borderBottom: activeSection === 'localizacao' ? '2px solid #009E8B' : 'none',
                            color: activeSection === 'localizacao' ? 'white' : '#6c757d', fontWeight: 'bold'
                        }}
                        className="py-3 px-4"
                    >
                        Localização
                    </Button>
                    <Button
                        onClick={() => setActiveSection('setor')}
                        style={{
                            borderRadius: '0', border: 'none',
                            backgroundColor: activeSection === 'setor' ? '#009E8B' : 'transparent',
                            borderBottom: activeSection === 'setor' ? '2px solid #009E8B' : 'none',
                            color: activeSection === 'setor' ? 'white' : '#6c757d', fontWeight: 'bold'
                        }}
                        className="py-3 px-4"
                    >
                        Setor
                    </Button>
                    <Button
                        onClick={() => setActiveSection('subsetor')}
                        style={{
                            borderRadius: '0', border: 'none',
                            backgroundColor: activeSection === 'subsetor' ? '#009E8B' : 'transparent',
                            borderBottom: activeSection === 'subsetor' ? '2px solid #009E8B' : 'none',
                            color: activeSection === 'subsetor' ? 'white' : '#6c757d', fontWeight: 'bold'
                        }}
                        className="py-3 px-4"
                    >
                        Subsetor
                    </Button>

                   {activeSection !== 'subsetor' && (
                        <Button
                            color="success"
                            className="ms-auto"
                            onClick={goToNextSection}
                            style={{ backgroundColor: '#009E8B', borderColor: '#009E8B' }}
                        >
                            Próximo &rarr;
                        </Button>
                    )} */}

                <Form onSubmit={handleSubmit(onSubmit)}>
                    {activeSection === 'localizacao' && (
                        <FormLocalizacao
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            onCadastrarLocalizacao={handleSubmit(onSubmit)}

                        />
                    )} 
                    {activeSection === 'setor' && (
                        <FormSetor
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            onCadastrarSetor={handleSubmit(onSubmit)}
                            options={loadLocationsForSelect}
                        />
                    )}

                    {activeSection === 'subsetor' && (
                        <FormSubsetor
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            options={loadSectorsForSelect}
                            onCadastrarSubsetor={handleSubmit(onSubmit)}
                        />
                    )}

                    <Row className="d-flex mt-3 justify-content-between">
                       {/*  {activeSection !== 'localizacao' && ( 
                            <Col sm="auto">
                                <Button
                                    onClick={goToPreviousSection}
                                    style={{ backgroundColor: "#6c757d", borderColor: "#6c757d", width: "120px", height: "60px" }}
                                >
                                    &larr; Voltar
                                </Button>
                            </Col>
                        )} */}
                        {/* <Col sm="auto" className="ms-auto"> 
                            {activeSection === 'subsetor' ? ( 
                                <Button type="submit" style={{ backgroundColor: "#009E8B", width: "120px", height: "60px" }}>
                                    Salvar
                                </Button>
                            ) : (
                                null 
                            )}
                        </Col> */}
                    </Row>
                </Form>
            </CardBody>
            {activeAlert && (
                <AlertMessage
                    type={alert["type"]}
                    text={alert["text"]}
                    isOpen={isOpen}
                    toggle={onDismiss}
                />
            )}
        </>
    );
}
