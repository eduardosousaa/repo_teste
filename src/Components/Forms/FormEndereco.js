"use client"
import { useEffect } from "react";
import { Row, Col, Form, Button } from "reactstrap";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import MaskCEP from "../../Utils/MaskCEP";
import BuscarDadoCEP from "../../Utils/BuscarDadoCEP";

export default function FormEndereco({data,setData,apiErrors}) {

    /* 
    "address": "string",
    "zip": "21217-348",
    "neighborhood": "string",
    "number": "string",
    "complement": "string",
    "city": "string",
    "state": "string",
 */

    const {
      register,
      handleSubmit,
      setError,
      clearErrors,
      control,
      setValue,
      getValues,
      formState: { errors },
    } = useForm({ defaultValues: data.address});

    function buscarDadoCEP(e){
      MaskCEP(e);
      const data = BuscarDadoCEP(e.target.value);
  
      if(data != null){
         
         data.then( (response) => {

               if(response.erro != undefined) return;
               setValue('address', response.logradouro);
               setValue('neighborhood', response.bairro);
               setValue('city', response.localidade);
               setValue('state', response.uf);   
          });
      }
    }

    function submit(formData){
          data.confirmed.push("address");
          setData({...data, address: formData, confirmed: data.confirmed});
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
        if(JSON.stringify(data.address) !== JSON.stringify(formValues) && !data.confirmed.includes("address")){
            for(const [key,value] of Object.entries(data.address)){
               setValue(key,value);
            }
        }

    },[data]);

    return (
        <>

         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3">
              <Col sm="2">
                 <InputForm
                  id="zip"
                  name="zip"
                  label="CEP*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  onChange={(e) => buscarDadoCEP(e)}
                  type="text"
                  errors={errors}
                 />
               </Col>
              <Col sm="8">
                 <InputForm
                   id="address"
                   name="address"
                   label="Logradouro*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="2">
                 <InputForm
                   id="neighborhood"
                   name="neighborhood"
                   label="Bairro*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="2">
                 <InputForm
                  id="number"
                  name="number"
                  label="Número*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  type="text"
                  errors={errors}
                 />
               </Col>
              <Col sm="5">
                 <InputForm
                   id="complement"
                   name="complement"
                   label="Complemento"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="4">
                 <InputForm
                   id="city"
                   name="city"
                   label="Cidade*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="1">
                 <InputForm
                   id="state"
                   name="state"
                   label="Estado*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
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