"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../usuarios.module.css";
import { UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem, Label,
         Form, Row, Col, Button,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import InputForm from "../../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../../src/Components/ElementsUI/AsyncSelectForm";

export default function Edit() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState('person');
   const [loading, setLoading] = useState(true);
   const [loadingSubmit, setLoadingSubmit] = useState(false);


   const router = useRouter();
   const params = useParams();

   const [person, setPerson] = useState({});

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
      getValues,
      formState: { errors },
   } = useForm({ defaultValues: {
   }});
                                                   
   function showAlert(type, text) {
      setIsOpen(false);

      setAlert({
          type: type,
          text: text
      })
      setIsOpen(true)
      setActiveAlert(true)
   }

   const profiles = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       url =  "profile?" + new URLSearchParams(query);
       
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
             "label": dado.name,
            }));
         
         return dadosTratados;
       });
   }

   function getUser(id){
        fetch(Constantes.urlBackAdmin + `admin/${id}`, {
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
                     setPerson(body.person);
                     setValue("personId",body.person.id);
                     setValue("username",body.username);
                     setValue("profiles",body.profiles != null ? body.profiles.id : null);
                     setValue("profilesView", body.profiles != null ? {value:body.profiles.id, label:body.profiles.name} : null);
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

   function checkEqualInput(value) {
      let password;
      let hasErrors = false;
          
      password = getValues('password');
      if(value != password) { 
         setError('confirm_password',{ type:'manual', message:'Campo não confere com a senha'});
         hasErrors = true;
      }
      else { clearErrors('confirm_password');}
         
     return hasErrors;
   }

   function submit(data){

      setLoadingSubmit(true);

      if(checkEqualInput(data["confirm_password"])) return;
      if(data["password"] == ""){
         delete data.password;
         delete data.confirm_password;
      }

      delete data.profilesView;
       
      fetch(Constantes.urlBackAdmin + `admin/${params.id}`, {
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
                 showAlert("success", "Usuário editado com sucesso!");
                 router.push("/admin/usuarios");
               break;
               case 400:
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
      getUser(params.id);
   },[params]);

   return (<>
       { loading == true  ? <LoadingGif/> : <>

       { loadingSubmit && <LoadingGif/>}
       
        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Edição de Usuário</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>
            <UncontrolledAccordion defaultOpen={["person","profile_user"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="person" */><span className={styles.accordionTitle}>Dados da Pessoa</span></AccordionHeader>
                  <AccordionBody accordionId="person" style={{padding:"15px"}}>
                    <Row className="d-flex mt-3">
                       <Col sm="4">    
                         <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome Completo</Label><br/>
                         <Label style={{height:"25px",fontSize:"16px"}}>{person.fullName}</Label> 
                       </Col>
                       <Col sm="4">
                         <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CPF</Label><br/>
                         <Label style={{height:"25px",fontSize:"16px"}}>{person.cpf}</Label> 
                       </Col>
                       <Col sm="4">
                         <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Email</Label><br/>
                         <Label style={{height:"25px",fontSize:"16px"}}>{person.email}</Label> 
                       </Col>
                    </Row>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader /* targetId="profile_user" */><span className={styles.accordionTitle}>Dados de Usuário</span></AccordionHeader>
                  <AccordionBody accordionId="profile_user" style={{padding:"15px"}}>
                  <Row className="d-flex mt-3">
                       <Col sm="4">
                           <AsyncSelectForm
                            id="profiles"
                            name="profiles"
                            label="Perfis*"
                            placeholder="--Selecione--"
                            register={register}
                            defaultValue={getValues("profilesView")}
                            onChange={(e) => {setValue(`profiles`,e ? e.value : "")}}
                            required={true}
                            options={profiles}
                            errors={errors}
                           />
                        </Col>
                       <Col sm="8">
                          <InputForm
                            id="username"
                            name="username"
                            label="Nome de Usuário*"
                            placeholder="--Digite--"
                            register={register}
                            required={true}
                            type="text"
                            errors={errors}
                          />
                        </Col>
                    </Row>

                    <Row className="d-flex mt-3">
                       <Col sm="6">
                          <InputForm
                            id="password"
                            name="password"
                            label="Nova Senha"
                            placeholder="--Digite--"
                            register={register}
                            required={false}
                            type="password"
                            errors={errors}
                          />
                        </Col>
                       <Col sm="6">
                          <InputForm
                            id="confirm_password"
                            name="confirm_password"
                            label="Confirme a Senha"
                            placeholder="--Digite--"
                            register={register}
                            required={false}
                            type="password"
                            onChange={(e) => checkEqualInput(e.target.value)}
                            errors={errors}
                          />
                        </Col>
                    </Row>

                  </AccordionBody>
               </AccordionItem>
            </UncontrolledAccordion>    
             
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit"
                        style={{ backgroundColor: "#009E8B", width:"25%", height:"60px"}}>
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
       
    </>}</>)
  }