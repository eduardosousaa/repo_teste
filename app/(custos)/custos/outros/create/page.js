"use client"
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import {
    Input, Form, Row, Col, Button, Card, CardHeader, CardBody,
    Nav, NavItem, NavLink, Alert, Label, FormGroup, Table
} from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiUpload } from 'react-icons/fi';
import { BiTrash } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { MdDriveFolderUpload, MdOutlinePhotoCamera } from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";
import InputForm from '../../../../../src/Components/ElementsUI/InputForm';
import AlertMessage from '../../../../../src/Components/ElementsUI/AlertMessage';
import LoadingGif from '../../../../../src/Components/ElementsUI/LoadingGif';
import ModalStyle from '../../../../../src/Components/ElementsUI/ModalStyle';
import TableStyle from '../../../../../src/Components/ElementsUI/TableStyle';
import IndexCardsStyle from '../../../../../src/Components/ElementsUI/IndexCardsStyle';
import Constantes from '../../../../../src/Constantes';
import { parseCookies } from 'nookies';
import MaskReal from '../../../../../src/Utils/MaskReal';
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";

import styles from '../outros.module.css';


export default function Create() {
    const { "token2": token2 } = parseCookies();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm({
        defaultValues: {
            invoiceNumber: '',
            value: '',
            typeOtherCostsId: '',
            /* category: '', */
            date: '',
            description: '',
            itemToDistributeName: '',
            itemToDistributeValue: '',
            itemToDistributeDescription: '',
            vehicleId: '',
            plate: '',
        }
    });

    const [loading, setLoading] = useState(false);
    /* const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState(''); */
    const [alert, setAlert] = useState({});
    const [activeAlert, setActiveAlert] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(true);

    const fileInputPhotoRef = useRef(null);
    const fileInputDocRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [photos, setPhotos] = useState([]);

    const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [showDistributedCostSection, setShowDistributedCostSection] = useState(false);
    const [distributedCostsItems, setDistributedCostsItems] = useState([]);

    /* const [costTypes, setCostTypes] = useState([]); */
    const [showAsync, setShowAsync] = useState([true,true,true,true]);

    /* const categoryOptions = useMemo(() => [
        { id: '', name: '--Selecione a Categoria--' },
        { id: 'DESPESAS_FIXAS', name: 'Despesas Fixas' },
        { id: 'DESPESAS_VARIAVEIS', name: 'Despesas Variáveis' },
        { id: 'INVESTIMENTOS', name: 'Investimentos' },
        { id: 'SERVICOS', name: 'Serviços' },
        { id: 'DIVERSOS', name: 'Diversos' },
    ], []); */

    function showAlert(type, text) {
        setIsAlertOpen(false);
        setAlert({ type: type, text: text });
        setIsAlertOpen(true);
        setActiveAlert(true);
    }
    const onDismissAlert = () => setIsAlertOpen(false);

    const vehicleOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.plate = teste;
        query.prefix = teste;
        /* query.status = "ACTIVE"; */
        query.statusVehicle = ["ACTIVE","UNDER_MAINTENANCE","RESERVE"];
        query.locationNotNull = true;
        url = "vehicle/available?" + new URLSearchParams(query);

        return fetch(Constantes.urlBackPatrimony + url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Module": "PATRIMONY",
                "Authorization": token2
            },
        })
            .then((response) => response.json())
            .then((data) => {
                let dadosTratados = [];

                data["content"].forEach(dado =>
                    dadosTratados.push({
                        "value": dado.id,
                        "label": (dado.prefix || "(sem prefixo)") + "/" + dado.plate
                    }));

                return dadosTratados;
            });
    };

    const costTypeOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        url = "other_costs/type?" + new URLSearchParams(query);

        return fetch(Constantes.urlBackCosts + url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Module": "COSTS",
                "Authorization": token2
            },
        })
            .then((response) => response.json())
            .then((data) => {
                let dadosTratados = [];

                data["content"].forEach(dado =>
                    dadosTratados.push({
                        "value": dado.id,
                        "label": dado.name
                    }));

                return dadosTratados;
            });
    };

   const localizationOptions = (teste, type) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        query.typeLocation = type;

   
        if(type == "SECTOR"){
           query.fatherId = getValues("locationId") || "";
        }

        if(type == "SUBSECTOR"){
           query.fatherId = getValues("sectorId") || "";
        }

        url =  "stock?" + new URLSearchParams(query);
        
        return fetch(Constantes.urlBackAdmin + url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION",
                "Authorization": token2
            },
        })
        .then((response) => response.json())
        .then((data) => {
         
          let dadosTratados = [];
         
          data["content"].forEach(dado =>
             dadosTratados.push({
              "value":  dado.id,
              "label": dado.name,
             }));
          
          return dadosTratados;
        });
    }

   /*  useEffect(() => {
        if (token2) {
            fetchCostTypes();
        }
    }, [token2]); */

    const changeArquivo = (e, type) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if(((type == "document" || type == "invoice") && file.type != "application/pdf") ||  
               (type == "photo" && file.type != "image/png" && file.type != "image/jpeg")){
                return showAlert("warning","Formato de documento não permitido!");
            }

            const fileName = file.name;

            const reader = new FileReader();
            reader.onload = (event) => {
                const blob = new Blob([new Uint8Array(event.target.result)], { type: file.type });
                const objectURL = URL.createObjectURL(blob);

                const newFileObject = {
                    arquivo: file,
                    arquivoBlob: objectURL,
                    descricao: fileName,
                };

                if (type === "document") {
                    setDocuments(prevDocs => [...prevDocs, newFileObject]);
                } else if (type === "photo") {
                    setPhotos(prevPhotos => [...prevPhotos, newFileObject]);
                } else if(type === "invoice"){
                    setValue("invoiceDoc", file);
                    setInvoiceDocBlob(objectURL);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    function dataForTable(data){
          let tableData = [];
    
          data.forEach(d => 
              tableData.push({
                "name": d.name,
                "value": "R$ " + d.value.toFixed(2).replace('.', ','),
                "description": d.description,
                "plate": d.plate,
                "actions": <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
                             <Button className={styles.button} 
                                     onClick={() => removeDistributedCostItem(d.id)}>
                                 <BiTrash />
                             </Button>
                          </div>
              })
          );
    
          return tableData;
       }


    const addDistributedCostItem = () => {
        const itemName = watch('itemToDistributeName');
        const itemValue = watch('itemToDistributeValue').replaceAll(".","");
        const itemDescription = watch('itemToDistributeDescription');
        const vehicleId = watch('vehicleId');
        const plate = watch('plate');


        if (!itemName || !itemValue) {
            showAlert('warning', 'Nome e Valor do item são obrigatórios para adicionar à distribuição.');
            return;
        }
        if (isNaN(parseFloat(String(itemValue).replace(',', '.')))) {
            showAlert('warning', 'Valor do item deve ser um número válido.');
            return;
        }

        const newItem = {
            id: Date.now().toString(),
            name: itemName,
            value: parseFloat(String(itemValue).replace(',', '.')),
            description: itemDescription,
            vehicleId: vehicleId || null,
            plate: plate || null,
        };

        setDistributedCostsItems(prevItems => [...prevItems, newItem]);

        setValue('itemToDistributeName', '');
        setValue('itemToDistributeValue', '');
        setValue('itemToDistributeDescription', '');
        setValue('vehicleId', '');
        setValue('plate', '');
        clearErrors(['itemToDistributeName', 'itemToDistributeValue', 'itemToDistributeDescription']);
        setShowAsync([true,true,true,false]);
    };

    const removeDistributedCostItem = (idToRemove) => {
        setDistributedCostsItems(prevItems => prevItems.filter(item => item.id !== idToRemove));
    };


    const createFormData = (data) => {
        const formData = new FormData();

        data.value = data.value.replaceAll(".","");

        const otherCostObject = {
            invoiceNumber: (data.invoiceNumber || '').trim(),
            value: parseFloat(String(data.value).replace(',', '.')),
            typeOtherCostsId: data.typeOtherCostsId,
            category: data.category,
            date: data.date,
            description: (data.description || '').trim(),
            locationId: data.subsectorId || data.sectorId || data.locationId,
            distributedCosts: showDistributedCostSection ? distributedCostsItems.map(item => ({
                name: item.name,
                value: item.value,
                description: item.description,
                vehicleId: item.vehicleId,
            })) : []
        };
        
        console.log('Dados do custo diverso JSON:', JSON.stringify(otherCostObject, null, 2));

        formData.append('other_costs', new Blob([JSON.stringify(otherCostObject)], { type: 'application/json' }));

        if(data.invoiceDoc) formData.append("invoiceDoc",data.invoiceDoc,"nota_fiscal.pdf"); 

        documents.forEach(doc => {
            formData.append('files', doc.arquivo, doc.descricao);
        });
        photos.forEach(photo => {
            formData.append('images', photo.arquivo, photo.descricao);
        });

        return formData;
    };

    const validateRequiredFields = (data) => {
        const requiredFields = [
            { field: 'invoiceNumber', name: 'Número da Nota Fiscal' },
            { field: 'value', name: 'Valor' },
            { field: 'typeOtherCostsId', name: 'Tipo de Custo' },
            /* { field: 'category', name: 'Categoria' }, */
            { field: 'date', name: 'Data' },
        ];

        const missingFields = requiredFields.filter(req => !data[req.field] || String(data[req.field]).trim() === '');

        if (missingFields.length > 0) {
            const fieldNames = missingFields.map(f => f.name).join(', ');
            throw new Error(`Campos obrigatórios não preenchidos: ${fieldNames}`);
        }

        /* if (documents.length === 0 && photos.length === 0) {
            throw new Error('É necessário anexar ao menos um arquivo ou uma foto.');
        } */

        if (showDistributedCostSection && distributedCostsItems.length === 0) {
            throw new Error('Se a distribuição de custos está ativa, adicione ao menos um item.');
        }
    };


    async function submit(data) {
        setLoading(true);
        /* setApiError('');
        setApiSuccess(''); */

        try {
            validateRequiredFields(data);
            const formData = createFormData(data);

            console.log('Dados sendo enviados (FormData):', Array.from(formData.entries()));

            const endpointUrl = Constantes.urlBackCosts + '/other_costs';
            console.log('Endpoint da API para criação de custo diverso:', endpointUrl);

            const response = await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Raw error response text:", errorText);
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = JSON.parse(errorText);
                        if (errorData.message) errorMessage = errorData.message;
                        else if (errorData.error) errorMessage = errorData.error;
                    }
                } catch (e) { }
                throw new Error(errorMessage);
            }

            const successResponseText = await response.text();
            let result = { message: 'Custo diverso cadastrado com sucesso!' };
            try {
                if (successResponseText.trim() !== '') {
                    const parsedSuccess = JSON.parse(successResponseText);
                    result = parsedSuccess.message ? parsedSuccess : result;
                }
            } catch (parseError) { console.warn("Resposta de sucesso não é JSON válido.", parseError); }

            /* setApiSuccess(result.message); */
            showAlert("success",result.message);
            router.push('/custos/outros');

        } catch (error) {
            console.error('Erro ao cadastrar custo diverso:', error);
            /* setApiError(error.message || 'Erro ao cadastrar custo diverso.'); */
            showAlert("danger",error.message || 'Erro ao cadastrar custo diverso.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
 
     const handleResize = () => {
       setWindowWidth(window.innerWidth);
     };
 
     window.addEventListener('resize', handleResize);
 
     return () => {
       window.removeEventListener('resize', handleResize);
     };
    });

    useEffect(() => {
      /* if(!showAsync) setShowAsync(true); */
      if(showAsync.includes(false)){
         setShowAsync(showAsync.map((s) => {
              return true;
         }));
      }     
    },[showAsync]);


    return (
        <>
            {loading && <LoadingGif />}

            <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
                <IoArrowBackCircleSharp style={{ width: "45px", height: "70px", color: "#009E8B" }}
                    onClick={() => { router.back() }} />
                <h1 className={styles.header_h1}>Cadastro de Outros Custos</h1>
            </CardHeader>

            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                {/* {apiError && (
                    <Alert color="danger" className="mb-3">
                        <strong>Erro:</strong> {apiError}
                    </Alert>
                )}
                {apiSuccess && (
                    <Alert color="success" className="mb-3">
                        <strong>Sucesso:</strong> {apiSuccess}
                    </Alert>
                )} */}

                <Form onSubmit={handleSubmit(submit)}>
                    <Row className="d-flex mt-3">
                        <Col sm="4">
                            <InputForm
                                id="invoiceNumber"
                                name="invoiceNumber"
                                label="N° Nota Fiscal*"
                                placeholder="--Digite--"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                                value={watch('invoiceNumber')}
                                onChange={(e) => setValue('invoiceNumber', e.target.value)}
                            />
                        </Col>
                        <Col sm="4">
                            <InputForm
                                id="date"
                                name="date"
                                label="Data de Emissão*"
                                placeholder="mm/dd/aaaa"
                                register={register}
                                required={true}
                                type="date"
                                value={watch('date')}
                                onChange={(e) => setValue('date', e.target.value)}
                                errors={errors}
                            />
                        </Col>
                        <Col sm="4">
                            <InputForm
                                id="value"
                                name="value"
                                label="Valor Total*"
                                placeholder="--Digite--"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                                value={watch('value')}
                                onChange={(e) => {
                                    MaskReal(e);
                                    setValue('value', e.target.value);
                                }}
                            />
                        </Col>
                        
                    </Row>

                    <div className={styles.archiveFormGroup}>
                        <div className={styles.archiveFormLink}>
                          <a href={invoiceDocBlob} target="_blank" rel="noreferrer">{invoiceDocBlob == null ? "Arquivo não enviado" : "nota_fiscal.pdf"}</a>
                          { errors?.["invoiceDoc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["invoiceDoc"]?.message || "Campo Obrigatório"}</div>}  
                        </div>

                        <div className={styles.archiveFormButtons}>
                         <div>
                            <label className={styles.archiveFormButtonGreen} htmlFor={"invoiceDoc"}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                            <input style={{display:"none"}} {...register("invoiceDoc",{required: false})}></input>
                            <input id={"invoiceDoc"} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,"invoice");clearErrors("invoiceDoc")}}
                                                                                                                   onClick={(e) => e.target.value = null}/>
                         </div>
     
                         <div>
                            <a className={styles.archiveFormButtonGreen}  href={invoiceDocBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                         </div>
     
                         <div>
                            <label className={styles.archiveFormButtonRed}  onClick={() => {setInvoiceDocBlob(null)}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                         </div>
                        </div>
                    </div>

                    <Row className="d-flex mt-3">
                        {/* <Col sm="4">
                            <InputForm
                                id="typeOtherCostsId"
                                name="typeOtherCostsId"
                                label="Tipo*"
                                placeholder="--Selecione--"
                                register={register}
                                required={true}
                                type="select"
                                options={costTypes}
                                value={watch('typeOtherCostsId')}
                                onChange={(e) => setValue('typeOtherCostsId', e.target.value)}
                                errors={errors}
                            />
                        </Col> */}
                        <Col sm="4">
                          <AsyncSelectForm
                              id="typeOtherCostsId"
                              name="typeOtherCostsId"
                              label="Tipo*"
                              register={register}
                              required={false}
                              onChange={(e) => { setValue('typeOtherCostsId', e ? e.value : "");}}
                              options={costTypeOptions}
                          />
                        </Col>
                        
                    </Row>

                    <Row className="d-flex mt-3">
                        <Col sm="12">
                            <InputForm
                                id="description"
                                name="description"
                                label="Observações adicionais sobre esse custo"
                                placeholder="Digite aqui"
                                register={register}
                                required={false}
                                type="textarea"
                                errors={errors}
                                value={watch('description')}
                                onChange={(e) => setValue('description', e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row className="d-flex mt-3">
                       { showAsync[0] && <Col sm="4">
                         <AsyncSelectForm
                           id="locationId"
                           name="locationId"
                           label="Localização"
                           onChange={(e) => {setValue("locationId",e ? e.value: "");
                                               setShowAsync([true,false,false])}}
                           register={register}
                           options={(value) => localizationOptions(value, 'LOCATION') }
                         />
                       </Col>}
       
                       { showAsync[1] && <Col sm="4">
                         <AsyncSelectForm
                           id="sectorId"
                           name="sectorId"
                           label="Setor"
                           onChange={(e) => {setValue("sectorId",e ? e.value: "");
                                               setShowAsync([true,true,false])}}
                           register={register}
                           options={(value) =>  localizationOptions(value, 'SECTOR')}
                         />
                       </Col>}
       
                       { showAsync[2] && <Col sm="4">
                         <AsyncSelectForm
                           id="subsectorId"
                           name="subsectorId"
                           label="Subsetor"
                           onChange={(e) => {setValue("subsectorId",e ? e.value: "");
                                               /* setShowAsync([true,true,true]) */}}
                           register={register}
                           options={(value) => localizationOptions(value, 'SUBSECTOR')}
                         />
                       </Col>}

                    </Row>

                    <Row className="d-flex mt-3">
                        <Col sm="2">
                            <Label style={{ height: "25px", fontSize: "18px" }}>Anexos</Label>
                        </Col>
                        <Col sm="6" style={{ display: "flex", gap: "40px" }}>
                            <label className={styles.archiveFormButtonGreen} htmlFor={`doc_fileBtn`} style={{ flex: "1" }}>Anexar Arquivo<MdDriveFolderUpload style={{ color: "teal" }} /></label>
                            <input id={`doc_fileBtn`} type="file" style={{ display: "none" }} accept="application/pdf" onChange={(e) => { changeArquivo(e, "document"); }}
                                ref={fileInputDocRef} onClick={(e) => e.target.value = null} />

                            <label className={styles.archiveFormButtonGreen} htmlFor={`doc_imageBtn`} style={{ flex: "1" }}>Anexar Foto<MdOutlinePhotoCamera style={{ color: "teal" }} /></label>
                            <input id={`doc_imageBtn`} type="file" style={{ display: "none" }} accept="image/png, image/jpeg" onChange={(e) => { changeArquivo(e, "photo"); }}
                                ref={fileInputPhotoRef} onClick={(e) => e.target.value = null} />
                        </Col>
                    </Row>

                    {(documents.length > 0 || photos.length > 0) && (
                        <Row className="d-flex mt-3">
                            {documents.length > 0 && <Col sm="6">
                                {documents.map((doc, index) =>
                                    <Card key={`doc-${index}`} className={styles.archiveFormLink}>
                                        <a href={doc.arquivoBlob} target="_blank" rel="noreferrer">{doc.descricao}</a>
                                        <Button color="danger" onClick={() => setDocuments(prev => prev.filter((_, i) => i !== index))}
                                                className="p-2" style={{ backgroundColor: '#fff', borderColor: '#dc3545', width: '40px'}}>
                                            <FaTrash style={{color:"#e32c2c",height: "25px"}}/>
                                        </Button>
                                    </Card>
                                )}
                            </Col>}
                            {photos.length > 0 && <Col sm="6">
                                <Row>
                                    {photos.map((photo, index) =>
                                        <Col key={`photo-${index}`} sm="4">
                                            <div style={{ position: "relative", backgroundColor: "#E5E7EB", padding: "16px", borderRadius: "8px", marginBottom: "10px" }}>
                                                <TiDelete size={40} color="#e32c2c" style={{ position: "absolute", top: "5px", right: "5px", cursor: "pointer", zIndex: 1 }} onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))} />
                                                <img src={photo.arquivoBlob} alt={photo.descricao} style={{ width: "100%", height: "auto", maxHeight: "120px", objectFit: "cover", /* borderRadius: "4px"  */}} 
                                                     onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}/>
                                                <p style={{ fontSize: "12px", textAlign: "center", marginTop: "5px", overflowWrap: "break-word" }}
                                                   onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}>{photo.descricao}</p>
                                            </div>
                                        </Col>
                                    )}
                                </Row>
                            </Col>}
                        </Row>
                    )}


                    <Row className="d-flex mt-4">
                        <Col sm="12">
                            <Button
                                color="info"
                                outline
                                onClick={() => setShowDistributedCostSection(!showDistributedCostSection)}
                                style={{ width: "fit-content", height: "50px" }}
                            >
                                Dividir custo
                            </Button>
                        </Col>
                    </Row>

                    {showDistributedCostSection && (
                        <Card style={{ padding: "20px", marginTop: "20px" }}>
                            <Row className="d-flex mt-3">
                                <Col sm="12">
                                    <h4 style={{ marginBottom: "15px" }}>Adicionar Item à Distribuição</h4>
                                </Col>
                                <Col sm="6">
                                    <InputForm
                                        id="itemToDistributeName"
                                        name="itemToDistributeName"
                                        label="Nome do Item*"
                                        placeholder="Nome do item ou serviço"
                                        register={register}
                                        required={false}
                                        type="text"
                                        errors={errors}
                                        value={watch('itemToDistributeName')}
                                        onChange={(e) => setValue('itemToDistributeName', e.target.value)}
                                    />
                                </Col>
                                <Col sm="6">
                                    <InputForm
                                        id="itemToDistributeValue"
                                        name="itemToDistributeValue"
                                        label="Valor do Item*"
                                        placeholder="R$ 0,00"
                                        register={register}
                                        required={false}
                                        type="text"
                                        errors={errors}
                                        value={watch('itemToDistributeValue')}
                                        onChange={(e) => {
                                            MaskReal(e);
                                            setValue('itemToDistributeValue', e.target.value);
                                        }}
                                    />
                                </Col>
                                <Col sm="6">
                                    <InputForm
                                        id="itemToDistributeDescription"
                                        name="itemToDistributeDescription"
                                        label="Descrição detalhada do Item"
                                        placeholder="Observações do item"
                                        register={register}
                                        required={false}
                                        type="textarea"
                                        errors={errors}
                                        value={watch('itemToDistributeDescription')}
                                        onChange={(e) => setValue('itemToDistributeDescription', e.target.value)}
                                    />
                                </Col>
                                {showAsync[3] && <Col sm="6">
                                    <AsyncSelectForm
                                        id="vehicleId"
                                        name="vehicleId"
                                        label="Veículo"
                                        register={register}
                                        required={false}
                                        onChange={(e) => { setValue('vehicleId', e ? e.value : ""); setValue('plate', e ? e.label : "") }}
                                        options={vehicleOptions}
                                    />
                                </Col>}
                                <Col sm="12" className="d-flex justify-content-end mt-3">
                                    <Button onClick={addDistributedCostItem} style={{ backgroundColor: "#009E8B" }}>
                                        Adicionar Item <FaPlus />
                                    </Button>
                                </Col>
                            </Row>

                            <Row className="d-flex mt-3">
                                <Col sm="12">
                                    {distributedCostsItems.length > 0 ? ( <>
                                        {/* <Table className="mt-3" striped>
                                            <thead>
                                                <tr style={{ fontSize: "1.2rem" }}>
                                                    <th style={{ backgroundColor: "#009e8b", color: "#fff", borderTopLeftRadius: "15px" }}>Item</th>
                                                    <th style={{ backgroundColor: "#009e8b", color: "#fff" }}>Valor</th>
                                                    <th style={{ backgroundColor: "#009e8b", color: "#fff" }}>Descrição Detalhada</th>
                                                    <th style={{ backgroundColor: "#009e8b", color: "#fff" }}>Veículo</th>
                                                    <th style={{ backgroundColor: "#009e8b", color: "#fff", borderTopRightRadius: "15px", width: "80px" }}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {distributedCostsItems.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0, ...(index == distributedCostsItems.length - 1 && { borderBottomLeftRadius: "15px"})}}>{item.name}</td>
                                                        <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0 }}>R$ {item.value.toFixed(2).replace('.', ',')}</td>
                                                        <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0 }}>{item.description || 'N/A'}</td>
                                                        <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0 }}>{item.plate || 'N/A'}</td>
                                                        <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0, ...(index == distributedCostsItems.length - 1 && { borderBottomRightRadius: "15px"})}}>
                                                            <Button className={styles.button} 
                                                                    onClick={() => removeDistributedCostItem(item.id)}>
                                                                <BiTrash />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table> */}

                                       {windowWidth > 795 && 
                                          <TableStyle columnNames={["Item","Valor","Descrição Detalhada","Veículo","Ações"]} 
                                                      data={dataForTable(distributedCostsItems)} />}
                                       {windowWidth <= 795 &&  
                                          <IndexCardsStyle names={["Item","Valor","Descrição Detalhada","Veículo","Ações"]} 
                                                           data={dataForTable(distributedCostsItems)}/>} 
                                      </>
                                    ) : (
                                        <Card style={{ padding: "10px", marginBottom: "20px" }}>Nenhum item adicionado à distribuição.</Card>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    )}


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

            <ModalStyle size="lg" open={openModal} title={"Imagem"} toggle={() => setOpenModal(!openModal)} noButtons={true}>
                {previewImage && (
                   <img
                       src={previewImage}
                       alt="Preview"
                       style={{ maxWidth: "100%", maxHeight: "80vh" }}
                   />
                )}
            </ModalStyle>

            {activeAlert && (
                <AlertMessage
                    type={alert.type}
                    text={alert.text}
                    isOpen={isAlertOpen}
                    toggle={onDismissAlert}
                />
            )}
        </>
    );
}