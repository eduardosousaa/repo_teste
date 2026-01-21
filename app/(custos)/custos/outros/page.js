"use client"
import { useState, useEffect, useContext, useMemo, Fragment } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaFileExport } from "react-icons/fa";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle, BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import { FiBarChart2 } from 'react-icons/fi';
import styles from "./outros.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader, CardBody, CardFooter, FormGroup, Label, Alert,
         UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";
import { FiSearch, FiPackage } from 'react-icons/fi';
import AlertMessage from "../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from "../../../../src/Components/ElementsUI/TableStyle";
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

    function checkPermission(name) {
        return permissions ? permissions.findIndex((permission) => permission.name.includes(name)) != -1 : false;
    }

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showAsync, setShowAsync] = useState([true,true,true,true,true]);
    const [maintenances, setMaintenances] = useState([]);

    const [number, setNumber] = useState(0);
    const [size, setSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [openModal, setOpenModal] = useState(false);

    const [generateReport, setGenerateReport] = useState(false);

    const [reportOptions, setReportOptions] = useState([{id:"municipio", name:"Relatório de Outros Custos por Município"},
                                                        {id:"veiculo", name:"Relatório de Outros Custos por Veículo"},
                                                        {id:"fornecedor", name:"Relatório de Outros Custos por Fornecedor"},
                                                        {id:"gre", name:"Relatório de Outros Custos por GRE"},
                                                        {id:"rota_gre", name:"Relatório de Outros Custos por Rota/GRE"}]);
    
    const [typeReport, setTypeReport] = useState(null);

    const [subTotalValues, setSubTotalValues] = useState([]);
    const [subTotalValuesIndex, setSubTotalValuesIndex] = useState();
    const [totalValue, setTotalValue] = useState();
    
    const [columns, setColumns] = useState([["Tipo", "Valor", "Data","Veículos", "Ações"]]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [alert, setAlert] = useState({});
    const [activeAlert, setActiveAlert] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(true);

    function showAlert(type, text) {
        setIsAlertOpen(false);
        setAlert({ type: type, text: text });
        setIsAlertOpen(true);
        setActiveAlert(true);
    }
    const onDismissAlert = () => setIsAlertOpen(false);


    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        defaultValues: {
            typeCost: '',
            date: '',
            distributedCosts: false,
            regionalEducationManagementId:"",
            municipalityId:"",
            typeOtherCostsId: "",
            minValue: "",
            maxValue: "",
            startDate: "",
            endDate: "",
        }
    });

    const filters = watch();
    const [otherCosts, setOtherCosts] = useState([]);
    const [loadingOtherCosts, setLoadingOtherCosts] = useState(true);
    const [requestErrorOtherCosts, setRequestErrorOtherCosts] = useState(null);

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);


    const costTypeOptions = (teste) => {
        let url;
        let query = {};
        query.size = 100;
        query.name = teste;
        url = "other_costs/type?" + new URLSearchParams(query);

        return fetch(Constantes.urlBackCosts + url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Module": "COSTS",
                "Authorization": token2
            },
        })
            .then((response) => response.json())
            .then((data) => {
                let dadosTratados = [];

                data["content"].forEach(dado =>
                    dadosTratados.push({
                        "value": dado.id,
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
       query.regionalEducationManagementId = getValues("regionalEducationManagementId") || "";
       if(typeReport != "rota_gre")query.municipalityId = getValues("municipalityId") || "";
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
                 "label": dado.name 
                }));
       
                 return dadosTratados;
          });
    };
    

    const fetchOtherCosts = async (page = 0, pageSize = size, currentFilters = filters) => {
        setLoadingOtherCosts(true);
        setRequestErrorOtherCosts(null);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: pageSize.toString(),
            });

            if (currentFilters.typeOtherCostsId && currentFilters.typeOtherCostsId.trim()) {
                params.append('typeOtherCostsId', currentFilters.typeOtherCostsId.trim());
            }
            if (currentFilters.date && currentFilters.date.trim()) {
                params.append('date', currentFilters.date.trim());
            }
            if (currentFilters.distributedCosts !== undefined) {
                params.append('distributedCosts', currentFilters.distributedCosts.toString());
            }

            if (checkPermission("Regional_Education_Management") && currentFilters.regionalEducationManagementId) {
                params.append('regionalEducationManagementId', currentFilters.regionalEducationManagementId.toString());
            }
            if (checkPermission("Municipality") && currentFilters.municipalityId) {
                params.append('municipalityId', currentFilters.municipalityId.toString());
            }

            if (currentFilters.minValue && currentFilters.minValue != "") {
                currentFilters.minValue = currentFilters.minValue.replaceAll(".","");
                currentFilters.minValue = parseFloat(currentFilters.minValue.replace(",","."));
                params.append('minValue', currentFilters.minValue);
            }
            if (currentFilters.maxValue && currentFilters.maxValue != "") {
                currentFilters.maxValue = currentFilters.maxValue.replaceAll(".","");
                currentFilters.maxValue = parseFloat(currentFilters.maxValue.replace(",","."));
                params.append('maxValue', currentFilters.maxValue);
            }

            const response = await fetch(Constantes.urlBackCosts + `other_costs?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Raw error response text (Outros Custos):", errorText);
                let errorMessage = `Erro na requisição: ${response.status} - ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.message) errorMessage = errorData.message;
                    else if (errorData.error) errorMessage = errorData.error;
                } catch (e) { }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setOtherCosts(Array.isArray(data.content) ? data.content : Array.isArray(data) ? data : []);
            setNumber(data.page.number);
            setSize(data.page.size);
            setTotalElements(data.page.totalElements);
            setTotalPages(data.page.totalPages);

        } catch (err) {
            console.error('Erro ao buscar outros custos:', err);
            setRequestErrorOtherCosts(err.message || 'Erro ao carregar outros custos. Tente novamente.');
            setOtherCosts([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoadingOtherCosts(false);
        }
    };

    /* function getOtherCostsReport(data){
      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackReports + "costs/other_costs?" + new URLSearchParams(query), {
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
                   setOtherCosts(body.content);
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


    /* function generateTypeReport(type){
        let data = { 
            typeOtherCostsId: getValues("typeOtherCostsId"),
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
              setColumns(["N° Nota Fiscal","GRE","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"]);
              data = {...data,
                      municipalityId: getValues("municipalityId")};
              if(type == "exhibition") getOtherCostsReport(data);
              else if(type == "csv") generateCSV(data);
              break;
           case "veiculo":
              if(getValues("vehicleId") == "" || getValues("vehicleId") == null || getValues("vehicleId") == undefined){
                return showAlert("warning","Selecione o veículo");
              }
              setColumns(["N° Nota Fiscal","Categoria","Tipo de Custo","Nome do Item","Valor do Item","Dt. Emissão","Valor Total"]);
              data = {...data,
                      vehicleId: getValues("vehicleId")};
              if(type == "exhibition") getOtherCostsReport(data);
              else if(type == "csv") generateCSV(data);
              break;
           case "fornecedor":
           case "rota_gre":
              if(typeReport == "fornecedor" && (getValues("supplierId") == "" || getValues("supplierId") == null || getValues("supplierId") == undefined)){
                  return showAlert("warning","Selecione o fornecedor");
              }
              if(typeReport == "rota_gre" && (getValues("routeId") == "" || getValues("routeId") == null || getValues("routeId") == undefined)){
                return showAlert("warning","Selecione a rota");
             }
              setColumns(["N° Nota Fiscal","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"]);
              data = {...data,
                      ...(typeReport == "fornecedor" && {supplierId: getValues("supplierId")}),
                      ...(typeReport == "rota_gre" && {routeId: getValues("routeId")}),};
              if(type == "exhibition") getOtherCostsReport(data);
              else if(type == "csv") generateCSV(data);
              break;
           case "gre":
              if(getValues("regionalEducationManagementId") == "" || getValues("regionalEducationManagementId") == null || getValues("regionalEducationManagementId") == undefined){
                   return showAlert("warning","Selecione a gre");
              }
              setColumns(["N° Nota Fiscal","Município","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"]);
              data = {...data,
                      regionalEducationManagementId: getValues("regionalEducationManagementId")};
              if(type == "exhibition") getOtherCostsReport(data);
              else if(type == "csv") generateCSV(data);
              break;
       }
    } */

    useEffect(() => {
       /* if(!showAsync) setShowAsync(true); */
        if(showAsync.includes(false)){
           setShowAsync(showAsync.map((s) => {
                return true;
           }));
        }
    },[showAsync]);

    useEffect(() => {
        if (token2 && !generateReport) {
           fetchOtherCosts(number, size, filters);
        }
    }, [token2, number, size]);


    const onSubmit = (data) => {
        setNumber(0);
        fetchOtherCosts(0, size, {
            typeOtherCostsId: data.typeOtherCostsId,
            date: data.date,
            distributedCosts: data.distributedCosts,
            ...(checkPermission("Regional_Education_Management") && {regionalEducationManagementId:data.regionalEducationManagementId}),
            ...(checkPermission("Municipality") && {municipalityId:data.municipalityId}),
            minValue: data.minValue,
            maxValue: data.maxValue,
        });
    };

    const limparFiltros = () => {
        reset({
            typeOtherCostsId: '',
            date: '',
            distributedCosts: false,
            regionalEducationManagementId:"",
            municipalityId:"",
            minValue: '',
            maxValue: '',
        });
        setShowAsync([false,false,false,false,false]);
        setNumber(0);
        fetchOtherCosts(0, size, {});
    };

    // const handlePageChange = (newPage) => {
    //     setNumber(newPage);
    // };

    // const handleSizeChange = (newSize) => {
    //     setSize(parseInt(newSize));
    //     setNumber(0);
    // };

    async function deleteOtherCost() {
        setLoadingOtherCosts(true);
        showAlert('info', 'Arquivando custo...');
        try {
            if (!itemToDeleteId) {
                throw new Error("ID do registro para remoção não encontrado.");
            }

            const endpointUrl = Constantes.urlBackCosts + `other_costs/archive/${itemToDeleteId}`;
            console.log("Tentando arquivar Outro Custo (PATCH):", endpointUrl);

            const response = await fetch(endpointUrl, {
                method: 'PATCH',
                headers: {
                    'accept': '*/*',
                    "Authorization": "Bearer " + token2,
                    "Module": "COSTS",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Raw error response text (Arquivar Outro Custo):", errorText);
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.message) errorMessage = errorData.message;
                    else if (errorData.error) errorMessage = errorData.error;
                } catch (parseError) { }
                throw new Error(errorMessage);
            }

            const successResponseText = await response.text();
            let result = { message: 'Custo arquivado com sucesso!' };
            try {
                if (successResponseText.trim() !== '') {
                    const parsedSuccess = JSON.parse(successResponseText);
                    result = parsedSuccess.message ? parsedSuccess : result;
                }
            } catch (parseError) { console.warn("Resposta de sucesso não é JSON válido.", parseError); }

            showAlert('success', result.message);
            setOpenModal(false);
            setItemToDeleteId(null);
            fetchOtherCosts(number, size);

        } catch (error) {
            console.error('Erro ao arquivar custo:', error);
            showAlert('danger', error.message || 'Não foi possível arquivar o custo.');
        } finally {
            setLoadingOtherCosts(false);
        }
    }


    function actionButtons(id) {
        return (
            <div style={{ display: "flex", gap: "2%", flexWrap: "wrap",
                           ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
                <div className={styles.balloon_div}>
                    <Button className={styles.button} onClick={() => router.push(`/custos/outros/visualizar/${id}`)}><BiInfoCircle /></Button>
                    <div className={styles.balloon_aviso_div}>
                        <div className={styles.balloon_aviso_border}>
                            <div className={styles.balloon_aviso_text}>Visualizar</div>
                        </div>
                    </div>
                </div>
               { checkPermission("Other_Costs_Read") && <>
                <div className={styles.balloon_div}>
                    <Button className={styles.button} onClick={() => router.push(`/custos/outros/visualizar/${id}/edit`)}><BsPencilSquare /></Button>
                    <div className={styles.balloon_aviso_div}>
                        <div className={styles.balloon_aviso_border}>
                            <div className={styles.balloon_aviso_text}>Editar</div>
                        </div>
                    </div>
                </div>
                <div className={styles.balloon_div}>
                    <Button className={styles.button} onClick={() => { setItemToDeleteId(id); setOpenModal(true); }}><BiTrash /></Button>
                    <div className={styles.balloon_aviso_div}>
                        <div className={styles.balloon_aviso_border}>
                            <div className={styles.balloon_aviso_text}>Remover</div>
                        </div>
                    </div>
                </div></>}
            </div>
        );
    }

    const dataForTable = useMemo(() => {

        return otherCosts.map(item => ({
            Tipo: item.typeOtherCostsName || item.typeCosts || item.type || 'N/A',
            Valor: item.value ? `R$ ${item.value.toFixed(2).replace('.', ',')}` : 'R$ 0,00',
            Data: item.date ? FormatarData(item.date, 'dd/MM/yyyy') : 'N/A',
            Veículos: "-",
            Ações: actionButtons(item.id),
        }));
    }, [otherCosts]);


    function getSubDataReport(data,index,typeReport){
      let query = {};
      /* query.page = number;
      query.size = size; */
      query.all = true;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackReports + "costs/other_costs?" + new URLSearchParams(query), {
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
                     /* setOtherCosts(otherCosts.map((s,i) =>{
                        if(i == index) s.subData = body.content;
                        return s;
                     })) */

                     if(index == 0){
                       setOtherCosts(getValues(typeReport).map((s,i) =>{
                          if(i == index) s.subData = body.content;
                          return s;
                       }))
                     }else{ 
                       setOtherCosts(otherCosts.map((s,i) =>{
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
                      setOtherCosts(body.content);
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

    function dataForTableList(data){
      let tableData = [];
      let columnNames = [];

      data.forEach((d,i) => {

         /* let post = { 
              typeOtherCostsId: getValues("typeOtherCostsId"),
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
              columnNames = ["N° Nota Fiscal","GRE","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"];
              break;
           case "veiculo":
              columnNames = ["N° Nota Fiscal","Categoria","Tipo de Custo","Nome do Item","Valor do Item","Dt. Emissão","Valor Total"];
              break;
           case "fornecedor":
           case "rota_gre":
              columnNames = ["N° Nota Fiscal","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"];
              break;
           case "gre":
              columnNames = ["N° Nota Fiscal","Município","Categoria","Tipo de Custo","Dt. Emissão","Valor Total"];
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
            /* ...(typeReport == "gre" && {"municipalities": d.municipalityAndGre && d.municipalityAndGre.length > 0 ? d.municipalityAndGre.map((e,index) => {return <Fragment key={index}><div>{e.municipalityName}</div><br/></Fragment>}) : "-"}), */
            ...(typeReport == "gre" && {"municipalities": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map(obj => obj.municipalityName).join(", \n") : 
                                                          d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"municipalityName").map((e,i) =>  {return <Fragment key={i}>{e.municipalityName}<br/></Fragment>}) : "-"}),
            /* ...(typeReport == "municipio" && {"regionalEducationManagements": d.municipalityAndGre && d.municipalityAndGre.length > 0 ? d.municipalityAndGre.map((e,index) => {return <Fragment key={index}><div>{e.regionalEducationManagementName}</div><br/></Fragment>}) : "-"}), */
            ...(typeReport == "municipio" && {"regionalEducationManagements": d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport != undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map(obj => obj.regionalEducationManagementName).join(", \n") :
                                                                              d.municipalityAndGre && d.municipalityAndGre.length > 0 && forExport == undefined ? removeDuplicates(d.municipalityAndGre,"regionalEducationManagementName").map((e,i) =>  {return <Fragment key={i}>{e.regionalEducationManagementName}<br/></Fragment>}) : "-"}),
            "categories": d.categories && d.categories.length > 0 && forExport != undefined ? d.categories.map(obj => obj.name).join(", \n") :
                          d.categories && d.categories.length > 0 && forExport == undefined ? d.categories.map((e,index) => {return <Fragment key={index}><div>{e.name}</div><br/></Fragment>}) : "-",     
            ...(typeReport == "veiculo" && { "distributedCostsName": d.distributedCosts && d.distributedCosts.length > 0 && forExport != undefined ? d.distributedCost.map(obj => obj.name).join(", \n") : 
                                                                     d.distributedCosts && d.distributedCosts.length > 0 && forExport == undefined ? d.distributedCost.map((e,index) => {return <Fragment key={index}><div>{e.name}</div><br/></Fragment>}) : "-"}),
            ...(typeReport == "veiculo" && { "distributedCostsValue": d.distributedCosts && d.distributedCosts.length > 0 && forExport != undefined ? d.distributedCost.map(obj => "R$" + FormatarReal(obj.value.toFixed(2))).join(", \n") :
                                                                      d.distributedCosts && d.distributedCosts.length > 0 && forExport != undefined ? d.distributedCost.map((e,index) => {return <Fragment key={index}><div>{"R$" + FormatarReal(e.value.toFixed(2))}</div><br/></Fragment>}) : "-"}),
            "typeOtherCostsName": d.typeOtherCostsName,
            "emissionDate": FormatarData(d.date,"dd/MM/yyyy"),
            "totalValue": d.value ? "R$ " + FormatarReal(String(d.value.toFixed(2))) : "-",
          })
      );

      return tableData;
    }

    async function getReportExcel(){
       
     let urlName;
     let query = { typeOtherCostsId: getValues("typeOtherCostsId"),
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
         urlName =  Constantes.urlBackReports + "other_costs/repot/municipality?" + new URLSearchParams(query);
         break;
       case "veiculo":
         urlName =  Constantes.urlBackReports + "other_costs/repot/vehicle?" + new URLSearchParams(query);
         break;     
       case "fornecedor":
         urlName =  Constantes.urlBackReports + "other_costs/repot/supplier?" + new URLSearchParams(query);
         break;     
       case "rota_gre":
         urlName =  Constantes.urlBackReports + "other_costs/repot/routes_gre?" + new URLSearchParams(query);
         break;    
       case "gre":
         urlName =  Constantes.urlBackReports + "other_costs/repot/gre?" + new URLSearchParams(query);
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
       let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Outros Custos.xlsx";
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
      setOtherCosts([]);
      setSubTotalValues([]);
      setSubTotalValuesIndex();
      setTotalValue(0);
    }

    function generateTypeReportList(){
       //let columns = ["Nome"];
       
       let post = {
             typeOtherCostsId: getValues("typeOtherCostsId"),
             minValue: getValues("minValue"),
             maxValue: getValues("maxValue"),
             startDate: getValues("startDate"),
             endDate: getValues("endDate")
       };

       switch(typeReport){
          case "municipio":
             if(getValues("municipalities") == undefined || (getValues("municipalities") && getValues("municipalities").length == 0)){
                return showAlert("warning","Selecione um municipio");
             }
             //setOtherCosts(getValues("municipalities"));
             post = {...post,municipalityId: getValues("municipalities")[0].id};
             getSubDataReport(post,0,"municipalities");
             break;
          case "veiculo":
             if(getValues("vehicles") == undefined || (getValues("vehicles") && getValues("vehicles").length == 0)){
                return showAlert("warning","Selecione um veiculo");
             }
             //setOtherCosts(getValues("vehicles"));
             post = {...post,vehicleId: getValues("vehicles")[0].id};
             getSubDataReport(post,0,"vehicles");
             break;
          case "fornecedor":
             if(getValues("suppliers") == undefined || (getValues("suppliers") && getValues("suppliers").length == 0)){
                return showAlert("warning","Selecione um posto");
             }
             //setOtherCosts(getValues("suppliers"));
             post = {...post,supplierId: getValues("suppliers")[0].id};
             getSubDataReport(post,0,"suppliers");
             break;
          case "rota_gre":
             if(getValues("routes") == undefined || (getValues("routes") && getValues("routes").length == 0)){
                return showAlert("warning","Selecione uma rota");
             }
             //setOtherCosts(getValues("routes"));
             post = {...post,routeId: getValues("routes")[0].id};
             getSubDataReport(post,0,"routes");
             break;
          case "gre":
             if(getValues("regionalEducationManagements") == undefined || (getValues("regionalEducationManagements") && getValues("regionalEducationManagements").length == 0)){
                return showAlert("warning","Selecione uma gre");
             }
             //setOtherCosts(getValues("regionalEducationManagements"));
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
    /* if(!showAsync) setShowAsync(true); */
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

    useEffect(() => {
      if(!generateReport){reset(); fetchOtherCosts(number, size, filters);setColumns(["Tipo", "Valor", "Data","Veículos", "Ações"])}
    },[generateReport]);

    useEffect(() => {
      console.log("u index:",subTotalValuesIndex);
      console.log("outros custos",otherCosts);
      if(subTotalValuesIndex != undefined && subTotalValuesIndex < otherCosts.length){
          
          let post = { 
              typeOtherCostsId: getValues("typeOtherCostsId"),
              minValue: getValues("minValue"),
              maxValue: getValues("maxValue"),
              startDate: getValues("startDate"),
              endDate: getValues("endDate"),
              ...(typeReport == "municipio" && {municipalityId: otherCosts[subTotalValuesIndex].id}),
              ...(typeReport == "veiculo" && {vehicleId: otherCosts[subTotalValuesIndex].id}),
              ...(typeReport == "fornecedor" && {supplierId: otherCosts[subTotalValuesIndex].id}),
              ...(typeReport == "rota_gre" && {routeId: otherCosts[subTotalValuesIndex].id}),
              ...(typeReport == "gre" && {regionalEducationManagementId: otherCosts[subTotalValuesIndex].id})
          };
        getSubDataReport(post,subTotalValuesIndex);
      }
      if(subTotalValuesIndex != undefined && subTotalValuesIndex == otherCosts.length){
          let total = subTotalValues.reduce((a, value) => {return a + value}, 0);
          setTotalValue(total);
          setColumns([<div style={{display:"flex", justifyContent:"space-between"}}> 
                           <div>Nome</div> <div>Valor Total: R$ {FormatarReal(String(total.toFixed(2)))}</div>
                      </div>]);
      }
    }, [subTotalValuesIndex])

    return (
        <>
            {(loadingOtherCosts || loading) && <LoadingGif />}

            <CardHeader className={styles.header}>
                <h1 className={styles.header_h1}>Outros Custos</h1>
                <div className={styles.header_buttons}>
                 { checkPermission("Other_Costs_Read") &&
                    <Button
                        className={styles.header_button}
                        onClick={() => router.push("/custos/outros/create")}
                    >
                        Cadastrar <FaPlus />
                    </Button>}
                </div>
            </CardHeader>
            <CardBody style={{ width: "90%" }}>
                {activeAlert && (
                    <AlertMessage
                        type={alert.type}
                        text={alert.text}
                        isOpen={isAlertOpen}
                        toggle={onDismissAlert}
                    />
                )}
                {requestErrorOtherCosts && (
                    <Alert color="danger" className="mb-3">
                        <strong>Erro:</strong> {requestErrorOtherCosts}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="d-flex mt-3">
                        <Col sm="4">
                            <AsyncSelectForm
                                id="typeOtherCostsId"
                                name="typeOtherCostsId"
                                label="Tipo*"
                                register={register}
                                required={false}
                                onChange={(e) => { setValue('typeOtherCostsId', e ? e.value : "");}}
                                options={costTypeOptions}
                            />
                        </Col>
                        
                        { checkPermission("Regional_Education_Management") && 
                           showAsync[0] == true &&
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
                                                   setShowAsync([true,false,false,true,true])}}
                                 options={greOptions}
                                 errors={errors}
                               />
                            </Col>}

                        { checkPermission("Municipality") &&
                          showAsync[1] == true &&
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
                                                 setShowAsync([false,true,false,true,true])}}
                               options={municipioOptions}
                               errors={errors}
                             />
                           </Col>}
                    {/* </Row>

                    <Row className="d-flex mt-3"> */}
                        { checkPermission("Route") &&
                          showAsync[2] == true &&
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
                       {!generateReport && 
                        showAsync[3] == true && <Col sm={"4"}>
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
                      {!generateReport && 
                       showAsync[4] == true && <Col sm="4">
                        <AsyncSelectForm
                          id={"companyId"}
                          name={"companyId"}
                          label="Fornecedor"
                          register={register}
                          onChange={(e) => {setValue(`supplierId`,e ? e.value : "")}}
                          options={supplierOptions}
                        />
                      </Col>}

                    {/* </Row>

                    <Row className="d-flex mt-3"> */} 
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
                        <Col sm="4" className="d-flex align-items-center">
                            <FormGroup check style={{marginTop:"20px"}}>
                                <Input
                                    type="checkbox"
                                    id="distributedCosts"
                                    name="distributedCosts"
                                    {...register('distributedCosts')}
                                    checked={filters.distributedCosts}
                                    onChange={(e) => setValue('distributedCosts', e.target.checked)}
                                />
                                {' '}
                                <Label check for="distributedCosts"
                                       style={{fontSize:"18px"}}>
                                    Com custos distribuídos
                                </Label>
                            </FormGroup>
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
                              //defaultValue={ getValues("municipalityId") ? {value:getValues("municipalityId"),label:getValues("municipalityName")} : null}
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
                                              clearReportValues();}}
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
                            //defaultValue={getValues("regionalEducationManagementId") ? {value: getValues("regionalEducationManagementId"), label: getValues("regionalEducationManagementName")} : null}
                            defaultValue={getValues("regionalEducationManagements") || null}
                            onChange={(e) => {/* setValue("regionalEducationManagementId", e ? e.value : "");
                                              setValue("regionalEducationManagementName", e ? e.label : ""); */
                                              setValue('regionalEducationManagements',e.map((e) => {return {id: e.value,
                                                                                                            name: e.label,
                                                                                                            subData:[]}}));
                                              
                                              if(typeReport == "rota_gre"){ 
                                                  //setValue("routeId","");setValue("routeName","");
                                                  setValue('routes',[]);
                                                  setShowAsync([true,true,false,true,true])}
                                              clearReportValues();}}
                            options={greOptions}
                            errors={errors}
                          />
                       </Col>}
       
                       {typeReport == "rota_gre" &&
                        showAsync[2] == true &&
                       <Col sm="3">
                          <AsyncSelectForm
                            id="routes"
                            name="routes"
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
                                
                    </Row>}
                 

                    {/* <Row style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}> */}
                    <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
                        {generateReport ? 
                        <> 

                          {otherCosts.length > 0 && 
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
                           <Button
                               type="button"
                               onClick={limparFiltros}
                               style={{ backgroundColor: "#009E8B", width: "150px"}}>
                                  Limpar <FaEraser />
                           </Button>
                           <Button
                               type="submit"
                               style={{ backgroundColor: "#009E8B", width: "150px"}}>
                                 Filtrar <FaFilter />
                           </Button>
                        </>}
                    </Row>
                </Form>
            </CardBody>

            <CardBody style={{ width: "90%" }}>
                {loadingOtherCosts ? (
                    <div className="text-center p-4">
                        <p>Carregando outros custos...</p>
                    </div>
                ) : requestErrorOtherCosts ? (
                    <div className="alert alert-danger" role="alert">
                        {requestErrorOtherCosts}
                    </div>
                ) : otherCosts.length > 0 ? (<>
                     {windowWidth > 795 && 
                       <TableStyle
                           columnNames={columns}
                           noStriped={generateReport}
                           data={generateReport ? dataForTableList(otherCosts) : dataForTable}
                       />}
                     {windowWidth <= 795 &&  
                        <IndexCardsStyle names={columns} 
                                         data={generateReport ? dataForTableList(otherCosts) : dataForTable}/>}

                    </>
                ) : (<>
                    {!generateReport && <div className="text-center p-4">
                        <FiPackage size={48} color="#999" />
                        <p>Nenhum outro custo encontrado</p>
                        <span>Tente ajustar os filtros ou registrar novos custos</span>
                    </div>}
                    </>
                )}

                {generateReport && otherCosts.length == 0 && 
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

            {!generateReport && otherCosts.length > 0 && <CardFooter style={{ width: "90%", backgroundColor: "transparent" }}>
                <PaginationStyle
                    number={number}
                    setNumber={setNumber}
                    size={size}
                    setSize={setSize}
                    pageElements={otherCosts.length}
                    totalElements={totalElements}
                    totalPages={totalPages}
                />
            </CardFooter>}

            <ModalStyle
                open={openModal}
                title={`Confirmar remoção de outro custo`}
                onClick={deleteOtherCost}
                toggle={() => setOpenModal(!openModal)}
            >
                Você tem certeza que deseja arquivar este custo? Esta ação não pode ser desfeita.
            </ModalStyle>
        </>
    );
}