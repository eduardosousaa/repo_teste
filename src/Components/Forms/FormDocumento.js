"use client"
import { Row, Col, Form, Button, Input, Table } from "reactstrap";
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import { MdDriveFolderUpload } from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import { useState, useEffect } from "react";
import styles from "./form.module.css";
import FormatarData from "../../../src/Utils/FormatarData";
import { ReadonlyURLSearchParams } from "next/navigation";

export default function FormDocumento({data,submitData,edit,readOnly,apiErrors,type}){

     const { "token2": token2 } = parseCookies();

     const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

    
   /*  const [documentTypeOptions, setDocumentTypeOptions] = useState([{id:"alvara",name:"Alvará"},
                                                                    {id:"cnpj",name:"CNPJ"},
                                                                    {id:"licenca",name:"Licença"},
                                                                    {id:"certificado",name:"Certificado"}]); */
    
    const [showAlert, setShowAlert] = useState(false);

    const documentOptions = (teste) => {
    
          let url;
          let query = {};
          query.size = 100;
          query.addMyCompany = true;
          query.name = teste;
          query.documentType = type != undefined ? type : "COMPANY_DOCUMENTS";
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
                "userAlerts": dado.userAlerts
               }));

            return dadosTratados;
          });
    }

    const employeeOptions = (teste) => {
  
         let url;
         let query = {};
         query.size = 100;
         query.fullName = teste;
         query.active = true;
         url =  "employee?" + new URLSearchParams(query);
         
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
               "label": dado.fullName
              }));
           
           return dadosTratados;
         });
    }

    const [document, setDocument] = useState({name:"",descricao: "", arquivoBlob:null});
    
    function changeArquivo(e,fileName){

        fileName = fileName.toLowerCase();
        fileName = fileName.replaceAll(" ","_");
        if(e.target.files[0] != undefined){
           const file = e.target.files[0];
           const newFile = new File([file],fileName,{
                              type: file.type
                           });
        
           const reader = new FileReader();
     
           reader.onload = function(e) {
             const blob = new Blob([new Uint8Array(e.target.result)], {type: file.type });
             /* console.log(blob); */
             const objectURL = URL.createObjectURL(blob);
             /* console.log(objectURL); */
                                              
             setDocument({name:fileName,descricao: fileName + ".pdf", arquivoBlob:objectURL});
                                              
             setValue(`document.doc`,fileName);
             setValue(`document.file`,newFile);
           };
     
           reader.readAsArrayBuffer(file);
        }
    }
    
    function clearFile(){
       setDocument({name:"",descricao: "", arquivoBlob:null});

       setValue(`document.doc`,"");
       setValue(`document.file`,null);
    }
                                              
          
    function submit(formData){
      formData.documentsGroup = formData.documentsGroup.id;
      submitData(formData);
    }

    useEffect(() => {

     const handleResize = () => {
       setWindowWidth(window.innerWidth);
     };
 
     window.addEventListener('resize', handleResize);
 
     return () => {
       window.removeEventListener('resize', handleResize);
     };
    });

    useEffect(() => {
        
      if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){

         Object.keys(apiErrors).forEach((key) => {
           setError(key, {type: "custom", message: apiErrors[key]});
         });
      }

    },[apiErrors]);
 
    useEffect(() => {
        if(readOnly){
          setDocument({name:"",
                       descricao: "versao_" + data.version + "_dt_" + FormatarData(data.expirationDate, "dd_MM_yyyy") + ".pdf",
                       arquivoBlob: Constantes.urlImages + data.link});
        }
    },[readOnly]);
    
    return (
        <>

         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3">

             { !edit &&
              <Col sm="12">
                <AsyncSelectForm
                  id={"documentsGroup"}
                  name={"documentsGroup"}
                  label="Tipo de Documento*"
                  register={register}
                  required={true}
                  onChange={(e) => {setValue("documentsGroup",
                                    e ? { id: e.value, 
                                          name: e.label,
                                          userAlerts: e.userAlerts} : null);
                                    setShowAlert(e ? e.userAlerts.length > 0 : false);
                                   }}
                  options={documentOptions}
                  errors={errors}
                />
              </Col>}
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="2">
                <InputForm
                 id="documentNumber"
                 name="documentNumber"
                 label="Número*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 disabled={readOnly}
                 type="text"
                 errors={errors}
                />
              </Col>

              <Col sm="5">
                  <InputForm
                    id="emissionDate"
                    name="emissionDate"
                    label="Data de Emissão*"
                    placeholder="--Digite--"
                    register={register}
                    required={true}
                    disabled={readOnly}
                    type="date"
                    errors={errors}
                  />
               </Col>

               <Col sm="5">
                  <InputForm
                    id="expirationDate"
                    name="expirationDate"
                    label="Data de Vencimento*"
                    placeholder="--Digite--"
                    register={register}
                    required={true}
                    disabled={readOnly}
                    type="date"
                    errors={errors}
                  />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
               <Col sm="6">
                  <InputForm
                    id="issuingBody"
                    name="issuingBody"
                    label="Orgão Emissor*"
                    placeholder="--Digite--"
                    register={register}
                    required={false}
                    disabled={readOnly}
                    type="text"
                    errors={errors}
                  />
               </Col>
              
           </Row>
           
           <div style={{fontSize: "1.25rem",marginTop:"20px", marginBottom:"20px"}}>Arquivo</div>
       
             <div className={styles.archiveFormGroup}>
                 <div className={styles.archiveFormLink}>
                   <a href={document.arquivoBlob} target="_blank" rel="noreferrer">{document.descricao == "" ? "Arquivo não enviado" : document.descricao}</a>
                   { errors?.["document"]?.["doc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["document"]?.message || "Campo Obrigatório"}</div>}  
                 </div>

                 <div className={styles.archiveFormButtons}>

                  { readOnly == false &&
                  <div>
                     <label className={styles.archiveFormButtonGreen} htmlFor={`doc_fileBtn`}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                     <input style={{display:"none"}} {...register(`document.doc`,{required: true})}></input>
                     <input id={`doc_fileBtn`} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,getValues("documentsGroup.name"));clearErrors(`document.doc`)}}
                                                                                                                      onClick={(e) => e.target.value = null}/>
                  </div>}
     
                  <div>
                     <a className={styles.archiveFormButtonGreen}  href={document.arquivoBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                  </div>
     
                  { readOnly == false && <div>
                     <label className={styles.archiveFormButtonRed}  onClick={() => {clearFile()}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                  </div>}


                 </div>
             </div>

           {showAlert && <>
           <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Alarmes</div>
              {windowWidth > 795 &&
               <Table>
                   <thead>
                     <tr style={{fontSize:"1.2rem"}}>
                      <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                      <th style={{backgroundColor:"#fff",borderWidth:2}}>Número Limite de Dias</th>
                      <th style={{backgroundColor:"#fff",borderWidth:2}}>Funcionários</th>
                     </tr>
                   </thead>
                   <tbody>
                     {  getValues("documentsGroup.userAlerts").map((alert,index,alerts) => 
                        <tr key={index}>
                         <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.name}</td>
                         <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.numberLimitDay}</td>
                         <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>
    
                                <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].userAlertId`,{value: alert.id})}></input>
                               <AsyncSelectForm
                                id={`documentUserAlerts[${index}].employeeId`}
                                name={`documentUserAlerts[${index}].employeeId`}
                                label=""
                                placeholder="--Selecione--"
                                register={register}
                                onChange={(e) => {setValue(`documentUserAlerts[${index}].employeeId`,e ? e.value : "")}}
                                required={true}
                                options={employeeOptions}
                                errors={errors}
                               />
                         </td>
                        </tr>
                      )}
                   </tbody>
               </Table>}

               {windowWidth <= 795 && <>
                  { getValues("documentsGroup.userAlerts").map((alert,index)  => 
                        <Card key={index} style={{borderRadius: "15px",marginTop:"20px",borderRadius:0}}>
                           <CardHeader style={{backgroundColor:"#fff", fontSize: "1.2rem", fontWeight:"bold",borderWidth:2}}>
                            Nome: {alert.name}
                           </CardHeader>
                           <CardBody style={{backgroundColor:"#ddffff"}}>
                              <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Número Limite de Dias:</Label> {alert.numberLimitDay}<br/>
                              <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Funcionários:</Label>
                              <div style={{display:"inline-block"}}>
                                  <input style={{display:"none"}} {...register(`documentUserAlerts[${index}].userAlertId`,{value: alert.id})}></input>
                                  <AsyncSelectForm
                                   id={`documentUserAlerts[${index}].employeeId`}
                                   name={`documentUserAlerts[${index}].employeeId`}
                                   label=""
                                   placeholder="--Selecione--"
                                   register={register}
                                   onChange={(e) => {setValue(`documentUserAlerts[${index}].employeeId`,e ? e.value : "")}}
                                   required={true}
                                   options={employeeOptions}
                                   errors={errors}
                                  />
                              </div>
                           </CardBody>
                        </Card>
                      )}
               </>}


           
           </>}

           { readOnly == false &&
            <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"15%"}}>
                 { edit ? "Confirmar" : "Salvar" }
                </Button>
            </Row>
          }

         </Form>

        </>
    );
          




}