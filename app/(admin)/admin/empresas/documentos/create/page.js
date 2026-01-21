"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../empresas.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDocumento from "../../../../../../src/Components/Forms/FormDocumento";

export default function Create() {

   const { "token2": token2 } = parseCookies();
  
   const router = useRouter();
   const [loading, setLoading] = useState(false);

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

   const [data, setData] = useState({documentUserAlerts:[]});

   const [errors, setErrors] = useState({});

   function submit(data){

      const formData = new FormData();
      let post = {...data};
      
      if(post.document){
         formData.append("file",post.document.file,"file");
      }
      console.log(post)
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("document",jsonBlob,"document.json");

      setLoading(true);
                       
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

           setLoading(false);
           
           switch(status){
               case 201:
                 showAlert("success", "Documento cadastrado com sucesso!");
                 router.push("/admin/empresas/documentos");
               break;
               case 400:
                 setErrors(body);
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

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro de Documento</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <UncontrolledAccordion defaultOpen={["documento"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="configuracao" */><span className={styles.accordionTitle}>Dados do Documento</span></AccordionHeader>
                  <AccordionBody accordionId="documento" style={{padding:"15px"}}>
                    <FormDocumento data={data} readOnly={false} submitData={submit} apiErrors={errors}/>
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
       
    </>)
  }