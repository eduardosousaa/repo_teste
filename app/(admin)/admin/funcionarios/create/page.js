"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../pessoas.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDadosPessoais from "../../../../../src/Components/Forms/FormDadosPessoais";
import FormEndereco from "../../../../../src/Components/Forms/FormEndereco";
import FormDadosBancarios from "../../../../../src/Components/Forms/FormDadosBancarios";
import FormFuncionario from "../../../../../src/Components/Forms/FormFuncionario";
import FormContatosEmergencia from "../../../../../src/Components/Forms/FormContatosEmergencia";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState(["person"]);
   const [loading, setLoading] = useState(false);

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

   const [accordionErrors, setAccordionErrors] = useState([]);

   const toggle = (id) => {
        /*  if(open === id){
            setOpen();
         }else{
            setOpen(id);  
         } */

         if(open.includes(id)){
            setOpen(open.filter((e) => e != id)); 
         }else{
            setOpen([...open,id]);
         } 
   };

   const [data, setData] = useState({
                    person:{
                       fullName:"",
                       dateOfBirth:"",
                       cpf:"",
                       rg:"",
                       emailPrimary:"",
                       emailPrimaryConfirm:"",
                       emailSecondary:"",
                       emailSecondaryConfirm:"",
                       phonePrimary:"",
                       phoneSecondary:""},
                    address:{
                       address: "",
                       zip: "",
                       neighborhood: "",
                       number: "",
                       complement: "",
                       city: "",
                       state: ""},
                    accountBanks:[],
                    employee:{
                       company: null,
                       typeLink:null,
                       position: null,
                       sector:"",
                       registration:"",
                       contractDate:"",
                       workload:"",
                       salary:"",
                       benefits:""
                    },
                    kinship:[],
                    confirmed:[]
   });

   const [errors, setErrors] = useState({
      person:{},
      address:{},
      accountBanks:{},
      employee:{},
      kinship:{}
   });

   function removeConfirmed(name) {
      setData({...data, confirmed: data.confirmed.filter((c) => c != name)});
   }

   function submit(){
      console.log(open);
      if(open.length != 0) return showAlert("danger", "Confirme os dados!");
                       

      const formData = new FormData();
      let post = {...data};
      
      console.log("data",data);
      if(post.person.phoneSecondary == "") post.person.phoneSecondary = null;
      
      if(post.documents){
         post.documents = post.documents.map((doc) => {
            formData.append("files",doc.file,doc.doc);
            return { doc: doc.doc,
                     expiration: doc.expiration,
                     initial: doc.initial,
                     positionDocuments: doc.positionDocuments,
                     documentUserAlerts: doc.documentUserAlerts
            }
         });
      }
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("employees",jsonBlob,"employees.json");

      setLoading(true);

      let url = "employee";
      fetch(Constantes.urlBackAdmin + url, {
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
                 showAlert("success", "Funcionário cadastro com sucesso!");
                 router.push("/admin/funcionarios");
               break;
               case 400:
                 let apiErrors = {
                              person:{},
                              address:{},
                              accountBanks:{},
                              employee:{},
                              kinship:{}
                           };
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
     /*  accordionErrors.forEach((accordion) =>{ 
         setOpen(accordion);
         showAlert("danger", "Preencha os dados obrigatórios!");
         return;
      }); */
      
   },[accordionErrors]);

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro de Funcionário</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader targetId="person" onClick={() => {removeConfirmed("person")}}>
                     <span className={styles.accordionTitle}>Dados Pessoais*</span></AccordionHeader>
                  <AccordionBody accordionId="person" style={{padding:"15px"}}>
                    <FormDadosPessoais data={data} setData={setData} apiErrors={errors.person}/>
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
               <AccordionItem>
                 <AccordionHeader targetId="employee" onClick={() => {removeConfirmed("employee")}}>
                    <span className={styles.accordionTitle}>Vínculo*</span></AccordionHeader>
                 <AccordionBody accordionId="employee" style={{padding:"15px"}}>
                    <FormFuncionario data={data} setData={setData} apiErrors={errors.employee}/>
                  </AccordionBody>
               </AccordionItem>

               <AccordionItem>
                 <AccordionHeader targetId="kinship" onClick={() => {removeConfirmed("kinship")}}>
                    <span className={styles.accordionTitle}>Contatos de Emergência</span></AccordionHeader>
                 <AccordionBody accordionId="kinship" style={{padding:"15px"}}>
                    <FormContatosEmergencia data={data} setData={setData} apiErrors={errors.kinship}/>
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
       
    </>)
  }