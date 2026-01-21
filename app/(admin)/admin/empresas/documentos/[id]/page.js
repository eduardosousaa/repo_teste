"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { get, useForm } from "react-hook-form";
import { UncontrolledAccordion, Accordion, AccordionBody, AccordionHeader, AccordionItem , 
         Col, Row, Button, Label, Card,CardHeader,CardBody, Table, Form } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../empresas.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDocumento from "../../../../../../src/Components/Forms/FormDocumento";
import AsyncSelectForm from "../../../../../../src/Components/ElementsUI/AsyncSelectForm";
import PaginationStyle from "../../../../../../src/Components/ElementsUI/PaginationStyle";
import FormatarData from "../../../../../../src/Utils/FormatarData";

export default function Edit() {

   const { "token2": token2 } = parseCookies();

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

   const [loading, setLoading] = useState(false);
   const [loadingSubmit, setLoadingSubmit] = useState(false);
  
   const router = useRouter();
   const params = useParams();

   const {
      register,
      handleSubmit,
      setError,
      clearErrors,
      control,
      setValue,
      getValues,
      formState: { errors },
    } = useForm({ /* defaultValues: data  */});

   
   const [companyDocument, setCompanyDocument] = useState({});

   const [historicDocuments, setHistoricDocuments] = useState(["first_open"]);
   // Paginação do Histórico
   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);
                                                            
   const [alert, setAlert] = useState([]);
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

   const [open, setOpen] = useState();

   const toggle = (id) => {
      if(open === id){
         setOpen();
      }else{
         setOpen(id);  
      }
   };

   const [data, setData] = useState({documentGroup:{id:"",name:""}});

   const employeeOptions = (teste) => {

        let url;
        let query = {};
        query.size = 100;
        query.fullName = teste;
        query.active = true;
        url =  "employee?" + new URLSearchParams(query);
        
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
              "label": dado.fullName
             }));
          
          return dadosTratados;
        });
   }

   function getCompanyDocument(id){

       fetch(Constantes.urlBackDocuments + `company/documents/${id}`, {
              method: "GET",
              headers: {
                  "Module": "ADMINISTRATION",
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
                if(body.link != null && !body.link.includes("https://")) body.link = "https://" + body.link;
                setCompanyDocument({ ...body, documentUserAlerts: body.documentUserAlerts.length > 0  ? body.documentUserAlerts 
                                                                 : body.documentsGroup.userAlerts.map((a) => {a.employee = {id:"", value:""};return a})});
                setData({documentsGroup: body.documentsGroup});
                getHistoric(id);
               break;
               case 400:
                 console.log("erro:",body);
                 setLoading(false);
               break;
               case 404:
                 console.log("erro:",body);
                 setLoading(false);
               break;
               
           }
        })
        .catch((error) => {
           console.log(error);
        }) 
   }

   function getHistoric(id){

        let query = {};
        query.page = number;
        query.size = size;

        fetch(Constantes.urlBackDocuments + `company/documents/history/${id}?` + new URLSearchParams(query), {
            method: "GET",
            headers: {
                "Module": "ADMINISTRATION",
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
                 setHistoricDocuments(body.content);
                 setNumber(body.page.number);
                 setSize(body.page.size);
                 setTotalElements(body.page.totalElements);
                 setTotalPages(body.page.totalPages);
                break;
                case 401:
                  console.log("erro:",body);
                  showAlert("danger", "Erro de Autorização!");
                break;
                case 404:
                  console.log("erro:",body);
                  showAlert("danger", body.message);
                break;
             }
             setLoading(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function submitAlerts(){

      let url = `company/documents/alert/${params.id}`;
      let data = getValues("documentUserAlerts");
      fetch(Constantes.urlBackDocuments + url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION",
                "Authorization": token2
            },
            body: JSON.stringify(data)
      })
      .then((response) => 
           response.status == 201 ? {status: response.status, body:  null} :
           response.json().then(data => ({
                          status: response.status, 
                          body: data }))
      ) 
      .then(({status, body}) => {
           switch(status){
               case 201:
                 showAlert("success", "Alerta alterado com sucesso!");
               break;
               case 400:
                 console.log("erro:",body);
                 showAlert("danger", "Preencha os dados obrigatórios!");
               break;
               case 404:
                 console.log("erro:",body);
                 showAlert("danger",body.message);
               break;
               
           }
      })
      .catch((error) => {
         console.log(error);
      })

   }

   function submit(data){

      console.log(data);
     
      const formData = new FormData();
      let post = {...data};
      
      if(post.document){
         formData.append("file",post.document.file,"file");
      }
      console.log(post)
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("document",jsonBlob,"document.json");

      setLoadingSubmit(true);

      let url = "company/documents";
      fetch(Constantes.urlBackDocuments + url, {
            method: "POST",
            headers: {
                "Module": "ADMINISTRATION",
                "Authorization": token2
            },
            body: formData
      })
      .then((response) => 
           response.status == 201 ? {status: response.status, body:  null} :
           response.json().then(data => ({
                          status: response.status, 
                          body: data }))
      ) 
      .then(({status, body}) => {
           setLoadingSubmit(false);
           switch(status){
               case 201:
                 showAlert("success", "Documento cadastrado com suscesso!");
                 setLoading(false);
                 getHistoric(params.id);
               break;
               case 400:
                 console.log("erro:",body);
                 showAlert("danger", "Preencha os dados obrigatórios!");
               break;
               case 404:
                 console.log("erro:",body);
                 showAlert("danger",body.message);
               break;
               
           }
      })
      .catch((error) => {
         console.log(error);
      }) 
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
      if(params.id && !historicDocuments.includes("first_open")) {
         getHistoric(params.id);
      } 
   },[number,size]);

   useEffect(() => {
      getCompanyDocument(params.id);
   },[params]);

   return (<>
       { loading == true  ? <LoadingGif/> : <>

       { loadingSubmit && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Upload de Documento</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <UncontrolledAccordion defaultOpen={["documento"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="configuracao" */></AccordionHeader>
                  <AccordionBody accordionId="documento" style={{padding:"15px"}}>
                    
                    <Row className="d-flex mt-3">
                       <Col sm="6">    
                         <Label style={{height:"25px",fontSize:"25px",fontWeight:"bold"}}>Tipo de Documento</Label><br/>
                         <Label style={{height:"25px",fontSize:"22px"}}>{companyDocument.documentsGroup?.name}</Label> 
                       </Col>
                    </Row>

                    <Row className="d-flex mt-3">
                       <Col sm="6">
                         <Label style={{height:"25px",fontSize:"20px"}}>Link de Renovação: <a href={companyDocument.link} style={{color:"#1FCEC9",wordBreak:"break-word"}}
                                                                                              target="_blank" rel="noopener noreferrer" passHref>{companyDocument.link}</a></Label><br/>
                       </Col>
                    </Row>

                    <div style={{fontSize: "1.25rem",marginTop:"20px", marginBottom:"20px"}}>Histórico</div>

                    <Accordion open={open} toggle={toggle}>
                       <AccordionItem>
                         <AccordionHeader targetId={"doc_new"} onClick={() => {setData({documentsGroup: data.documentsGroup})}}>Novo Documento +</AccordionHeader>
                         <AccordionBody accordionId={"doc_new"}>
                            {open == "doc_new" && <FormDocumento data={data} edit={true} readOnly={false} submitData={submit} apiErrors={errors}/>}
                         </AccordionBody>
                       </AccordionItem>
                      { historicDocuments.map((document,index) => 
                       <AccordionItem key={index}>
                         <AccordionHeader targetId={`doc_${index}`} onClick={() => {setData({documentsGroup: data.documentsGroup,
                                                                                             version: document.version,
                                                                                             issuingAgency: document.issuingAgency,
                                                                                             documentNumber: document.documentNumber,
                                                                                             emissionDate: document.emissionDate,
                                                                                             expirationDate: document.expirationDate,
                                                                                             link: document.link})}}> 
                                          Versão: {document.version} - {FormatarData(document.expirationDate,"dd/MM/yyyy")}</AccordionHeader>
                         <AccordionBody accordionId={`doc_${index}`}>
                             {open == `doc_${index}` && <FormDocumento data={data} edit={true} readOnly={true} submitData={submit} apiErrors={errors}/>}
                         </AccordionBody>
                       </AccordionItem>)}
                    </Accordion>

                    <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={historicDocuments.length} totalElements={totalElements} totalPages={totalPages}/>

                    <Form onSubmit={handleSubmit(submitAlerts)}>
                      <div style={{fontSize: "1.25rem",marginTop:"20px", marginBottom:"20px",
                                   paddingTop:"20px",borderTop: "1px solid rgb(222, 226, 230)"}}>Alarmes</div>
                      {windowWidth > 795 &&
                        <Table>
                            <thead>
                              <tr style={{fontSize:"1.2rem"}}>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>Número Limite de Dias</th>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>Funcionários</th>
                              </tr>
                            </thead>
                            <tbody>
                              {  companyDocument.documentUserAlerts?.map((alert,index,alerts) => 
                                 <tr key={index}>
                                  <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.name}</td>
                                  <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.numberLimitDay}</td>
                                  <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>
                                      <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].userAlertId`,{value: alert.id})}></input>
                                      <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].employeeId`,{value: alert.employee.id})}></input>
                                      <AsyncSelectForm
                                       id={`documentUserAlerts[${index}].employeeId`}
                                       name={`documentUserAlerts[${index}].employeeId`}
                                       label=""
                                       placeholder="--Selecione--"
                                       register={register}
                                       defaultValue={{value: alert.employee.id , label: alert.employee.name}}
                                       onChange={(e) => {setValue(`documentUserAlerts[${index}].employeeId`,e ? e.value : "")}}
                                       required={true}
                                       options={employeeOptions}
                                       errors={errors}
                                      />
                                  </td>
                                 </tr>
                               )}
                            </tbody>
                        </Table>}
                     
                       {windowWidth <= 795 && <>

                        { companyDocument.documentUserAlerts?.map((alert,index)  => 
                             <Card key={index} style={{borderRadius: "15px",marginTop:"20px",borderRadius:0}}>
                                <CardHeader style={{backgroundColor:"#fff", fontSize: "1.2rem", fontWeight:"bold",borderWidth:2}}>
                                 Nome: {alert.name}
                                </CardHeader>
                                <CardBody style={{backgroundColor:"#ddffff"}}>
                                   <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Número Limite de Dias:</Label> {alert.numberLimitDay}<br/>
                                   <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Funcionários:</Label>
                                   <div style={{display:"inline-block"}}>
                                       <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].userAlertId`,{value: alert.id})}></input>
                                       <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].employeeId`,{value: alert.employee.id})}></input>
                                       <AsyncSelectForm
                                        id={`documentUserAlerts[${index}].employeeId`}
                                        name={`documentUserAlerts[${index}].employeeId`}
                                        label=""
                                        placeholder="--Selecione--"
                                        register={register}
                                        defaultValue={{value: alert.employee.id , label: alert.employee.name}}
                                        onChange={(e) => {setValue(`documentUserAlerts[${index}].employeeId`,e ? e.value : "")}}
                                        required={true}
                                        options={employeeOptions}
                                        errors={errors}
                                       />
                                   </div>
                                </CardBody>
                             </Card>
                           )}
                        </>}

                        <Row className="d-flex mt-3 mb-3 justify-content-end">
                            <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                              Salvar
                            </Button>
                        </Row>
                    </Form>
                  </AccordionBody>
               </AccordionItem>
            </UncontrolledAccordion>   
        </CardBody>    
       
        {activeAlert && (
            <AlertMessage type={alert["type"]}
                text={alert["text"]}
                isOpen={isOpen}
                toggle={onDismiss}>
            </AlertMessage>
         )}
       
    </>}</>)
  }