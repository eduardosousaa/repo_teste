"use client"
import { useState,useEffect } from "react";
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import { /* UncontrolledAccordion, */ Accordion, AccordionBody, AccordionHeader, AccordionItem,
         Label, Card, CardHeader, CardBody, Table, Row, Col, Form, Button } from "reactstrap";
import { MdDriveFolderUpload } from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { FaPlus } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import AlertMessage from "../ElementsUI/AlertMessage";
import InputForm from "../ElementsUI/InputForm";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import MaskReal from "../../Utils/MaskReal";
import LoadingGif from  "../ElementsUI/LoadingGif";
import FormatarData from "../../Utils/FormatarData";
import styles from "./form.module.css";

export default function FormFuncionario({data,setData,apiErrors}) {

    const { "token2": token2 } = parseCookies();
    const [loading, setLoading] = useState(false);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [open, setOpen] = useState([]);

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
	  } = useForm({ defaultValues: data.employee });

    const toggle = (id) => {
         console.log(id);
         if(open.includes(id)){
            setOpen(open.filter((e) => e != id)); 
         }else{
            setOpen([...open,id]);
         } 
    };


    function showAlert(type, text) {
      setIsOpen(false);

      setAlert({
          type: type,
          text: text
      })
      setIsOpen(true)
      setActiveAlert(true)
    }

    
    const companyOptions = (teste) => {
           let url;
           let query = {};
           query.size = 100;
           query.name = teste;
           url =  "company?" + new URLSearchParams(query);
           
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
                 let filter = data["content"].filter(a => a.myCompany == true);
    
                 filter.forEach(dado =>
                    dadosTratados.push({
                     "value":  dado.id,
                     "label": dado.name 
                    }));
           
                     return dadosTratados;
              });
    };

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

    const localizationOptions = (teste, type) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        query.typeLocation = type;

        url =  "stock?" + new URLSearchParams(query);
        
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
    };

    const greOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      query.municipalityId = getValues("municipalityId") || "";
      query.status = "ACTIVE";
      url =  "regional_education_management?" + new URLSearchParams(query);
      
      return fetch(Constantes.urlBackRotas + url, {method: "GET",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": "ROUTES",
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

    const municipioOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      query.regionalEducationManagementId = getValues("regionalEducationManagementId") || "";
      query.status = "ACTIVE";
      url =  "municipality?" + new URLSearchParams(query);
      
      return fetch(Constantes.urlBackRotas + url, {method: "GET",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": "ROUTES",
             "Authorization": token2
         },})
         .then((response) => response.json())
        .then((data) => {
 
            let dadosTratados = [];
            
            data["content"].forEach(dado =>
               dadosTratados.push({
                "value":  dado.id,
                "label": dado.name,
                "latitude": dado.latitude,
                "longitude": dado.longitude
               }));
     
 
                return dadosTratados;
         });
    };
    
    
    const vinculoOptions = [{id:"PARTNER_CONTRACTOR",name:"Parceiro"},
                            {id:"TEMPORARY",name:"Temporário"},
                            {id:"CLT",name:"CLT"},
                            {id:"OUTSOURCED",name:"Terceirizado"},
                            {id:"EFFECTIVE_SERVER",name:"Servidor Efetivo"},
                            {id:"COMMISSIONED_SERVER",name:"Servidor Comissionado"}];
    
    const workloadOptions = [{id:"20",name:"20hs"},
                             {id:"24",name:"24hs"},
                             {id:"30",name:"30hs"},
                             {id:"36",name:"36hs"},
                             {id:"40",name:"40hs"},
                             {id:"44",name:"44hs"}];
    
    const [showAsync, setShowAsync] = useState([true,true,true]);

    const [showDocuments, setShowDocuments] = useState(false);

    const [documents, setDocuments] = useState([/* {arquivo: (formData),
                                                 arquivoBlob: (blob),
                                                 descricao: (string)} */]);
    
    const [showVacancies, setShowVacancies] = useState(false);
    const [vacancies, setVacancies] = useState([/* {installments:[true]} */]);
    const [yearOptions, setYearOptions] = useState([{id:2025,name:2025},
                                                    {id:2024,name:2024},
                                                    {id:2023,name:2023},
                                                    {id:2022,name:2022},
                                                    {id:2021,name:2021},
                                                    {id:2020,name:2020},
                                                    {id:2019,name:2019},
                                                    {id:2018,name:2018},
                                                    {id:2017,name:2017},
                                                    {id:2016,name:2016}]);
    const [vacanciesAlerts, setVacanciesAlerts] = useState([]);

    const positionOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        url =  "position?" + new URLSearchParams(query);
        
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
              "documents": dado.documents,
              "vacancy" : dado.vacancy
             }));
          
          return dadosTratados;
        });
    }

    function getPositionVacancyDays(id){
         fetch(Constantes.urlBackAdmin + `position/${id}`, {
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
                    if(body.vacancy){ 
                       setValue(`position.vacancy`,body.vacancy);
                       setShowVacancies(true);}
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

    function getVacanciesAlerts(){
        setLoading(true);
        fetch(Constantes.urlBackAdmin + "employee/user-alert", {
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
                    let array = getValues(`employeeUserAlert`); 
                    if(array != undefined && array.length > 0) {
                      setVacanciesAlerts(body.content.map((e) => {
                                              let index = array.findIndex((a) => a.employeeAlertId == e.id);
                                              return { ...e,
                                                       ...(index != -1 && {employee: {value: array[index].employeeId,
                                                                                      label: array[index].employeeName}})
                                                      }
                      }));  
                    }else{
                      setVacanciesAlerts(body.content);    
                    }
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

    function prepareUploadDocuments(e){

      setValue(`position`,{id: e.value, 
                           name: e.label,
                           documents: e.documents/* .map((document) => {
                              document = {...document,alerts:[{name:"Alerta 1",daysLimit:"120"}]}  
                              return document;
                           }) */,
                           vacancy: e.vacancy
                          });

      setShowDocuments(e.documents.length > 0);

      if(e.documents.length > 0){
          setDocuments(e.documents.map((document) => {
              return({ 
                  /* arquivo: null, */
                  arquivoBlob: null,
                  descricao: ''
               });

          }));
      }

      setShowVacancies(true);

    }

    function cleanUploadDocumentsVacancies(){
       setValue(`position`,null);
       setShowDocuments(false);
       setDocuments([]);
       setShowVacancies(false);
    }

    /* Rota para conseguir documentos e 
       e depois transformar no formato do FormFuncionarios */
    function getDocumentBlob(url){

      return new Promise((resolve, reject) => {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', Constantes.urlImages + url, true);
          xhr.setRequestHeader('Accept', 'application/pdf');
          xhr.setRequestHeader('Content-Type' ,'application/pdf');
    /*       xhr.setRequestHeader('Module' ,'ADMINISTRATION');
          xhr.setRequestHeader('Authorization','Bearer ' + token2); */
          xhr.responseType = 'arraybuffer';
          xhr.onload = function(e) {
              if (this.status >= 200 || this.status <= 400) {
                  resolve(this.response)
              }
          }
          xhr.send();
      }).then((data) => {
          var base64Str = Buffer.from(data).toString('base64');
    
          var binaryString = atob(base64Str);
          var binaryLen = binaryString.length;
          var bytes = new Uint8Array(binaryLen);
    
          for(var i = 0; i < binaryLen; i++){
             var ascii = binaryString.charCodeAt(i);
             bytes[i] = ascii;
          }
          var arrBuffer = bytes;
          var newBlob = new Blob([arrBuffer], {type: "application/pdf"});
          /* var file = new File([newBlob], "teste.pdf", {type: "application/pdf", lastModified: Date.now()});
          const objectURL = URL.createObjectURL(newBlob); */

          return newBlob;
      
      });


    }
    
    function changeArquivo(e,index,fileName){
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
           setValue(`documents[${index}].positionDocuments`,getValues(`position.documents[${index}].id`));
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
       setValue(`documents[${index}].positionDocuments`,"");
       setValue(`documents[${index}].file`,null);
    }

    function addVacancy(){

      if(getValues(`vacancies`) != undefined && getValues(`vacancies`).length > 1){
          console.log("Vagas",getValues(`vacancies`));
          let vacanciesSum = getValues(`vacancies[${vacancies.length - 1}].installments`)
                             .reduce((n,{days}) => n + Number(days), 0);
          let maxDays = getValues("position.vacancy");
    
          console.log("MaxDays:",maxDays);
          console.log("Sum:",vacanciesSum);
    
          if(vacanciesSum < maxDays){
             return showAlert("danger", "Quantidade de Dias inferior ao Máximo!");
          }
    
          if(vacanciesSum > maxDays){
             return showAlert("danger", "Quantidade de Dias superior ao Máximo!");
          }
      }
      setVacancies([...vacancies,{installments:[true]}]);
    }

    function removeVacancy(index){
       
       setVacancies(vacancies.filter((_,i) => i != index));
       let vacanciesInputs = getValues("vacancies");
       setValue("vacancies",vacanciesInputs.filter((_,i) => i != index)); 
    }

    function addInstallment(index){

      let installments = getValues(`vacancies[${index}].installments`);
      let date = new Date(installments[installments.length - 1].date);
      let days = installments[installments.length - 1].days;
      installments.push({ date: FormatarData(new Date(date.setDate(date.getDate() + parseInt(days))),"yyyy-MM-dd"),
                          days: ""
         
      });
      setValue(`vacancies[${index}].installments`,installments);

      setVacancies(vacancies.map((vacancy,i) => {
          if(i == index && vacancy.installments.length < 3){
            vacancy.installments.push(true);
          }
          return vacancy;
      }));

    }

    function removeInstallment(index,index2){

        setVacancies(vacancies.map((input,i) => {
            if(i == index){
              input.installments = input.installments.filter((_,i2) => i2 != index2);
            }
            return input;
         }));
        let vacancyInputs = getValues(`vacancies[${index}].installments`);
        setValue(`vacancies[${index}].installments`,vacancyInputs.filter((_,i2) => i2 != index2)); 
    }

    function onError(errors){
      if('documents' in errors){
        setOpen(getValues("position.documents").map((document,index) => {
            if(errors.documents[index] != undefined) {
              return `doc_${index}`;
            };
        }));
      }
    }

    function submit(formData){
      console.log(formData.documents);
      formData.contractDate = new Date(formData.contractDate);

      formData.salary = formData.salary.replaceAll(".","");
      formData.salary = parseFloat(formData.salary.replace(",","."));
      formData.benefits =  formData.benefits.replaceAll(".","");
      formData.benefits = parseFloat( formData.benefits.replace(",","."));
      
      if(showDocuments){
         formData.documents = formData.documents.map((document) => {
              document.initial  = new Date(document.initial);
              document.expiration  = new Date(document.expiration);
              return document;
         });

         console.log(formData.documents);
      }

      if(formData.vacancies && formData.vacancies.length == 1){

       let vacanciesSum = formData.vacancies[0].installments.reduce((n,{days}) => n + Number(days), 0);
       let maxDays = formData.position.vacancy;

        console.log("MaxDays:",maxDays);
        console.log("Sum:",vacanciesSum);
  
        if(vacanciesSum < maxDays){
           return showAlert("danger", "Quantidade de Dias inferior ao Máximo!");
        }
  
        if(vacanciesSum > maxDays){
           return showAlert("danger", "Quantidade de Dias superior ao Máximo!");
        }

      }

      let formDocuments = showDocuments ? formData.documents : undefined;
      delete formData.documents;
      data.confirmed.push("employee");
      setData({...data, employee: formData,
                        documents: formDocuments,
                        confirmed: data.confirmed 
      });
    }

    useEffect(() => {
        
      if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){
         console.log(apiErrors);
         Object.keys(apiErrors).forEach((key) => {
           setError(key, {type: "custom", message: apiErrors[key]});
         });
      }

    },[apiErrors]);

    useEffect(() => {
      if(data.documents != undefined) {
       
        let positionDocuments = [];
        let documentsScreen = [];
        let documentsForm = [];
        
        data.documents.forEach((document) => {
           positionDocuments.push({id: document.positionDocuments,
                                  name: document.positionDocumentsName,
                                  userAlerts: document.documentUserAlertsScreen.map((alert) => {
                                                                              return({ id: alert.userAlert.id,
                                                                                       name: alert.userAlert.name,
                                                                                       numberLimitDay: alert.numberLimitDay,
                                                                                       employee: alert.employee != null ? {value: alert.employee.id, label: alert.employee.name} : null
                                                                                      });
                                                                           })});

           documentsScreen.push({ 
             arquivoBlob: Constantes.urlImages + document.url,
             descricao: document.doc
           })

           documentsForm.push({doc: document.doc,
                               positionDocuments: document.positionDocuments,
                              /*  file: new File([blob], document.doc + ".pdf", {type: "application/pdf"}), */
                               initial: FormatarData(document.initial,"yyyy-MM-dd"),
                               expiration: FormatarData(document.expiration,"yyyy-MM-dd"),
                               documentUserAlerts: document.documentUserAlerts/* .map((alert) => {
                                                      return(alert.employee != null ? {employeeId: alert.employee.id, 
                                                                                       userAlertId: alert.userAlert.id} : null)
                                                    }) */,
                               url: document.url
                              });
          
         });

        setValue(`position`,{id: data.employee.position.id, 
                            name: data.employee.position.name,
                            documents: positionDocuments});
        setDocuments(documentsScreen); 
        console.log(documentsForm);                  
        setValue(`documents`,documentsForm)
        setShowDocuments(true);

      } 

      if(data.employee.vacancies != undefined && data.employee.vacancies.length > 0) {
         setValue('vacancies',data.employee.vacancies);
         setVacancies(data.employee.vacancies.map((vacancy) => {
             return {
               installments: Array(vacancy.installments.length).fill(true)
             }
         }));
         //[...vacancies,{installments:[true]
         /* setShowVacancies(true); */
      }

      if(data.employee.employeeUserAlert != undefined && data.employee.employeeUserAlert.length > 0) {
        setValue("employeeUserAlert",data.employee.employeeUserAlert.map((e) => {
                                                   return { employeeId: e.employeeId, 
                                                            employeeAlertId: e.employeeAlertId,
                                                            employeeName: e.fullName}
        }));
      }
      getVacanciesAlerts();
       if(data.employee.position != undefined) getPositionVacancyDays(data.employee.position.id);
      
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    },[]);

    useEffect(() => {
      /* if(!showAsync) setShowAsync(true); */
      if(showAsync.includes(false)){
         setShowAsync(showAsync.map((s) => {
              return true;
         }));
      }     
    },[showAsync]);

    return (
        <>
        { loading && <LoadingGif/>}
         <Form onSubmit={handleSubmit(submit,onError)}>

           <Row className="d-flex mt-3">
              <Col sm="6">
                <AsyncSelectForm
                  id={"company"}
                  name={"company"}
                  label="Empresa*"
                  register={register}
                  required={true}
                  defaultValue={data.employee.company != null ? {value: data.employee.company.id , label: data.employee.company.name} : null}
                  onChange={(e) => {setValue(`company`, e ? {id: e.value, name: e.label} : null);/* clearErrors(`companyId`) */}}
                  options={companyOptions}
                  errors={errors}
                />
              </Col> 
              <Col sm="2">
                 <InputForm
                   id="sector"
                   name="sector"
                   label="Setor*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="4">
                <AsyncSelectForm
                  id={"position"}
                  name={"position"}
                  label="Cargo*"
                  register={register}
                  required={true}
                  defaultValue={data.employee.position != null ? {value: data.employee.position.id , label: data.employee.position.name} : null}
                  onChange={(e) => { e ? prepareUploadDocuments(e) : cleanUploadDocumentsVacancies()}}
                  options={positionOptions}
                  errors={errors}
                />
              </Col> 
           </Row>

           
           <Row className="d-flex mt-3">
              <Col sm="4">
                <AsyncSelectForm
                  id="locationId"
                  name="locationId"
                  label="Localização de Lotação"
                  defaultValue={data.employee.location != null ? {value: data.employee.location.id , label: data.employee.location.name} : null}
                  onChange={(e) => {setValue("locationId",e ? e.value: "");
                                      setShowAsync([true,false,false])}}
                  register={register}
                  required={false}
                  options={(value) => localizationOptions(value, 'LOCATION') }
                />
              </Col>
                  
              { showAsync[0] && <Col sm="4">
                 <AsyncSelectForm
                    id="regionalEducationManagementId"
                    name="regionalEducationManagementId"
                    label="GRE"
                    register={register}
                    required={false}
                    defaultValue={data.employee.regionalEducationManagement != null ? {value: data.employee.regionalEducationManagement.id , label: data.employee.regionalEducationManagement.name} : null}
                    onChange={(e) => {setValue("regionalEducationManagementId", e ? e.value : "");
                                      setValue("regionalEducationManagementName", e ? e.label : "");
                                      setShowAsync([true,false])}}
                    options={greOptions}
                    errors={errors}
                  />
              </Col>}
                  
              { showAsync[1] && <Col sm="4">
                <AsyncSelectForm
                   id="municipalityId"
                   name="municipalityId"
                   label="Município"
                   register={register}
                   required={false}
                   defaultValue={data.employee.municipality != null ? {value: data.employee.municipality.id , label: data.employee.municipality.name} : null}
                   onChange={(e) => {setValue("municipalityId", e ? e.value : "");
                                     setValue("name", e ? e.label : "");
                                     /* setShowAsync([false,true]) */}}
                   isDisabled={getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == ""}
                   options={municipioOptions}
                   errors={errors}
                 />
              </Col>}
           
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="4">
                 <InputForm
                  id="typeLink"
                  name="typeLink"
                  label="Tipo de Vínculo*"
                  placeholder="--Digite--"
                  register={register}
                  required={true}
                  type="select"
                  options={vinculoOptions}
                  errors={errors}
                 />
               </Col>
              <Col sm="4">
                 <InputForm
                   id="registration"
                   name="registration"
                   label="Matrícula*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="text"
                   errors={errors}
                 />
               </Col>
               <Col sm="4">
                 <InputForm
                   id="contractDate"
                   name="contractDate"
                   label="Data de Contratação*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="date"
                   errors={errors}
                 />
               </Col>
           </Row>

           <Row className="d-flex mt-3">
              <Col sm="4">
                 <InputForm
                   id="workload"
                   name="workload"
                   label="Carga Horária*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   type="select"
                   options={workloadOptions}
                   errors={errors}
                 />
              </Col>
              <Col sm="4">
                 <InputForm
                   id="salary"
                   name="salary"
                   label="Salário*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   onChange={(e) => MaskReal(e)}
                   errors={errors}
                 />
              </Col>
              <Col sm="4">
                 <InputForm
                   id="benefits"
                   name="benefits"
                   label="Benefícios*"
                   placeholder="--Digite--"
                   register={register}
                   required={true}
                   onChange={(e) => MaskReal(e)}
                   errors={errors}
                 />
              </Col>

           </Row>


           {showDocuments && <> 
              <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Documentos Obrigatórios Cargo</div>
              {/* <UncontrolledAccordion stayOpen style={ windowWidth <= 575 ? {width:"130%",marginLeft:"-35px"} : {width: "100%"}}> */}
              <Accordion open={open} toggle={toggle} style={ windowWidth <= 575 ? {width:"130%",marginLeft:"-35px"} : {width: "100%"}}>
                {getValues("position.documents").map((document,index) =>
                   <AccordionItem key={index}>
                      <AccordionHeader targetId={`doc_${index}`}>
                          <span style={{fontSize: "1.125rem"}}>{document.name} 
                                                               {errors?.["documents"] && errors?.["documents"]?.[index] && <span style={{color:"red",fontWeight: "300"}}> (Preencha o campos obrigatórios)</span>}</span></AccordionHeader>
                      <AccordionBody accordionId={`doc_${index}`} style={{padding:"15px"}}>
                          <div className={styles.archiveFormGroup}>
                              <div className={styles.archiveFormLink}>
                                <a href={documents[index].arquivoBlob} target="_blank" rel="noreferrer">{documents[index].descricao == "" ? "Arquivo não enviado" : documents[index].descricao}</a>
                                { errors?.["documents"]?.[index]?.["doc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["arquivo"]?.message || "Campo Obrigatório"}</div>}  
                              </div>

                              <div className={styles.archiveFormButtons}>
                               <div>
                                  <label className={styles.archiveFormButtonGreen} htmlFor={`doc_${index}_fileBtn`}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                                  <input style={{display:"none"}} {...register(`documents[${index}].doc`,{required: true})}></input>
                                  <input id={`doc_${index}_fileBtn`} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,index,document.name);clearErrors(`documents[${index}].doc`)}}
                                                                                                                                   onClick={(e) => e.target.value = null}/>
                               </div>
     
                               <div>
                                  <a className={styles.archiveFormButtonGreen}  href={documents[index].arquivoBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                               </div>
     
                               <div>
                                  <label className={styles.archiveFormButtonRed}  onClick={() => {clearFile(index)}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                               </div>


                              </div>
                          </div>

                          <Row className="d-flex mt-3">
                             <Col sm="3">
                                <InputForm
                                  id={`documents[${index}].initial`}
                                  name={`documents[${index}].initial`}
                                  label="Data Inicial*"
                                  placeholder="--Digite--"
                                  register={register}
                                  required={true}
                                  type="date"
                                  errors={errors}
                                />
                              </Col>
                              <Col sm="3">
                                <InputForm
                                  id={`documents[${index}].expiration`}
                                  name={`documents[${index}].expiration`}
                                  label="Data de Expiração*"
                                  placeholder="--Digite--"
                                  register={register}
                                  required={true}
                                  type="date"
                                  errors={errors}
                                />
                              </Col>
                          </Row>

                          {document.userAlerts && <>

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
                                   {  document.userAlerts.map((alert,index2,alerts) => 
                                      <tr key={index2}>
                                       <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.name}</td>
                                       <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.numberLimitDay}</td>
                                       <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>
                                             <AsyncSelectForm
                                              id={`documents[${index}].documentUserAlerts[${index2}]`}
                                              name={`documents[${index}].documentUserAlerts[${index2}]`}
                                              label=""
                                              placeholder="--Selecione--"
                                              register={register}
                                              defaultValue={alert.employee != null ? alert.employee : ""}
                                              onChange={(e) => {setValue(`documents[${index}].documentUserAlerts[${index2}]`,
                                                                          e ? {employeeId: e.value, userAlertId: alert.id} : null)}}
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
                                { document.userAlerts.map((alert,index2)  => 
                                      <Card key={index2} style={{borderRadius: "15px",marginTop:"20px",borderRadius:0}}>
                                         <CardHeader style={{backgroundColor:"#fff", fontSize: "1.2rem", fontWeight:"bold",borderWidth:2}}>
                                          Nome: {alert.name}
                                         </CardHeader>
                                         <CardBody style={{backgroundColor:"#ddffff"}}>
                                            <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Número Limite de Dias:</Label> {alert.numberLimitDay}<br/>
                                            <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Funcionários:</Label>
                                            <div style={{display:"inline-block"}}>
                                                <AsyncSelectForm
                                                 id={`documents[${index}].documentUserAlerts[${index2}]`}
                                                 name={`documents[${index}].documentUserAlerts[${index2}]`}
                                                 label=""
                                                 placeholder="--Selecione--"
                                                 register={register}
                                                 defaultValue={alert.employee != null ? alert.employee : ""}
                                                 onChange={(e) => {setValue(`documents[${index}].documentUserAlerts[${index2}]`,
                                                                             e ? {employeeId: e.value, userAlertId: alert.id} : null)}}
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
                      </AccordionBody>
                   </AccordionItem>)}
              </Accordion>
              {/* </UncontrolledAccordion> */}
           
           </>}


           {showVacancies && <> 
           <div style={{fontSize: "1.25rem",marginTop:"20px", marginBottom:"20px"}}>{`Férias  (${getValues("position.vacancy")} dias)`}</div>
           
           <Row className="d-flex mt-1 mb-3 justify-content-end">
              <Button style={{ backgroundColor: "#009E8B",width:"200px"}}
                      onClick={() => addVacancy()}>
                  Novo Ano Aquisitivo <FaPlus/>
              </Button>
           </Row> 
           { vacancies.map((vacancy,index) =>
            <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px",
                                    ...(windowWidth <= 575 && {flexDirection:"column"})}}>
               <Card style={{flex:"1", padding:"20px",
                             ...(windowWidth <= 575 && {width:"110%"})}}>
                 <Row className="d-flex mt-3 mb-3 justify-content-between">
                    <Col sm="4">
                       <InputForm
                           id={`vacancies[${index}].year`}
                           name={`vacancies[${index}].year`}
                           label="Ano Aquisitivo*"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           type="select"
                           errors={errors}
                           options={yearOptions}
                         />
                     </Col>
                 </Row>
    
                 <div style={{fontSize: "18px", marginBottom:"20px"}}>Parcelas</div>
                 <Card style={{flex:"1", padding:"20px"}}>
                 { vacancy.installments.map((installment,index2) => 
                   <div key={index2} style={{marginBottom:"20px"}}>
                     
                       <Row className="d-flex mt-3">
                         <Col sm="4">
                            <InputForm
                                id={`vacancies[${index}].installments[${index2}].date`}
                                name={`vacancies[${index}].installments[${index2}].date`}
                                label="Data de Início*"
                                placeholder="--Digite--"
                                register={register}
                                required={false}
                                min={vacancy.installments.length > 1 ? getValues(`vacancies[${index}].installments[${index2}].date`) : null}
                                type="date"
                                errors={errors}
                              />
                         </Col> 
                         <Col sm="4">
                           <InputForm
                                id={`vacancies[${index}].installments[${index2}].days`}
                                name={`vacancies[${index}].installments[${index2}].days`}
                                label="Quantidade de dias*"
                                placeholder="--Digite--"
                                register={register}
                                required={false}
                                type="number"
                                errors={errors}
                              />
                         </Col>
                         <Col sm="4">
                          <div style={{marginTop:"38px"}}>
                          {(index2 == vacancy.installments.length - 1 && vacancy.installments.length < 3) &&
                            <Button style={{ backgroundColor: "#009E8B",width:"150px"}}
                              onClick={() => addInstallment(index)}>
                              Nova Parcela <FaPlus/></Button>}
                          {(vacancy.installments.length > 1) &&
                            <Button style={{ backgroundColor: "#c00",width:"150px"}}
                              onClick={() => removeInstallment(index,index2)}>
                              Excluir Parcela <AiOutlineClose/></Button>
                          }
                          </div>
                         </Col>
                      </Row>
                 </div>)}
                 </Card>
               </Card>
 
               { vacancies.length > 0 && 
                 <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px",
                                  ...(windowWidth <= 575 && {width:"100%",color:"red"})}}
                          onClick={() => removeVacancy(index)}>
                     {windowWidth <= 575 && "Remover"} <FaTrash style={{color:"red"}}/>
                 </Button>}

            </div>)}

            {vacanciesAlerts.length > 0 && vacancies.length > 0 && <>
              {windowWidth > 795 &&
                  <Table>
                      <thead>
                        <tr style={{fontSize:"1.2rem"}}>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Número Limite de Dias</th>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Funcionário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {  vacanciesAlerts.map((alert,index,alerts) => 
                           <tr key={index}>
                            <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.name}</td>
                            <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>{alert.numberLimitDay}</td>
                            <td style={{backgroundColor: "#ddffff", ...( index == alerts.length - 1 && { borderBottomWidth:0})}}>
                                  <AsyncSelectForm
                                   id={`employeeUserAlert[${index}]`}
                                   name={`employeeUserAlert[${index}]`}
                                   label=""
                                   placeholder="--Selecione--"
                                   register={register}
                                   defaultValue={alert.employee != null ? alert.employee : ""}
                                   onChange={(e) => {setValue(`employeeUserAlert[${index}]`,
                                                               e ? {employeeId: e.value, employeeAlertId: alert.id} : null)}}
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
                 { vacanciesAlerts.map((alert,index)  => 
                  <Card key={index} style={{borderRadius: "15px",marginTop:"20px",borderRadius:0}}>
                     <CardHeader style={{backgroundColor:"#fff", fontSize: "1.2rem", fontWeight:"bold",borderWidth:2}}>
                      Nome: {alert.name}
                     </CardHeader>
                     <CardBody style={{backgroundColor:"#ddffff"}}>
                        <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Número Limite de Dias:</Label> {alert.numberLimitDay}<br/>
                        <Label style={{ fontWeight: "bold", fontSize: "16px" }}>Funcionários:</Label>
                        <div style={{display:"inline-block"}}>
                            <AsyncSelectForm
                             id={`employeeUserAlert[${index}]`}
                             name={`employeeUserAlert[${index}]`}
                             label=""
                             placeholder="--Selecione--"
                             register={register}
                             defaultValue={alert.employee != null ? alert.employee : ""}
                             onChange={(e) => {setValue(`employeeUserAlert[${index}]`,
                                                         e ? {employeeId: e.value, employeeAlertId: alert.id} : null)}}
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

            </>}


           <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Confirmar
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