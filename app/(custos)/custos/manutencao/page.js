"use client"
import { useState, useEffect, useContext, Fragment } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaFileExport } from "react-icons/fa";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare  } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import { FiBarChart2 } from 'react-icons/fi';
import styles from "./manutencao.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader,CardBody,CardFooter,
         UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem,
 } from "reactstrap";
import AlertMessage from "../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../src/Components/ElementsUI/AsyncSelectForm";
import ModalStyle from "../../../../src/Components/ElementsUI/ModalStyle"; 
import FormatarData from "../../../../src/Utils/FormatarData";
import FormatarReal from "../../../../src/Utils/FormatarReal";
import MaskReal from "../../../../src/Utils/MaskReal";

export default function Page() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
   
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name.includes(name)) != -1 : false;
   }

   const router = useRouter();

   const [loading, setLoading] = useState(false);

   const [showAsync, setShowAsync] = useState([true,true,true,true,true]);
   
   /* const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]); */
    
   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions, setReportOptions] = useState([{id:"municipio", name:"Relatório de Manutenção por Município"},
                                                       {id:"veiculo", name:"Relatório de Manutenção por Veículo"},
                                                       {id:"fornecedor", name:"Relatório de Manutenção por Fornecedor"},
                                                       {id:"gre", name:"Relatório de Manutenção por GRE"},
                                                       {id:"rota_gre", name:"Relatório de Manutenção por Rota/GRE"}]);
   
   const [typeReport, setTypeReport] = useState(null);
   
   const [subTotalValues, setSubTotalValues] = useState([]);
   const [subTotalValuesIndex, setSubTotalValuesIndex] = useState();
   const [totalValue, setTotalValue] = useState();
   
   const [columns, setColumns] = useState(["N° Nota Fiscal","Fornecedor","Local","Data","Valor",/*"Status", */"Ações"]);

   const [maintenances, setMaintenances] = useState([/* {id:"1",code:"0024",supplier:"Fornecedor",location:"Garagem Central",date:"01/01/2025"} */]);
   const [maintenanceId, setMaintenanceId] = useState(null);

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
       getValues,
       setValue,
       reset,
       formState: { errors },
    } = useForm({ defaultValues: {companyId:"",
                                  vehicleId:"",
                                  regionalEducationManagementId:"",
                                  municipalityId:"",
                                  routeId:"",
                                  invoiceNumber: "", 
                                  minValue: "",
                                  maxValue: "",
                                  startDate: "",
                                  endDate: "",
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

    const vehicleOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.plate = teste;
       query.prefix = teste;
       /* query.status = "ACTIVE"; */
       /* query.statusVehicle = ["ACTIVE","UNDER_MAINTENANCE","RESERVE"];
       query.locationNotNull = true; */
       url =   "vehicle?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackPatrimony + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "PATRIMONY",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
      
             let dadosTratados = [];
             
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": (dado.prefix || "(sem prefixo)") + "/" + dado.plate,
                }));
       
                 return dadosTratados;
          });
    };

    const municipioOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      if(!generateReport) query.regionalEducationManagementId = getValues("regionalEducationManagementId") || "";
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

    const greOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       if(!generateReport) query.municipalityId = getValues("municipalityId") || "";
       query.allGre = true;
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

    const routeOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       if(!generateReport) query.regionalEducationManagementId = getValues("regionalEducationManagementId") || "";
       if(!generateReport) query.municipalityId = getValues("municipalityId") || "";
       if(generateReport) query.greIds = getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length > 0 ?
                                         getValues("regionalEducationManagements").map((a) => {return a.id}) : "";
       query.status = "ACTIVE";
       url =  "routes?" + new URLSearchParams(query);
       
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

    const supplierOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      url =  "supplier?" + new URLSearchParams(query);
      
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
                "label": dado.name,
                "cnpj" : dado.docs 
               }));
      
                return dadosTratados;
         });
   };


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "invoiceNumber": d.invoiceNumber || "-",
            "supplierName": d.supplierName,
            "locationName": d.place,
            "date": FormatarData(d.invoiceData,"dd/MM/yyyy"),
            "value": d.invoiceValue ? FormatarReal(String(d.invoiceValue.toFixed(2))) : "-",
            /* "status": <Card style={{alignItems:"center",
                                    width:"fit-content",
                                    padding:"4px 12px",
                                    color: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    backgroundColor: d.status == "ACTIVE" ? "#58eb25" : "#eb2558",
                                    borderColor: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    borderRadius:"10px"}}>{d.status == "ACTIVE" ? "Ativo" : "Inativo"}</Card>, */
            "actions": actionButtons(d.id,d.status)
          })
      );

      return tableData;
   }

   function dataForTableList(data){
      let tableData = [];
      let columnNames = [];

      data.forEach((d,i) => {

         /* let post = { 
              invoiceNumber:getValues("invoiceNumber"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              ...(typeReport == "municipio" && {municipalityId: d.id}),
              ...(typeReport == "veiculo" && {vehicleId: d.id}),
              ...(typeReport == "fornecedor" && {supplierId: d.id}),
              ...(typeReport == "rota_gre" && {routeId: d.id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: d.id})

         }; */

         switch(typeReport){
           case "municipio":
              columnNames = ["N° Nota Fiscal","GRE","Local Responsável","Fornecedor","Dt. Emissão","Valor Total"];
              break;
           case "veiculo":
           case "fornecedor":
              columnNames = ["N° Nota Fiscal","GRE","Município","Rota","Dt. Emissão","Valor Total"];
              break;
           case "rota_gre":
              columnNames = ["N° Nota Fiscal","Município","Veiculo","Distância Total","Dt. Emissão","Valor Total"];
              break;
           case "gre":
              columnNames = ["N° Nota Fiscal","Município","Local Responsável","Fornecedor","Dt. Emissão","Valor Total"];
              break;
         }


         tableData.push({
            "name": <UncontrolledAccordion flush className={styles.accordion}>
                       <AccordionItem>
                          <AccordionHeader targetId={d.name}
                                           /* onClick={() => {getSubDataReport(post,i)}} */>
                             {/* <div style={{fontSize:"1.2rem"}}>{d.name}</div> */}
                             <div style={{fontSize:"1.2rem",display:"flex", justifyContent:"space-between",width:"190%"}}>
                                 <div>{d.name}</div> <div>Valor Total: R$ {subTotalValues[i] ? FormatarReal(String(subTotalValues[i].toFixed(2))) : "0,00"}</div>
                             </div>
                          </AccordionHeader>
                          <AccordionBody accordionId={d.name}>
                             {d.subData.length > 0 ? 
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


   function removeDuplicates(array,key){
      const item = new Set();
      return array.filter(i => {
         if (item.has(i[key])) {
           return false; // Item has been seen before, filter it out
         } else {
           item.add(i[key]); // Add the new ID to the Set
           return true;          // Keep the item
         }});
   }

   function dataForTableReport(data,forExport){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "invoiceNumber": d.invoiceNumber || "-",
            /* ...((typeReport != "gre" &&  
                 typeReport != "rota_gre") && {"regionalEducationManagements": d.municipalityAndGre && d.municipalityAndGre.length > 0 ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map((e,i) =>  {return <Fragment key={i}>{e.regionalEducationManagementName}<br/></Fragment>}) : "-"}),  */
            ...((typeReport != "gre" &&  
                 typeReport != "rota_gre") && {"regionalEducationManagements": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map(obj => obj.regionalEducationManagementName).join(", \n") :
                                                                               d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map((e,i) =>  {return <Fragment key={i}>{e.regionalEducationManagementName}<br/></Fragment>}) : "-"}),

            /* ...(typeReport != "municipio" && {"municipalities": d.municipalityAndGre && d.municipalityAndGre.length > 0 ? removeDuplicates(d.municipalityAndGre,"municipalityName").map((e,i) =>  {return <Fragment key={i}>{e.municipalityName}<br/></Fragment>}) : "-"}), */
            ...(typeReport != "municipio" && {"municipalities": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map(obj => obj.municipalityName).join(", \n") : 
                                                                d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map((e,i) =>  {return <Fragment key={i}>{e.municipalityName}<br/></Fragment>}) : "-"}),
            ...((typeReport == "veiculo" || typeReport == "fornecedor") && {"routeName": d.routeName}),
            ...((typeReport == "gre" || typeReport == "municipio") && {"locationName": d.place}),
            ...((typeReport == "gre" || typeReport == "municipio") && {"supplierName": d.supplierName}),
            ...(typeReport == "rota_gre" && {"vehicles": d.vehicles && d.vehicles.length > 0 && forExport != undefined ? d.schools.map(obj => (obj.prefix || "(sem prefixo)") + "/" + obj.plate).join(", \n") :
                                                         d.vehicles && d.vehicles.length > 0 && forExport == undefined ? d.vehicles.map( (e,index) => {
                                                                                                                           return <Fragment key={index}><div>{ (e.prefix || "(sem prefixo)") + "/" + e.plate}</div><br/></Fragment>}) : "-"}),
            ...(typeReport == "rota_gre" && {"distance": d.municipalityAndGre.length > 0 && d.municipalityAndGre[0].distance ? String(d.municipalityAndGre[0].distance.toFixed(2)).replace(".",",") + " Km" : "-"}),
            "emissionDate": FormatarData(d.invoiceData,"dd/MM/yyyy"),
            "totalValue":  d.invoiceValue ? "R$ " + FormatarReal(String(d.invoiceValue.toFixed(2))) : "-",
          })
      );

      return tableData;
   }

   /* function setStatus(id){
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
               getMaintenance();
          })
          .catch((error) => {
             console.log(error);
          }) 
   } */

   function deleteMaintenance(){
      fetch(Constantes.urlBackCosts + `manitenance/archive/${maintenanceId}`, {
          method: "PATCH",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "COSTS",
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
              getMaintenance();
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
               <Button className={styles.button} onClick={() => {router.push(`/custos/manutencao/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Maintenance_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/custos/manutencao/${id}/edit`)}}><BsPencilSquare/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Editar
                   </div>
                 </div>
               </div>
             </div>
              {/* <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {setStatus(id)}}>{ status == "ACTIVE" ? <CgCloseR size={"1.5em"}/> : <BsCheckSquare/> }</Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                     { status == "ACTIVE" ? "Desativar" : "Ativar" }
                   </div>
                 </div>
               </div>
             </div>*/}
            <div className={styles.balloon_div}>
               <Button className={styles.button}onClick={() => {setMaintenanceId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div> </>}
           </div>;
   }

   function clearFilter(){
      setValue("companyId","");
      setValue("vehicleId","");
      setValue("regionalEducationManagementId","");
      setValue("municipalityId","");
      setValue("routeId","");
      setValue("minValue","");
      setValue("maxValue","");
      setShowAsync([false,false,false,false,false]);
      setValue("invoiceNumber","");
      setValue("date","");
      getMaintenance();
   }
                                                    
   function getMaintenance(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined){ 
         query = { ...query, ...data};
         if(query.minValue != ""){
            query.minValue = query.minValue.replaceAll(".","");
            query.minValue = parseFloat(query.minValue.replace(",","."));
         }

         if(query.maxValue != ""){
            query.maxValue = query.maxValue.replaceAll(".","");
            query.maxValue = parseFloat(query.maxValue.replace(",","."));
         }
      }

      setLoading(true);

      fetch(Constantes.urlBackCosts + "manitenance?" + new URLSearchParams(query), {
                method: "GET",
                headers: {
                    "Module": "COSTS",
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
                   setMaintenances(body.content);
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


  /* function getMaintenancesReport(data){
      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackReports + "costs/maintenance?" + new URLSearchParams(query), {
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
                   setMaintenances(body.content);
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
      
  } */

  function getSubDataReport(data,index,typeReport){
     let query = {};
     /* query.page = number;
     query.size = size; */
     query.all = true;

     if(data != undefined) query = { ...query, ...data};

     setLoading(true);

     fetch(Constantes.urlBackReports + "costs/maintenance?" + new URLSearchParams(query), {
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
      
                    if(index == 0){
                       setMaintenances(getValues(typeReport).map((s,i) =>{
                          if(i == index) s.subData = body.content;
                          return s;
                       }))
                     }else{ 
                       setMaintenances(maintenances.map((s,i) =>{
                          if(i == index) s.subData = body.content;
                          return s;
                       }))
                     }
                     
                     let subtotalValue = body.content.reduce((a, value) => {return a + value["invoiceValue"]}, 0);
                     if(index == 0){
                        setSubTotalValues([subtotalValue]);
                     }else{
                        setSubTotalValues([...subTotalValues,subtotalValue]);
                     }
                     
                     setSubTotalValuesIndex(index + 1);
                  }else{
                     setMaintenances(body.content);
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

  function getReportSubtitle(title){
     switch(typeReport){
        case "municipio":
          return title + ": " + getValues("municipalityName");
        case "veiculo":
          return title + ": " + getValues("vehicleName");
        case "fornecedor":
          return title + ": " + getValues("supplierName") + "/" + getValues("cnpj");
        case "rota_gre":
          return title + ": " + getValues("routeName") + "/" + (getValues("regionalEducationManagementName") || "");
        case "gre":
          return title + ": " + getValues("regionalEducationManagementName");
      }
   }

  function generateCSV(data){

     let query = {};
     query.all = true;

     if(data != undefined) query = { ...query, ...data};

     setLoading(true);

     fetch(Constantes.urlBackReports + "costs/maintenance?" + new URLSearchParams(query), {
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
                  //setSuppliers(body.content);
                  let index = reportOptions.findIndex(e => e.id == typeReport);
                  let reportTitle = index != -1 ? reportOptions[index].name : "Relatório de Fornecedores";
                  const csvData = [];
    
                  csvData.push(['Sistema de Administração da Frota']);
                  csvData.push([getReportSubtitle(reportTitle)]);
                  csvData.push([]);
    
                  const headers = columns;
                  csvData.push(headers.map(h => String(h).replace(/<[^>]+>/g, '')));
                  const displayData = dataForTableReport(body.content,true);
    
                  displayData.forEach(row => {
          
                  const rowValues = [];
                   for(const [_,value] of Object.entries(row)){      
                      rowValues.push(value)
                   }
             
                   csvData.push(rowValues);
                  });
    
                  let csvString = '';
                  csvData.forEach(row => {
                    csvString += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
                  });
            
                  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${reportTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert('Seu navegador não suporta download automático de CSV. Salve o conteúdo manualmente.');
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
  /* function generateTypeReport(type){
      let data = { 
          invoiceNumber:getValues("invoiceNumber"),
          minValue: getValues("minValue"),
          maxValue: getValues("maxValue"),
          startDate: getValues("startDate"),
          endDate: getValues("endDate"),
      };
      switch(typeReport){
          case "municipio":
             if(getValues("municipalityId") == "" || getValues("municipalityId") == null || getValues("municipalityId") == undefined){
                return showAlert("warning","Selecione o município");
             }
             setColumns(["N° Nota Fiscal","GRE","Local Responsável","Fornecedor","Dt. Emissão","Valor Total"]);
             data = {...data,
                     municipalityId: getValues("municipalityId")};
             if(type == "exhibition") getMaintenancesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "veiculo":
          case "fornecedor":
             if(typeReport == "veiculo" && (getValues("vehicleId") == "" || getValues("vehicleId") == null || getValues("vehicleId") == undefined)){
                return showAlert("warning","Selecione o veículo");
             }
             if(typeReport == "fornecedor" && (getValues("supplierId") == "" || getValues("supplierId") == null || getValues("supplierId") == undefined)){
                return showAlert("warning","Selecione o fornecedor");
             }
             setColumns(["N° Nota Fiscal","GRE","Município","Rota","Dt. Emissão","Valor Total"]);
             data = {...data,
                     ...(typeReport == "veiculo" && {vehicleId: getValues("vehicleId")}),
                     ...(typeReport == "fornecedor" && {supplierId: getValues("supplierId")}),};
             if(type == "exhibition") getMaintenancesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "rota_gre":
             if(getValues("routeId") == "" || getValues("routeId") == null || getValues("routeId") == undefined){
                 return showAlert("warning","Selecione a rota");
             }
             setColumns(["N° Nota Fiscal","Município","Veiculo","Distância Total","Dt. Emissão","Valor Total"]);
             data = {...data,
                     routeId: getValues("routeId")};
             if(type == "exhibition") getMaintenancesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "gre":
             if(getValues("regionalEducationManagementId") == "" || getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == undefined){
                 return showAlert("warning","Selecione a gre");
             }
             setColumns(["N° Nota Fiscal","Município","Local Responsável","Fornecedor","Dt. Emissão","Valor Total"]);
             data = {...data,
                     regionalEducationManagementId: getValues("regionalEducationManagementId")};
             if(type == "exhibition") getMaintenancesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
      }
   } */

   async function getReportExcel(){
      
    let urlName;
    let query = { invoiceNumber:getValues("invoiceNumber"),
                  minValue: getValues("minValue"),
                  maxValue: getValues("maxValue"),
                  startDate: getValues("startDate"),
                  endDate: getValues("endDate"),
                  ...(typeReport == "municipio" && {ids: getValues("municipalities").map((a) => {return a.id})}),
                  ...(typeReport == "veiculo" && {ids: getValues("vehicles").map((a) => {return a.id})}),
                  ...(typeReport == "fornecedor" && {ids: getValues("suppliers").map((a) => {return a.id})}),
                  ...(typeReport == "rota_gre" && {routesIds: getValues("routes").map((a) => {return a.id})}),
                  ...(typeReport == "gre" && {ids: getValues("regionalEducationManagements").map((a) => {return a.id})})};
    
    
    switch(typeReport){
      case "municipio":
        urlName =  Constantes.urlBackReports + "maintenance/repot/municipality?" + new URLSearchParams(query);
        break;
      case "veiculo":
        urlName =  Constantes.urlBackReports + "maintenance/repot/vehicle?" + new URLSearchParams(query);
        break;     
      case "fornecedor":
        urlName =  Constantes.urlBackReports + "maintenance/repot/supplier?" + new URLSearchParams(query);
        break;     
      case "rota_gre":
        urlName =  Constantes.urlBackReports + "maintenance/repot/routes_gre?" + new URLSearchParams(query);
        break;    
      case "gre":
        urlName =  Constantes.urlBackReports + "maintenance/repot/gre?" + new URLSearchParams(query);
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
      let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Manutenções.xlsx";
      link.setAttribute("download", reportTitle);
      document.body.appendChild(link);
      link.click();
      link.remove();
     } catch (error) {
      console.error("Erro ao baixar Excel:", error);
      showAlert("warning", "Erro ao gerar Excel.");
     }
   }

   function clearReportValues(){
     setMaintenances([]);
     setSubTotalValues([]);
     setSubTotalValuesIndex();
     setTotalValue(0);
   }

   function generateTypeReportList(){
       //let columns = ["Nome"];

       let post = { invoiceNumber:getValues("invoiceNumber"),
                    minValue: getValues("minValue"),
                    maxValue: getValues("maxValue"),
                    startDate: getValues("startDate"),
                    endDate: getValues("endDate")}

       switch(typeReport){
          case "municipio":
             if(getValues("municipalities") == undefined || (getValues("municipalities") && getValues("municipalities").length == 0)){
                return showAlert("warning","Selecione um municipio");
             }
             //setMaintenances(getValues("municipalities"));
             post = {...post,municipalityId: getValues("municipalities")[0].id};
             getSubDataReport(post,0,"municipalities");
             break;
          case "veiculo":
             if(getValues("vehicles") == undefined || (getValues("vehicles") && getValues("vehicles").length == 0)){
                return showAlert("warning","Selecione um veiculo");
             }
             //setMaintenances(getValues("vehicles"));
             post = {...post,vehicleId: getValues("vehicles")[0].id};
             getSubDataReport(post,0,"vehicles");
             break;
          case "fornecedor":
             if(getValues("suppliers") == undefined || (getValues("suppliers") && getValues("suppliers").length == 0)){
                return showAlert("warning","Selecione um posto");
             }
             //setMaintenances(getValues("suppliers"));
             post = {...post,supplierId: getValues("suppliers")[0].id};
             getSubDataReport(post,0,"suppliers");
             break;
          case "rota_gre":
             if(getValues("routes") == undefined || (getValues("routes") && getValues("routes").length == 0)){
                return showAlert("warning","Selecione uma rota");
             }
             //setMaintenances(getValues("routes"));
             post = {...post,routeId: getValues("routes")[0].id};
             getSubDataReport(post,0,"routes");
             break;
          case "gre":
             if(getValues("regionalEducationManagements") == undefined || (getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length == 0)){
                return showAlert("warning","Selecione uma gre");
             }
             //setMaintenances(getValues("regionalEducationManagements"));
             post = {...post,regionalEducationManagementId: getValues("regionalEducationManagements")[0].id};
             getSubDataReport(post,0,"regionalEducationManagements");             
             break;

       }
       //setColumns(columns);
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
    if(!generateReport){ getMaintenance();}
   },[number,size]);

   useEffect(() => {
    /* if(!showAsync) setShowAsync(true); */
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

   useEffect(() => {
      if(!generateReport){ getMaintenance();setColumns(["N° Nota Fiscal","Fornecedor","Local","Data","Valor","Ações"])}
   },[generateReport]);

   useEffect(() => {
     
     if(subTotalValuesIndex != undefined && subTotalValuesIndex < maintenances.length){
         
       let post = {
                invoiceNumber:getValues("invoiceNumber"),
                minValue: getValues("minValue"),
                maxValue: getValues("maxValue"),
                startDate: getValues("startDate"),
                endDate: getValues("endDate"), 
                ...(typeReport == "municipio" && {municipalityId: maintenances[subTotalValuesIndex].id}),
                ...(typeReport == "veiculo" && {vehicleId: maintenances[subTotalValuesIndex].id}),
                ...(typeReport == "fornecedor" && {supplierId: maintenances[subTotalValuesIndex].id}),
                ...(typeReport == "rota_gre" && {routeId: maintenances[subTotalValuesIndex].id}),
                ...(typeReport == "gre" && {regionalEducationManagementId: maintenances[subTotalValuesIndex].id})
       };

       getSubDataReport(post,subTotalValuesIndex);
     }
     if(subTotalValuesIndex != undefined && subTotalValuesIndex == maintenances.length){
         let total = subTotalValues.reduce((a, value) => {return a + value}, 0);
         setTotalValue(total);
         setColumns([<div style={{display:"flex", justifyContent:"space-between"}}> 
                          <div>Nome</div> <div>Valor Total: R$ {FormatarReal(String(total.toFixed(2)))}</div>
                     </div>]);
     }
   }, [subTotalValuesIndex])

   return (<>

        { loading && <LoadingGif/>}
   
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Serviços de Manutenção</h1>
         { checkPermission("Maintenance_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push("/custos/manutencao/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getMaintenance)}>
            <Row className="d-flex mt-3">
              { showAsync[0] == true && !generateReport &&
               <Col sm="3">
                  <AsyncSelectForm
                    id={"companyId"}
                    name={"companyId"}
                    label="Fornecedor"
                    register={register}
                    onChange={(e) => {setValue(`supplierId`,e ? e.value : "")}}
                    options={supplierOptions}
                  />
                </Col>}
               <Col sm="3">
                  <InputForm
                    id="invoiceNumber"
                    name="invoiceNumber"
                    label="Nota Fiscal"
                    placeholder="Digite o número"
                    register={register}
                    type="text"
                  />
                </Col>
                { showAsync[1] == true && !generateReport &&
                 <Col sm={"3"}>
                    <AsyncSelectForm
                      id="vehicleId"
                      name="vehicleId"
                      label="Veículo"
                      register={register}
                      required={false}
                      onChange={(e) => {setValue("vehicleId", e ? e.value : "");
                                        setValue("vehicleName", e? e.label : "")}}
                      options={vehicleOptions}
                      errors={errors}
                    />  
                 </Col>}
                 { checkPermission("Regional_Education_Management") && 
                   showAsync[2] == true && !generateReport &&
                    <Col sm="3">
                    <AsyncSelectForm
                      id="regionalEducationManagementId"
                      name="regionalEducationManagementId"
                      label="GRE"
                      register={register}
                      required={false}
                      defaultValue={getValues("regionalEducationManagementId") ? {value: getValues("regionalEducationManagementId"), label: getValues("regionalEducationManagementName")} : null}
                      onChange={(e) => {setValue("regionalEducationManagementId", e ? e.value : "");
                                        setValue("regionalEducationManagementName", e ? e.label : "");
                                        setValue("municipalityId","");setValue("municipalityName","");
                                        setShowAsync([true,true,true,false,true])}}
                      options={greOptions}
                      errors={errors}
                    />
                 </Col>}
               {/* <Col sm="4">
                  <InputForm
                    id="active"
                    name="active"
                    label="Status"
                    placeholder="Selecione o status"
                    register={register}
                    type="select"
                    options={statusOptions}
                  />
               </Col> */}
            {/* </Row>
            <Row className="d-flex mt-3"> */}
              { checkPermission("Municipality") && 
                showAsync[3] == true &&
                !generateReport && <Col sm="4">
              <AsyncSelectForm
                   id="municipalityId"
                   name="municipalityId"
                   label="Município"
                   register={register}
                   required={false}
                   defaultValue={ getValues("municipalityId") ? {value:getValues("municipalityId"),label:getValues("municipalityName")} : null}
                   onChange={(e) => {setValue("municipalityId", e ? e.value : "");
                                     setValue("municipalityName", e ? e.label : "");
                                     setShowAsync([true,true,true,true,false])}}
                   options={municipioOptions}
                   errors={errors}
                 />
               </Col>}

               { checkPermission("Route") && 
                showAsync[4] == true &&
                !generateReport && <Col sm="4">
                   <AsyncSelectForm
                        id="routeId"
                        name="routeId"
                        label="Rota"
                        register={register}
                        required={false}
                        defaultValue={ getValues("routeId") ? {value:getValues("routeId"),label:getValues("routeName")} : null}
                        onChange={(e) => {setValue("routeId", e ? e.value : "");
                                          setValue("routeName", e ? e.label : "")}}
                        options={routeOptions}
                        errors={errors}
                      />
                    </Col>}
               <Col sm="2">
                   <InputForm
                       id="startDate"
                       name="startDate"
                       label="Data de Início"
                       placeholder="dd/mm/aaaa"
                       register={register}
                       type="date"
                   />
               </Col>
               <Col sm="2">
                   <InputForm
                       id="endDate"
                       name="endDate"
                       label="Data de Fim"
                       placeholder="dd/mm/aaaa"
                       register={register}
                       type="date"
                   />
               </Col>
               <Col sm="2">
                  <InputForm
                    id="minValue"
                    name="minValue"
                    label="Valor de"
                    placeholder="0,00"
                    register={register}
                    onChange={(e) => MaskReal(e)}
                    type="text"
                  />
                </Col>
                <Col sm="2">
                  <InputForm
                    id="maxValue"
                    name="maxValue"
                    label="até"
                    placeholder="0,00"
                    register={register}
                    onChange={(e) => MaskReal(e)}
                    type="text"
                  />
                </Col>
            </Row>

            {checkPermission("Report_View") && <Col sm="12" style={{paddingLeft:"10px",fontSize:"20px",
                                      display:"flex", gap:"12px"}}>
                    <Input name="check" 
                           type="checkbox"
                           checked={generateReport}
                           onChange={() => {clearReportValues();
                                            setGenerateReport(!generateReport)}}
                           className={styles.radioButton}>
                    </Input>
                    Gerar Relatório
            </Col>}

            {generateReport &&  
              <Row className="d-flex mt-3 pt-3"
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
                                        clearReportValues();
                      }}
                    />
                 </Col>

                 {typeReport == "municipio" && 
                    <Col sm="3">
                    <AsyncSelectForm
                         id="municipalities"
                         name="municipalities"
                         label="Município"
                         register={register}
                         required={false}
                         isMulti={true}
                         onChange={(e) => {/* setValue("municipalityId", e ? e.value : "");
                                           setValue("municipalityName", e ? e.label : ""); */
                                          setValue('municipalities',e.map((e) => {return {id: e.value,
                                                                                          name: e.label,
                                                                                          subData:[]}}));
                                          clearReportValues();
                                          }}
                         options={municipioOptions}
                         errors={errors}
                       />
                    </Col>
                  }

                 {typeReport == "veiculo" && 
                    <Col sm={"3"}>
                      <AsyncSelectForm
                        id="vehicles"
                        name="vehicles"
                        label="Veículo"
                        register={register}
                        required={false}
                        isMulti={true}
                        onChange={(e) => {/* setValue("vehicleId", e ? e.value : "");
                                          setValue("vehicleName", e? e.label : "") */
                                          setValue('vehicles',e.map((e) => {return {id: e.value,
                                                                                    name: e.label,
                                                                                    subData:[]}}));
                                          clearReportValues();                                        
                                          }}
                        options={vehicleOptions}
                        errors={errors}
                      />  
                   </Col>
                 }

                 {typeReport == "fornecedor" && 
                   <Col sm="3">
                     <AsyncSelectForm
                       id={"suppliers"}
                       name={"suppliers"}
                       label="Fornecedor"
                       register={register}
                       isMulti={true}
                       onChange={(e) => {/* setValue(`supplierId`,e ? e.value : "");
                                         setValue(`supplierName`,e ? e.value : "");
                                         setValue(`cnpj`,e ? e.cnpj : "") */
                                        setValue('suppliers',e.map((e) => {return {id: e.value,
                                                                                   name: e.label,
                                                                                   cnpj: e.cnpj,
                                                                                   subData:[]}}));
                                        clearReportValues();}}
                       options={supplierOptions}
                     />
                   </Col>}

                 {(typeReport == "rota_gre" || typeReport == "gre") &&
                   <Col sm="3">
                      <AsyncSelectForm
                        id="regionalEducationManagements"
                        name="regionalEducationManagements"
                        label="GRE"
                        register={register}
                        required={false}
                        isMulti={true}
                        onChange={(e) => {/* setValue("regionalEducationManagementId", e ? e.value : "");
                                          setValue("regionalEducationManagementName", e ? e.label : ""); */
                                          setValue('regionalEducationManagements',e.map((e) => {return {id: e.value,
                                                                                                        name: e.label,
                                                                                                        subData:[]}}));
                                          
                                          if(typeReport == "rota_gre"){ 
                                              //setValue("routeId","");setValue("routeName","");
                                              setValue('routes',[]);
                                              setShowAsync([true,true,true,true,false])}
                                          clearReportValues();
                                          }}
                        options={greOptions}
                        errors={errors}
                      />
                   </Col>}

                   {typeReport == "rota_gre" &&
                    showAsync[4] &&
                   <Col sm="3">
                      <AsyncSelectForm
                        id="routes"
                        name="routes"
                        label="Rota"
                        register={register}
                        required={false}
                        isMulti={true}
                        defaultValue={ getValues("routes") && getValues("routes").length > 0 ?  
                                                              getValues("routes").map((e) => {return {value: e.id, label: e.name}}): null}
                        onChange={(e) => {/* setValue("routeId", e ? e.value : "");
                                          setValue("routeName", e ? e.label : ""); */
                                          setValue('routes',e.map((e) => {return {id: e.value,
                                                                                  name: e.label,
                                                                                  subData:[]}}));
                                          clearReportValues();
                                          }}
                        options={routeOptions}
                        errors={errors}
                      />
                   </Col>}
              </Row>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">

              {generateReport ? 
              <>
              {maintenances.length > 0 && 
                 <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                   Exportar <FaFileExport />
                 </Button>}
                <Button onClick={() => { /* generateTypeReport("exhibition") */clearReportValues();generateTypeReportList()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                  Gerar Relatório <FiBarChart2 />
                </Button> 
                <Button onClick={() => {clearReportValues();setGenerateReport(false);reset();}} 
                        style={{ backgroundColor: "#c00", width:"130px"}}>
                  Cancelar
                </Button>
              </> : <>
                 <Button onClick={() => {clearFilter()}} style={{ backgroundColor: "#009E8B", width:"150px"}}>
                   Limpar <FaEraser />
                 </Button>
   
                 <Button type="submit" style={{ backgroundColor: "#009E8B", width:"150px"}}>
                   Filtrar <FaFilter />
                 </Button>
              </>}
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%"}}>
            {windowWidth > 795 && maintenances.length > 0 &&
              <TableStyle columnNames={columns}
                          noStriped={generateReport}  
                          data={ generateReport ? dataForTableList(maintenances) :  dataForTable(maintenances)} />}
  
            {windowWidth <= 795 && maintenances.length > 0 &&
              <IndexCardsStyle names={columns} data={ generateReport ? dataForTableList(maintenances) :  dataForTable(maintenances)}/>}
            {generateReport && maintenances.length == 0 && 
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

        {!generateReport && maintenances.length > 0 && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={maintenances.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

        <ModalStyle  open={openModal} title="Remover Manutenção" onClick={() => {deleteMaintenance()}} toggle={() => setOpenModal(!openModal)}>
          Cuidado essa ação não poderá ser desfeita!
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