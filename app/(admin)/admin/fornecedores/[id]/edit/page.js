"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Row, Button,CardHeader,CardBody,
         Nav, NavItem, NavLink 
 } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../fornecedores.module.css";
/* import { Row, Col, Form, FormGroup, Label, Button } from "reactstrap";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; */
import FormDadosPessoais from "../../../../../../src/Components/Forms/FormDadosPessoais";
import FormDadosEmpresa from "../../../../../../src/Components/Forms/FormDadosEmpresa";
import FormEndereco from "../../../../../../src/Components/Forms/FormEndereco";
import FormDadosBancarios from "../../../../../../src/Components/Forms/FormDadosBancarios";
import FormCategorias from "../../../../../../src/Components/Forms/FormCategorias";

export default function Edit() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState(["person"]);
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
                       cpf:"",
                       dateOfBirth:"",
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

   function getSupplier(id){
        fetch(Constantes.urlBackAdmin + `supplier/${id}`, {
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
                    if(body.person != null) setTypeSupplier("person")
                    if(body.company != null) setTypeSupplier("company")

                    Object.keys(body).forEach(key => { 
                       if(key == "person" && body[key] != null){
                           body[key].emailPrimaryConfirm = body[key].emailPrimary
                           body[key].emailSecondaryConfirm = body[key].emailSecondary
                       }
                    });
                    body.confirmed = [];
                    setData(body);
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
               setLoading(false);
            })
            .catch((error) => {
               console.log(error);
            }) 
   }

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

      if(typeSupplier == "person") delete post.company;
      if(typeSupplier == "company") delete post.person;
      if(post.documents){
         post.documents = post.documents.map((doc) => {
           if(doc.doc == "cartao_cnpj") formData.append("cnpj",doc.file,"cnpj");
           if(doc.doc == "contrato_social") formData.append("socialContract",doc.file,"socialContract");
         });
      }
      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("supplier",jsonBlob,"supplier.json");

      setLoadingSubmit(true);
                       
      let url = `supplier/${params.id}`;
      fetch(Constantes.urlBackAdmin + url, {
            method: "PUT",
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
                 showAlert("success", "Fornecedor cadastro com sucesso!");
                 router.push("/admin/fornecedores");
               break;
               case 400:
                 let apiErrors = {
                              person:{},
                              company:{},
                              address:{},
                              accountBanks:{},
                              employee:{}};
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
               break;
               case 404:
                 console.log("erro:",body);
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
      getSupplier(params.id);
   },[params]);

   useEffect(() => {
      setOpen([typeSupplier])
   },[typeSupplier]);


   return (<> {loading == true  ? <LoadingGif/> : <>

        { loadingSubmit && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Edição de Fornecedor</h1>
        </CardHeader>
        
        <Nav tabs className={styles.navbar}>
           {/* <NavItem>
             <NavLink active={typeSupplier == "person"} onClick={() => {setTypeSupplier("person");}} 
                      className={styles.navlink}>Pessoa Física</NavLink>
           </NavItem>
           <NavItem>
           <NavLink active={typeSupplier == "company"} onClick={() => {setTypeSupplier("company");}}
                    className={styles.navlink}>Pessoa Jurídica</NavLink>
           </NavItem> */}
            <NavItem>
           <NavLink active={true} onClick={() => {setTypeSupplier("company");}}
                    className={styles.navlink}>{typeSupplier == "company" && "Pessoa Jurídica"}
                                               {typeSupplier == "person" && "Pessoa Física"}</NavLink>
           </NavItem> 
        </Nav>
        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
            <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader targetId={typeSupplier}><span className={styles.accordionTitle}>Dados do Fornecedor*</span></AccordionHeader>
                  <AccordionBody accordionId={typeSupplier} style={{padding:"15px"}}>
                   {typeSupplier == "person" && <FormDadosPessoais data={data} setData={setData} apiErrors={errors.person}/>}
                   {typeSupplier == "company" && <FormDadosEmpresa data={data} setData={setData} apiErrors={errors.company} myCompany={false}/>}
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="address" onClick={() => {removeConfirmed("address")}}><span className={styles.accordionTitle}>Endereço*</span></AccordionHeader>
                  <AccordionBody accordionId="address" style={{padding:"15px"}}>
                    <FormEndereco data={data} setData={setData} apiErrors={errors.address}/>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="accountBanks" onClick={() => {removeConfirmed("accountBanks")}}><span className={styles.accordionTitle}>Dados Bancários</span></AccordionHeader>
                  <AccordionBody accordionId="accountBanks" style={{padding:"15px"}}>
                    <FormDadosBancarios data={data} setData={setData} apiErrors={errors.accountBanks}/>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                 <AccordionHeader targetId="categories" onClick={() => {removeConfirmed("categories")}}><span className={styles.accordionTitle}>Categorias*</span></AccordionHeader>
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
       
    </>}</>)
  }