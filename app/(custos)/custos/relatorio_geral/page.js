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
import styles from "./relatorio.module.css";
import { Row, Col, Form, Button,  Input, Card, CardHeader,CardBody,CardFooter,
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

   const [showAsync, setShowAsync] = useState([true,true]);
   
   /* const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]); */
    
   const [columns, setColumns] = useState(["N° Nota Fiscal","Natureza Custo","Município","Veiculo","Dt. Emissão","Valor Total"]);

   const [reports, setReports] = useState([]);

   const [openModal, setOpenModal] = useState(false);

   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions] = useState([{id:"gre", name:"Relatório de Custos Total por GRE"},
                                     {id:"gre_exc", name:"Relatório de Custos Total(Exceto Mão de Obra) por GRE"},
                                     {id:"rota_gre", name:"Relatório de Custos Total por Rota"},
                                     {id:"rota_gre_exc", name:"Relatório de Custos Total(Exceto Mão de Obra) por Rota"}]);
    
    const natureCostOptions = [
        { id: 'Maintenance', name: 'Manutenção' },
        { id: 'Supply', name: 'Abastecimento' },
        { id: 'OtherCosts', name: 'Outros Custos' },
        { id: 'Labor', name: 'Mão de Obra' },
   ];
   
   const [typeReport, setTypeReport] = useState("");

   const [subTotalValues, setSubTotalValues] = useState([]);
   const [subTotalValuesIndex, setSubTotalValuesIndex] = useState();
   const [totalValue, setTotalValue] = useState();

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
    } = useForm({ defaultValues: {
                    vehicleId:"",
                    minValue: "",
                    maxValue: "",
                    startDate: "",
                    endDate: ""
    }});


    function showAlert(type, text) {
       setIsOpen(false);

       setAlert({
           type: type,
           text: text
       })
       setIsOpen(true)
       setActiveAlert(true)
    }

    /* const employeeOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.fullName = teste;
      url =  "employee?" + new URLSearchParams(query);
      
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
                "label": dado.fullName 
               }));
      
                return dadosTratados;
         });
   }; */

   const vehicleOptions = (teste) => {
     let url;
     let query = {};
     query.size = 100;
     query.plate = teste;
     query.prefix = teste;
     /* query.statusVehicle = ["ACTIVE","UNDER_MAINTENANCE","RESERVE"];
     query.locationNotNull = true; */
     url = "vehicle?" + new URLSearchParams(query);
     
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

   const greOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
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
      query.regionalEducationManagementId = getValues("regionalEducationManagementId") || "";
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


   function dataForTableList(data){
      let tableData = [];
      let columnNames = ["N° Nota Fiscal","Natureza Custo","Município","Veiculo","Dt. Emissão","Valor Total"];

      data.forEach((d,i) => {

         /* let post = { 
              vehicleId:getValues("vehicleId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              ...((typeReport == "rota_gre" || typeReport == "rota_gre_exc") && {routeId: d.id}),
              ...((typeReport == "gre" || typeReport == "gre_exc") && {regionalEducationManagementId: d.id}),
              notLabor: typeReport.includes("exc") ? true : false
         }; */

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
           "natureCost": d.costs != null ? natureCostOptions.filter((t) => t.id == d.costs)[0].name : "-",
           "municipalities" : d.municipalityAndGreAndVehicle && d.municipalityAndGreAndVehicle.length > 0 && forExport != undefined  ? removeDuplicates(d.municipalityAndGreAndVehicle,"municipalityName").map(obj => obj.municipalityName).join(", \n") : 
                              d.municipalityAndGreAndVehicle && d.municipalityAndGreAndVehicle.length > 0 && forExport == undefined  ? removeDuplicates(d.municipalityAndGreAndVehicle,"municipalityName").map((e,i) =>  {return <Fragment key={i}>{e.municipalityName}<br/></Fragment>}) : "-",
           "vehicles": d.municipalityAndGreAndVehicle && d.municipalityAndGreAndVehicle.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGreAndVehicle,"vehicleId").map(obj => obj.prefix + "/" + obj.plate).join(", \n") : 
                       d.municipalityAndGreAndVehicle && d.municipalityAndGreAndVehicle.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGreAndVehicle,"vehicleId").map((e,i) =>  {return <Fragment key={i}>{e.prefix + "/" + e.plate}<br/></Fragment>}) : "-",
           "emissionDate": FormatarData(d.date,"dd/MM/yyyy"),
           "totalValue":  d.value ? FormatarReal(String(d.value.toFixed(2))) : "-",
         })
     );

     return tableData;
   }


   function clearFilter(){
      setValue("companyId","");
      setValue("vehicleId","");
      setValue("minValue","");
      setValue("maxValue","");
      setValue("startDate","");
      setValue("endDate","");
      setValue("typeReport","");
      setValue("regionalEducationManagementId","");
      setValue("routeId","");
      setShowAsync([false,false]);
      setReports([]);
   }
                                                    
  function getReport(data){
    let query = {};

    if(data != undefined) query = { ...query, ...data};

    setLoading(true);

    fetch(Constantes.urlBackReports + "costs/all?" + new URLSearchParams(query), {
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
                 setReports(body[0]);
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

  function getSubDataReport(data,index,typeReport){
    let query = {};

    if(data != undefined) query = { ...query, ...data};

    setLoading(true);

    fetch(Constantes.urlBackReports + "costs/all?" + new URLSearchParams(query), {
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
                 if(index != undefined){
                   
                   if(index == 0){
                     setReports(getValues(typeReport).map((s,i) =>{
                        if(i == index) s.subData = body[0];
                        return s;
                     }))
                   }else{ 
                     setReports(reports.map((s,i) =>{
                        if(i == index) s.subData = body[0];
                        return s;
                     }))
                   }

                   let subtotalValue = body[0].reduce((a, value) => {return a + value["value"]}, 0);
                   if(index == 0){
                      setSubTotalValues([subtotalValue]);
                   }else{
                      setSubTotalValues([...subTotalValues,subtotalValue]);
                   }
                   
                   setSubTotalValuesIndex(index + 1);
                 }else{
                    setReports(body[0]);
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
        case "rota_gre":
        case "rota_gre_exc":
          return title + ": " + getValues("routeName") + "/" + (getValues("regionalEducationManagementName") || "");
        case "gre":
        case "gre_exc":
          return title + ": " + getValues("regionalEducationManagementName");
      }
  }

  /* function generateTypeReport(){
      let data = { 
          vehicleId:getValues("vehicleId"),
          minValue: getValues("minValue"),
          maxValue: getValues("maxValue"),
          startDate: getValues("startDate"),
          endDate: getValues("endDate"),
      };
      switch(typeReport){
          case "rota_gre":
          case "rota_gre_exc":
            if(getValues("routeId") == "" || getValues("routeId") == null || getValues("routeId") == undefined){
                 return showAlert("warning","Selecione a rota");
             }
            data = {...data, routeId: getValues("routeId"),
                    notLabor: typeReport.includes("exc") ? true : false
            };
            getReport(data);
            break;
          case "gre":
          case "gre_exc":
             if(getValues("regionalEducationManagementId") == "" || getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == undefined){
                 return showAlert("warning","Selecione a gre");
             }
             data = {...data, regionalEducationManagementId: getValues("regionalEducationManagementId"),
                    notLabor: typeReport.includes("exc") ? true : false
             };
             getReport(data);
             break;
      }
   } */

   async function getReportExcel(){
      
    let urlName;
    let query = { vehicleId:getValues("vehicleId"),
                  minValue: getValues("minValue"),
                  maxValue: getValues("maxValue"),
                  startDate: getValues("startDate"),
                  endDate: getValues("endDate"),
                  ...((typeReport == "rota_gre" || typeReport == "rota_gre_exc") && {routeId: getValues("routes").map((a) => {return a.id})}),
                  ...((typeReport == "gre" || typeReport == "gre_exc") && {regionalEducationManagementId: getValues("regionalEducationManagements").map((a) => {return a.id})}),
                  notLabor: typeReport.includes("exc") ? true : false}
    
    
    switch(typeReport){    
      case "rota_gre":
        urlName =  Constantes.urlBackReports + "costs/repot/all_rotas?" + new URLSearchParams(query);
        break;    
      case "gre":
        urlName =  Constantes.urlBackReports + "costs/repot/all_gre?" + new URLSearchParams(query);
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
      let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Custos Gerais.xlsx";
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
     setReports([]);
     setSubTotalValues([]);
     setSubTotalValuesIndex();
     setTotalValue(0);
   }

   function generateTypeReportList(){
       //let columns = ["Nome"];

       let post = {
             vehicleId:getValues("vehicleId"),
             minValue: getValues("minValue"),
             maxValue: getValues("maxValue"),
             startDate: getValues("startDate"),
             endDate: getValues("endDate")
       };

       switch(typeReport){
          case "rota_gre":
          case "rota_gre_exc":
             if(getValues("routes") == undefined || (getValues("routes") && getValues("routes").length == 0)){
                return showAlert("warning","Selecione uma rota");
             }
             //setReports(getValues("routes"));
             post = {...post,routeId: getValues("routes")[0].id};
             getSubDataReport(post,0,"routes");
             break;
          case "gre":
          case "gre_exc":
             if(getValues("regionalEducationManagements") == undefined || (getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length == 0)){
                return showAlert("warning","Selecione uma gre");
             }
             //setReports(getValues("regionalEducationManagements"));
             post = {...post,regionalEducationManagementId: getValues("regionalEducationManagements")[0].id};
             getSubDataReport(post,0,"regionalEducationManagements");             
             break;

       }
       //setColumns(columns);
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

   /* useEffect(() => {
     getReport();
   },[number,size]);
 */
   useEffect(() => {
    /* if(!showAsync) setShowAsync(true); */
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

   useEffect(() => {
   
     if(subTotalValuesIndex != undefined && subTotalValuesIndex < reports.length){
      
       let post = { 
           vehicleId:getValues("vehicleId"),
           minValue: getValues("minValue"),
           maxValue: getValues("maxValue"),
           startDate: getValues("startDate"),
           endDate: getValues("endDate"),
           ...((typeReport == "rota_gre" || typeReport == "rota_gre_exc") && {routeId: reports[subTotalValuesIndex].id}),
           ...((typeReport == "gre" || typeReport == "gre_exc") && {regionalEducationManagementId: reports[subTotalValuesIndex].id}),
           notLabor: typeReport.includes("exc") ? true : false}
       getSubDataReport(post,subTotalValuesIndex);
     }
     if(subTotalValuesIndex != undefined && subTotalValuesIndex == reports.length){
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
         <h1 className={styles.header_h1}>Relatório de Custos</h1>
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getReport)}>
            <Row className="d-flex mt-3">
                <Col sm={"4"}>
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
                </Col>
                <Col sm="2">
                  <InputForm
                    id="dateStart"
                    name="dateStart"
                    label="Período de"
                    placeholder="dd/mm/aaaa"
                    register={register}
                    type="date"
                  />
                </Col>
                 <Col sm="2">
                  <InputForm
                    id="dateEnd"
                    name="dateEnd"
                    label="até"
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

              
               {typeReport != "" && 
                showAsync[0] && <Col sm="3">
                  <AsyncSelectForm
                    id="regionalEducationManagements"
                    name="regionalEducationManagements"
                    label="GRE"
                    register={register}
                    required={false}
                    isMulti={true}
                    //defaultValue={getValues("regionalEducationManagementId") ? {value: getValues("regionalEducationManagementId"), label: getValues("regionalEducationManagementName")} : null}
                    defaultValue={getValues("regionalEducationManagements") || null}
                    onChange={(e) => {/* setValue("regionalEducationManagementId", e ? e.value : "");
                                      setValue("regionalEducationManagementName", e ? e.label : ""); */
                                      setValue('regionalEducationManagements',e.map((e) => {return {id: e.value,
                                                                                                        name: e.label,
                                                                                                        subData:[]}}));
                                          
                                      if(typeReport == "rota_gre" || typeReport == "rota_gre_exc"){
                                        //setValue("routeId","");setValue("routeName","");
                                        setValue('routes',[]);
                                        setShowAsync([true,false])}
                                      clearReportValues();
                                      }}
                    options={greOptions}
                    errors={errors}
                  />
               </Col>}

               {(typeReport == "rota_gre" || typeReport == "rota_gre_exc") &&
                 showAsync[1] &&
               <Col sm="3">
                  <AsyncSelectForm
                    id="routeId"
                    name="routeId"
                    label="Rota"
                    register={register}
                    required={false}
                    isMulti={true}
                    //defaultValue={ getValues("routeId") ? {value:getValues("routeId"),label:getValues("routeName")} : null}
                    defaultValue={ getValues("routes") || null}
                    onChange={(e) => {/* setValue("routeId", e ? e.value : "");
                                      setValue("routeName", e ? e.label : ""); */
                                      setValue('routes',e.map((e) => {return {id: e.value,
                                                                              name: e.label,
                                                                              subData:[]}}));
                                      clearReportValues();}}
                    options={routeOptions}
                    errors={errors}
                  />
               </Col>}
        
            </Row>

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
                  {reports.length > 0 && 
                   <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                     Exportar <FaFileExport />
                   </Button>}
                  <Button onClick={() => { /* generateTypeReport() */  clearReportValues();generateTypeReportList()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                    Gerar Relatório <FiBarChart2 />
                  </Button> 
                  <Button onClick={() => { clearReportValues();clearFilter();reset()}} style={{ backgroundColor: "#009E8B", width:"150px"}}>
                    Limpar <FaEraser />
                  </Button>
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%"}}>

            {windowWidth > 795 && reports.length > 0 &&
              <TableStyle columnNames={columns} 
                          noStriped={true}
                          data={dataForTableList(reports)} />} 

            {windowWidth <= 795 && reports.length > 0 && 
              <IndexCardsStyle names={columns} data={dataForTableList(reports)}/>}

            {reports.length == 0 &&
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

        <ModalStyle  open={openModal} title="Remover Mão de Obra" onClick={() => {deleteLabor()}} toggle={() => setOpenModal(!openModal)}>
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