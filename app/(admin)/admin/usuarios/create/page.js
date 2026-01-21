"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../usuarios.module.css";
import { UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem, 
         Input, Table, Form, Row, Col, Button, Card, CardHeader,CardBody, Label } from 'reactstrap';
import { FaSearch } from "react-icons/fa";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const [open, setOpen] = useState('person');

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
   
   const router = useRouter();
   const [loading, setLoading] = useState(false);

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

   const [accordionErrors, setAccordionErrors] = useState([]);

   const toggle = (id) => {
         if(open === id){
            setOpen();
         }else{
            setOpen(id);  
         }
   };

   const [persons, setPersons] = useState([]);
   /* const [profiles, setProfiles] = useState([]);
 */
   const [personId, setPersonId] = useState("");

   function getPersons(name=""){

      let query = {name: name,
                   notUser: true,
                   active: true,
      }
   
      fetch(Constantes.urlBackAdmin + "person?" + new URLSearchParams(query), {
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
                   setPersons(body.content);
                 break;
                 case 400:
                   console.log("erro:",body);
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

      if(checkEqualInput(data["confirm_password"])) return;

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "admin", {
            method: "POST",
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

           setLoading(false);

           switch(status){
               case 201:
                 showAlert("success", "Usuário cadastro com sucesso!");
                 router.push("/admin/usuarios");
               break;
               case 400:
                 let apiErrors = {};
                 setErrors(apiErrors);
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
      getPersons();

      const handleResize = () => {
         setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
   },[]);
   

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
           <h1 className={styles.header_h1}>Cadastro de Usuário</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>
            <UncontrolledAccordion defaultOpen={["person","profile_user"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="person" */><span className={styles.accordionTitle}>Selecionar Pessoa</span></AccordionHeader>
                  <AccordionBody accordionId="person" style={{padding:"15px"}}>

                      <Row className="d-flex mt-3">
                         <Col sm="4">
                            <InputForm
                              id="search_name"
                              name="search_name"
                              label="Nome*"
                              placeholder="--Digite--"
                              register={register}
                              required={false}
                              type="text"
                              errors={errors}
                            />
                          </Col>
                          <Col sm="2">
                            <Button onClick={() => getPersons(getValues("search_name"))} style={{ backgroundColor: "#009E8B", height:"50px", marginTop:"32px", width:windowWidth > 575 ? "150px" : "100%"}}>
                              Pesquisar <FaSearch color="#fff"/>
                            </Button>
                          </Col>
                      </Row>

                      {windowWidth > 795 && 
                        <Table>
                            <thead>
                              <tr style={{fontSize:"1.2rem"}}>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>CPF</th>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}>E-mail</th>
                               <th style={{backgroundColor:"#fff",borderWidth:2}}></th>
                              </tr>
                            </thead>
                            <tbody>
                              { persons.map((person,index) => 
                                 <tr key={index}>
                                  <td style={{backgroundColor: personId == person.id ? "#1fcec9" : "#ddffff", ...( index == persons.length - 1 && { borderBottomWidth:0})}}>{person.fullName}</td>
                                  <td style={{backgroundColor: personId == person.id ? "#1fcec9" : "#ddffff", ...( index == persons.length - 1 && { borderBottomWidth:0})}}>{person.cpf}</td>
                                  <td style={{backgroundColor: personId == person.id ? "#1fcec9" : "#ddffff", ...( index == persons.length - 1 && { borderBottomWidth:0})}}>{person.emailPrimary}</td>
                                  <td style={{backgroundColor: personId == person.id ? "#1fcec9" : "#ddffff", ...( index == persons.length - 1 && { borderBottomWidth:0})}}>
                                      <div style={{display:"flex",justifyContent:"center"}}>
                                         <Input name="radio" 
                                                type="radio"
                                                {...register("personId",{required:true})}
                                                onClick={() => {setPersonId(person.id);
                                                                 setValue("personId",person.id);
                                                }}
                                                className={styles.radioButton}></Input>
                                      </div>
                                  </td>
                                 </tr>
                               )}
                            </tbody>
                        </Table>}

                      {windowWidth <= 795 && <>
                          { persons.map((person,index)  => 
                              <Card key={index} style={{borderRadius: "15px",marginTop:"20px",borderRadius:0}}>
                                 <CardHeader style={{backgroundColor:"#fff", fontSize: "1.2rem", fontWeight:"bold",borderWidth:2}}>
                                  {person.fullName}
                                 </CardHeader>
                                 <CardBody style={{backgroundColor: personId == person.id ? "#1fcec9" : "#ddffff"}}>
                                    <Label style={{ fontWeight: "bold", fontSize: "16px" }}>CPF:</Label> {person.cpf}<br/>
                                    <Label style={{ fontWeight: "bold", fontSize: "16px" }}>E-mail:</Label> {person.emailPrimary}<br/>
                                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                                       <Input name="radio" 
                                              type="radio"
                                              {...register("personId",{required:true})}
                                              onClick={() => {setPersonId(person.id);
                                                               setValue("personId",person.id);
                                              }}
                                              className={styles.radioButton}></Input>
                                    </div>
                                 </CardBody>
                              </Card>
                            )}
                      </>}
                      { errors?.personId && <div style={{color:"red",fontWeight: "300"}}>{"Selecione uma pessoa"}</div>}
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
                            label="Digite a Senha*"
                            placeholder="--Digite--"
                            register={register}
                            required={true}
                            type="password"
                            errors={errors}
                          />
                        </Col>
                       <Col sm="6">
                          <InputForm
                            id="confirm_password"
                            name="confirm_password"
                            label="Confirme a Senha*"
                            placeholder="--Digite--"
                            register={register}
                            required={true}
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