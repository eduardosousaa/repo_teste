"use client"
import { useState, useEffect, useContext, Fragment } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare  } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import { FiBarChart2 } from 'react-icons/fi';
import { FaFileExport } from "react-icons/fa";
import styles from "./abastecimento.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader,CardBody,CardFooter,
         UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem,
         Label, Nav, NavItem, NavLink } from "reactstrap";
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

   const [showAsync, setShowAsync] = useState([true,true,true,true,true,true]);

   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions, setReportOptions] = useState([{id:"municipio", name:"Relatório de Abastecimento por Município"},
                                                       {id:"veiculo", name:"Relatório de Abastecimento por Veículo"},
                                                       {id:"fornecedor", name:"Relatório de Abastecimento por Posto de Combustível"},
                                                       {id:"gre", name:"Relatório de Abastecimento por GRE"},
                                                       {id:"rota_gre", name:"Relatório de Abastecimento por Rota/GRE"}]);
   
   const [typeReport, setTypeReport] = useState(null);

   const [subTotalValues, setSubTotalValues] = useState([]);
   const [subTotalValuesIndex, setSubTotalValuesIndex] = useState();
   const [totalValue, setTotalValue] = useState();

   const [subPage, setSubPage] = useState("Abastecimento");

   const fuelTypes = [
           { id: 'GASOLINE_COMMON', name: 'Gasolina comum' },
           { id: 'GASOLINE_ADDITIVE', name: 'Gasolina aditivada' },
           { id: 'DIESEL_S10', name: 'Diesel S10' },
           { id: 'DIESEL_S500', name: 'Diesel S500' },
           { id: 'DIESEL_ADDITIVE', name: 'Diesel aditivado' },
   ];

   const vehicleTypes = [
            { id: 'ONIBUS', name: 'Ônibus' },
            { id: 'CAMINHAO', name: 'Caminhão' },
            { id: 'MICRO_ONIBUS', name: 'Micro-Ônibus' },
            { id: 'VAN', name: 'Van' },
            { id: 'MOTO', name: 'Moto' },
            { id: 'CARRO', name: 'Carro' },
            { id: "CAMINHONETE", name: "Caminhonete" },
		        { id: "OUTROS", name: "Outros" },
   ];

   const vehicleAssetTypes = [
            { id: 'OWN', name: 'Veículos Próprios' },
            { id: 'LEASED', name: 'Veículos Prestadores de Serviço' },
   ];
   
   /* const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]); */
    
   const [columns, setColumns] = useState([]);

   const [fuelSupplies, setFuelSupplies] = useState([]);
   const [invoices, setInvoices] = useState([]);
   const [deleteId, setDeleteId] = useState(null);

   const [startDate,setStartDate] = useState("");
   const [endDate,setEndDate] = useState("");

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
    } = useForm({ defaultValues: {supplierId:"",
                                  vehicleId:"",
                                  locationId:"",
                                  regionalEducationManagementId:"",
                                  municipalityId:"",
                                  routeId: "",
                                  maxValue:"",
                                  minValue:"",
                                  startDate:"",
                                  endDate:"",
                                  fuelType: "",
                                  typeVehicle: "",
                                  vehicleType: "",
                                  couponNumber: "",
                                   
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

    const supplierOptions = (teste) => {
            let url;
            let query = {};
            query.size = 100;
            query.name = teste;
            query.isGasStation = true;
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


    const vehicleOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.plate = teste;
       query.prefix = teste;
       /* query.status = "ACTIVE"; */
     /*   query.statusVehicle = ["ACTIVE","UNDER_MAINTENANCE","RESERVE"];
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

    const localizationOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        query.typeLocation = "LOCATION";
   
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


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push(
            subPage == "Abastecimento" ?
              {
                "vehicle": d.vehiclePrefix + "/" + d.plate,
                "supplierName": d.supplierName,
                "fuelType": fuelTypes.filter((fuel) => fuel.id == d.fuelType)[0].name,
                "date": FormatarData(d.date,"dd/MM/yyyy"),
                "value": d.fuelCost ? FormatarReal(String(d.fuelCost.toFixed(2))) : "-",
                "actions": actionButtons(d.id)
              } :
            subPage == "Nota Fiscal" ?
              {
                "number": d.number,
                "emissionDate": FormatarData(d.date,"dd/MM/yyyy"),
                "value": d.value ? FormatarReal(String(d.value.toFixed(2))) : "-",
                "actions": actionButtons(d.id)
              } :
            null
            

        )
      );

      return tableData;
   }

   function dataForTableList(data){
      let tableData = [];
      let columnNames = [];

      data.forEach((d,i) => {

         /* let post = { 
              fuelType:getValues("fuelType"),
              typeVehicle: getValues("typeVehicle"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              vehicleType: getValues("vehicleType"),
              couponNumber: getValues("couponNumber"),
              locationId: getValues("locationId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              ...(typeReport == "municipio" && {municipalityId: d.id}),
              ...(typeReport == "veiculo" && {vehicleId: d.id}),
              ...(typeReport == "fornecedor" && {supplierId: d.id}),
              ...(typeReport == "rota_gre" && {routeId: d.id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: d.id})

         }; */

         switch(typeReport){
           case "municipio":
              columnNames = ["N° Nota Fiscal","GRE","Veículo","Tipo Combustível","Qtd. Litros","Dt. Emissão","Valor Total"];
              break;
           case "veiculo":
              columnNames = ["N° Nota Fiscal","Prefixo","Quilometragem","Tipo Combustível","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"];
              break;
           case "fornecedor":
              columnNames = ["N° Nota Fiscal","Prefixo","Veículo","Quilometragem","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"];
              break;
           case "rota_gre":
              columnNames = ["N° Nota Fiscal","Razão Social","Município","Quilometragem","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"];
              break;
           case "gre":
              columnNames = ["N° Nota Fiscal","Município","Veículo","Tipo Combustível","Qtd. Litros","Dt. Emissão","Valor Total"];
              break;
         }


         tableData.push({
            "name": <UncontrolledAccordion flush className={styles.accordion}>
                       <AccordionItem>
                          <AccordionHeader targetId={d.name}
                                           /* onClick={() => {getSubDataReport(post,i)}} */>
                             {/* <div style={{fontSize:"1.2rem"}}>{d.name}  Valor Total: R$ {FormatarReal(String(subTotalValues[i]))}</div> */}
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
                ...(typeReport == "municipio" && {"regionalEducationManagements": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map(obj => obj.regionalEducationManagementName).join(", \n") :
                                                                                  d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map((e,i) =>  {return <Fragment key={i}>{e.regionalEducationManagementName}<br/></Fragment>}) : "-"}),
                ...((typeReport == "gre" || typeReport == "rota_gre" ) && {"municipalities": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map(obj => obj.municipalityName).join(", \n") : 
                                                                                             d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map((e,i) =>  {return <Fragment key={i}>{e.municipalityName}<br/></Fragment>}) : "-"}),
                ...(typeReport == "rota_gre" && {"corporateReason": d.corporateReason}),
                ...((typeReport == "veiculo" || typeReport == "fornecedor") && {"prefix": d.vehiclePrefix || ("sem prefixo")}),
                ...((typeReport == "municipio" || typeReport == "gre" || typeReport == "fornecedor" ) && {"plate": d.plate}),
                ...((typeReport == "fornecedor" || typeReport == "rota_gre" || typeReport == "veiculo") && {"vehicleMileage" : d.vehicleMileage || "-"}),
                 ...((typeReport == "gre" || typeReport == "municipio" || typeReport == "veiculo") && {"fuelType": fuelTypes.filter((fuel) => fuel.id == d.fuelType)[0].name}),
                "quantityLiters": d.quantityLiters,
                 ...((typeReport == "fornecedor" || typeReport == "rota_gre" || typeReport == "veiculo") && {"invoiceDate" :  FormatarData(d.invoiceDate,"dd/MM/yyyy")}),
                "date": FormatarData(d.date,"dd/MM/yyyy"),
                "value": d.fuelCost ? "R$ " + FormatarReal(String(d.fuelCost.toFixed(2))) : "-",
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

   function deleteItem(){
      let url = subPage == "Nota Fiscal" ? `supply/invoice/archive/${deleteId}` : `supply/archive/${deleteId}`;
      
      fetch(Constantes.urlBackCosts + url, {
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
              getData();
              setOpenModal(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function actionButtons(id){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
            <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/custos/abastecimento/${id}?type=${subPage == "Abastecimento" ? "abastecimento" : 
                                                                                                                 subPage == "Nota Fiscal" ?  "nota" : ''}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { ((subPage == "Abastecimento" && checkPermission("Supply_Read")) || 
               (subPage == "Nota Fiscal" && checkPermission("Invoice_Read"))) && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/custos/abastecimento/${id}/edit?type=${subPage == "Abastecimento" ? "abastecimento" : 
                                                                                                                      subPage == "Nota Fiscal" ?  "nota" : ''}`)}}><BsPencilSquare/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Editar
                   </div>
                 </div>
               </div>
             </div>
            <div className={styles.balloon_div}>
               <Button className={styles.button}onClick={() => {setDeleteId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div></>}
           </div>;
   }

   function clearFilter(){
      setValue("fuelType","");
      setShowAsync([false,false,false,false,false]);
      setValue("typeVehicle","");
      setValue("supplierId","");
      setValue("number","");
      setValue("date","");
      setValue("vehicleId","");
      setValue("locationId","");

      setValue("regionalEducationManagementId","");
      setValue("municipalityId","");
      setValue("routeId","");

      setValue("minValue","");
      setValue("maxValue","");

      if(checkPermission("Export_Supply")){
         setValue("vehicleType","");
         setValue("startDate","");
         setValue("endDate","");
         setValue("month","");
         setStartDate("");
         setEndDate("");
      }
      
      getData();
   }
                                                    
   function getData(data){

      let query = {};
      query.page = /* data != undefined && data.number ? data.number : */ number;
      query.size = size;
        
      if(data != undefined) {
         query = { ...query, ...data};

         if(subPage == "Nota Fiscal"){
           delete query.fuelType;
           delete query.typeVehicle;
           delete query.vehicleType;
           delete query.startDate;
           delete query.endDate;
           delete query.vehicleId;
           delete query.locationId;
         }else if(subPage == "Abastecimento"){
           delete query.number;
           delete query.date;
   
           query.startDate = query.month != "" && query.startDate == "" ? startDate :  query.startDate;
           query.endDate = query.month != "" && query.endDate == "" ? endDate :  query.endDate;

           if(query.minValue != ""){
              query.minValue = query.minValue.replaceAll(".","");
              query.minValue = parseFloat(query.minValue.replace(",","."));
           }

           if(query.maxValue != ""){
              query.maxValue = query.maxValue.replaceAll(".","");
              query.maxValue = parseFloat(query.maxValue.replace(",","."));
           }
         }
      }

      setLoading(true);

      let url = subPage == "Abastecimento" ? "supply?" : "supply/invoice?";

      fetch(Constantes.urlBackCosts + url + new URLSearchParams(query), {
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
                   if(subPage == "Abastecimento") setFuelSupplies(body.content);
                   else if( subPage == "Nota Fiscal") setInvoices(body.content);
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

   /* ------------------------------------- */

   /* function getSuppliesReport(data){
      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackReports + "costs/supply?" + new URLSearchParams(query), {
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
                   setFuelSupplies(body.content);
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

      fetch(Constantes.urlBackReports + "costs/supply?" + new URLSearchParams(query), {
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
                       setFuelSupplies(getValues(typeReport).map((s,i) =>{
                          if(i == index) s.subData = body.content;
                          return s;
                       }))
                     }else{ 
                       setFuelSupplies(fuelSupplies.map((s,i) =>{
                          if(i == index) s.subData = body.content;
                          return s;
                       }))
                     }
                     
                     let subtotalValue = body.content.reduce((a, value) => {return a + value["fuelCost"]}, 0);
                     if(index == 0){
                        setSubTotalValues([subtotalValue]);
                     }else{
                        setSubTotalValues([...subTotalValues,subtotalValue]);
                     }
                     
                     setSubTotalValuesIndex(index + 1);
                   }else{
                      setFuelSupplies(body.content);
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
          fuelType:getValues("fuelType"),
          typeVehicle: getValues("typeVehicle"),
          startDate: getValues("startDate"),
          endDate: getValues("endDate"),
          vehicleType: getValues("vehicleType"),
          couponNumber: getValues("couponNumber"),
          locationId: getValues("locationId"),
          minValue: getValues("minValue"),
          maxValue: getValues("maxValue"),
      };
      switch(typeReport){
          case "municipio":
             if(getValues("municipalityId") == "" || getValues("municipalityId") == null || getValues("municipalityId") == undefined){
                return showAlert("warning","Selecione o município");
             }
             setColumns(["N° Nota Fiscal","GRE","Veículo","Tipo Combustível","Qtd. Litros","Dt. Emissão","Valor Total"]);
             data = {...data,
                     municipalityId: getValues("municipalityId")};
             if(type == "exhibition") getSuppliesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "veiculo":
             if(getValues("vehicleId") == "" || getValues("vehicleId") == null || getValues("vehicleId") == undefined){
                return showAlert("warning","Selecione o veículo");
             }
             setColumns(["N° Nota Fiscal","Prefixo","Quilometragem","Tipo Combustível","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"]);
             data = {...data,
                     vehicleId: getValues("vehicleId")};
             if(type == "exhibition") getSuppliesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "fornecedor":
             if(getValues("supplierId") == "" || getValues("supplierId") == null || getValues("supplierId") == undefined){
                return showAlert("warning","Selecione o fornecedor");
             }
             setColumns(["N° Nota Fiscal","Prefixo","Veículo","Quilometragem","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"]);
             data = {...data,
                     supplierId: getValues("supplierId")};
             if(type == "exhibition") getSuppliesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "rota_gre":
             if(getValues("routeId") == "" || getValues("routeId") == null || getValues("routeId") == undefined){
                 return showAlert("warning","Selecione a rota");
             }
             setColumns(["N° Nota Fiscal","Razão Social","Município","Quilometragem","Qtd. Litros","Dt. Abastecimento","Dt. Emissão","Valor Total"]);
             data = {...data,
                     routeId: getValues("routeId")};
             if(type == "exhibition") getSuppliesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
          case "gre":
             if(getValues("regionalEducationManagementId") == "" || getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == undefined){
                 return showAlert("warning","Selecione a gre");
             }
             setColumns(["N° Nota Fiscal","Município","Veículo","Tipo Combustível","Qtd. Litros","Dt. Emissão","Valor Total"]);
             data = {...data,
                     regionalEducationManagementId: getValues("regionalEducationManagementId")};
             if(type == "exhibition") getSuppliesReport(data);
             else if(type == "csv") generateCSV(data);
             break;
      }
   } */

   async function getReportExcel(){
      
    let urlName;
    let query = { fuelType:getValues("fuelType"),
                  typeVehicle: getValues("typeVehicle"),
                  startDate: getValues("startDate"),
                  endDate: getValues("endDate"),
                  vehicleType: getValues("vehicleType"),
                  couponNumber: getValues("couponNumber"),
                  locationId: getValues("locationId"),
                  minValue: getValues("minValue"),
                  maxValue: getValues("maxValue"),
                  ...(typeReport == "municipio" && {ids: getValues("municipalities").map((a) => {return a.id})}),
                  ...(typeReport == "veiculo" && {ids: getValues("vehicles").map((a) => {return a.id})}),
                  ...(typeReport == "fornecedor" && {ids: getValues("suppliers").map((a) => {return a.id})}),
                  ...(typeReport == "rota_gre" && {routesIds: getValues("routes").map((a) => {return a.id})}),
                  ...(typeReport == "gre" && {ids: getValues("regionalEducationManagements").map((a) => {return a.id})})};
    
    
    switch(typeReport){
      case "municipio":
        urlName =  Constantes.urlBackReports + "supply/repot/municipality?" + new URLSearchParams(query);
        break;
      case "veiculo":
        urlName =  Constantes.urlBackReports + "supply/repot/vehicle?" + new URLSearchParams(query);
        break;     
      case "fornecedor":
        urlName =  Constantes.urlBackReports + "supply/repot/supplier?" + new URLSearchParams(query);
        break;     
      case "rota_gre":
        urlName =  Constantes.urlBackReports + "supply/repot/routes_gre?" + new URLSearchParams(query);
        break;    
      case "gre":
        urlName =  Constantes.urlBackReports + "supply/repot/gre?" + new URLSearchParams(query);
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
      let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx": "Relatório de Abastecimento.xlsx";
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
     setFuelSupplies([]);
     setSubTotalValues([]);
     setSubTotalValuesIndex();
     setTotalValue(0);
   }

   function generateTypeReportList(){
      //let columns = ["Nome"];
    
       let post = { 
              fuelType:getValues("fuelType"),
              typeVehicle: getValues("typeVehicle"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              vehicleType: getValues("vehicleType"),
              couponNumber: getValues("couponNumber"),
              locationId: getValues("locationId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
         };

       switch(typeReport){
          case "municipio":
             if(getValues("municipalities") == undefined || (getValues("municipalities") && getValues("municipalities").length == 0)){
                return showAlert("warning","Selecione um municipio");
             }
             //setFuelSupplies(getValues("municipalities"));
             post = {...post,municipalityId: getValues("municipalities")[0].id};
             getSubDataReport(post,0,"municipalities");
             break;
          case "veiculo":
             if(getValues("vehicles") == undefined || (getValues("vehicles") && getValues("vehicles").length == 0)){
                return showAlert("warning","Selecione um veiculo");
             }
             //setFuelSupplies(getValues("vehicles"));
             post = {...post,vehicleId: getValues("vehicles")[0].id};
             getSubDataReport(post,0,"vehicles");
             break;
          case "fornecedor":
             if(getValues("suppliers") == undefined || (getValues("suppliers") && getValues("suppliers").length == 0)){
                return showAlert("warning","Selecione um posto");
             }
             //setFuelSupplies(getValues("suppliers"));
             post = {...post,supplierId: getValues("suppliers")[0].id};
             getSubDataReport(post,0,"suppliers");
             break;
          case "rota_gre":
             if(getValues("routes") == undefined || (getValues("routes") && getValues("routes").length == 0)){
                return showAlert("warning","Selecione uma rota");
             }
             //setFuelSupplies(getValues("routes"));
             post = {...post,routeId: getValues("routes")[0].id};
             getSubDataReport(post,0,"routes");
             break;
          case "gre":
             if(getValues("regionalEducationManagements") == undefined || (getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length == 0)){
                return showAlert("warning","Selecione uma gre");
             }
             //setFuelSupplies(getValues("regionalEducationManagements"));
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

   /* ------------------------------------- */

   function generateReportCSV(){

      let query = {
        supplierId: getValues("supplierId"),
        fuelType: getValues("fuelType"),
        typeVehicle: getValues("typeVehicle"),
        vehicleType: getValues("vehicleType"),
        vehicleId: getValues("vehicleId"),
        locationId: getValues("locationId"),
        startDate : getValues("month") != "" && getValues("startDate") == "" ? startDate :  getValues("startDate") ,
        endDate: getValues("month") != "" && getValues("endDate") ==  "" ? endDate :  getValues("endDate"),
        couponNumber: getValues("couponNumber")
	    	/* page: 0,
	    	size: 1000,
	    	service: true, */
	    };
      setLoading(true);
      fetch(Constantes.urlBackCosts + "supply/report?" + new URLSearchParams(query), {
          method: "GET",
          headers: {
              "Module": "COSTS",
              "Authorization": token2
          }
      })
      .then((response) =>
          response.json().then(data => ({
              status: response.status,
              body: data
          }))
      )
      .then(({ status, body }) => {

          switch (status) {
              case 200:
                  console.log(body);
                  let data = body;
                  const reportTitle = 'Veículos Prestadores de Serviço';
                  const csvData = [];

                  csvData.push(['Sistema de Gestão de Veículos']);
                  csvData.push([reportTitle]);
                  csvData.push([]);

                  const headers = ["Modelo","Placa","Renavam","Ano de Fabricação",
                                   "Ano do Modelo","Tipo de Veículo","Localização",
                                   "Posto de Combustível","Tipo de Combustível",
                                   "Data","Valor","Preço p/ Litro","Quantidade Litros"];
                  csvData.push(headers.map(h => String(h).replace(/<[^>]+>/g, '')));


                  const displayData = data.map(item => ({
                                        "Modelo": item.model || "-",
                                        "Placa": item.plate || "-",
                                        "Renavam": item.renavamCode || "-",
                                        "Ano de Fabricação": item.yearBodywork || "-", 
                                        "Ano do Modelo": item.modelyear || "-",
                                        "Tipo de Veículo": item.typeVehicle ? vehicleTypes.filter((vehicle) => vehicle.id == item.typeVehicle)[0].name : "-", 
                                        "Localização": item.locationName || "-",
                                        "Posto de Combustível": item.supplierName || "-",
                                        "Tipo de Combustível": item.fuelType ? fuelTypes.filter((fuel) => fuel.id == item.fuelType)[0].name : "-",
                                        "Data": item.date ? FormatarData(item.date,"dd/MM/yyyy") : "-",
                                        "Valor": item.fuelCost ? "R$ " + FormatarReal(String(item.fuelCost.toFixed(2))) : "-",
                                        "Preço p/ Litro": item.priceLiter ? "R$ " + FormatarReal(String(item.priceLiter.toFixed(2))) : "-",
                                        "Quantidade Litros": item.quantityLiters ?  String(item.quantityLiters.toFixed(2)) : "-",
                                      }));
                  displayData.forEach(row => {
                    const rowValues = headers.map(header => {
                      return row[header] || '';
                    });
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

                   getData({ ...getValues(),number: 0});
                  break;
              case 400:
                  console.log("erro:", body);
                  break;
              case 404:
                  console.log("erro:", body);
                  break;
          }
          setLoading(false);
      })
      .catch((error) => {
          console.log(error);
      })
   }

   function generateReportTCECSV(){

      let query = {
        supplierId: getValues("supplierId"),
        fuelType: getValues("fuelType"),
        typeVehicle: getValues("typeVehicle"),
        vehicleType: getValues("vehicleType"),
        vehicleId: getValues("vehicleId"),
        locationId: getValues("locationId"),
        startDate : getValues("month") != "" && getValues("startDate") == "" ? startDate :  getValues("startDate") ,
        endDate: getValues("month") != "" && getValues("endDate") ==  "" ? endDate :  getValues("endDate"),
        couponNumber: getValues("couponNumber")
	    	/* page: 0,
	    	size: 1000,
	    	service: true, */
	    };
      setLoading(true);
      fetch(Constantes.urlBackCosts + "supply/report_tce?" + new URLSearchParams(query), {
          method: "GET",
          headers: {
              "Module": "COSTS",
              "Authorization": token2
          }
      })
      .then((response) =>
          response.json().then(data => ({
              status: response.status,
              body: data
          }))
      )
      .then(({ status, body }) => {

          switch (status) {
              case 200:
                  console.log(body);
                  let data = body;
                  const reportTitle = 'Relatório TCE';
                  const csvData = [];

                  csvData.push(['Sistema de Gestão de Veículos']);
                  csvData.push([reportTitle]);
                  csvData.push([]);

                  const headers = ["modelo","placa","renavam","ano_fab",
                                   "ano_mod","tipo_veiculo","localizacao",
                                   "capacidade","qtde_abastecimento","combustivel_abastecimento",
                                   "km_inicial_mes","km_final_mes"
                                  ];
                  csvData.push(headers.map(h => String(h).replace(/<[^>]+>/g, '')));


                  const displayData = data.map(item => ({
                                        "modelo": item.model || "-",
                                        "placa": item.plate || "-",
                                        "renavam": item.renavamCode || "-",
                                        "ano_fab": item.yearBodywork || "-", 
                                        "ano_mod": item.modelyear || "-",
                                        "tipo_veiculo": item.typeVehicle ? vehicleTypes.filter((vehicle) => vehicle.id == item.typeVehicle)[0].name : "-", 
                                        "localizacao": item.locationName || "-",
                                        "capacidade": item.tankCapacity || "-",
                                        "qtde_abastecimento": item.totalLiters || "0",
                                        "combustivel_abastecimento": item.fuelType ? fuelTypes.filter((fuel) => fuel.id == item.fuelType)[0].name : "-",
                                        "km_inicial_mes": item.startMileage,
                                        "km_final_mes": item.endMileage
                                      }));
                  displayData.forEach(row => {
                    const rowValues = headers.map(header => {
                      return row[header] || '';
                    });
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
                  console.log("erro:", body);
                  break;
              case 404:
                  console.log("erro:", body);
                  break;
          }
          setLoading(false);
      })
      .catch((error) => {
          console.log(error);
      })
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

      if(subTotalValuesIndex != undefined && subTotalValuesIndex < fuelSupplies.length){
          
          let post = { 
              fuelType:getValues("fuelType"),
              typeVehicle: getValues("typeVehicle"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              vehicleType: getValues("vehicleType"),
              couponNumber: getValues("couponNumber"),
              locationId: getValues("locationId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              ...(typeReport == "municipio" && {municipalityId: fuelSupplies[subTotalValuesIndex].id}),
              ...(typeReport == "veiculo" && {vehicleId: fuelSupplies[subTotalValuesIndex].id}),
              ...(typeReport == "fornecedor" && {supplierId: fuelSupplies[subTotalValuesIndex].id}),
              ...(typeReport == "rota_gre" && {routeId: fuelSupplies[subTotalValuesIndex].id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: fuelSupplies[subTotalValuesIndex].id})
          };
        getSubDataReport(post,subTotalValuesIndex);
      }
      if(subTotalValuesIndex != undefined && subTotalValuesIndex == fuelSupplies.length){
          let total = subTotalValues.reduce((a, value) => {return a + value}, 0);
          setTotalValue(total);
          setColumns([<div style={{display:"flex", justifyContent:"space-between"}}> 
                           <div>Nome</div> <div>Valor Total: R$ {FormatarReal(String(total.toFixed(2)))}</div>
                      </div>]);
      }
    }, [subTotalValuesIndex])


   useEffect(() => {
     if(subPage == "Abastecimento"){
       if(!generateReport){
          getData();
          setColumns(["Veículo","Posto de Combustível","Tipo de Combustível","Data","Valor","Ações"]);
       }
     } 
     if(subPage == "Nota Fiscal"){
        getData();
        setColumns(["N° da Nota Fiscal","Data de Emissão","Valor Total","Ações"]);
     } 
   },[subPage,number,size]);

   useEffect(() => {
    /* if(!showAsync) setShowAsync(true); */
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

   useEffect(() => {
      if(!generateReport && subPage == "Abastecimento"){reset();getData();setColumns(["Veículo","Posto de Combustível","Tipo de Combustível","Data","Valor","Ações"])}
   },[generateReport]);

   return (<>

        { loading && <LoadingGif/>}
   
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Serviços de Abastecimento</h1>
         { checkPermission("Supply_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push(`/custos/abastecimento/create?type=${subPage == "Abastecimento" ? "abastecimento" : 
                                                                                   subPage == "Nota Fiscal" ?  "nota" : ''}`);}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>

        <Nav tabs className={styles.navbar}>
           <NavItem  style={{cursor:"pointer"}}>
             <NavLink active={subPage == "Abastecimento"} onClick={() => setSubPage("Abastecimento")} 
                      className={styles.navlink}>Abastecimento</NavLink>
           </NavItem>
           {checkPermission("Invoice") && <NavItem  style={{cursor:"pointer"}}>
           <NavLink active={subPage == "Nota Fiscal"} onClick={() => setSubPage("Nota Fiscal")}
                    className={styles.navlink}>Nota Fiscal</NavLink>
           </NavItem>}
        </Nav>

        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
          <Form onSubmit={handleSubmit(getData)}>
            <Row className="d-flex mt-3">
              {subPage == "Nota Fiscal" && <>
                <Col sm="4">
                  <InputForm
                    id="number"
                    name="number"
                    label="N° da Nota Fiscal"
                    placeholder="Selecione"
                    register={register}
                    type="text"
                  />
                </Col>
                <Col sm="4">
                  <InputForm
                    id="date"
                    name="date"
                    label="Data de Emissão"
                    placeholder="dd/mm/aaaa"
                    register={register}
                    type="date"
                  />
                </Col>
               { showAsync[0] == true && 
                <Col sm="4">
                    <AsyncSelectForm
                      id={"supplierId"}
                      name={"supplierId"}
                      label="Posto de Combustível"
                      register={register}
                      onChange={(e) => {setValue(`supplierId`,e ? e.value : "")}}
                      options={supplierOptions}
                    />
                </Col>}
              </>}

              {subPage == "Abastecimento" && <>
                <Col sm="4">
                  <InputForm
                    id="fuelType"
                    name="fuelType"
                    label="Tipo de Combustível"
                    placeholder="Selecione"
                    register={register}
                    type="select"
                    options={fuelTypes}
                  />
                </Col>

                <Col sm="4">
                  <InputForm
                    id="typeVehicle"
                    name="typeVehicle"
                    label="Tipo de Veículo"
                    placeholder="Selecione"
                    register={register}
                    type="select"
                    options={vehicleTypes}
                  />
                </Col>
                { showAsync[0] == true && 
                 !generateReport &&
                 <Col sm="4">
                    <AsyncSelectForm
                      id={"supplierId"}
                      name={"supplierId"}
                      label="Posto de Combustível"
                      register={register}
                      onChange={(e) => {setValue(`supplierId`,e ? e.value : "")}}
                      options={supplierOptions}
                    />
                  </Col>}
                
                {checkPermission("Export_Supply") && <Col sm="4">
                  <InputForm
                      id="month"
                      name="month"
                      label="Mês/Ano"
                      placeholder="mm/aaaa"
                      register={register}
                      onChange={(e) => {let date = new Date(e.target.value);
                                        setStartDate(FormatarData(new Date(date.getFullYear(), date.getMonth(), 1),"yyyy-MM-dd"));
                                        setEndDate(FormatarData(new Date(date.getFullYear(), date.getMonth() + 1, 0),"yyyy-MM-dd"));
                                        setValue("startDate","")
                                        setValue("endDate","")}}
                      type="month"
                   />
                 </Col>}
                 <Col sm="4">
                     <InputForm
                         id="startDate"
                         name="startDate"
                         label="Data de Início"
                         placeholder="dd/mm/aaaa"
                         min={startDate}
                         max={endDate}
                         register={register}
                         type="date"
                     />
                 </Col>
                 <Col sm="4">
                     <InputForm
                         id="endDate"
                         name="endDate"
                         label="Data de Fim"
                         placeholder="dd/mm/aaaa"
                         min={startDate}
                         max={endDate}
                         register={register}
                         type="date"
                     />
                 </Col>

                 <Col sm="3">
                   <InputForm
                     id="vehicleType"
                     name="vehicleType"
                     label="Tipo de Ativo Veículo"
                     placeholder="Selecione"
                     register={register}
                     type="select"
                     options={vehicleAssetTypes}
                   />
                 </Col>
                 <Col sm={"3"}>
                    <InputForm
                      id="couponNumber"
                      name="couponNumber"
                      label="N° do Cupom"
                      placeholder="Selecione"
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
                { showAsync[2] == true && 
                  <Col sm={"3"}>
                     <AsyncSelectForm
                       id="locationId"
                       name="locationId"
                       label="Localização"
                       onChange={(e) => {setValue("locationId",e ? e.value: "")}}
                       register={register}
                       options={localizationOptions}
                     />
                  </Col>}

                 {checkPermission("Regional_Education_Management") &&  
                  showAsync[3] == true && 
                  !generateReport &&
                  <Col sm="4">
                     <AsyncSelectForm
                       id="regionalEducationManagementId"
                       name="regionalEducationManagementId"
                       label="GRE"
                       register={register}
                       required={false}
                       defaultValue={getValues("regionalEducationManagementId") ? {value: getValues("regionalEducationManagementId"), label: getValues("regionalEducationManagementName")} : null}
                       onChange={(e) => {setValue("regionalEducationManagementId", e ? e.value : "");
                                         setValue("regionalEducationManagementName", e ? e.label : "");
                                         /* setValue("municipalityId","");setValue("municipalityName",""); */
                                         setValue("routeId","");setValue("routeName","");
                                         setShowAsync([true,true,true,true,false,false])}}
                       options={greOptions}
                       errors={errors}
                     />
                  </Col>}
                 {checkPermission("Municipality") &&  
                  showAsync[4] == true && 
                  !generateReport &&
                 <Col sm="4">
                 <AsyncSelectForm
                      id="municipalityId"
                      name="municipalityId"
                      label="Município"
                      register={register}
                      required={false}
                      defaultValue={ getValues("municipalityId") ? {value:getValues("municipalityId"),label:getValues("municipalityName")} : null}
                      onChange={(e) => {setValue("municipalityId", e ? e.value : "");
                                        setValue("municipalityName", e ? e.label : "");
                                         setValue("routeId","");setValue("routeName","");
                                        setShowAsync([true,true,true,false,true,false])}}
                      options={municipioOptions}
                      errors={errors}
                    />
                  </Col>}
                { checkPermission("Route") && 
                  showAsync[5] == true &&
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

 
                { checkPermission("Report_View") && <Col sm="12" style={{paddingLeft:"10px",fontSize:"20px",
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

              </>}
            </Row>

            {subPage == "Abastecimento" && generateReport &&  
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
                                          clearReportValues()                                      
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
                        //defaultValue={getValues("regionalEducationManagements") || null}
                        onChange={(e) => {/* setValue("regionalEducationManagementId", e ? e.value : "");
                                          setValue("regionalEducationManagementName", e ? e.label : ""); */
                                          setValue('regionalEducationManagements',e.map((e) => {return {id: e.value,
                                                                                                        name: e.label,
                                                                                                        subData:[]}}));
                                          
                                          if(typeReport == "rota_gre"){ 
                                              //setValue("routeId","");setValue("routeName","");
                                              setValue('routes',[]);
                                              setShowAsync([true,true,true,true,true,false])}
                                          clearReportValues();
                                          }}
                        options={greOptions}
                        errors={errors}
                      />
                   </Col>}

                   {typeReport == "rota_gre" &&
                   showAsync[5] == true &&
                   <Col sm="3">
                      <AsyncSelectForm
                        id="routes"
                        name="routes"
                        label="Rota"
                        register={register}
                        required={false}
                        isMulti={true}
                        //defaultValue={ getValues("routeId") ? {value:getValues("routeId"),label:getValues("routeName")} : null}
                        defaultValue={ getValues("routes") && getValues("routes").length > 0 ?  
                                                              getValues("routes").map((e) => {return {value: e.id, label: e.name}}) : null}
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

              {generateReport && subPage == "Abastecimento" ? 
               <>
                 {fuelSupplies.length > 0 && 
                  <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                    Exportar <FaFileExport />
                  </Button>}
                  <Button onClick={() => {/*  generateTypeReport("exhibition") */clearReportValues();generateTypeReportList()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
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
   
                 <Button type="submit" style={{ backgroundColor: "#009E8B", width:"150px"/* , marginRight:"10px" */}}>
                   Filtrar <FaFilter />
                 </Button>
   
                 {checkPermission("Export_Supply") && subPage == "Abastecimento" &&
                    <Button onClick={() => { generateReportCSV() }} style={{ backgroundColor: "#009E8B", width: "200px" }}>
                        Relatório Interno  <FaFileExport/>
                    </Button>
                 }
                 {checkPermission("Supply_TCE_Report") && subPage == "Abastecimento" && 
                    <Button onClick={() => { generateReportTCECSV() }} style={{ backgroundColor: "#009E8B", width: "200px" }}>
                        Relatório TCE  <FaFileExport/>
                    </Button>}
               </>}
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%"}}>
              
              {windowWidth > 921 && ((subPage == "Abastecimento" && fuelSupplies.length > 0) || 
                                     (subPage == "Nota Fiscal" && invoices.length > 0)) &&
                <TableStyle columnNames={columns} 
                            noStriped={generateReport} 
                            data={ generateReport ? dataForTableList(fuelSupplies) : dataForTable(subPage == "Abastecimento" ? fuelSupplies : 
                                                                                                  subPage == "Nota Fiscal" ?  invoices : null)} />}
              {windowWidth <= 921 && ((subPage == "Abastecimento" && fuelSupplies.length > 0) || 
                                      (subPage == "Nota Fiscal" && invoices.length > 0)) &&  
              <IndexCardsStyle names={columns} data={ generateReport ? dataForTableList(fuelSupplies) : dataForTable(subPage == "Abastecimento" ? fuelSupplies : 
                                                                                                                       subPage == "Nota Fiscal" ?  invoices : null)}/>}
              {generateReport && subPage == "Abastecimento" && fuelSupplies.length == 0 && 
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

        { ((!generateReport && subPage == "Abastecimento" && fuelSupplies.length > 0) || 
           (!generateReport && subPage == "Nota Fiscal" && invoices.length > 0)) && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} 
                               pageElements={subPage == "Abastecimento" ? fuelSupplies.length : 
                                             subPage == "Nota Fiscal" ?  invoices.length : null} 
                               totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

        <ModalStyle  open={openModal} title={"Remover " + subPage} onClick={() => {deleteItem()}} toggle={() => setOpenModal(!openModal)}>
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