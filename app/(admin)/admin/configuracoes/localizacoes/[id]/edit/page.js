"use client";
import { useState, useEffect } from "react";
import Constantes from "../../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Row, Button, CardHeader, CardBody, Form, Col, Navbar, NavLink, Nav, NavItem } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../../src/Components/ElementsUI/LoadingGif";
import FormLocalizacao from "../../../../../../../src/Components/Forms/FormLocalizacao";
import FormSetor from "../../../../../../../src/Components/Forms/FormSetor";
import FormSubsetor from "../../../../../../../src/Components/Forms/FormSubsetor";
import { fetchData } from "../../../../../../../src/Utils/FetchData";
import styles from '../../localizacoes.module.css';

export default function Page() {

    const { "token2": token2 } = parseCookies();
    const params = useParams();
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
        watch,
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
            localizacaoSetorView: null,
            subsetorNome: '',
            subsetorDescricao: '',
            /* localizacaoSubsetor: null, */
            setorSubsetor: null,
            setorSubsetorView: null,
            responsible: []
        }
    });

    const [data, setData] = useState({});

    const [activeSection, setActiveSection] = useState('');
    const [locationData, setLocationData] = useState(null);

    const localizacaoSetorViewValue = watch('localizacaoSetorView');
    const setorSubsetorViewValue = watch('setorSubsetorView');

    function showAlert(type, text) {
        setIsOpen(false);
        setAlert({ type: type, text: text });
        setIsOpen(true);
        setActiveAlert(true);
    }

    function getLocalizacao(id, typeLocation) {
        setLoading(true);
        let url = `stock/${id}`;

        fetch(Constantes.urlBackAdmin + url, {
            method: "GET",
            headers: { "Module": "ADMINISTRATION", "Authorization": token2 }
        })
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                setLoading(false);
                if (status === 200 && body) {
                    setValue('status', body.status || '');
                    if (body.typeLocation === 'LOCATION') {
                        setValue( "nomeLocalizacao", body.name);
                        setValue( "description",body.description);
                        setValue( "status",body.status);
                        setValue( "cep", body.zip);
                        setValue( "estado", body.state);
                        setValue( "cidade" ,body.city);
                        setValue( "numero" , body.number);
                        setValue( "bairro" , body.neighborhood);
                        setValue( "rua", body.address);
                        setValue( "complemento", body.complement);
                        setValue( "latitude", parseFloat(body.latitude));
                        setValue( "longitude", parseFloat(body.longitude));

                    } else if (body.typeLocation === 'SECTOR') {
                        setValue('setorNome', body.name || '');
                        setValue('setorDescricao', body.description || '');

                        if (body.father && body.father.id && body.father.name) {
                            setValue('localizacaoSetorId', body.father.id);
                            setValue('localizacaoSetorName', body.father.name);
                        }
                    } else if (body.typeLocation === 'SUBSECTOR') {
                        setValue('subsetorNome', body.name || '');
                        setValue('subsetorDescricao', body.description || '');

                        if (body.father && body.father.id && body.father.name) {
                            setValue('setorSubsetorId', body.father.id);
                            setValue('setorSubsetorName', body.father.name);

                            if (body.father.father && body.father.father.id && body.father.father.name) {
                               setValue('locationId', body.father.father.id);
                               setValue('locationName', body.father.father.name);
                            }
                        }
                    }
                    setValue( "responsible", body.responsible);
                    setActiveSection(typeLocation);
                } else {
                    showAlert("danger", body ? body.message : "Erro ao buscar dados.");
                }
            })
            .catch(error => {
                setLoading(false);
                showAlert("danger", "Erro de conexão ao buscar dados.");
            });
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
        const locationMapper = (data) => {
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
            { setLoading, showAlert }
        )
    }


    async function onUpdate(data) {
        setLoading(true);

        console.log("Dados completos do formulário:", data);

        let endpoint;
        let payload = {};
        let successMessage = '';

        const localizationId = params.id;

        switch (activeSection) {
            case 'LOCATION':
                endpoint = `stock/location/${localizationId}`;
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
                    typeLocation: 'LOCATION',
                    responsible: data.responsible
                };
                successMessage = "Localização cadastrada com sucesso!"
                break;
            case 'SECTOR':
                endpoint = `/stock/sector_subsector/${localizationId}`;
                payload = {
                    name: data.setorNome,
                    description: data.setorDescricao || "",
                    father: data.localizacaoSetor ? data.localizacaoSetor.value : null,
                    status: data.status,
                    responsible: data.responsible
                };
                successMessage = "Setor atualizado com sucesso!";
                break;
            case 'SUBSECTOR':
                endpoint = `/stock/sector_subsector/${localizationId}`;
                payload = {
                    name: data.subsetorNome,
                    description: data.subsetorDescricao || "",
                    fatherId: data.setorSubsetorId ? data.setorSubsetorId : null,
                    status: data.status,
                    responsible: data.responsible
                };
                successMessage = "Subsetor atualizado com sucesso!";
                break;

            default:
                showAlert("Selecione uma das sessões para efetuar um cadastro!");
        };

        delete data.localizacaoSetorView;
        delete data.setorSubsetorView;

        try {
            const response = await fetch(Constantes.urlBackAdmin + endpoint, {
                method: "PUT",
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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('typeLocation')) {
            getLocalizacao(params.id, urlParams.get('typeLocation'));

        }

    }, [params.id, token2]);

    return (
        <>
            {loading && <LoadingGif />}
            <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                <IoArrowBackCircleSharp
                    style={{ width: "45px", height: "70px", color: "#009E8B", cursor: "pointer" }}
                    onClick={() => { router.back() }}
                />
                <h1 className={styles.header_h1}>Edição de Localização, Setor e Subsetor</h1>
            </CardHeader>

            <Nav tabs className={styles.navbar}>
                {activeSection == 'LOCATION' && <NavItem style={{ cursor: "pointer" }}>
                    <NavLink active={true} onClick={() => { setActiveSection("LOCATION"); }}
                        className={styles.navlink}>Localização</NavLink>
                </NavItem>}
                {activeSection == 'SECTOR' && (<NavItem style={{ cursor: "pointer" }}>
                    <NavLink active={true} onClick={() => { setActiveSection("setor"); }}
                        className={styles.navlink}>Setor</NavLink>
                </NavItem>)}
                {activeSection == 'SUBSECTOR' && (<NavItem style={{ cursor: "pointer" }}>
                    <NavLink active={true} onClick={() => { setActiveSection("subsetor"); }}
                        className={styles.navlink}>Subsetor</NavLink>
                </NavItem>)}
            </Nav>

            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                <Form onSubmit={handleSubmit(onUpdate)}>
                    {activeSection == 'LOCATION' && (
                        <FormLocalizacao
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            localizacaoInicial={{latitude:getValues("latitude"),longitude:getValues("longitude")}}
                            onCadastrarLocalizacao={handleSubmit(onUpdate)}


                        />
                    )}
                    {activeSection === 'SECTOR' && (
                        <FormSetor
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            register={register}
                            options={loadLocationsForSelect}
                            onAtualizarSetor={handleSubmit(onUpdate)}
                            initialViewValue={localizacaoSetorViewValue}
                        />
                    )}

                    {activeSection === 'SUBSECTOR' && (
                        <FormSubsetor
                            register={register}
                            control={control}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            options={loadSectorsForSelect}
                            onAtualizarSubsetor={handleSubmit(onUpdate)}
                            subsetorInicial={data}
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
