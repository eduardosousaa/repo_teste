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
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import { useState, useEffect, Fragment } from "react";

export default function FormCargo({data,submitData,apiErrors}){

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

    
    const [documents, setDocuments] = useState([]);

    const documentOptions = (teste,type) => {
    
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      query.documentType = type; 
      query.addMyCompany = false;
      url =  "documents-group?" + new URLSearchParams(query);
      
      return fetch(Constantes.urlBackDocuments + url, {
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
            "documents": dado.documents
           }));
        
        return dadosTratados;
      });
    }

    function addDocument(type){
      setDocuments([...documents,{id:Math.random(),type:type}]);
    }

    function removeDocument(id){
      let index = documents.findIndex((doc,i) => doc.id == id);
      let documentsForm = getValues("documents");
      setValue("documents",documentsForm.filter((_,i) => i != index)); 
      setDocuments(documents.filter((doc,i) => doc.id != id));
      
    }

    
    function submit(formData){
      submitData(formData);

    }

    useEffect(() => {
        
      if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){

         Object.keys(apiErrors).forEach((key) => {
           setError(key, {type: "custom", message: apiErrors[key]});
         });
      }

    },[apiErrors]);


     useEffect(() => {
        if(data.documents.length > 0){
          let inputs = [];
          data.documents.forEach((document) => {
             inputs.push({id:Math.random(),type:document.documentType})
          });
          setDocuments(inputs);
        }
    },[]);

    
    return (
        <>

         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3">
              <Col sm="6">
                <InputForm
                 id="name"
                 name="name"
                 label="Nome do Cargo*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="text"
                 errors={errors}
                />
              </Col>
           </Row>

           <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Documentos do Cargo</div>
           <UncontrolledAccordion stayOpen>

              <AccordionItem>
                 <AccordionHeader targetId={`docs_document`}><span style={{fontSize: "1.125rem"}}>Documentos Pessoais</span></AccordionHeader>
                 <AccordionBody accordionId={`docs_document`} style={{padding:"15px"}}>

                    <Row className="d-flex mt-3 mb-3 justify-content-end">
                        <Button style={{ backgroundColor: "#009E8B", width:"15%"}}
                                onClick={() => addDocument("DOCUMENTS")}>
                          Adicionar <FaPlus/>
                        </Button>
                    </Row>

                    { documents.filter((doc) => doc.type == "DOCUMENTS").map((doc,index) => 
                       <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px"}}>
                         <Card style={{ flex:"1", padding: "15px"}}>
                           {/* <Row className="d-flex mt-3">
                               <Col sm="6">
                                 <InputForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].name`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].name`}
                                   label="Nome*"
                                   placeholder="--Digite--"
                                   register={register}
                                   required={true}
                                   type="text"
                                   errors={errors}
                                 />
                               </Col>
                               <Col sm="3">
                                 <InputForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].alertDays`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].alertDays`}
                                   label="Prazo de Validade em Dias*"
                                   placeholder="--Digite--"
                                   register={register}
                                   required={true}
                                   type="number"
                                   errors={errors}
                                 />
                               </Col>
                               <Col sm="3">
                                 <InputForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].expirationDays`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].expirationDays`}
                                   label="Dias de Antecedência do Alerta*"
                                   placeholder="--Digite--"
                                   register={register}
                                   required={true}
                                   type="number"
                                   errors={errors}
                                 />
                               </Col>
                               <input style={{display:"none"}} 
                                      {...register(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].documentType`,
                                                  {value: "DOCUMENTS"})}></input>
                           </Row> */}
                           <Row className="d-flex mt-3">
                              <Col sm="12">
                                 <AsyncSelectForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   label="Tipo de Documento*"
                                   register={register}
                                   required={true}
                                   defaultValue={{value: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].id`),
                                                  label: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].name`)}}
                                   onChange={(e) => {setValue(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`,
                                                     e ? {id: e.value, name: e.label} : null)}}
                                   options={(value) => documentOptions(value,"DOCUMENTS")}
                                   errors={errors}
                                 />
                              </Col>
                           </Row> 
                         </Card>
                         <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px"}}
                                 onClick={() => removeDocument(doc.id)}>
                           <FaTrash style={{color:"red"}}/>
                          </Button>
                       </div>
                    )} 
                 </AccordionBody>
              </AccordionItem>

              <AccordionItem>
                 <AccordionHeader targetId={`docs_exames`}><span style={{fontSize: "1.125rem"}}>Exames Obrigatórios</span></AccordionHeader>
                 <AccordionBody accordionId={`docs_exames`} style={{padding:"15px"}}>
                    <Row className="d-flex mt-3 mb-3 justify-content-end">
                        <Button style={{ backgroundColor: "#009E8B", width:"15%"}}
                                onClick={() => addDocument("EXAMES")}>
                          Adicionar <FaPlus/>
                        </Button>
                    </Row>

                    { documents.filter((doc) => doc.type == "EXAMES").map((doc,index) =>
                       <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px"}}>
                         <Card style={{ flex:"1", padding: "15px"}}>
                           <Row className="d-flex mt-3">
                              <Col sm="12">
                                 <AsyncSelectForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   label="Tipo de Documento*"
                                   register={register}
                                   required={true}
                                   defaultValue={{value: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].id`),
                                                  label: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].name`)}}
                                   onChange={(e) => {setValue(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`,
                                                     e ? {id: e.value, name: e.label} : null);}}
                                   options={(value) => documentOptions(value,"EXAMES")}
                                   errors={errors}
                                 />
                              </Col>
                           </Row>
                         </Card>
                         <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px"}}
                                 onClick={() => removeDocument(doc.id)}>
                           <FaTrash style={{color:"red"}}/>
                         </Button>
                       </div>
                    )}
                 </AccordionBody>
              </AccordionItem>

              <AccordionItem>
                 <AccordionHeader targetId={`docs_courses`}><span style={{fontSize: "1.125rem"}}>Cursos Obrigatórios</span></AccordionHeader>
                 <AccordionBody accordionId={`docs_courses`} style={{padding:"15px"}}>
                    <Row className="d-flex mt-3 mb-3 justify-content-end">
                        <Button style={{ backgroundColor: "#009E8B", width:"15%"}}
                                onClick={() => addDocument("COURSES")}>
                          Adicionar <FaPlus/>
                        </Button>
                    </Row>

                    { documents.filter((doc) => doc.type == "COURSES").map((doc,index) => 
                       <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px"}}>
                         <Card style={{ flex:"1", padding: "15px"}}>
                           <Row className="d-flex mt-3">
                              <Col sm="12">
                                 <AsyncSelectForm
                                   id={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   name={`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`}
                                   label="Tipo de Documento*"
                                   register={register}
                                   required={true}
                                   defaultValue={{value: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].id`),
                                                  label: getValues(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}].name`)}}
                                   onChange={(e) => {setValue(`documents[${documents.findIndex((doc2) => doc2.id == doc.id)}]`,
                                                     e ? {id: e.value, name: e.label} : null);}}
                                   options={(value) => documentOptions(value,"COURSES")}
                                   errors={errors}
                                 />
                              </Col>
                           </Row>
                         </Card>
                         <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px"}}
                                 onClick={() => removeDocument(doc.id)}>
                           <FaTrash style={{color:"red"}}/>
                         </Button>
                       </div>
                    )}
                 </AccordionBody>
              </AccordionItem>
           </UncontrolledAccordion>

           <Row className="d-flex mt-3">
              <Col sm="6">
                <InputForm
                 id="vacancy"
                 name="vacancy"
                 label="Quantidade dias de férias*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="number"
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

        </>
    );
          




}