"use client"
import { useState, useEffect, useContext } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaFileExport } from "react-icons/fa";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare  } from "react-icons/bs";
import { FiBarChart2 } from 'react-icons/fi';
import { CgCloseR } from "react-icons/cg";
import styles from "./pessoas.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader,CardBody,CardFooter,
         UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";
import AlertMessage from "../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../src/Components/ElementsUI/AsyncSelectForm";
import MultiSelectForm from "../../../../src/Components/ElementsUI/MultiSelectForm";
import ModalStyle from "../../../../src/Components/ElementsUI/ModalStyle";
import FormatarData from "../../../../src/Utils/FormatarData";

export default function Page() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
   
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
   }

   const router = useRouter();

   const [loading, setLoading] = useState(true);

   const [showAsync, setShowAsync] = useState(true);

   const documentTypeOptions = [{id:"DOCUMENTS",name:"Documentos Pessoais"},
                                {id:"EXAMES",name:"Exames Obrigatórios"},
                                {id:"COURSES",name:"Cursos Obrigatórios"},
                                /* {id:"COMPANY_DOCUMENTS",name:"Documento da Empresa"},
                                {id:"VEHICLE_DOCUMENTS",name:"Documento de Veículo"} */];

   const vinculoOptions = [{id:"PARTNER_CONTRACTOR",name:"Parceiro"},
                           {id:"TEMPORARY",name:"Temporário"},
                           {id:"CLT",name:"CLT"},
                           {id:"OUTSOURCED",name:"Terceirizado"},
                           {id:"EFFECTIVE_SERVER",name:"Servidor Efetivo"},
                           {id:"COMMISSIONED_SERVER",name:"Servidor Comissionado"}];
   
   const statusOptions = [{id:true,name:"Ativo"},
                          {id:false,name:"Inativo"}];
    
   const statusOptions2 = [{value:"ACTIVE",label:"Ativo"},
                           {value:"NOT_ACTIVE",label:"Inativo"}];

   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions, setReportOptions] = useState([{id:"status", name:"Relatório de Funcionários por Status"},
                                                       {id:"clt_terc", name:"Relatório de Funcionários por Vinculo Empregatício"},
                                                       {id:"ferias", name:"Relatório de Funcionários por Férias"},
                                                       {id:"cargo", name:"Relatório de Funcionários por Cargo"},
                                                       {id:"gre", name:"Relatório de Funcionários por GRE"},
                                                       {id:"municipio", name:"Relatório de Funcionários por Município"},
                                                       {id:"doc", name:"Relatório de Funcionários Documentos a Vencer"}]);

   const [typeReport, setTypeReport] = useState(null);
    
   const [columns, setColumns] = useState(["Nome","CPF",/* "Empresa","CNPJ", */"Cargo","Matrícula","Status","Ações"]);

   const [employees, setEmployees] = useState([]);
   const [employeeId, setEmployeeId] = useState(null);

   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);

   const [openModal, setOpenModal] = useState(false);

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
       reset,
       formState: { errors },
    } = useForm({ defaultValues: {companyId:"",
                                  fullName:"",
                                  active:"",
    } });


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
      
            data["content"].forEach(dado =>
               dadosTratados.push({
                "value":  dado.id,
                "label": dado.name 
               }));
      
                return dadosTratados;
         });
   };

   //seletor assincrono para cargo/gre/municipio
   const asyncOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;

      switch(typeReport){
         case "cargo":
           url =  Constantes.urlBackAdmin + "position?" + new URLSearchParams(query);
           break;
         case "gre":
           url =  Constantes.urlBackRotas + "regional_education_management?" + new URLSearchParams(query);
           break;
         case "municipio":
           url =  Constantes.urlBackRotas + "municipality?" + new URLSearchParams(query);
           break;
      }
     
      
      return fetch(url, {method: "GET",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": typeReport == "cargo" ? "ADMINISTRATION" : "ROUTES",
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
   }

   const documentsGroupOptions = (teste) => {

      let query = {};
      query.size = 100;
      query.documentTypes = getValues("documentType") && getValues("documentType").length > 0 ?
                            getValues("documentType").map((a) => {return a.id}) : "";
      query.name = teste;

        
      return fetch(Constantes.urlBackDocuments + "documents-group?" + new URLSearchParams(query), 
        {method: "GET",
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


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "fullName": d.fullName,
            "cpf": d.cpf,
            //"companyName": d.companyName,
            //"cnpj": d.cnpj,
            "namePosition": d.namePosition,
            "registration": d.registration,
            "status": <Card style={{/* alignItems:"center", */
                                    ...(windowWidth <= 795  && {display:"inline-block"}),
                                    width:"fit-content",
                                    padding:"4px 12px",
                                    color: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    backgroundColor: d.status == "ACTIVE" ? "#58eb25" : "#eb2558",
                                    borderColor: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    borderRadius:"10px"}}>{d.status == "ACTIVE" ? "Ativo" : "Inativo"}</Card>,
            "actions": actionButtons(d.id,d.status)
          })
      );

      return tableData;
   }

   function dataForTableList(data){
      let tableData = [];
      let columnNames = [];
      console.log(data);
      data.forEach((d,i) => {

        let post = { 
              companyId:getValues("companyId"),
              fullName:getValues("fullName"),
              status: getValues("active") == "false" ? "NOT_ACTIVE" : 
                      getValues("active") == "true" ? "ACTIVE" : "",
              ...(typeReport == "status" && {status: d.id}),
              ...(typeReport == "clt_terc" && {typeLink: d.id}),
              ...(typeReport == "cargo" && {positionId: d.id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: d.id}),
              ...(typeReport == "municipio" && {municipalityId: d.id}),
              ...(typeReport == "doc" && {/* documentType: getValues("documentType").map((a) => {return a.id}), */
                                          documentsGroupId: d.id,
                                          startDate: getValues("startDate"),
                                          endDate: getValues("endDate")}),   
        
            };

         switch(typeReport){
           //PADRÃO ANTERIOR
           /* case "status":
              columnNames = ["Nome","Matrícula","CPF","Cargo","Telefone"];
              break;
           case "clt_terc":
              columnNames = ["Nome","Matrícula","CPF","Data da Contratação","Vinculo Empregatício","Cargo","Telefone"];
              break;
           case "cargo":
           case "gre":
           case "municipio":
              columnNames = ["Nome","Matrícula","CPF","Telefone"];
              break;
           case "doc":
              columnNames = ["Nome","Matrícula","CPF","Nome do Documento","Tipo de Documento","Data do Alerta","Telefone"];
              break; */
           // Nome, CPF, Data da Contratação, Vinculo Empregatício, Cargo, Município, Telefone, STATUS
           case "status":
           case "clt_terc":
           case "cargo":
           case "gre":
           case "municipio":
               columnNames = ["Nome", "CPF", "Data da Contratação", "Vinculo Empregatício", "Cargo", "Município", "Telefone", "Status"];
               break;
           case "doc":
               columnNames = ["Nome", "CPF", "Data da Contratação", "Vinculo Empregatício", "Cargo", "Município", "Nome do Documento","Tipo de Documento","Data do Alerta","Telefone", "Status"];
               break;
         }


         tableData.push({
            "name": <UncontrolledAccordion flush className={styles.accordion}>
                       <AccordionItem>
                          <AccordionHeader targetId={d.name}
                                           onClick={() => {getSubDataReport(post,i)}}>
                             <div style={{fontSize:"1.2rem"}}>{d.name}</div></AccordionHeader>
                          <AccordionBody accordionId={d.name}>
                             {d.subData && d.subData.length > 0 ? 
                               <TableStyle columnNames={columnNames}
                                           radius="sharp"
                                           data={dataForTableReport(d.subData)}/> :
                               <div style={{padding:"15px 25px"}}> Não há dados </div>
                             }
                          </AccordionBody>
                       </AccordionItem>
                    </UncontrolledAccordion>
         })
      });

      return tableData;
   }

   function dataForTableReport(data){
      let tableData = [];
      // PADRÃO ANTERIOR
      /* data.forEach(d => 
          tableData.push({
            "fullName": d.fullName,
            "registration": d.registration,
            "cpf": d.cpf,
             ...( typeReport == "clt_terc" && {"contractDate": FormatarData(d.contractDate,"dd/MM/yyyy"),
                                               "typeLink": d.typeLink ? vinculoOptions.filter((doc) => doc.id == d.typeLink)[0].name : "" }),
             ...((typeReport == "status" ||
                  typeReport == "clt_terc" ||
                  typeReport == "ferias") && {"namePosition": d.namePosition}),
             ...( typeReport == "ferias" && {"beginDate": FormatarData(d.startDate,"dd/MM/yyyy"),
                                             "newDate": FormatarData(d.endDate,"dd/MM/yyyy")}),
             ...( typeReport == "doc" && {"documentGroupName": d.documentGroupName,
                                          "documentType": d.documentType ? documentTypeOptions.filter((doc) => doc.id == d.documentType)[0].name : "",
                                          "alertDate": FormatarData(d.alertDate,"dd/MM/yyyy")}),
            "phone": d.phone,
          })
      ); */

      /* case "municipio":
          columnNames = ["Nome", "CPF", "Data da Contratação", "Vinculo Empregatício", "Cargo", "Município", "Telefone", "Status"];
      case "doc":
          columnNames = ["Nome", "CPF", "Data da Contratação", "Vinculo Empregatício", "Cargo", "Município", "Nome do Documento","Tipo de Documento","Data do Alerta","Telefone", "Status"]; */

      data.forEach(d => 
          tableData.push({
            "fullName": d.fullName,
            "cpf": d.cpf,
            "contractDate": FormatarData(d.contractDate,"dd/MM/yyyy"),
            "typeLink": d.typeLink ? vinculoOptions.filter((doc) => doc.id == d.typeLink)[0].name : "",
            "namePosition": d.namePosition,
            "municipalityName": d.municipalityName || "-",
             ...( typeReport == "ferias" && {"beginDate": FormatarData(d.startDate,"dd/MM/yyyy"),
                                             "newDate": FormatarData(d.endDate,"dd/MM/yyyy")}),
             ...( typeReport == "doc" && {"documentGroupName": d.documentGroupName,
                                          "documentType": d.documentType ? documentTypeOptions.filter((doc) => doc.id == d.documentType)[0].name : "",
                                          "alertDate": FormatarData(d.alertDate,"dd/MM/yyyy")}),
            "phone": d.phone,
            "status": d.status ? statusOptions2.filter((a) => a.value == d.status)[0].label : "",
          })
      );

      return tableData;
   }

   function setStatus(id){
      fetch(Constantes.urlBackAdmin + `employee/${id}`, {method: "PATCH",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2
          },})
          .then((response) => response.status) 
          .then((status) => {
               switch(status){
                   case 201:
                     showAlert("success", " Status alterado com sucesso!");
                   break;
                   case 401:
                     showAlert("danger","Erro de autorização");
                   break;
                   case 404:
                     showAlert("danger","Erro ao Alterar o Status");
                   break;  
               }
               getEmployees();
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function deleteEmployee(){
      fetch(Constantes.urlBackAdmin + `employee/${employeeId}`, {method: "DELETE",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2
          },})
          .then((response) => response.status) 
          .then((status) => {
               switch(status){
                   case 201:
                     showAlert("success", "Excluído com sucesso!");
                   break;
                   case 401:
                     showAlert("danger","Erro de autorização");
                   break;
                   case 404:
                     showAlert("danger","Error ao Apagar Funcionário");
                   break;   
               }
              getEmployees();
              setOpenModal(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function actionButtons(id,status){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
            <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/funcionarios/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Employee_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/funcionarios/${id}/edit`)}}><BsPencilSquare/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Editar
                   </div>
                 </div>
               </div>
             </div>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {setStatus(id)}}>{ status == "ACTIVE" ? <CgCloseR size={"1.5em"}/> : <BsCheckSquare/> }</Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                     { status == "ACTIVE" ? "Desativar" : "Ativar" }
                   </div>
                 </div>
               </div>
             </div>
             {/* <div className={styles.balloon_div}>
               <Button className={styles.button}onClick={() => {setEmployeeId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div> */}</>}
           </div>;
   }

   function clearFilter(){
      setValue("companyId","");
      setShowAsync(false);
      setValue("fullName","");
      setValue("active","");
      getEmployees();
   }
                                                    
   function getEmployees(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "employee?" + new URLSearchParams(query), {
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
                   setEmployees(body.content);
                   setNumber(body.page.number);
                   setSize(body.page.size);
                   setTotalElements(body.page.totalElements);
                   setTotalPages(body.page.totalPages);
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

   function getEmployeesReport(data){
      let url;
      let query = {};
      query.all = true;

      console.log(data);

      if(data != undefined) query = { ...query, ...data};

      switch(typeReport){
        case "ferias":
          url =  Constantes.urlBackReports + "employee/vacancies?" + new URLSearchParams(query);
          break;
        case "doc":
          url =  Constantes.urlBackReports + "employee/documents?" + new URLSearchParams(query);
          break;
        default :
          url =  Constantes.urlBackReports + "employee/list?" + new URLSearchParams(query);
          break;
      }

      setLoading(true);

      fetch(url, {
                method: "GET",
                headers: {
                    "Module": "STOCK",
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
                   setEmployees(body.content);
                   setNumber(body.page.number);
                   setSize(body.page.size);
                   setTotalElements(body.page.totalElements);
                   setTotalPages(body.page.totalPages);
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

   function getSubDataReport(data,index){
      let url;
      let query = {};
      /* query.page = number;
      query.size = size; */
      query.all = true;
  
      if(data != undefined) query = { ...query, ...data};

      switch(typeReport){
        case "ferias":
          url =  Constantes.urlBackReports + "employee/vacancies?" + new URLSearchParams(query);
          break;
        case "doc":
          url =  Constantes.urlBackReports + "employee/documents?" + new URLSearchParams(query);
          break;
        default :
          url =  Constantes.urlBackReports + "employee/list?" + new URLSearchParams(query);
          break;
      }
  
      setLoading(true);
  
      fetch(url, {
                method: "GET",
                headers: {
                    "Module": "STOCK",
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
                   if(index != undefined){
                      setEmployees(employees.map((s,i) =>{
                         if(i == index) s.subData = body.content;
                         return s;
                      }))
                   }else{
                      setEmployees(body.content);
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

   async function getReportExcel(){

      let urlName;
      let query = {companyId:getValues("companyId"),
                  fullName:getValues("fullName"),
                  ...(typeReport != "status" &&  {status: getValues("active") == "false" ? "NOT_ACTIVE" : 
                                                          getValues("active") == "true" ? "ACTIVE" : ""}),
                  ...(typeReport == "status" && getValues("activeReport").length < 2 && {status: getValues("activeReport").map((a) => {return a.id})}),
                  ...(typeReport == "clt_terc" && {typeLinks: getValues("typeLink").map((a) => {return a.id})}),
                  ...(typeReport == "ferias" && {startDate: getValues("startDate"),endDate: getValues("endDate")}),
                  ...(typeReport == "cargo" && {positionsId: getValues("types").map((a) => {return a.id})}),
                  ...(typeReport == "gre" && {ids: getValues("types").map((a) => {return a.id})}),
                  ...(typeReport == "municipio" && {ids: getValues("types").map((a) => {return a.id})}),
                  ...(typeReport == "doc" && {documentType: getValues("documentType").map((a) => {return a.id}),
                                              documentsGroup: getValues("documentsGroup").map((a) => {return a.id}),
                                              startDate: getValues("startDate"),
                                              endDate: getValues("endDate")}), 
                };


      switch(typeReport){
        case "status":
          urlName =  Constantes.urlBackReports + "employee/report/status?" + new URLSearchParams(query);
          break;
        case "clt_terc":
          urlName =  Constantes.urlBackReports + "employee/repot/type_link?" + new URLSearchParams(query);
          break;
        case "ferias":
          urlName =  Constantes.urlBackReports + "employee/repot/vacancies?" + new URLSearchParams(query);
          break;
        case "cargo":
          urlName =  Constantes.urlBackReports + "employee/repot/position?" + new URLSearchParams(query);
          break;
        case "gre":
          urlName =  Constantes.urlBackReports + "employee/repot/gre?" + new URLSearchParams(query);
          break;
        case "municipio":
          urlName =  Constantes.urlBackReports + "employee/repot/municipal?" + new URLSearchParams(query);
          break;
        case "doc":
          urlName =  Constantes.urlBackReports + "employee/repot/documents?" + new URLSearchParams(query);
          break;
        
      }
     

      try {
	
          const response = await fetch(
		      	urlName,
		      	{
		      		method: "GET",
		      		headers: {
		      			Module: "STOCK",
		      			Authorization: token2,
		      			"Content-Type": "application/json",
		      		},
		      	}
		      );
     
		     	if (!response.ok) {
		     		throw new Error("Erro ao gerar Excel");
		     	}
     
		     	const blob = await response.blob();
		     	const url = window.URL.createObjectURL(blob);
     
		     	const link = document.createElement("a");
		     	link.href = url;
           let index = reportOptions.findIndex(e => e.id == typeReport);
            let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Funcionários.xlsx";
		     	link.setAttribute("download", reportTitle);
		     	document.body.appendChild(link);
		     	link.click();
		     	link.remove();
		     } catch (error) {
		     	console.error("Erro ao baixar Excel:", error);
		     	showAlert("warning", "Erro ao gerar Excel.");
		     }
   }

   function generateTypeReport(){
      let data = { 
          companyId:getValues("companyId"),
          fullName:getValues("fullName"),
          status: getValues("active") == "false" ? "NOT_ACTIVE" : 
                  getValues("active") == "true" ? "ACTIVE" : "",
      };

      switch(typeReport){
          case "ferias":
             setColumns(["Nome", "CPF", "Data da Contratação", "Vinculo Empregatício", "Cargo", "Município","Data de Início","Data Retorno","Telefone", "Status"])
             data = {...data, startDate: getValues("startDate"),endDate: getValues("endDate")};
             getEmployeesReport(data);
             break;      
      }
   }

   function generateTypeReportList(){
       let columns = ["Nome"];

       switch(typeReport){
          case "status":
            if(getValues("activeReport") == undefined || (getValues("activeReport") && getValues("activeReport").length == 0)){
                return showAlert("warning","Selecione um tipo de status");
            }
            setEmployees(getValues("activeReport"));
            break;
          case "clt_terc":
            if(getValues("typeLink") == undefined || (getValues("typeLink") && getValues("typeLink").length == 0)){
                return showAlert("warning","Selecione um tipo de vínculo");
            }
            setEmployees(getValues("typeLink"));
            break;
         /*  case "ferias":
            setEmployees([]);
            break; */
          case "cargo":
          case "gre":
          case "municipio":
            if(getValues("types") == undefined || (getValues("types") && getValues("types").length == 0)){
                return showAlert("warning","Selecione um tipo de" + typeReport);
            }
            setEmployees(getValues("types"));
            break;
          case "doc":
            if(getValues("documentType") == "" || getValues("documentType") == null || getValues("documentType") == undefined){
               return showAlert("warning","Selecione o tipo de documento");
            }

            if(getValues("documentsGroup") == undefined || (getValues("documentsGroup") && getValues("documentsGroup").length == 0)){
                return showAlert("warning","Selecione um nome de documento");
            }
            
            /* setColumns(["Nome","Matrícula","CPF","Empresa","Nome do Documento","Tipo de Documento","Data do Alerta","Telefone"]);
            data = {...data,documentType: getValues("documentType"),startDate: getValues("startDate"),endDate: getValues("endDate")};
            getEmployeesReport(data);  */

            setEmployees(getValues("documentsGroup"));
            break;

       }
       setColumns(columns);
       setNumber(0);
       setSize(5);
       setTotalElements(0);
       setTotalPages(0);

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
     if(!generateReport){getEmployees();}
   },[number,size]);

   useEffect(() => {
    if(!showAsync) setShowAsync(true);
   },[showAsync]);

   useEffect(() => {
      if(!generateReport){ reset();getEmployees();setColumns(["Nome","CPF",/* "Empresa","CNPJ", */"Cargo","Matrícula","Status","Ações"])}
   },[generateReport]);

   return (<>

        { loading && <LoadingGif/>}
   
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Funcionários</h1>
         { checkPermission("Employee_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/funcionarios/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getEmployees)}>
            <Row className="d-flex mt-3">
              {/* { showAsync == true && 
               <Col sm="4">
                  <AsyncSelectForm
                    id={"companyId"}
                    name={"companyId"}
                    label="Empresa*"
                    register={register}
                    onChange={(e) => {setValue(`companyId`,e ? e.value : "")}}
                    options={companyOptions}
                  />
                </Col>} */}
               <Col sm="4">
                  <InputForm
                    id="fullName"
                    name="fullName"
                    label="Nome"
                    placeholder="Digite o nome"
                    register={register}
                    type="text"
                  />
                </Col>
               {(!generateReport  || 
                 (generateReport && typeReport != "status")) && <Col sm="4">
                  <InputForm
                    id="active"
                    name="active"
                    label="Status"
                    placeholder="Selecione o status"
                    register={register}
                    type="select"
                    options={statusOptions}
                  />
               </Col>}
            </Row>

            {checkPermission("Report_View") && <Col sm="12" style={{paddingLeft:"10px",fontSize:"20px",
                                      display:"flex", gap:"12px"}}>
                    <Input name="check" 
                           type="checkbox"
                           checked={generateReport}
                           onChange={() => {if(!generateReport){ setEmployees([]);setTypeReport("")} 
                                            setGenerateReport(!generateReport)}}
                           className={styles.radioButton}>
                    </Input>
                    Gerar Relatório
            </Col>}

            {generateReport &&  <Row className="d-flex mt-3 pt-3"
                 style={{borderTop: "1px solid rgb(222, 226, 230)"}}>
               <Col sm="6">
                  <InputForm
                    id="typeReport"
                    name="typeReport"
                    label="Tipo de Relatório"
                    placeholder="--Selecione o tipo de relatório--"
                    register={register}
                    type="select"
                    options={reportOptions}
                    onChange={(e) => {setTypeReport(e.target.value);
                                      setEmployees([]);
                                      setShowAsync(false);
                    }}
                  />
               </Col>

               {typeReport == "status" &&
                  <Col sm="3">
                     <MultiSelectForm
                       id="activeReport"
                       name="activeReport"
                       label="Status"
                       placeholder="Selecione o status"
                       register={register}
                       options={statusOptions2}
                       onChange={(e) => { setValue('activeReport',e.map((e) => {return {id: e.value,
                                                                                        name: e.label,
                                                                                        subData:[]}}));
                                          setEmployees([]);}}
                     />
                  </Col>
               }

               {typeReport == "clt_terc" && 
                  <Col sm="3">
                    <MultiSelectForm
                     id="typeLink"
                     name="typeLink"
                     label="Tipo de Vínculo*"
                     placeholder="--Selecione--"
                     register={register}
                     type="select"
                     options={[{value:"PARTNER_CONTRACTOR",label:"Parceiro"},
                               {value:"TEMPORARY",label:"Temporário"},
                               {value:"CLT",label:"CLT"},
                               {value:"OUTSOURCED",label:"Terceirizado"},
                               {value:"EFFECTIVE_SERVER",label:"Servidor Efetivo"},
                               {value:"COMMISSIONED_SERVER",label:"Servidor Comissionado"}]}
                     onChange={(e) => { setValue("typeLink",e.map((e) => {return {id: e.value,
                                                                                  name: e.label,
                                                                                  subData:[]}}));
                                        setEmployees([]);}}
                    />
                  </Col>
               }

               {(typeReport == "cargo" || 
                 typeReport == "gre" || 
                 typeReport == "municipio") && showAsync &&
                  <Col sm="3">
                    <AsyncSelectForm
                      id={"types"}
                      name={"types"}
                      label={reportOptions[reportOptions.findIndex(e => e.id == typeReport)].name.split("Relatório de Funcionários por")[1]}
                      register={register}
                      isMulti={true}
                      /* onChange={(e) => {setValue(`typeId`,e ? e.value : "");
                                        setValue(`typeName`,e ? e.label : "");}} */
                      onChange={(e) => { setValue("types",e.map((e) => {return {id: e.value,
                                                                                name: e.label,
                                                                                subData:[]}}));
                                         setEmployees([]);}}
                      options={asyncOptions}
                    />
                  </Col>
               }

               {typeReport == "doc" && <>
                  <Col sm="3">
                    {/* <InputForm
                     id="documentType"
                     name="documentType"
                     label="Tipo de Documento"
                     placeholder="--Selecione--"
                     register={register}
                     type="select"
                     onChange={() => {setShowAsync(false);setEmployees([]);}}
                     options={documentTypeOptions}
                    /> */}
                    <MultiSelectForm
                       id="documentType"
                       name="documentType"
                       label="Tipo de Documento*"
                       placeholder="--Selecione--"
                       register={register}
                       type="select"
                       options={[{value:"DOCUMENTS",label:"Documentos Pessoais"},
                                 {value:"EXAMES",label:"Exames Obrigatórios"},
                                 {value:"COURSES",label:"Cursos Obrigatórios"},]}
                       onChange={(e) => { setValue("documentType",e.map((e) => {return {id: e.value,
                                                                                        name: e.label}}));
                                          setShowAsync(false);
                                          setEmployees([]);}}
                    />
                  </Col>
                  {showAsync && <Col sm="3">
                     <AsyncSelectForm
                       id={"documentGroup"}
                       name={"documentGroup"}
                       label="Nome do Documento"
                       register={register}
                       isMulti={true}
                       onChange={(e) => { setValue("documentsGroup",e.map((e) => {return {id: e.value,
                                                                                          name: e.label,
                                                                                          subData:[]}}));
                                          setEmployees([]);}}
                       options={documentsGroupOptions}
                     />
                  </Col>}
               </>}

               {(typeReport == "doc" || typeReport == "ferias") && <>
                   <Col sm="3">
                        <InputForm
                            id="startDate"
                            name="startDate"
                            label="Data de Início"
                            placeholder="dd/mm/aaaa"
                            register={register}
                            type="date"
                        />
                    </Col>
                    <Col sm="3">
                        <InputForm
                            id="endDate"
                            name="endDate"
                            label="Data de Fim"
                            placeholder="dd/mm/aaaa"
                            register={register}
                            type="date"
                        />
                    </Col>
                 </>
               }


               

            </Row>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">

              {generateReport ?  <>
                {employees.length > 0 && 
                 <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                   Exportar <FaFileExport />
                 </Button>}
                <Button onClick={() => {if(typeReport == "ferias") generateTypeReport("exhibition"); 
                                        else generateTypeReportList()}}
                        style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                  Gerar Relatório <FiBarChart2 />
                </Button> 
                <Button onClick={() => {setGenerateReport(false);reset();}} 
                        style={{ backgroundColor: "#c00", width:"130px"}}>
                  Cancelar
                </Button></> :

                <><Button onClick={() => {clearFilter()}} style={{ backgroundColor: "#009E8B", width:"130px"}}>
                   Limpar <FaEraser />
                 </Button>

                 <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px", marginRight:"10px"}}>
                   Filtrar <FaFilter />
                 </Button></> } 
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%"}}>
             {windowWidth > 795 && employees.length > 0 &&
              <TableStyle columnNames={columns} /* data={generateReport && typeReport != null ? dataForTableReport(employees) : dataForTable(employees)} */
                          noStriped={generateReport  && typeReport != "ferias"}
                          data={generateReport && typeReport == "ferias" ? dataForTableReport(employees) : 
                                generateReport && typeReport != "ferias" ? dataForTableList(employees) : dataForTable(employees)}/>}
             {windowWidth <= 795 && employees.length > 0 &&
              <IndexCardsStyle names={columns} data={generateReport && typeReport != null ? dataForTableReport(employees) : dataForTable(employees)}/>}
             {generateReport && employees.length == 0 && 
               <div style={{ backgroundColor: "#f8f9fa",textAlign: "center", padding: "4rem 2rem", color:"#999" }}>
                 <FiBarChart2 size={64} color="#999" />
                 <p style={{ marginTop: "16px", marginBottom: "8px", color: "#666" }}>
                   Selecione um relatório para visualizar.
                 </p>
                 <span style={{ fontSize: "14px", color: "#999" }}>
                   Clique em Gerar Relatório após selecionar um tipo.
                 </span>
               </div>}          
        </CardBody>

        {!generateReport && employees.length > 0 && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={employees.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

        <ModalStyle  open={openModal} title="Remover Funcionário" onClick={() => {deleteEmployee()}} toggle={() => setOpenModal(!openModal)}>
          Cuidado essa ação poderá ser desfeita!
        </ModalStyle>

        {activeAlert && (
           <AlertMessage type={alert["type"]}
               text={alert["text"]}
               isOpen={isOpen}
               toggle={onDismiss}>
           </AlertMessage>
        )}      
    </>)
  }