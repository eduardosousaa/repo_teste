"use client"
import React, { use, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import {
    Input, Form, Row, Col, Button, CardHeader, CardBody, Card,
    Nav, NavItem, NavLink, Alert, Label, FormGroup, Table
} from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiUpload } from 'react-icons/fi';
import { BiTrash } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { MdDriveFolderUpload, MdOutlinePhotoCamera } from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";
import { FiPackage } from 'react-icons/fi';
import InputForm from '../../../../../../../src/Components/ElementsUI/InputForm';
import AlertMessage from '../../../../../../../src/Components/ElementsUI/AlertMessage';
import LoadingGif from '../../../../../../../src/Components/ElementsUI/LoadingGif';
import ModalStyle from '../../../../../../../src/Components/ElementsUI/ModalStyle';
import TableStyle from '../../../../../../../src/Components/ElementsUI/TableStyle';
import IndexCardsStyle from '../../../../../../../src/Components/ElementsUI/IndexCardsStyle';
import Constantes from '../../../../../../../src/Constantes';
import { parseCookies } from 'nookies';
import MaskReal from '../../../../../../../src/Utils/MaskReal';
// import FormatarData from '../../../../../../src/Utils/FormatarData';
import FormatarReal from '../../../../../../../src/Utils/FormatarReal';
import AsyncSelectForm from "../../../../../../../src/Components/ElementsUI/AsyncSelectForm";

import styles from '../../../outros.module.css';


export default function EditarOutroCusto() {
    const { id: costId } = useParams();
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
            type: '',
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

    /* const [costTypes, setCostTypes] =  useState([]); */
    const [showAsync, setShowAsync] = useState([true,true,true,true]);

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

    const fetchOtherCostDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(Constantes.urlBackCosts + `other_costs/${costId}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ao carregar detalhes do custo: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Detalhes do Custo Diverso carregados para edição (API):", data);

            setValue('invoiceNumber', data.invoiceNumber || '');
            setValue('value', data.value ? FormatarReal(String(data.value.toFixed(2))) : "");
            setValue('typeOtherCostsId', data.typeOtherCostsId || '');
            setValue('typeOtherCostsName', data.typeOtherCostsName || '');
            setValue('date', data.date || '');
            setValue('description', data.description || '');

            setValue("invoicePath",data.invoicePath);
            setValue("invoiceDoc","unchanged");
            if(data.invoicePath != null) setInvoiceDocBlob(Constantes.urlImages + data.invoicePath);
                            
            const loadedDocuments = [];
            const loadedPhotos = [];

            if (data.files && Array.isArray(data.files)) {
                data.files.forEach(file => {
                    loadedDocuments.push({
                        id: file.id,
                        path: file.path,
                        descricao: file.path.split('/').pop() || 'Documento',
                        arquivoBlob: null,
                        arquivo: null,
                        fileType: file.fileType
                    });
                });
            }
            if (data.images && Array.isArray(data.images)) {
                data.images.forEach(image => {
                    loadedPhotos.push({
                        id: image.id,
                        path: image.path,
                        descricao: image.path.split('/').pop() || 'Foto',
                        arquivoBlob: null,
                        arquivo: null,
                        fileType: image.fileType
                    });
                });
            }
            setDocuments(loadedDocuments);
            setPhotos(loadedPhotos);

            if (data.distributedCosts && Array.isArray(data.distributedCosts) && data.distributedCosts.length > 0) {
                setDistributedCostsItems(data.distributedCosts.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    value: item.value || 0,
                    description: item.description || '',
                    vehicleId: item.vehicleId || '',
                    plate: item.plate || '',
                })));
                setShowDistributedCostSection(true);
            }

        } catch (error) {
            console.error('Erro ao buscar detalhes do custo diverso para edição:', error);
            //setApiError(error.message || 'Erro ao carregar detalhes do custo para edição.');
            showAlert("danger",error.message || 'Erro ao carregar detalhes do custo para edição.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (token2 && costId) {
            fetchOtherCostDetails();
            /* fetchCostTypes(); */
        }
    }, [token2, costId]);


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
                    fileType: file.type.startsWith('image/') ? 'IMAGE' : (file.type === 'application/pdf' ? 'DOCUMENT' : 'OTHER'),
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

    const removeAttachedFile = (idToRemove, type) => {
        if (type === "document") {
            setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== idToRemove));
        } else if (type === "photo") {
            setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== idToRemove));
        }
    };

    const removeNewUploadedFile = (descriptionToRemove, type) => {
        if (type === "document") {
            setDocuments(prevDocs => prevDocs.filter(doc => doc.descricao !== descriptionToRemove || doc.id !== undefined));
        } else if (type === "photo") {
            setPhotos(prevPhotos => prevPhotos.filter(photo => photo.descricao !== descriptionToRemove || photo.id !== undefined));
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
            showAlert('danger', 'Nome e Valor do item são obrigatórios para adicionar à distribuição.');
            return;
        }
        if (isNaN(parseFloat(String(itemValue).replace(',', '.')))) {
            showAlert('danger', 'Valor do item deve ser um número válido.');
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
            date: data.date,
            description: (data.description || '').trim(),
            locationId: data.subsectorId || data.sectorId || data.locationId,
            distributedCosts: distributedCostsItems.map(item => {
                const itemPayload = {
                    name: item.name,
                    value: item.value,
                    description: item.description,
                    vehicleId: item.vehicleId,
                    plate: item.plate
                };
                if (item.id && item.id.length === 36) {
                    itemPayload.id = item.id;
                }
                return itemPayload;
            }),
            files: documents.filter(doc => doc.arquivo === null).map(doc => ({
                id: doc.id,
                path: doc.path,
                fileType: doc.fileType
            })),
            images: photos.filter(photo => photo.arquivo === null).map(photo => ({
                id: photo.id,
                path: photo.path,
                fileType: photo.fileType
            })),
        };
        otherCostObject.category = 'DIVERSOS';

        console.log('Dados do custo diverso JSON para PUT:', JSON.stringify(otherCostObject, null, 2));

        formData.append('other_costs', new Blob([JSON.stringify(otherCostObject)], { type: 'application/json' }));

        if(data.invoiceDoc != "unchanged"){
             formData.append("invoiceDoc",data.invoiceDoc,"nota_fiscal.pdf"); 
        }

        documents.filter(doc => doc.arquivo !== null).forEach((doc, index) => {
            formData.append(`files[${index}]`, doc.arquivo, doc.descricao);
        });
        photos.filter(photo => photo.arquivo !== null).forEach((photo, index) => {
            formData.append(`images[${index}]`, photo.arquivo, photo.descricao);
        });

        return formData;
    };

    const validateRequiredFields = (data) => {
        const requiredFields = [
            { field: 'invoiceNumber', name: 'Número da Nota Fiscal' },
            { field: 'value', name: 'Valor' },
            { field: 'typeOtherCostsId', name: 'Tipo' },
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

            console.log('Dados sendo enviados (FormData) para PUT:', Array.from(formData.entries()));

            const endpointUrl = Constantes.urlBackCosts + `/other_costs/${costId}`;
            console.log('Endpoint da API para atualização de custo diverso:', endpointUrl);

            const response = await fetch(endpointUrl, {
                method: 'PUT',
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
            let result = { message: 'Custo diverso atualizado com sucesso!' };
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
            console.error('Erro ao atualizar custo diverso:', error);
            /* setApiError(error.message || 'Erro ao atualizar custo diverso.'); */
            showAlert("danger",error.message || 'Erro ao atualizar custo diverso.');
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
                <IoArrowBackCircleSharp style={{ width: "45px", height: "70px", color: "#009E8B", cursor: "pointer" }}
                    onClick={() => { router.back() }} />
                <h1 className={styles.header_h1}>Edição do Custo</h1>
            </CardHeader>

            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                {/* {apiError && (
                    <Alert color="danger" className="mx-3">
                        <strong>Erro:</strong> {apiError}
                    </Alert>
                )}
                {apiSuccess && (
                    <Alert color="success" className="mx-3">
                        <strong>Sucesso:</strong> {apiSuccess}
                    </Alert>
                )} */}

                {loading ? (
                    <div className="text-center p-4">
                        <p>Carregando dados para edição...</p>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit(submit)}>
                        <Row className="d-flex mt-3">
                            <Col sm="12">
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
                                          defaultValue={{value:getValues("typeOtherCostsId"),label:getValues("typeOtherCostsName")}}
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
                                {documents.length > 0 && (
                                    <Col sm="6">
                                        <h4>Documentos</h4>
                                        {documents.map((doc, index) => (
                                            <Card key={`doc-${doc.id || index}`} className={styles.archiveFormLink} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                                <a href={doc.arquivoBlob || Constantes.urlImage + doc.path} target="_blank" rel="noreferrer" style={{ fontSize: "16px", textDecoration: "underline", color: "#009E8B" }}>
                                                    {doc.descricao || `Documento ${index + 1}`}
                                                </a>
                                                <Button color="danger" onClick={() => doc.id ? removeAttachedFile(doc.id, "document") : removeNewUploadedFile(doc.descricao, "document")}
                                                        className="p-2" style={{ backgroundColor: '#fff', borderColor: '#dc3545', width: '40px'}}>
                                                    <FaTrash style={{color:"#e32c2c",height: "25px"}}/>
                                                </Button>
                                            </Card>
                                        ))}
                                    </Col>
                                )}
                                {photos.length > 0 && (
                                    <Col sm="6">
                                        <h4>Fotos</h4>
                                        <Row>
                                            {photos.map((photo, index) => (
                                                <Col key={`photo-${photo.id || index}`} sm="4">
                                                    <div style={{ position: "relative", backgroundColor: "#E5E7EB", padding: "16px", borderRadius: "8px", marginBottom: "10px" }}>
                                                        <TiDelete size={40} color="#e32c2c" style={{ position: "absolute", top: "5px", right: "5px", cursor: "pointer", zIndex: 1 }} onClick={() => photo.id ? removeAttachedFile(photo.id, "photo") : removeNewUploadedFile(photo.descricao, "photo")} />
                                                        <img src={photo.arquivoBlob || (Constantes.urlImage + photo.path)} alt={photo.descricao || `Foto ${index + 1}`} style={{ width: "100%", height: "auto", maxHeight: "120px", objectFit: "cover",/*  borderRadius: "4px"  */}} 
                                                             onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}/>
                                                        <p style={{ fontSize: "12px", textAlign: "center", marginTop: "5px", overflowWrap: "break-word" }}
                                                           onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}>{photo.descricao || `Foto ${index + 1}`}</p>
                                                    </div>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                )}
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
                                    <Col sm="6">
                                        {showAsync[3] && <AsyncSelectForm
                                            id="vehicleId"
                                            name="vehicleId"
                                            label="Veículo"
                                            register={register}
                                            required={false}
                                            onChange={(e) => { setValue('vehicleId', e ? e.value : ""); setValue('plate', e ? e.label : "") }}
                                            options={vehicleOptions}
                                        />}
                                    </Col>
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
                                                            <td style={{ backgroundColor: "#ddffff",borderBottomWidth:0 }}>R$ {item.value ? item.value.toFixed(2).replace('.', ',') : '0,00'}</td>
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
                )}
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