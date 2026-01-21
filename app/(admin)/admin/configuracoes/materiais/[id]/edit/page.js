"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams,useSearchParams } from "next/navigation";
import { UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../materiais.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormConfiguracoes from "../../../../../../../src/Components/Forms/FormConfiguracoes";

export default function Edit() {

   const { "token2": token2 } = parseCookies();

   const [loading, setLoading] = useState(true);
   const [loadingSubmit, setLoadingSubmit] = useState(false);

   const params = useParams();
   
   const [type, setType] = useState("categoria");

   const router = useRouter();

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

   const [data, setData] = useState({});

   const [errors, setErrors] = useState({});

   function getCategory(id){
        fetch(Constantes.urlBackAdmin + `category/${id}`, {
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
   
   function getTypeProduct(id){
        fetch(Constantes.urlBackAdmin + `product_type/${id}`, {
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
                    setData({name: body.name,
                        category: body.category,
                        ncms: body.ncm,
                        catMats: body.catMat,
                        quantityStock: body.quantityStock,
                        maxStock: body.maxStock,
                        minStock: body.minStock});
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

   function submit(data){
      console.log(data);
      
      let url;
      
      if(type == "categoria"){ url =  `category/${params.id}`; data.service = false;}
      if(type == "tipo_produto"){ 
          url =  `product_type/${params.id}`; 
          data.ncm = data.ncms;
          data.catMat = data.catMats; 
      }

      if(data.type != undefined && data.type == ""){
         data.type = null;
      }

      setLoadingSubmit(true);

      fetch(Constantes.urlBackAdmin + url, {
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
           setLoadingSubmit(false);
           switch(status){
               case 201:
                 showAlert("success", "Material cadastrado com sucesso!");
                 router.push("/admin/configuracoes/materiais");
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


    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.get('type')) {
         setType(urlParams.get('type'));
         if(urlParams.get('type') == "categoria") getCategory(params.id);
         if(urlParams.get('type') == "tipo_produto") getTypeProduct(params.id);
      }
      
      
   },[params]);

   return (<>{ loading == true  ? <LoadingGif/> : <>

        { loadingSubmit && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Edição de {type == "categoria" && "Categoria"} 
                                                      {type == "tipo_produto" && "Tipo de Produto"} </h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <UncontrolledAccordion defaultOpen={["configuracao"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="configuracao" */><span className={styles.accordionTitle}>Dados de {type == "categoria" && "Categoria"}
                                                                                                                  {type == "tipo_produto" && "Tipo de Produto"}</span></AccordionHeader>
                  <AccordionBody accordionId="configuracao" style={{padding:"15px"}}>
                    <FormConfiguracoes type={type} data={data} submitData={submit} apiErrors={errors} />
                  </AccordionBody>
               </AccordionItem>
            </UncontrolledAccordion>    
             
          
           {/*  <Row className="d-flex mt-3 justify-content-end">
                <Button onClick={() => submit()}
                        style={{ backgroundColor: "#009E8B", width:"25%", height:"60px"}}>
                  Salvar
                </Button>
             </Row> */} 
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