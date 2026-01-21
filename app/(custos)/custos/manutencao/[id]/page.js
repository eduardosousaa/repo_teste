"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import { FaPlus, FaTrash } from "react-icons/fa6";
import { TiDelete } from "react-icons/ti";
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import ModalStyle from  "../../../../../src/Components/ElementsUI/ModalStyle";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import FormatarReal from "../../../../../src/Utils/FormatarReal";
import FormatarData from "../../../../../src/Utils/FormatarData";
import styles from "../manutencao.module.css";

export default function Page() {


   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(false);

   const params = useParams();

   const [data, setData] = useState({});
   
   const [openModal, setOpenModal] = useState(false);
   const [previewImage, setPreviewImage] = useState(null);
  
   const [photos, setPhotos] = useState([]);

   const [documents, setDocuments] = useState([/* {arquivo: (formData),
                                                 arquivoBlob: (blob),
                                                 descricao: (string)} */]);

   const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);

   const [vehicles, setVehicles] = useState([]);

   function getMaintenance(id){
        fetch(Constantes.urlBackCosts + `manitenance/${id}`, {
                  method: "GET",
                  headers: {
                      "Module": "COSTS",
                      "Authorization": token2
                  }
            })
            .then((response) => 
               response.json().then(data => ({
                   status: response.status, 
                   body: data }))
            ) 
            .then(({ status, body}) => {
               
               switch(status){
                   case 200:
                      setData(body);

                      if(body.maintenanceCosts.length > 0){
                         setVehicles(body.maintenanceCosts.map((cost) => { 
                             return {vehicleId: cost.vehiclePrefix + "/" + cost.vehiclePlate,
                                     value: "R$ " + FormatarReal(String(cost.value.toFixed(2))),
                                     mileage: cost.mileage + " km"
                            };
                         }));
                      }

                      if(body.files.length > 0){
                          let documents = body.files.filter((v) => v.fileType == "DOCUMENT");
                          if(documents.length > 0){
                              setDocuments(documents.map((document) => {
                                       
                                return { arquivo: null,
                                         arquivoBlob: Constantes.urlImages + document.path,
                                         descricao: document.path.split("/document/")[1]};
                              }));
                          }

                          let photos = body.files.filter((v) => v.fileType == "IMAGE");
                          if(photos.length > 0){
                              setPhotos(photos.map((photo) => {
                                       
                                return { arquivo: null,
                                         arquivoBlob: Constantes.urlImages + photo.path,
                                         descricao: photo.path.split("/image/")[1]};
                              }));
                          }
                      }

                   break;
                   case 400:
                     console.log("erro:",body);
                   break;
                   case 404:
                     console.log("erro:",body);
                   break;
                   
               }
               setLoading(false);
            })
            .catch((error) => {
               console.log(error);
            }) 
   }
   
   useEffect(() => {
     getMaintenance(params.id);
   },[params]);

   return (<>

       { loading && <LoadingGif/>}

       <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados da Manutenção</h1>
       </CardHeader>

       <CardBody style={{width:"90%"}}>
        <Row className="d-flex mt-3">
           <Col sm="4">
             <Card style={{padding:"20px"}}>
               <Row className="d-flex mt-3">
                 <Col sm="6"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Responsável</Label>
                             <p>{data.employeeName || "John"}</p></Col>
                 <Col sm="6"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Fornecedor</Label>
                             <p>{data.supplierName || "-"}</p></Col> 
               </Row>
               <Row className="d-flex mt-3">
                 <Col sm="6"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Local</Label>
                             <p>{data.place || "-"}</p></Col>
               </Row>
             </Card>
           </Col>
           <Col sm="8">
             <Card style={{padding:"20px"}}>
               <Label style={{height:"25px",fontSize:"24px"}}>Anexos</Label> 
               <Row className="d-flex mt-3">
                 {documents.length > 0 && <Col sm="5">
                        {documents.map((document,index) =>  
                           <Card key={index} className={styles.archiveFormLink}>
                               <a href={document.arquivoBlob} target="_blank" rel="noreferrer">{document.descricao}</a>
                               {/* <Button color="danger" onClick={() => setDocuments(documents.filter((_,i) => i != index))}
                                       className="p-2" style={{ backgroundColor: '#fff', borderColor: '#dc3545', width: '40px'}}>
                                   <FaTrash style={{color:"#e32c2c",height: "25px"}}/>
                               </Button> */}
                           </Card>
                         )}
                     </Col>}
                 {photos.length > 0 && <Col sm="6">
                      <Row>
                         {photos.map((photo,index) =>  
                            <Col key={index} sm="4" style={{marginBottom:"8px"}}>
                                <div style={{position:"relative",backgroundColor:"#E5E7EB", padding:"16px",borderRadius: "8px",/* width:"232px",height:"160px" */}}>

                                    {/* <TiDelete size={40} color="#e32c2c" style={{position:"absolute",top:"100",left:"180",cursor:"pointer"}} onClick={() => setPhotos(photos.filter((_,i) => i != index))}/> */}
                                    {/* <div style={{backgroundColor:"#FFFFFF",
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

             </Card>
           </Col>  
        </Row>

        <Row className="d-flex mt-3">
          <Card style={{padding:"20px"}}>
            <Label style={{height:"25px",fontSize:"24px",marginBottom:"30px"}}>Distribuição de custos</Label>
           
            <Card style={{padding:"20px",backgroundColor:"#F3F3F3"}}>
              <Row className="d-flex mt-3">
                 <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Número da nota fiscal</Label>
                             <p>{data.invoiceNumber || "-"}</p></Col>
                 <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Data de Emissão</Label>
                             <p>{data.invoiceData ?  FormatarData(data.invoiceData,"dd/MM/yyyy") : "-"}</p></Col>
                 <Col sm="4"/*  style={{textAlign:"end"}} */><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Valor total</Label>
                             <p>{data.invoiceValue ? "R$ " + FormatarReal(String(data.invoiceValue.toFixed(2))) : "-"}</p></Col>
              </Row>


              {invoiceDocBlob != null && <Card className={styles.archiveFormLink} style={{width:"30%"}}>
                   <a href={invoiceDocBlob} target="_blank" rel="noreferrer">nota_fiscal.pdf</a>
              </Card>}


            </Card>

            <Row className="d-flex mt-3">
              <Col sm="12">
                { vehicles.length > 0 ?  
                   <TableStyle columnNames={["Veículo","Valor da Manutenção","Quilometragem"]} data={vehicles}/>  
                  :   
                   <Card style={{padding:"10px",marginBottom:"20px"}}>Não há veículos</Card>
                }
              </Col>
            </Row> 

          </Card>
        </Row>
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
        
       
    </>)
  }