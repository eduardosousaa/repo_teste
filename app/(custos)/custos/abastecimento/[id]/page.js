"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { Col, Row, Button, Label, Card,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { BiInfoCircle } from "react-icons/bi";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../abastecimento.module.css";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import ModalStyle from  "../../../../../src/Components/ElementsUI/ModalStyle";
import FormatarData from "../../../../../src/Utils/FormatarData";
import FormatarReal from "../../../../../src/Utils/FormatarReal";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState(["register","address","vehicles"]);
   const [loading, setLoading] = useState(false);

   const router = useRouter();
   const params = useParams();

   const [type, setType] = useState("abastecimento");

   const fuelTypes = [ { id: 'GASOLINE_COMMON', name: 'Gasolina comum' },
                       { id: 'GASOLINE_ADDITIVE', name: 'Gasolina aditivada' },
                       { id: 'DIESEL_S10', name: 'Diesel S10' },
                       { id: 'DIESEL_S500', name: 'Diesel S500' },
                       { id: 'DIESEL_ADDITIVE', name: 'Diesel aditivado' }];


   const [data, setData] = useState({});

   const [openModal, setOpenModal] = useState(false);
   const [previewImage, setPreviewImage] = useState(null);
   
   const [photos, setPhotos] = useState([]);

   const [documents, setDocuments] = useState([/* {arquivo: (formData),
                                                 arquivoBlob: (blob),
                                                 descricao: (string)} */]);

   const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);                                              

   const [columns, setColumns] = useState(["Veículo","Quilometragem","Posto de Combustível","Tipo de Combustível","Data","Valor","Ações"]);

   const [fuelSupplies, setFuelSupplies] = useState([]);

   const [alert, setAlert] = useState({});
   const [activeAlert, setActiveAlert] = useState(false);
   const [isOpen, setIsOpen] = useState(true);
   const onDismiss = () => setIsOpen(false);


   function showAlert(type, text) {
      setIsOpen(false);

      setAlert({
          type: type,
          text: text
      })
      setIsOpen(true)
      setActiveAlert(true)
   }

   const [accordionErrors, setAccordionErrors] = useState([]);

   const toggle = (id) => {
         if(open.includes(id)){
            setOpen(open.filter((e) => e != id)); 
         }else{
            setOpen([...open,id]);
         } 
   };

  
   function getFuelSupply(id){
         fetch(Constantes.urlBackCosts + `supply/${id}`, {
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

   function getInvoice(id){
        fetch(Constantes.urlBackCosts + `supply/invoice/${id}`, {
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

                       if(body.supply.length > 0){
                           setFuelSupplies(body.supply.map((supply) => { 
                               return {
                                       "id":  supply.id,
                                       "vehicle": supply.vehicleName,
                                       "kilometer": supply.kilometer,
                                       "gasStation": supply.supplierName,
                                       "fuelType": fuelTypes.filter((fuel) => fuel.id == supply.fuelType)[0].name,
                                       "date": FormatarData(supply.date,"dd/MM/yyyy"),
                                       "value":  "R$" + FormatarReal(supply.value.toFixed(2)),
                                    };
                           }));
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
    
   function dataForTable(data){
     let tableData = [];
 
     data.forEach(d => 
         tableData.push({
               "vehicle": d.vehicle,
               "kilometer": d.kilometer,
               "gasStation": d.gasStation,
               "fuelType": d.fuelType,
               "date": d.date,
               "value": d.value,
               "actions": actionButtons(d.id)
         })
     );

     return tableData;
   }

   function actionButtons(id){
      console.log(id);
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap"}}>
            <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/custos/abastecimento/${id}?type=abastecimento`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
           </div>;
   }

   useEffect(() => {
      if(accordionErrors.length > 0){
         setOpen(accordionErrors);
         showAlert("danger", "Preencha os dados obrigatórios!");
      }
     /*  accordionErrors.forEach((accordion) =>{ 
         setOpen(accordion);
         showAlert("danger", "Preencha os dados obrigatórios!");
         return;
      }); */
      
   },[accordionErrors]);

   useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.get('type')) {
         if(urlParams.get('type') == "abastecimento") getFuelSupply(params.id);
         if(urlParams.get('type') == "nota") getInvoice(params.id);

         setType(urlParams.get('type'));
      } 

   },[params]);


   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados de {type == "abastecimento" && "Abastecimento"}
                                                     {type == "nota" && "Nota Fiscal"}</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            { type == "abastecimento" && <>
             <Card style={{padding:"20px"}}>
              <Row className="d-flex mt-3">
                 <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Veículo</Label>
                             <p>{data.plate || "-"}</p></Col>
                 <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Tipo de Combustível</Label>
                             <p>{data.fuelType && fuelTypes.filter((fuel) => fuel.id == data.fuelType)[0].name}</p></Col> 
                 <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Posto de Combustível</Label>
                             <p>{data.supplierName}</p></Col> 
              </Row>
              <Row className="d-flex mt-3 mb-3">
                <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Quilometragem</Label>
                            <p>{data.mileage + "km"}</p></Col>
                <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Valor</Label>
                            <p>{data.fuelCost && "R$ " + FormatarReal(data.fuelCost.toFixed(2))}</p></Col> 
                <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Data</Label>
                            <p>{FormatarData(data.date,"dd/MM/yyyy")}</p></Col> 
              </Row>
             </Card>

             { data.invoiceId != null &&  
                <Card style={{padding:"20px",marginTop:"20px"}}> 
                 <Row className="d-flex mt-3">
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>N° da Nota Fiscal</Label>
                               <p>{data.invoiceNumber}</p></Col>
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Data de Emissão</Label>
                               <p>{data.invoiceDate ? FormatarData(data.invoiceDate,"dd/MM/yyyy") : "-"}</p></Col>
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Valor Total</Label>
                               <p>{data.invoiceValue && "R$ " + FormatarReal(data.invoiceValue.toFixed(2))}</p></Col>  
                 </Row>

                 {invoiceDocBlob != null && <Card className={styles.archiveFormLink} style={{width:"30%"}}>
                   <a href={invoiceDocBlob} target="_blank" rel="noreferrer">nota_fiscal.pdf</a>
                  </Card>}
                </Card>
             }
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
            </>}


            { type == "nota" && <>


               <Card style={{padding:"20px"}}> 
                 <Row className="d-flex mt-3">
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>N° da Nota Fiscal</Label>
                               <p>{data.number}</p></Col>
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Data de Emissão</Label>
                               <p>{FormatarData(data.date,"dd/MM/yyyy")}</p></Col>
                   <Col sm="4"><Label style={{ fontWeight: "bold", fontSize: "18px" }}>Valor Total</Label>
                               <p>{ data.value && "R$ " + FormatarReal(data.value.toFixed(2))}</p></Col>  
                 </Row>

                 {invoiceDocBlob != null && <Card className={styles.archiveFormLink} style={{width:"30%"}}>
                   <a href={invoiceDocBlob} target="_blank" rel="noreferrer">nota_fiscal.pdf</a>
                  </Card>}
               </Card>

               
               {fuelSupplies.length > 0 && <Row className="d-flex mt-3">
                   <TableStyle columnNames={columns} data={dataForTable(fuelSupplies)} />
               </Row>}
            </>}
         
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
            <AlertMessage type={alert["type"]}
                text={alert["text"]}
                isOpen={isOpen}
                toggle={onDismiss}>
            </AlertMessage>
         )}
       
    </>)
  }