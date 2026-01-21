"use client"
import { Row, Col, Form, Button, Card, Table,
    UncontrolledAccordion, Accordion, AccordionBody, AccordionHeader, AccordionItem,  
 } from "reactstrap";
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import LoadingGif from  "../ElementsUI/LoadingGif";
import AlertMessage from "../ElementsUI/AlertMessage";
import { useState, useEffect, Fragment } from "react";

export default function FormTrocarSenha({userId,externalAction}){

    const { "token2": token2 } = parseCookies();
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

    const {
           register,
           handleSubmit,
           setError,
           clearErrors,
           control,
           setValue,
           getValues,
           formState: { errors },
         } = useForm({/*  defaultValues: {}*/});

    
    function checkEqualInput(value) {
       let password;
       let hasErrors = false;
           
       password = getValues('newPassword');
       if(value != password) { 
          setError('confirmPassword',{ type:'manual', message:'Campo não confere com a senha'});
          hasErrors = true;
       }
       else { clearErrors('confirmPassword');}
          
      return hasErrors;
    }
   

    function submit(formData){
        
        if(checkEqualInput(formData["confirmPassword"])) return;

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `admin/${userId}/password`, {method: "PATCH",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2,
          },
          body: JSON.stringify(formData)
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
                 showAlert("success", "Senha alterada com sucesso!");
                 externalAction();
               break;
               case 401:
                 showAlert("danger",body.message || "Erro de Autorizacao!");
               break;
               case 404:
                 showAlert("danger",body.message || "Erro ao alterar Senha!");
               break;
               
           }
        })
        .catch((error) => {
           console.log(error);
        }) 
    }
    
    return (
        <>
         { loading && <LoadingGif/>}

         <Form onSubmit={handleSubmit(submit)}>

            <Row className="d-flex mt-3">
             <Col sm="12">
               <InputForm
                 id="currentPassword"
                 name="currentPassword"
                 label="Digite a Senha Atual*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="password"
                 errors={errors}
               />
             </Col>
           </Row>

           <Row className="d-flex mt-3">
             <Col sm="12">
               <InputForm
                 id="newPassword"
                 name="newPassword"
                 label="Digite a Nova Senha*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="password"
                 errors={errors}
               />
             </Col>
           </Row>

           <Row className="d-flex mt-3">
             <Col sm="12">
               <InputForm
                 id="confirmPassword"
                 name="confirmPassword"
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

           <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Salvar
                </Button>
           </Row>

         </Form>

         {activeAlert && (
            <AlertMessage type={alert["type"]}
                text={alert["text"]}
                isOpen={isOpen}
                toggle={onDismiss}>
            </AlertMessage>
         )}

        </>
    );
          




}