"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody,
         Nav, NavItem, NavLink 
 } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../fornecedores.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDadosPessoais from "../../../../../src/Components/Forms/FormDadosPessoais";
import FormDadosEmpresa from "../../../../../src/Components/Forms/FormDadosEmpresa";
import FormEndereco from "../../../../../src/Components/Forms/FormEndereco";
import FormDadosBancarios from "../../../../../src/Components/Forms/FormDadosBancarios";
import FormCategorias from "../../../../../src/Components/Forms/FormCategorias";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState([]);
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

   const [typeSupplier, setTypeSupplier] = useState("person");

   const [accordionErrors, setAccordionErrors] = useState([]);

   const toggle = (id) => {
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
                       emailPrimary:"",
                       emailSecondary:"",
                       phonePrimary:"",
                       phoneSecondary:""},
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
                    categories: [],
                    confirmed:[]
   });

   const [errors, setErrors] = useState({
      person:{},
      company:{},
      address:{},
      accountBanks:{},
      categories:{}
   });

   function removeConfirmed(name) {
      setData({...data, confirmed: data.confirmed.filter((c) => c != name)});
   }

   function submit(){

      if(open.length != 0) return showAlert("danger", "Confirme os dados!");

      const formData = new FormData();
      let post = {...data};
      
      console.log("data",data);
      if(typeSupplier == "person"){ 
          if(post.person.phoneSecondary == "") post.person.phoneSecondary = null;
          delete post.company;
      }
      if(typeSupplier == "company"){ 
         if(post.company.legalNature == "") post.company.legalNature = null;
          delete post.person;
      }
      if(post.documents){
         post.documents = post.documents.map((doc) => {
           if(doc.doc == "cartao_cnpj") formData.append("cnpj",doc.file,"cnpj");
           if(doc.doc == "contrato_social") formData.append("socialContract",doc.file,"socialContract");
         });
      }
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("supplier",jsonBlob,"supplier.json");

      setLoading(true);
                       
      let url = "supplier";
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
                 showAlert("success", "Fornecedor cadastro com sucesso!");
                 router.push("/admin/fornecedores");
               break;
               case 400:
                 let apiErrors = {
                              person:{},
                              company:{},
                              address:{},
                              accountBanks:{},
                              categories:{}};
                 let sectionError = [];
                 Object.keys(body).forEach((error) => {
                     if(!sectionError.includes(error.split(".")[0])) sectionError.push(error.split(".")[0]);
                     if(error = "categories") {
                        apiErrors[error] = body[error];
                     }else{
                        apiErrors[error.split(".")[0]][error.split(".")[1]] = body[error];
                     }
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
      setOpen([typeSupplier])
   },[typeSupplier]);

   
   return (<>

         { loading && <LoadingGif/>}


        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro de Fornecedor</h1>
        </CardHeader>
        
        <Nav tabs className={styles.navbar}>
           <NavItem style={{cursor:"pointer"}}>
             <NavLink active={typeSupplier == "person"} onClick={() => {setTypeSupplier("person");}} 
                      className={styles.navlink}>Pessoa Física</NavLink>
           </NavItem>
           <NavItem style={{cursor:"pointer"}}>
           <NavLink active={typeSupplier == "company"} onClick={() => {setTypeSupplier("company");}}
                    className={styles.navlink}>Pessoa Jurídica</NavLink>
           </NavItem>
        </Nav>
        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
            <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader targetId={typeSupplier} onClick={() => {removeConfirmed(typeSupplier)}}>
                     <span className={styles.accordionTitle}>Dados do Fornecedor*</span></AccordionHeader>
                  <AccordionBody accordionId={typeSupplier} style={{padding:"15px"}}>
                   {typeSupplier == "person" && <FormDadosPessoais data={data} setData={setData} apiErrors={errors.person}/>}
                   {typeSupplier == "company" && <FormDadosEmpresa data={data} setData={setData} apiErrors={errors.company} myCompany={false}/>}
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
                 <AccordionHeader targetId="categories" onClick={() => {removeConfirmed("categories")}}>
                  <span className={styles.accordionTitle}>Categorias*</span></AccordionHeader>
                 <AccordionBody accordionId="categories" style={{padding:"15px"}}>
                    <FormCategorias data={data} setData={setData} apiErrors={errors.categories}/>
                  </AccordionBody>
               </AccordionItem>
               {/* <AccordionItem>
                 <AccordionHeader targetId="3"><span className={styles.accordionTitle}>Documentos Obrigatórios Cargo</span></AccordionHeader>
               </AccordionItem> */}
            </Accordion>    
             
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button onClick={() => submit()}
                        style={{ backgroundColor: "#009E8B", width:"100px", height:"60px"}}>
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