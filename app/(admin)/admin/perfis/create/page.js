"use client"
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Row,  
         Form, Col, Button,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm"; 
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../perfis.module.css";
import FormPerfil from "../../../../../src/Components/Forms/FormPerfil";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState("first_open");
   const [loading, setLoading] = useState(false);

   const router = useRouter();

   const [alert, setAlert] = useState({});
   const [activeAlert, setActiveAlert] = useState(false);
   const [isOpen, setIsOpen] = useState(true);
   const onDismiss = () => setIsOpen(false);

   const {
      register,
      handleSubmit,
      setError,
      clearErrors,
      control,
      setValue,
      formState: { errors },
   } = useForm({ /* defaultValues: pessoa */ });


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
         if(open === id){
            setOpen();
         }else{
            setOpen(id);  
         }
   };

   const [data, setData] = useState({
                    name:"",
                    modules:[
                     { name:"ADMINISTRATION", permissions:[]},
                     { name:"ROUTES", permissions:[]},
                     { name:"STOCK", permissions:[]},
                     { name:"PATRIMONY", permissions:[]},
                     { name:"COSTS", permissions:[]}
                    ]
                    
   });

   
   function submit(formData){
      if(open != undefined) return showAlert("danger", "Confirme os dados!");

      let permissions = [];

      data.modules.forEach((module) => {
           permissions = permissions.concat(module.permissions);
      })
                       
      let post = {name: formData.name,
                  permissions: permissions
      };

      console.log(post);

      setLoading(true);
      
      fetch(Constantes.urlBackAdmin + "profile", {
            method: "POST",
            headers: {
                "Module": "ADMINISTRATION",
                "Authorization": token2,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(post)
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
                 showAlert("success", "Perfil cadastro com sucesso!");
                 router.push("/admin/perfis");
               break;
               case 400:
                 let apiErrors = {};
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
      toggle(open == "first_open" ? "administration" : open);
   },[data]);

   useEffect(() => {

      accordionErrors.forEach((accordion) =>{ 
         setOpen(accordion);
         showAlert("danger", "Preencha os dados obrigatórios!");
         return;
      });
      
   },[accordionErrors]);

   return (<>

       { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}> 
            <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                    onClick={() => {router.back()}}/>
         <h1 className={styles.header_h1}>Cadastro de Perfil</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>
              <Row className="d-flex mt-3">
                 <Col sm="4">
                    <InputForm
                     id="name"
                     name="name"
                     label="Nome do Perfil"
                     placeholder="--Digite--"
                     required={true}
                     type="text"
                     register={register}
                     errors={errors}
                    />
                  </Col>
              </Row>

              <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
                 <AccordionItem>
                    <AccordionHeader targetId="administration"><span className={styles.accordionTitle}>Administração</span></AccordionHeader>
                    <AccordionBody accordionId="administration" style={{padding:"15px"}}>
                       <FormPerfil module={"ADMINISTRATION"} data={data} setData={setData}/>
                    </AccordionBody>
                 </AccordionItem>
                {Constantes.urlFrontRoutes != "" && 
                  <AccordionItem>
                      <AccordionHeader targetId="routes"><span className={styles.accordionTitle}>Rotas</span></AccordionHeader>
                      <AccordionBody accordionId="routes" style={{padding:"15px"}}>
                         <FormPerfil module={"ROUTES"} data={data} setData={setData}/>
                      </AccordionBody>
                  </AccordionItem>}
                 {Constantes.urlFrontStock != "" && 
                  <AccordionItem>
                     <AccordionHeader targetId="stock"><span className={styles.accordionTitle}>Estoque</span></AccordionHeader>
                     <AccordionBody accordionId="stock" style={{padding:"15px"}}>
                        <FormPerfil module={"STOCK"} data={data} setData={setData}/>
                     </AccordionBody>
                  </AccordionItem>}
                 {Constantes.urlFrontPatrimony != "" && 
                  <AccordionItem>
                     <AccordionHeader targetId="patrimony"><span className={styles.accordionTitle}>Patrimônio</span></AccordionHeader>
                     <AccordionBody accordionId="patrimony" style={{padding:"15px"}}>
                        <FormPerfil module={"PATRIMONY"} data={data} setData={setData}/>
                     </AccordionBody>
                  </AccordionItem>}
                 {Constantes.urlFrontCosts != "" && 
                  <AccordionItem>
                     <AccordionHeader targetId="costs"><span className={styles.accordionTitle}>Custos</span></AccordionHeader>
                     <AccordionBody accordionId="costs" style={{padding:"15px"}}>
                        <FormPerfil module={"COSTS"} data={data} setData={setData}/>
                     </AccordionBody>
                  </AccordionItem>}
              </Accordion>    
             
              <Row className="d-flex mt-3 justify-content-end">
                  <Button type="submit"
                          style={{ backgroundColor: "#009E8B", width:"100px", height:"60px"}}>
                    Salvar
                  </Button>
              </Row>
            </Form> 
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