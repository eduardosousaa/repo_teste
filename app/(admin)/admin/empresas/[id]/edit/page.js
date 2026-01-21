"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody,Spinner } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../empresas.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDadosEmpresa from "../../../../../../src/Components/Forms/FormDadosEmpresa";
import FormEndereco from "../../../../../../src/Components/Forms/FormEndereco";
import FormDadosBancarios from "../../../../../../src/Components/Forms/FormDadosBancarios";

export default function Edit() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState(["company"]);
   const [loading, setLoading] = useState(true);
   const [loadingSubmit, setLoadingSubmit] = useState(false);

   const router = useRouter();
   const params = useParams();

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

   const [data, setData] = useState({
                    company:{
                       name:"",
                       corporateReason:"",
                       cpf:"",
                       email:"",
                       phone:"",
                       site:"",
                       myCompany:true},
                    address:{
                       address: "",
                       zip: "",
                       neighborhood: "",
                       number: "",
                       complement: "",
                       city: "",
                       state: ""},
                    accountBanks:[],
                    confirmed:[]
   });

   function getCompany(id){
      fetch(Constantes.urlBackAdmin + `company/${id}`, {
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
                  body.confirmed = [];
                  setData(body);
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

   const [errors, setErrors] = useState({
      company:{},
      address:{},
      accountBanks:{},
   });

   function removeConfirmed(name) {
      setData({...data, confirmed: data.confirmed.filter((c) => c != name)});
   }

   function submit(){
      if(open.length != 0) return showAlert("danger", "Confirme os dados!");

      if(data.company.legalNature == "") data.company.legalNature = null;

      /* const formData = new FormData();
      let post = {...data};
      
      console.log("data",data);
      if(post.documents){
         post.documents = post.documents.map((doc) => {
           if(doc.doc == "cartao_cnpj") formData.append("cnpj",doc.file,"cnpj");
           if(doc.doc == "contrato_social") formData.append("socialContract",doc.file,"socialContract");
         });
      }
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("company",jsonBlob,"company.json");
 */

      setLoadingSubmit(true);

      let url = `company/${params.id}`;

      fetch(Constantes.urlBackAdmin + url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION",
                "Authorization": token2,     
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
           setLoadingSubmit(false);
           switch(status){
               case 201:
                 showAlert("success", "Empresa cadastrada com sucesso!");
                 router.push("/admin/empresas");
               break;
               case 400:
                 let apiErrors = {
                              company:{},
                              address:{},
                              accountBanks:{}};
                 let sectionError = [];
                 Object.keys(body).forEach((error) => {
                     if(!sectionError.includes(error.split(".")[0])) sectionError.push(error.split(".")[0]);
                     apiErrors[error.split(".")[0]][error.split(".")[1]] = body[error];
                 })
                 setErrors(apiErrors);
                 setAccordionErrors(sectionError);
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
      console.log(data);
      Object.keys(data).forEach((key) => {
        console.log(data.confirmed);
        if(data.confirmed.includes(key) && open.includes(key)){
           toggle(key);
        }   
      });
   },[data]);

   useEffect(() => {

      if(accordionErrors.length > 0){
         setOpen(accordionErrors);
         showAlert("danger", "Preencha os dados obrigatórios!");
      }
      
   },[accordionErrors]);

   useEffect(() => {
      getCompany(params.id);
   },[params]);

   return (<> 
            { loading == true  ? <LoadingGif/> : <>

        { loadingSubmit && <LoadingGif/>}
        
        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Edição de Empresa</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader targetId="company" onClick={() => {removeConfirmed("company")}}>
                     <span className={styles.accordionTitle}>Dados da Empresa*</span></AccordionHeader>
                  <AccordionBody accordionId="company" style={{padding:"15px"}}>
                    <FormDadosEmpresa data={data} setData={setData} apiErrors={errors.company} myCompany={true}/>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="address" onClick={() => {removeConfirmed("address")}}>
                     <span className={styles.accordionTitle}>Endereço*</span></AccordionHeader>
                  <AccordionBody accordionId="address" style={{padding:"15px"}}>
                    <FormEndereco data={data} setData={setData} apiErrors={errors.address}/>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="accountBanks" onClick={() => {removeConfirmed("accountBanks")}}>
                     <span className={styles.accordionTitle}>Dados Bancários</span></AccordionHeader>
                  <AccordionBody accordionId="accountBanks" style={{padding:"15px"}}>
                    <FormDadosBancarios data={data} setData={setData} apiErrors={errors.accountBanks}/>
                  </AccordionBody>
               </AccordionItem>
               {/* <AccordionItem>
                 <AccordionHeader targetId="3"><span className={styles.accordionTitle}>Documentos Obrigatórios Cargo</span></AccordionHeader>
               </AccordionItem> */}
            </Accordion>    
             
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button onClick={() => submit()}
                        style={{ backgroundColor: "#009E8B", width:"25%", height:"60px"}}>
                  Salvar
                </Button>
             </Row> 
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