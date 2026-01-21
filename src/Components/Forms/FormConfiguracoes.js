"use client"
import { Row, Col,FormGroup, Input, Label, Form, Button } from "reactstrap";
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import InputForm from "../ElementsUI/InputForm";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import { useState,useEffect } from "react";
import { useForm } from "react-hook-form";
                            /* tipo: categoria, tipo produto, serviço */
export default function FormConfiguracoes({type,data,submitData,apiErrors}){

    const { "token2": token2 } = parseCookies();

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        control,
        setValue,
        getValues,
        formState: { errors },
      } = useForm({ defaultValues: data });

      const [isDisabled, setIsDisabled] = useState(false);
      const [categoryId, setCategoryId] = useState();
      const [fuel, setFuel] = useState(false);

      const categoriaOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        query.active = true;
        url =  "category?" + new URLSearchParams(query);
        
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

      const ncmOptions = (teste) => {
              let url;
              let query = {};
              query.size = 100;
              query.name = teste;

              if(type == "tipo_produto") query.categoryId = getValues("category.id");
              url =  "types/ncm?" + new URLSearchParams(query);
              
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
                    "label": dado.code + " - " + dado.description,
                   }));
                
                return dadosTratados;
              });
      }
      
      const catMatOptions = (teste) => {
             let url;
             let query = {};
             query.size = 100;
             query.name = teste;

             if(type == "tipo_produto") query.categoryId = getValues("category.id");
             url =  "types/cat_mat?" + new URLSearchParams(query);
             
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
                   "label": dado.code + " - " + dado.description,
                  }));
               
               return dadosTratados;
             });
      }

      const catSerOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        url =  "types/cat_ser?" + new URLSearchParams(query);
        
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
              "label": dado.code + " - " + dado.description,
              "type": dado.type
             }));
          
          return dadosTratados;
        });
      }

      function submit(formData){
        formData.type = fuel == true ? "FUEL" : "";
        submitData(formData);

      }

      useEffect(() => {
        if(type == "tipo_produto" && getValues("category") == undefined) setIsDisabled(true);
      },[type]);


      useEffect(() => {
        if(data.type) setFuel(data.type == "FUEL");
      },[]);

      return (
        <>
        <Form onSubmit={handleSubmit(submit)}>
           <Row className="d-flex mt-3">
              <Col sm="12">
               <InputForm
                 id="name"
                 name="name"
                 label="Nome*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="text"
                 errors={errors}
               />
             </Col>
            </Row>
            {type == "tipo_produto" &&
             <Row className="d-flex mt-3">
               <Col sm="12">
                 <AsyncSelectForm
                   id="category"
                   name="category"
                   label="Categoria*"
                   register={register}
                   required={true}
                   options={categoriaOptions}
                   defaultValue={data.category ? {value: data.category.id , label: data.category.name} : null}
                   onChange={(e) => {setValue(`category`, e ? {id: e.value, name: e.label} : null);
                                     if(type == "tipo_produto"){ setIsDisabled(false);
                                                                 setCategoryId(e.value);}}}
                   errors={errors}
                 />
               </Col>
             </Row>}
             
             {type != "servico" &&
            <Row className="d-flex mt-3">
             <Col sm="12" key={categoryId}>
               <AsyncSelectForm
                 id="ncms"
                 name="ncms"
                 label="NCM"
                 register={register}
                 defaultValue={data.ncms.length > 0 ? data.ncms.map((ncm) => {return {value: ncm.id, 
                                                                           label: ncm.code + " - " + ncm.description}}) : null}
                 onChange={(ncms) => {setValue(`ncms`,ncms.map((e) => {
                                                return ({id: e.value,
                                                         code: e.label.split(" - ")[0],
                                                         description: e.label.split(" - ")[1]})}
                           ))}}
                 required={false}
                 options={ncmOptions}
                 isMulti={true}
                 isDisabled={isDisabled} 
                 errors={errors}
               />
             </Col>
            </Row>}

            <Row className="d-flex mt-3">
             <Col sm="12" key={categoryId}>
               <AsyncSelectForm
                 id={type == "servico" ? "catSers" :"catMats"}
                 name={type == "servico" ? "catSers" :"catMats"}
                 label={type == "servico" ? "CAT SER" :"CAT MAT"}
                 register={register}
                 defaultValue={type == "servico" && data.catSers.length > 0 ? 
                                                    data.catSers.map((catSer) => {return {value: catSer.id, 
                                                                                          label: catSer.code + " - " + catSer.description}}) : 
                               type != "servico" && data.catMats.length > 0 ?
                                                    data.catMats.map((catMat) => {return {value: catMat.id, 
                                                                                          label: catMat.code + " - " + catMat.description}}) : 
                                                null}
                 onChange={(e) => {setValue(type == "servico" ? "catSers" :"catMats",
                                            e.map((f) => {
                                              return ({id: f.value,
                                                       code: f.label.split(" - ")[0],
                                                       description: f.label.split(" - ")[1],
                                                       ...(type == "servico" && {type: f.type})})}
                          ))}}
                 required={false}
                 options={type == "servico" ? catSerOptions : catMatOptions}
                 isMulti={true}
                 isDisabled={isDisabled}
                 errors={errors}
               />
             </Col> 
            </Row>

            {type == "tipo_produto" && 
              <Row className="d-flex mt-3">
                 {/* <Col sm="4">
                   <InputForm
                     id="quantityStock"
                     name="quantityStock"
                     label="Quant. em Estoque*"
                     placeholder="--Digite--"
                     register={register}
                     required={true}
                     type="text"
                   />
                 </Col> */}
                 <Col sm="4">
                   <InputForm
                     id="minStock"
                     name="minStock"
                     label="Estoque Mínimo*"
                     placeholder="--Digite--"
                     register={register}
                     required={true}
                     type="text"
                   />
                 </Col>
                 <Col sm="4">
                   <InputForm
                     id="maxStock"
                     name="maxStock"
                     label="Estoque Máximo*"
                     placeholder="--Digite--"
                     register={register}
                     required={true}
                     type="text"
                   />
                 </Col>
               </Row>}

             {type == "categoria" && 
               <FormGroup style={{fontSize:"20px",marginLeft:"15px"}} switch>
                  <Input
                    type="switch"
                    checked={fuel}
                    onChange={() => {
                      setFuel(!fuel);
                    }}
                  />
                  <Label check>Combustível</Label>
               </FormGroup>
             }

            <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Salvar
                </Button>
            </Row>

        </Form>
        </>
       );

}