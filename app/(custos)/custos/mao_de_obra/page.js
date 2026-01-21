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
import { CgCloseR } from "react-icons/cg";
import { FiBarChart2 } from 'react-icons/fi';
import styles from "./maodeobra.module.css";
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

   const [showAsync, setShowAsync] = useState([true,true,true,true]);
   
   /* const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]); */
    
   const [columns, setColumns] = useState(["Funcionário","Data de Pagamento","Valor","Ações"]);

   const [labories, setLabories] = useState([]);
   const [laborId, setLaborId] = useState(null);

   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);

   const [openModal, setOpenModal] = useState(false);

   const typeOptions = [
        { id: '', name: '--Selecione a Categoria--' },
        { id: 'RESCISSION', name: 'Rescisão' },
        { id: 'VACATION', name: 'Férias' },
        { id: 'SALARY', name: 'Salário' },
        { id: 'SALARY_13TH', name: '13º Salário' },
   ];

   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions, setReportOptions] = useState([{id:"municipio", name:"Relatório de Mão de Obra por Município"},
                                                       {id:"gre", name:"Relatório de Mão de Obra por GRE"}]);
   
   const [typeReport, setTypeReport] = useState(null);

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
    } = useForm({ defaultValues: {employeeId:"",
                                  vehicleId:"",
                                  regionalEducationManagementId:"",
                                  municipalityId:"",
                                  minValue: "",
                                  maxValue: "",
                                  startDate: "",
                                  endDate: ""} });


    function showAlert(type, text) {
       setIsOpen(false);

       setAlert({
           type: type,
           text: text
       })
       setIsOpen(true)
       setActiveAlert(true)
    }

    const employeeOptions = (teste) => {
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
   };

   const vehicleOptions = (teste) => {
     let url;
     let query = {};
     query.size = 100;
     query.plate = teste;
     /* query.prefix = teste; */
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
   
   const greOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      query.municipalityId = getValues("municipalityId") || "";
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

   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "employeeName": d.employeeName,
            "date": FormatarData(d.paymentDate,"dd/MM/yyyy"),
            "value": d.value ? FormatarReal(String(d.value.toFixed(2))) : "-",
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
              employeeId: getValues("employeeId"),
              vehicleId: getValues("vehicleId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              ...(typeReport == "municipio" && {municipalityId: d.id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: d.id})

         }; */

         switch(typeReport){
           case "municipio":
              columnNames = ["Funcionário","CPF","Lotação","Cargo","Tipo de Mão de Obra","Mês de Ref.","Dt. de Pagamento","Valor Total"];
              break;
           case "gre":
              columnNames = ["Funcionário","CPF","Cargo","Tipo de Mão de Obra","Mês de Ref.","Dt. de Pagamento","Valor Total"];
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


    function dataForTableReport(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "employeeName": d.employeeName,
            "cpf": d.cpf,
            ...(typeReport == "municipio" && {"locationName": d.locationName || "-"}),
            "positionName": d.positionName, 
            "typeCost": d.typeCost != null ? typeOptions.filter((type) => type.id == d.typeCost)[0].name : "-", 
            "referenceMonth": FormatarData(d.referenceMonth,"MM/yyyy"),
            "paymentDate": FormatarData(d.paymentDate,"dd/MM/yyyy"),
            "value":"R$ " + FormatarReal(d.value.toFixed(2))
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
               getLabor();
          })
          .catch((error) => {
             console.log(error);
          }) 
   } */

   function deleteLabor(){
      fetch(Constantes.urlBackCosts + `labor/archive/${laborId}`, {method: "DELETE",
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
                     showAlert("danger","Error ao Apagar Mão de Obra");
                   break;   
               }
              getLabor();
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
               <Button className={styles.button} onClick={() => {router.push(`/custos/mao_de_obra/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Labor_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/custos/mao_de_obra/${id}/edit`)}}><BsPencilSquare/></Button>
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
               <Button className={styles.button}onClick={() => {setLaborId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div>  </>}
           </div>;
   }

   function clearFilter(){
      setValue("companyId","");
      setValue("vehicleId","");
      if(checkPermission("Regional_Education_Management")) setValue("regionalEducationManagementId","");
      if(checkPermission("Municipality")) setValue("municipalityId","");
      setValue("minValue","");
      setValue("maxValue","");
      setShowAsync([false,false,false,false]);
      setValue("invoiceNumber","");
      setValue("dateMaintenance","");
      getLabor();
   }
                                                    
   function getLabor(data){

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

      fetch(Constantes.urlBackCosts + "labor?" + new URLSearchParams(query), {
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
                   setLabories(body.content);
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

  function getLaboriesReport(data){
    let query = {};
    query.page = number;
    query.size = size;

    if(data != undefined) query = { ...query, ...data};

    setLoading(true);

    fetch(Constantes.urlBackReports + "costs/labor?" + new URLSearchParams(query), {
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
                 setLabories(body.content);
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

  function getSubDataReport(data,index,typeReport){
    let query = {};
    /* query.page = number;
    query.size = size; */
    query.all = true;

    if(data != undefined) query = { ...query, ...data};

    setLoading(true);

    fetch(Constantes.urlBackReports + "costs/labor?" + new URLSearchParams(query), {
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
                     setLabories(getValues(typeReport).map((s,i) =>{
                        if(i == index) s.subData = body.content;
                        return s;
                     }))
                   }else{ 
                     setLabories(labories.map((s,i) =>{
                        if(i == index) s.subData = body.content;
                        return s;
                     }))
                   }

                   let subtotalValue = body.content.reduce((a, value) => {return a + value["value"]}, 0);
                     if(index == 0){
                        setSubTotalValues([subtotalValue]);
                     }else{
                        setSubTotalValues([...subTotalValues,subtotalValue]);
                     }

                   setSubTotalValuesIndex(index + 1);
                 }else{
                    setLabories(body.content);
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
            employeeId: getValues("employeeId"),
            vehicleId: getValues("vehicleId"),
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
             setColumns(["Funcionário","CPF","Lotação","Cargo","Tipo de Mão de Obra","Mês de Ref.","Dt. de Pagamento","Valor Total"]);
             data = {...data,
                     municipalityId: getValues("municipalityId")};
             if(type == "exhibition") getLaboriesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "gre":
             if(getValues("regionalEducationManagementId") == "" || getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == undefined){
                 return showAlert("warning","Selecione a gre");
             }
             setColumns(["Funcionário","CPF","Cargo","Tipo de Mão de Obra","Mês de Ref.","Dt. de Pagamento","Valor Total"]);
             data = {...data,
                     regionalEducationManagementId: getValues("regionalEducationManagementId")};
             if(type == "exhibition") getLaboriesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
      }
   } */

   async function getReportExcel(){
      
    let urlName;
    let query = { employeeId: getValues("employeeId"),
                  vehicleId: getValues("vehicleId"),
                  minValue: getValues("minValue"),
                  maxValue: getValues("maxValue"),
                  startDate: getValues("startDate"),
                  endDate: getValues("endDate"),
                  ...(typeReport == "municipio" && {ids: getValues("municipalities").map((a) => {return a.id})}),
                  ...(typeReport == "gre" && {ids: getValues("regionalEducationManagements").map((a) => {return a.id})})};
    
    
    switch(typeReport){
      case "municipio":
        urlName =  Constantes.urlBackReports + "labor/repot/municipality?" + new URLSearchParams(query);
        break;   
      case "gre":
        urlName =  Constantes.urlBackReports + "labor/repot/gre?" + new URLSearchParams(query);
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
      let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Mão de Obra.xlsx";
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
     setLabories([]);
     setSubTotalValues([]);
     setSubTotalValuesIndex();
     setTotalValue(0);
   }

   function generateTypeReportList(){
       /* let columns = ["Nome"];*/

       let post = { employeeId: getValues("employeeId"),
                    vehicleId: getValues("vehicleId"),
                    minValue: getValues("minValue"),
                    maxValue: getValues("maxValue"),
                    startDate: getValues("startDate"),
                    endDate: getValues("endDate")}

       switch(typeReport){
          case "municipio":
             if(getValues("municipalities") == undefined || (getValues("municipalities") && getValues("municipalities").length == 0)){
                return showAlert("warning","Selecione um municipio");
             }
             //setLabories(getValues("municipalities"));
             post = {...post,municipalityId: getValues("municipalities")[0].id};
             getSubDataReport(post,0,"municipalities");
             break;
          case "gre":
             if(getValues("regionalEducationManagements") == undefined || (getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length == 0)){
                return showAlert("warning","Selecione uma gre");
             }
             //setLabories(getValues("regionalEducationManagements"));   
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
      if(!generateReport){getLabor();}
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
      if(!generateReport){reset(); getLabor();setColumns(["Funcionário","Data de Pagamento","Valor","Ações"])}
   },[generateReport]);


   useEffect(() => {
   
     if(subTotalValuesIndex != undefined && subTotalValuesIndex < labories.length){
         
         let post = { 
             employeeId: getValues("employeeId"),
             vehicleId: getValues("vehicleId"),
             minValue: getValues("minValue"),
             maxValue: getValues("maxValue"),
             startDate: getValues("startDate"),
             endDate: getValues("endDate"),
             ...(typeReport == "municipio" && {municipalityId: labories[subTotalValuesIndex].id}),
             ...(typeReport == "gre" && {regionalEducationManagementId: labories[subTotalValuesIndex].id})
         };
       getSubDataReport(post,subTotalValuesIndex);
     }
     if(subTotalValuesIndex != undefined && subTotalValuesIndex == labories.length){
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
         <h1 className={styles.header_h1}>Custos de Mão de Obra</h1>
         { checkPermission("Labor_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push("/custos/mao_de_obra/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getLabor)}>
            <Row className="d-flex mt-3">
              { showAsync[0] == true &&
               <Col sm="4">
                  <AsyncSelectForm
                    id={"employeeId"}
                    name={"employeeId"}
                    label="Funcionário"
                    register={register}
                    onChange={(e) => {setValue(`employeeId`,e ? e.value : "")}}
                    options={employeeOptions}
                  />
                </Col>}
                { showAsync[1] == true &&
                <Col sm="4">
                  <AsyncSelectForm
                    id={"vehicleId"}
                    name={"vehicleId"}
                    label="Veículo"
                    register={register}
                    onChange={(e) => {setValue(`vehicleId`,e ? e.value : "")}}
                    options={vehicleOptions}
                  />
                </Col>}
                <Col sm="2">
                  <InputForm
                    id="starDate"
                    name="starDate"
                    label="Período de"
                    placeholder="dd/mm/aaaa"
                    register={register}
                    type="date"
                  />
                </Col>
                 <Col sm="2">
                  <InputForm
                    id="endDate"
                    name="endDate"
                    label="até"
                    placeholder="dd/mm/aaaa"
                    register={register}
                    type="date"
                  />
                </Col>
              
            </Row>

            <Row className="d-flex mt-3">
              { checkPermission("Regional_Education_Management") &&
                showAsync[2] == true && 
                !generateReport && <Col sm="4">
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
                                     setShowAsync([true,true,true,false])}}
                   options={greOptions}
                   errors={errors}
                 />
              </Col>}
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
                                     setShowAsync([true,true,false,true])}}
                   options={municipioOptions}
                   errors={errors}
                 />
               </Col>}
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
                                          clearReportValues()}}
                         options={municipioOptions}
                         errors={errors}
                       />
                    </Col>
                }
                
               { typeReport == "gre" &&
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
                                          clearReportValues();
                                        }}
                       options={greOptions}
                       errors={errors}
                     />
                  </Col>}
                           
             </Row>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">

              {generateReport ? 
                <>
                   {labories.length > 0 && 
                    <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                      Exportar <FaFileExport />
                    </Button>}
                  <Button onClick={() => {/*  generateTypeReport("exhibition") */ clearReportValues();generateTypeReportList()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                    Gerar Relatório <FiBarChart2 />
                  </Button> 
                  <Button onClick={() => {clearReportValues();setGenerateReport(false);reset()}} 
                          style={{ backgroundColor: "#c00", width:"130px"}}>
                    Cancelar
                  </Button>
                
                </> : 
                        
                <>
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

            {windowWidth > 795 && labories.length > 0 &&
              <TableStyle columnNames={columns} 
                          noStriped={generateReport}
                          data={generateReport ? dataForTableList(labories) :  dataForTable(labories)} />} 

            {windowWidth <= 795 && labories.length > 0 && 
              <IndexCardsStyle names={columns} data={generateReport ? dataForTableList(labories) : dataForTable(labories)}/>}

            {generateReport && labories.length == 0 &&
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

        {!generateReport && labories.length > 0 && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={labories.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

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