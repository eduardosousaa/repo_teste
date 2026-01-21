"use client"
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import { Row, Col, Form, Button } from "reactstrap";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import LoadingGif from  "../ElementsUI/LoadingGif";
import MaskCPF from "../../Utils/MaskCPF";
import MaskTelefone from "../../Utils/MaskTelefone";
import { useState,useEffect } from "react";

export default function FormDadosPessoais({data,setData,apiErrors}) {

    /* "fullName": "string",
    "cpf": "string",
    "rg": "string",
    "emailPrimary": "string",
    "emailSecondary": "string",
    "phonePrimary": "3392-215-8835",
    "phoneSecondary": "1761-105-2921",
 */

    const { "token2": token2 } = parseCookies();
    const [loading, setLoading] = useState(false);

    const {
	  	register,
	  	handleSubmit,
	  	setError,
	  	clearErrors,
	  	control,
	  	setValue,
      getValues,
	  	formState: { errors },
	  } = useForm({ defaultValues: data.person });

    function getPersonCPF(e){
       MaskCPF(e);
       if(e.target.value.length == 14){
          setLoading(true);
          fetch(Constantes.urlBackAdmin + `person/${e.target.value}`, {method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Module": "ADMINISTRATION",
                    "Authorization": token2
                },})
                .then((response) => 
                     response.json().then(data => ({
                               status: response.status, 
                               body: data }))
                ) 
                .then(({ status, body}) => {
                     console.log(body);
                     switch(status){
                         case 200:
                           delete body.person.id;
                           setData({
                              ...data,
                              person: {...body.person, 
                                          emailPrimaryConfirm: body.person.emailPrimary,
                                          emailSecondaryConfirm: body.person.emailSecondary },
                              address:body.address,
                              accountBanks: body.accountBanks,
                             /*  employee: data.employee,
                              kinship: data.kinship,
                              confirmed: data.confirmed */
                           });
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
    }

    function checkEqualInput(value, name) {
       let email;
       let hasErrors = false;
        switch(name){
           case 'emailPrimaryConfirm':
              email = getValues('emailPrimary');
              if(value != email) { 
                 setError('emailPrimaryConfirm',{ type:'manual', message:'Campo não confere com email primário'});
                 hasErrors = true;
              }
              else { clearErrors('emailPrimaryConfirm');}
              break;   
           case 'emailSecondaryConfirm':
              email = getValues('emailSecondary');
              if(value != email) { 
                 setError('emailSecondaryConfirm',{ type:'manual', message:'Campo não confere com email secundário'});
                 hasErrors = true;
              }
              else { clearErrors('emailSecondaryConfirm');}
              break;  
        }
      return hasErrors;
    }

    function submit(formData){

      if(checkEqualInput(formData['emailPrimaryConfirm'],'emailPrimaryConfirm')) return;
      if(checkEqualInput(formData['emailSecondaryConfirm'],'emailSecondaryConfirm')) return;
      data.confirmed.push("person");
      setData({...data, person: formData, confirmed: data.confirmed});
    }

    useEffect(() => {
        
      if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){

         Object.keys(apiErrors).forEach((key) => {
           setError(key, {type: "custom", message: apiErrors[key]});
         });
      }

    },[apiErrors]);

    useEffect(() => {
        let formValues = getValues();
        if(JSON.stringify(data.person) !== JSON.stringify(formValues) && !data.confirmed.includes("person")){
            for(const [key,value] of Object.entries(data.person)){
               setValue(key,value);
            }
        }

    },[data]);

    return (
        <>
        { loading && <LoadingGif/>}
         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3">
              <Col sm="9">
                 <InputForm
                  id="fullName"
                  name="fullName"
                  label="Nome Completo*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  type="text"
                  errors={errors}
                 />
              </Col>
              <Col sm="3">
                 <InputForm
                   id="dateOfBirth"
                   name="dateOfBirth"
                   label="Data de Nascimento"
                   register={register}
                   required={false}
                   type="date"
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
               <Col sm="4">
                 <InputForm
                   id="cpf"
                   name="cpf"
                   label="CPF*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   onChange={(e) => getPersonCPF(e)}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="4">
                 <InputForm
                   id="rg"
                   name="rg"
                   label="RG"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="text"
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="6">
                 <InputForm
                  id="emailPrimary"
                  name="emailPrimary"
                  label="Email*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  type="text"
                  errors={errors}
                 />
               </Col>
              <Col sm="6">
                 <InputForm
                   id="emailPrimaryConfirm"
                   name="emailPrimaryConfirm"
                   label="Confirme o email*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   onChange={(e) => checkEqualInput(e.target.value,'emailPrimaryConfirm')}
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="6">
                 <InputForm
                  id="emailSecondary"
                  name="emailSecondary"
                  label="Email secundário"
                  placeholder="--Digite--"
                  register={register}
                  required={false}
                  type="text"
                  errors={errors}
                 />
               </Col>
              <Col sm="6">
                 <InputForm
                   id="emailSecondaryConfirm"
                   name="emailSecondaryConfirm"
                   label="Confirme o email secundário"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="text"
                   onChange={(e) => checkEqualInput(e.target.value,'emailSecondaryConfirm')}
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="2">
                 <InputForm
                  id="phonePrimary"
                  name="phonePrimary"
                  label="Telefone 1*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  onChange={(e) => MaskTelefone(e)}
                  type="text"
                  errors={errors}
                 />
               </Col>
              <Col sm="2">
                 <InputForm
                   id="phoneSecondary"
                   name="phoneSecondary"
                   label="Telefone 2"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   onChange={(e) => MaskTelefone(e)}
                   type="text"
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Confirmar
                </Button>
           </Row>

         </Form>
        </>
    );


}