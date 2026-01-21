"use client"
import { useState,useEffect } from "react";
import Constantes from "../../Constantes";
import { parseCookies } from "nookies";
import { Row, Col, Form, FormGroup, Button, Input, Card, Label } from "reactstrap";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import styles from "./form.module.css";

export default function FormDadosCategorias({data,setData,apiErrors}) {

    const { "token2": token2 } = parseCookies();

    const {
	  	register,
	  	handleSubmit,
	  	setError,
	  	clearErrors,
	  	control,
      getValues,
	  	setValue,
	  	formState: { errors },
	  } = useForm({ defaultValues: data.categories });

    const [showAsync, setShowAsync] = useState([true]);

    const categoriasOptions = (teste,index) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       query.active = true;
       query.service = categoriasInputs[index].service;
       url =  "category?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackAdmin + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {

             let dadosTratados = [];

             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": dado.name 
                }));
       
                 return dadosTratados;
          });
    };

    const tipoProdutosOptions = (teste,index) => {
      let url;
      let query = {};
      query.size = 100;
      query.productName = teste;
      query.categoryName = getValues(`categories[${index}].category.name`);
      query.active = true;
      url =  "product_type?" + new URLSearchParams(query);
      
      return fetch(Constantes.urlBackAdmin + url, {method: "GET",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": "ADMINISTRATION",
             "Authorization": token2
         },})
         .then((response) => response.json())
         .then((data) => {

            let dadosTratados = [];

            data["content"].forEach(dado =>
               dadosTratados.push({
                "value":  dado.id,
                "label": dado.name 
               }));
      
                return dadosTratados;
         });
    };

    const [categoriasInputs, setCategoriasInputs] = useState([]);
 
    function addCategoria(){
      setCategoriasInputs([...categoriasInputs,{service:false,productTypes:false}]);
      setShowAsync([...showAsync,true]);
    }

    function removeCategoria(index){
       
       setCategoriasInputs(categoriasInputs.filter((_,i) => i != index));
       setShowAsync(showAsync.filter((_,i) => i != index));
       let categories = getValues("categories");
       setValue("categories",categories.filter((_,i) => i != index)); 
    }

    function setTypeProducts(index){
       setCategoriasInputs(categoriasInputs.map((input,i) =>{
         if(i == index){
            if(input.productTypes == true) setValue(`categories[${index}].productTypes`,[]);
            input.productTypes = !input.productTypes;
         } 
         return input;
       }));
    }

    function submit(formData){

      let categories = [];

      formData.categories.forEach((data,index) => {
        categories.push({
             id: data.category.id,
             name: data.category.name,
             ...( data.productTypes != undefined && { productTypes: data.productTypes}),
             isService: categoriasInputs[index].service
        });
      });
      data.confirmed.push("categories");
      setData({...data, categories: categories,confirmed: data.confirmed});
     
    }

    useEffect(() => {
            
       /* if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){
    
          Object.keys(apiErrors).forEach((key) => {
            setError(key, {type: "custom", message: apiErrors[key]});
          });
       } */
  
       if(apiErrors == "Campo Obrigatorio"){
          setError(`categories[0]`, {type: "custom", message: "Campo Obrigatório"});
       }
    
    },[apiErrors]);

    useEffect(() => {
      if(data.categories.length > 0){
        let inputs = [];
        data.categories.forEach((categories) => {
          inputs.push({service:categories.isService,productTypes:categories.productTypes.length > 0});
        });
        setCategoriasInputs(inputs);
        setValue("categories",data.categories.map((category) => {
                                                    return {
                                                      category:{id:category.id, name:category.name},
                                                      productTypes: category.productTypes    
                                                    }
                                                  }))
        setShowAsync(Array(data.categories.length).fill(true));
      }else{
        setCategoriasInputs([{service:false,productTypes:false}]);
      }
    },[]);
    
    useEffect(() => {
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

    return (
        <>
         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button style={{ backgroundColor: "#009E8B", width:"150px"}}
                        onClick={() => addCategoria()}>
                  Adicionar <FaPlus/>
                </Button>
           </Row>


          {categoriasInputs.map((categoria,index) => 
             <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px"}}>
              <Card style={{ flex:"1", padding: "15px"}}>
                 <Row className="d-flex mt-3">
                  <Col sm="2">
                   <Input name={`radio[${index}]`}
                          type="radio"
                          defaultChecked={!categoria.service}
                          onClick={() => {setCategoriasInputs(categoriasInputs.map((c,i) => {
                                            if(index == i) c.service = false;
                                            return c;  
                                          }));
                                          setShowAsync(showAsync.map((_,i) => {
                                              return !(index == i);
                                           }));
                                          setValue(`categories[${index}].category`,null)
                                         }}
                          className={styles.radioButton}>
                   </Input>  
                   <Label style={{height:"25px",fontSize:"20px"}}>&nbsp;&nbsp;Material</Label>
                  </Col>
                  <Col sm="2">
                    <Input name={`radio[${index}]`} 
                           type="radio"
                           defaultChecked={categoria.service}
                           onClick={() => {setCategoriasInputs(categoriasInputs.map((c,i) => {
                                              if(index == i){ c.service = true;c.productTypes = false}
                                              return c; 
                                            }));
                                           setShowAsync(showAsync.map((_,i) => {
                                              return !(index == i);
                                           }));
                                           setValue(`categories[${index}].category`,null)
                                          }}
                           className={styles.radioButton}>
                   </Input>
                   <Label style={{height:"25px",fontSize:"20px"}}>&nbsp;&nbsp;Serviço</Label>
                 </Col>
                 </Row>
                 <Row className="d-flex mt-3">
                    {showAsync[index] && <Col sm="12">
                      <AsyncSelectForm
                        id={`categories[${index}].category`}
                        name={`categories[${index}].category`}
                        label="Categoria*"
                        register={register}
                        required={true}
                        //defaultValue={data.categories[index] ? {value: data.categories[index].id , label: data.categories[index].name} : null}
                        defaultValue={getValues(`categories[${index}].category`) ? {value: getValues(`categories[${index}].category.id`) , label: getValues(`categories[${index}].category.name`)} : null}
                        onChange={(e) => {setValue(`categories[${index}].category`, e ? {id: e.value, name: e.label} : null);
                                          setCategoriasInputs(categoriasInputs.map((c,i) => { if(i == index) c.productTypes = false; return c;}));
                                          setValue(`categories[${index}].productTypes`,[]);
                                         }}
                        options={(value) => categoriasOptions(value,index)}
                        errors={errors}
                      />
                    </Col>} 
                 </Row>
                 {!categoria.service && <Row className="d-flex mt-4 mb-3">
                    <Col sm="12" style={{paddingLeft:"30px",fontSize:"18px",
                                              display:"flex", gap:"12px"}}>
                            <Input name="check" 
                                   type="checkbox"
                                   checked={categoria.productTypes}
                                   onChange={() => setTypeProducts(index)}
                                   className={styles.radioButton}>
                            </Input>
                            Incluir Tipos de Produtos
                    </Col>
                 </Row>}

                 {categoria.productTypes == true &&
                   <Row className="d-flex" style={{paddingLeft:"35px"}}>
                      <Col sm="12">
                        <AsyncSelectForm
                          id={`categories[${index}].productTypes`}
                          name={`categories[${index}].productTypes`}
                          label=""
                          register={register}
                          required={true}
                          isMulti={true}
                          /* defaultValue={data.categories[index]?.productTypes ? data.categories[index].productTypes.map((prodType) => 
                                                                                    { return ({value:prodType.id, label:prodType.name})}) : null} */
                          defaultValue={getValues(`categories[${index}].productTypes`) ? getValues(`categories[${index}].productTypes`).map((prodType) => 
                                                                                    { return ({value:prodType.id, label:prodType.name})}) : null}
                          onChange={(prodType) => {setValue(`categories[${index}].productTypes`,prodType.map((p) => 
                                                                                    { return ({id:p.value, name:p.label})}))}}
                          options={(value) => tipoProdutosOptions(value,index)}
                          errors={errors}
                        />
                      </Col> 
                   </Row>}
              </Card>
              {categoriasInputs.length > 1 && 
                <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px"}}
                      onClick={() => removeCategoria(index)}>
                <FaTrash style={{color:"red"}}/>
              </Button>}
              </div>
          )}
           <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"150px"}}>
                  Confirmar
                </Button>
           </Row>

         </Form>
        </>
    );


}