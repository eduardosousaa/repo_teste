"use client"
import React, { use, useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import {
    Input, Form, Row, Col, Button, CardHeader, CardBody, Card,
    Nav, NavItem, NavLink, Alert, Label, FormGroup, Table
} from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiPackage } from 'react-icons/fi';
import InputForm from '../../../../../../src/Components/ElementsUI/InputForm';
import ModalStyle from  "../../../../../../src/Components/ElementsUI/ModalStyle";
import Constantes from '../../../../../../src/Constantes';
import { parseCookies } from 'nookies';
import FormatarData from '../../../../../../src/Utils/FormatarData';
import FormatarReal from '../../../../../../src/Utils/FormatarReal';

import styles from '../../../outros/outros.module.css';


export default function VisualizarOutroCusto() {
    const { id: costId } = useParams();
    const { "token2": token2 } = parseCookies();
    const router = useRouter();

    const [isLoadingCost, setIsLoadingCost] = useState(true);
    const [apiError, setApiError] = useState('');
    const [otherCostDetails, setOtherCostDetails] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);

    const [photos, setPhotos] = useState([]);
    const [documents, setDocuments] = useState([]);
    
    /* const categoryOptions = [
        { id: 'DESPESAS_FIXAS', name: 'Despesas Fixas' },
        { id: 'DESPESAS_VARIAVEIS', name: 'Despesas Variáveis' },
        { id: 'INVESTIMENTOS', name: 'Investimentos' },
        { id: 'SERVICOS', name: 'Serviços' },
        { id: 'DIVERSOS', name: 'Diversos' },
    ]; */

    /* const getCategoryName = (categoryId) => {
        const category = categoryOptions.find(opt => opt.id === categoryId);
        return category ? category.name : 'N/A';
    }; */


    const fetchOtherCostDetails = async () => {
        setIsLoadingCost(true);
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
            console.log("Detalhes do Custo Diverso carregados (API):", data);
            setOtherCostDetails(data);

    
        } catch (error) {
            console.error('Erro ao buscar detalhes do custo diverso:', error);
            setApiError(error.message || 'Erro ao carregar detalhes do custo.');
        } finally {
            setIsLoadingCost(false);
        }
    };

    useEffect(() => {
        if (token2 && costId) {
            fetchOtherCostDetails();
        }
    }, [token2, costId]);

    useEffect(() => {
     
        if( otherCostDetails?.files && otherCostDetails.files.length > 0){
            let documents = otherCostDetails.files.filter((v) => v.fileType == "DOCUMENT");
            if(documents.length > 0){
                setDocuments(documents.map((document) => {
                         
                  return { arquivo: null,
                           arquivoBlob: Constantes.urlImages + document.path,
                           descricao: document.path.split("/document/")[1]};
                }));
            }

            let photos = otherCostDetails.files.filter((v) => v.fileType == "IMAGE");
            if(photos.length > 0){
                setPhotos(photos.map((photo) => {
                         
                  return { arquivo: null,
                           arquivoBlob: Constantes.urlImages + photo.path,
                           descricao: photo.path.split("/image/")[1]};
                }));
            }
        }
    }, [otherCostDetails]);


    return (<>
        <CardHeader className={styles.header} style={{ justifyContent: "flex-start", alignItems: "center" }}>
            <IoArrowBackCircleSharp style={{ width: "45px", height: "70px", color: "#009E8B", cursor: "pointer" }}
                onClick={() => { router.back() }} />
            <h1 className={styles.header_h1}>
                Informações do custo
            </h1>
            {/* <Button
                className={styles.header_button}
                onClick={() => router.push(`/custos/outros/visualizar/${costId}/edit`)}
                style={{ marginLeft: "auto", width: "120px" }}
            >
                Atualizar
            </Button> */}
        </CardHeader>

        {apiError && (
            <Alert color="danger" className="mx-3">
                <strong>Erro:</strong> {apiError}
            </Alert>
        )}

        {isLoadingCost ? (
            <div className="text-center p-4">
                <p>Carregando detalhes do custo...</p>
            </div>
        ) : (
            <CardBody style={{ width: "90%", backgroundColor: "#fff" }}>
                <Form>
                    <Row className="d-flex mt-3">
                         <Col sm="4">
                             <Label style={{ fontWeight: "bold", fontSize: "20px" }}>Tipo</Label>
                             <p style={{ fontSize: "20px" }}>{otherCostDetails?.typeOtherCostsName || 'N/A'}</p>
                         </Col>
                        
                    </Row>

                    <Row className="d-flex mt-3">
                        <Col sm="12">
                         <Card style={{padding:"20px"}}>
                            <Label style={{ fontWeight: "bold", fontSize: "18px" }}>Observações</Label>
                            <p>{otherCostDetails?.description || 'N/A'}</p>
                         </Card>
                        </Col>
                    </Row>

                    <Row className="d-flex mt-3">
                          <Col sm="4">
                             <Label style={{ fontWeight: "bold", fontSize: "18px" }}>N° Nota Fiscal</Label>
                             <p>{otherCostDetails.invoiceNumber}</p>
                         </Col>

                         <Col sm="4">
                             <Label style={{ fontWeight: "bold", fontSize: "18px" }}>Data de Emissão</Label>
                             <p>{otherCostDetails?.date ? FormatarData(otherCostDetails.date, 'dd/MM/yyyy') : 'N/A'}</p>
                         </Col>

                         <Col sm="4">
                             <Label style={{ fontWeight: "bold", fontSize: "18px" }}>Valor Total</Label>
                             <p>{`R$ ${otherCostDetails?.value}`}</p>
                         </Col>
                    </Row>

                    {invoiceDocBlob != null && <Card className={styles.archiveFormLink} style={{width:"45%"}}>
                         <a href={invoiceDocBlob} target="_blank" rel="noreferrer">nota_fiscal.pdf</a>
                    </Card>}

                    {/* {(otherCostDetails?.files && otherCostDetails.files.length > 0) && (
                        <Row className="d-flex mt-4">
                            <Col sm="12">
                                <h4 style={{ marginBottom: "15px" }}>Anexos</h4>
                            </Col>
                            {otherCostDetails.files[0] && (
                                <Col sm="6">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: '#fff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '5px',
                                        padding: '10px 15px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        justifyContent: 'space-between'
                                    }}
                                        onClick={() => window.open(Constantes.urlImage + otherCostDetails.files[0].path, '_blank')}
                                    >
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                                            {`Nota Fiscal (${otherCostDetails.invoiceNumber || 'N/A'})`}
                                        </p>
                                        <i className="bi bi-download" style={{ fontSize: '1.2rem' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                            </svg>
                                        </i>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )} */}

                    {(documents.length > 0 || photos.length > 0) &&
                      <Card style={{padding:"20px",marginTop:"20px"}}>
                         <Label style={{height:"25px",fontSize:"24px"}}>Anexos</Label>
                         <Row className="d-flex mt-3">
                           {documents.length > 0 && <Col sm="6">
                              {documents.map((document,index) =>  
                                 <Card key={index} className={styles.archiveFormLink}>
                                     <a href={document.arquivoBlob} target="_blank" rel="noreferrer">{document.descricao}</a>
                                 </Card>
                               )}
                           </Col>}
                           {photos.length > 0 && <Col sm="6">
                             <Row>
                                {photos.map((photo,index) =>  
                                   <Col key={index} sm="4" style={{marginBottom:"8px"}}>
                                       <div style={{position:"relative",backgroundColor:"#E5E7EB", padding:"16px",borderRadius: "8px",/* width:"232px",height:"160px" */}}>
         
                                          {/*  <div style={{backgroundColor:"#FFFFFF",
                                                        border:"2px dashed #D1D5DB",
                                                        padding:"16px",
                                                        display:"flex",
                                                        flexDirection:"column",
                                                        alignItems:"center",
                                                        justifyContent:"center",
                                                        width:"200px",height:"118px"}}> */}
            
                                            <img /* style={{width:"200px",maxHeight:"118px"}} */ 
                                                 style={{ cursor:"pointer",width: "100%", height: "auto", maxHeight: "120px", objectFit: "cover"}} src={photo.arquivoBlob}
                                                 onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}/>
                                            <p style={{ cursor:"pointer", fontSize: "12px", textAlign: "center", marginTop: "5px", overflowWrap: "break-word" }}
                                               onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true)}}>{photo.descricao}</p>
                                                      
                                           {/* </div> */}
                                       </div>
                                   </Col>
                                 )}
                             </Row>
                           </Col>}
                         </Row>
                      </Card>}


                    <Row className="d-flex mt-4">
                        <Col sm="12">
                            <h4 style={{ marginBottom: "15px" }}>Lista de Itens</h4>
                            {(otherCostDetails?.distributedCosts && otherCostDetails.distributedCosts.length > 0) ? (
                                <Card style={{ padding: "20px", marginTop: "20px" }}>
                                    <Table className="mt-3">
                                        <thead>
                                            <tr style={{ fontSize: "18px", backgroundColor: "#f8f9fa" }}>
                                                <th style={{ borderTopLeftRadius: "15px", padding: "10px" }}>Detalhes</th>
                                                <th style={{ borderTopRightRadius: "15px", padding: "10px" }}>Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {otherCostDetails.distributedCosts.map((item, index) => (
                                                <tr key={item.id || index} style={{ borderBottom: "1px solid #dee2e6" }}>
                                                    <td style={{ backgroundColor: "#fff", padding: "10px" }}>
                                                        <p style={{ margin: "0" }}>{item.name || 'N/A'}</p>
                                                        <p style={{ margin: "0", fontSize: "0.8em", color: "#666" }}>{item.description || 'N/A'}</p>
                                                    </td>
                                                    <td style={{ backgroundColor: "#fff", padding: "10px" }}>R$ {item.value ? item.value.toFixed(2).replace('.', ',') : '0,00'}</td>
                                                </tr>
                                            ))}
                                            <tr style={{ fontWeight: 'bold', borderTop: "1px solid #000" }}>
                                                <td style={{ textAlign: "left", padding: "10px" }}>Valor total</td>
                                                <td style={{ padding: "10px" }}>R$ {otherCostDetails.value ? otherCostDetails.value.toFixed(2).replace('.', ',') : '0,00'}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </Card>
                            ) : (
                                <Card style={{ padding: "10px", marginBottom: "20px" }}>
                                    Nenhum histórico de auditoria ou distribuição de custos detalhada encontrada.
                                </Card>
                            )}
                        </Col>
                    </Row>

                    <Row className="d-flex mt-4 justify-content-end">
                        <Col sm="auto">
                            <Button
                                color="secondary"
                                size="lg"
                                outline
                                onClick={() => router.back()}
                            >
                                Voltar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        )}

        <ModalStyle size="lg" open={openModal} title={"Imagem"} toggle={() => setOpenModal(!openModal)} noButtons={true}>
            {previewImage && (
               <img
                   src={previewImage}
                   alt="Preview"
                   style={{ maxWidth: "100%", maxHeight: "80vh" }}
               />
            )}
        </ModalStyle>
    </>);
}