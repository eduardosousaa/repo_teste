"use client"
import Constantes from "../../Constantes";
import { parseCookies } from "nookies";
import { Row, Col, Form, Button, Input,
    UncontrolledAccordion, Accordion, AccordionBody, AccordionHeader, AccordionItem,  
 } from "reactstrap";
 import { MdDriveFolderUpload } from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import MaskCnpj from "../../Utils/MaskCnpj";
import MaskTelefone from "../../Utils/MaskTelefone";
import { useState, useEffect } from "react";
import styles from "./form.module.css";

export default function FormDadosEmpresa({data,setData,apiErrors,myCompany}){

    /*
      "name": "string",
      "corporateReason": "string",
      "cnpj": "string",
      "email": "string",
      "phone": "string",
      "site": "string",
      "myCompany": true
    */

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
          } = useForm({ defaultValues: data.company });

    
    const shareHoldingControlOptions = [{id:"NACIONAL",name:"Nacional"},{id:"INTERNACIONAL",name:"Internacional"}];
    const legalNatureOptions = [{id:"MEI",name:"MEI"},
                                {id:"EIRELI",name:"EIRELI"},
                                {id:"LTDA",name:"LTDA"},
                                {id:"SA",name:"SA"},
                                {id:"SLU",name:"SLU"},
                                {id:"SOCIEDADE_SIMPLES",name:"Sociedade simples"},
                                {id:"ME",name:"ME"},
                                {id:"EPP",name:"EPP"}];
    /* const countryOptions = [];
 */
    const countryOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      url =  "types/country?" + new URLSearchParams(query);
      
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

    const [documents, setDocuments] = useState([{name:"Cartão CNPJ",descricao: "", arquivoBlob:null},
                                                {name:"Contrato Social",descricao: "", arquivoBlob:null}]);

    
    function changeArquivo(e,index,fileName){

        fileName = fileName.toLowerCase();
        fileName = fileName.replaceAll(" ","_");
        fileName = fileName.replaceAll("ã","a");
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
                                              
             setDocuments(documents.map((document,i) => {
                if(i == index){
                   /* document.arquivo = newFile; */
                   document.arquivoBlob = objectURL;
                   document.descricao = fileName + ".pdf";
                }
                                              
                return document;
             }));
                                              
             setValue(`documents[${index}].doc`,fileName);
             setValue(`documents[${index}].file`,newFile);
           };
     
           reader.readAsArrayBuffer(file);
        }
    }
    
    function clearFile(index){
       setDocuments(documents.map((document,i) => {
          if(i == index){
            /*  document.arquivo = null; */
             document.arquivoBlob = null;
             document.descricao = "";
          }

          return document;
       }));

       setValue(`documents[${index}].doc`,"");
       setValue(`documents[${index}].file`,null);
    }
           
    function checkApiSupplierDocument(type){
       if(type == "Cartão CNPJ") {
         return data.company.archivedCnpj == null;
       }
       if(type == "Contrato Social"){
         return data.company.archivedSocialContract == null;
       }
    }
          
    function submit(formData){

      if(formData.constitutionDate != "") formData.constitutionDate = new Date(formData.constitutionDate);
     
      let formDocuments;
      if(myCompany == false) {
         formDocuments = formData.documents;
         delete formData.documents;
      }
      data.confirmed.push("company");
      setData({...data, company: formData,
                        ...(myCompany == false && {documents: formDocuments}),
                        confirmed: data.confirmed          
      });

    }

    useEffect(() => {
        
      if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){

         Object.keys(apiErrors).forEach((key) => {
           setError(key, {type: "custom", message: apiErrors[key]});
         });
      }

    },[apiErrors]);

    useEffect(() => {
      if(data.company.archivedCnpj != null || data.company.archivedSocialContract != null) {
         let documentsScreen = [];
        
         if(data.company.archivedCnpj != null){
             documentsScreen.push({ 
               name:"Cartão CNPJ",
               arquivoBlob: Constantes.urlImages + data.company.archivedCnpj,
               descricao: "cnpj.pdf"
             })
            
         }

         if(data.company.archivedSocialContract != null){
            documentsScreen.push({
               name:"Contrato Social", 
               arquivoBlob: Constantes.urlImages + data.company.archivedSocialContract,
               descricao: "contrato_social.pdf"
            })
           
         }

         setDocuments(documentsScreen);
      }
    },[])

    
    return (
        <>

         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3">
              <Col sm="12">
                <InputForm
                 id="corporateReason"
                 name="corporateReason"
                 label="Razão Social*"
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
                 id="name"
                 name="name"
                 label="Nome Fantasia*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="text"
                 errors={errors}
                />
              </Col>

              <Col sm="6">
                 <InputForm
                  id="cnpj"
                  name="cnpj"
                  label="CNPJ*"
                  placeholder="--Digite--"
                  register={register}
                  onChange={(e) => MaskCnpj(e)}
                  required={true}
                  type="text"
                  errors={errors}
                />
              </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="4">
                <InputForm
                 id="email"
                 name="email"
                 label="Email*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 type="text"
                 errors={errors}
                />
              </Col>

              <Col sm="4">
                <InputForm
                 id="phone"
                 name="phone"
                 label="Telefone*"
                 placeholder="--Digite--"
                 register={register}
                 required={true}
                 onChange={(e) => MaskTelefone(e)}
                 type="text"
                 errors={errors}
                />
              </Col>

              <Col sm="4">
                <InputForm
                 id="site"
                 name="site"
                 label="Site"
                 placeholder="--Digite--"
                 register={register}
                 required={false}
                 type="text"
                 errors={errors}
                />
              </Col>

           </Row>
           
           <Row className="d-flex mt-3">
              <Col sm="4">
                 <InputForm
                   id="constitutionDate"
                   name="constitutionDate"
                   label="Data de Constituição"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="date"
                   errors={errors}
                 />
              </Col>

              <Col sm="4">
                 <InputForm
                   id="nire"
                   name="nire"
                   label="NIRE"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="text"
                   errors={errors}
                 />
              </Col>

              <Col sm="4">
                 <InputForm
                   id="mainEconomicActivity"
                   name="mainEconomicActivity"
                   label="Atividade Econômica Principal"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="text"
                   errors={errors}
                 />
              </Col>

           </Row>

           <Row className="d-flex mt-3">

              <Col sm="3">
                 <InputForm
                   id="legalNature"
                   name="legalNature"
                   label="Natureza Jurídica"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="select"
                   errors={errors}
                   options={legalNatureOptions}
                 />
              </Col>

              <Col sm="3">
                 <InputForm
                   id="shareHoldingControl"
                   name="shareHoldingControl"
                   label="Controle Acionário"
                   placeholder="--Digite--"
                   register={register}
                   required={false}
                   type="select"
                   errors={errors}
                   options={shareHoldingControlOptions}
                 />
              </Col>

              <Col sm="3">
                 <AsyncSelectForm
                   id={"countryConstitution"}
                   name={"countryConstitution"}
                   label="País da Constituição"
                   register={register}
                   required={false}
                   defaultValue={data.countryConstitution != null ? {value: data.countryConstitution.id , label: data.countryConstitution.name} : null}
                   onChange={(e) => {setValue("countryConstitution", e ? {id: e.value, name: e.label} : null);}}
                   options={countryOptions}
                   errors={errors}
                 />
              </Col>

              <Col sm="3">
                 <AsyncSelectForm
                   id={"countryTaxResidence"}
                   name={"countryTaxResidence"}
                   label="País de Residência Fiscal"
                   register={register}
                   required={false}
                   defaultValue={data.countryTaxResidence != null ? {value: data.countryTaxResidence.id , label: data.countryTaxResidence.name} : null}
                   onChange={(e) => {setValue("countryTaxResidence", e ? {id: e.value, name: e.label} : null);}}
                   options={countryOptions}
                   errors={errors}
                 />
              </Col>
           </Row>


           
           { myCompany == false && <>
            <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Documentos da Empresa</div>
            <UncontrolledAccordion stayOpen>
 
            {documents.map((document,index) =>
               <AccordionItem key={index}>
                  <AccordionHeader targetId={`doc_${document.name}`}><span style={{fontSize: "1.125rem"}}>{document.name}</span></AccordionHeader>
                  <AccordionBody accordionId={`doc_${document.name}`} style={{padding:"15px"}}>
                     <div className={styles.archiveFormGroup}>
                         <div className={styles.archiveFormLink}>
                           <a href={documents[index].arquivoBlob} target="_blank" rel="noreferrer">{document.descricao == "" ? "Arquivo não enviado" : document.descricao}</a>
                           { errors?.["documents"]?.[index]?.["doc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["documents"]?.[index]?.["doc"]?.message || "Campo Obrigatório"}</div>}  
                         </div>
 
                         <div className={styles.archiveFormButtons}>
                          <div>
                             <label className={styles.archiveFormButtonGreen} htmlFor={`doc_${index}_fileBtn`}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                             <input style={{display:"none"}} {...register(`documents[${index}].doc`,{required: /* checkApiSupplierDocument(document.name) */false})}></input>
                             <input id={`doc_${index}_fileBtn`} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,index,document.name);clearErrors(`documents[${index}].doc`)}}
                                                                                                                              onClick={(e) => e.target.value = null}/>
                          </div>
      
                          <div>
                             <a className={styles.archiveFormButtonGreen}  href={document.arquivoBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                          </div>
      
                          <div>
                             <label className={styles.archiveFormButtonRed}  onClick={() => {clearFile(index)}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                          </div>
 
 
                         </div>
                     </div>
 
 
                  </AccordionBody>
 
               </AccordionItem>)}
 
            </UncontrolledAccordion></>}

           <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Confirmar
                </Button>
           </Row>

         </Form>

        </>
    );
          




}