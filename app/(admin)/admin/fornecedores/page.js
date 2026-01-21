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
import { FiBarChart2 } from 'react-icons/fi';
import { CgCloseR } from "react-icons/cg";
import styles from "./fornecedores.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader,CardBody,CardFooter,
         UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";
import AlertMessage from "../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../src/Components/ElementsUI/InputForm"; 
import AsyncSelectForm from "../../../../src/Components/ElementsUI/AsyncSelectForm";
import ModalStyle from "../../../../src/Components/ElementsUI/ModalStyle";

export default function Page() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
   
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
   }

   const router = useRouter();

   const [loading, setLoading] = useState(true);

   const [showAsync, setShowAsync] = useState([true,true]);

   const typeOptions = [{id:true,name:"Pessoa Física"},
                        {id:false,name:"Pessoa Jurídica"}];
  
   const statusOptions =  [{id:true,name:"Ativo"},
                           {id:false,name:"Inativo"}];

   const statusOptions2 = [{value:"ACTIVE",label:"Ativo"},
                           {value:"NOT_ACTIVE",label:"Inativo"}];
   
   const [generateReport, setGenerateReport] = useState(false);

   const [reportOptions, setReportOptions] = useState([{id:"categoria", name:"Relatório por Categoria/Serviço"},
                                                       {id:"tipo_material", name:"Relatório por Tipo Material"},
                                                       {id:"municipio", name:"Relatório por Município"}]);
   
   const [typeReport, setTypeReport] = useState(null);

   const [columns, setColumns] = useState(["Nome","CPF / CNPJ","Email","Telefone","Status","Ações"]);

   const [suppliers, setSuppliers] = useState([]);
   const [supplierId, setSupplierId] = useState([]);

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
    } = useForm({ defaultValues: {categories: [],
                                  name:"",
                                  doc: "",
                                  isPF: "",
                                  active: "",
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


   const categoryOptions = (teste) => {
         let url;
         let query = {};
         query.size = 100;
         query.service = false;
         query.name = teste;
         url =  "category?" + new URLSearchParams(query);
         
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

    const typeProductsOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.productName = teste;
       query.categoryId = getValues("categoryId") && getValues("categoryId").length > 0 ?
                          getValues("categoryId").map((a) => {return a.id}) : "";
       query.active = true;
       url =  "product_type?" + new URLSearchParams(query);
       
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


    const cityOptions = () => {
       let url;
       let query = {};
       query.size = 100;

       url =  "supplier/municipalities?" + new URLSearchParams(query);
       
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
                 "value":  dado.municipality,
                 "label": dado.municipality 
                }));
       
                 return dadosTratados;
          });
    }; 


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "name": d.name,
            "docs": d.docs,
            "email": d.email,
            "phone": d.phone,
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
      let columnNames = ["Nome","CPF/CNPJ","Município","Categoria","Tipo de Produto","Email","Telefone","Status"];

      data.forEach((d,i) => {

         let post = { 
          name:getValues("name"),
          doc:getValues("doc"),
          isPF:getValues("isPF"),
          status: getValues("active") == "false" ? "NOT_ACTIVE" : 
                  getValues("active") == "true" ? "ACTIVE" : "",
          ...(typeReport == "categoria" && {categoryId: d.id}),
          ...(typeReport == "tipo_material" && {productTypeId: d.id}),
          ...(typeReport == "municipio" && {city: d.id})
         };

         // PADRÃO ANTERIOR 
         /* switch(typeReport){ 
           case "categoria":
              columnNames = ["Nome","CPF/CNPJ","Município","Tipo de Produto","Telefone"];
              break;
           case "tipo_material":
              columnNames = ["Nome","CPF/CNPJ","Município","Telefone"];
              break;
           case "municipio":
              columnNames = ["Nome","CPF/CNPJ","Categoria/Serviço","Tipo de Produto","Telefone"];
              break; 
         } */


         tableData.push({
            "name": <UncontrolledAccordion flush className={styles.accordion}>
                       <AccordionItem>
                          <AccordionHeader targetId={d.name}
                                           onClick={() => {getSubDataReport(post,i)}}>
                             <div style={{fontSize:"1.2rem"}}>{d.name}</div></AccordionHeader>
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

      /* data.forEach(d => 
          tableData.push({
            "supplierName": d.supplierName,
            "cpfOrCnpj": d.cpfOrCnpj,
            ...(typeReport != "municipio" && {"city": d.city}),
            ...((typeReport != "categoria" && typeReport != "tipo_material") && {"category": d.categories && forExport != undefined ? d.categories.map(obj => obj.name).join(", \n") :
                                                                                             d.categories && forExport == undefined ? d.categories.map((e,index) => {return <Fragment key={index}>{e.name}<br/></Fragment>}) : "-"}),
            ...(typeReport != "tipo_material" &&  {"productType" : d.categories ? d.categories.map((e,i) => {if(e.productType && e.productType.length > 0) 
                                                                                                             return  forExport != undefined ? e.productType.map(obj => obj.name).join(", \n") : 
                                                                                                                                              e.productType.map((f,index) => {return <Fragment key={index}>{f.name}<br/></Fragment>})
                                                                                                             else return forExport != undefined ? "\n" : <br key={i}/>}) : "-"}),
            "phone": d.phone,
          })
      ); */
      //Nome        CPF/CNPJ        Município        Tipo de Produto        Email        Telefone        Status

      data.forEach(d => 
          tableData.push({
            "supplierName": d.supplierName,
            "cpfOrCnpj": d.cpfOrCnpj,
            "city": d.city,
            "category": d.categories ? d.categories.map((e,index) => {return <Fragment key={index}>{e.name}<br/></Fragment>}) : "-",
            "productType" : d.categories ? d.categories.map((e,i) => {e.productType && e.productType.length > 0 ? e.productType.map((f,index) => {return <Fragment key={index}>{f.name}<br/></Fragment>})
                                                                                                                : <br key={i}/>}) : "-",
            "email": d.email,
            "phone": d.phone,
            "status": d.status ? statusOptions2.filter((a) => a.value == d.status)[0].label : "",
          })
      );

      return tableData;
   }

   function actionButtons(id,status){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/fornecedores/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Supplier_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/fornecedores/${id}/edit`)}}><BsPencilSquare/></Button>
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
               <Button className={styles.button}onClick={() => {setSupplierId(id);setOpenModal(true)}}><BiTrash/></Button>
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

   function setStatus(id){
      fetch(Constantes.urlBackAdmin + `supplier/${id}`, {method: "PATCH",
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
              getSuppliers();
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function deleteSupplier(){
      fetch(Constantes.urlBackAdmin + `supplier/${supplierId}`, {method: "DELETE",
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
                     showAlert("danger","Error ao Apagar Fornecedor");
                   break;   
               }
              getSuppliers();
              setOpenModal(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function clearFilter(){
      setValue("name","");
      setValue("doc","");
      setValue("isPF","");
      setValue("categories",[]);
      setShowAsync([false,false]);
      setValue("active","");
      getSuppliers();
   }
                                                     
   function getSuppliers(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "supplier?" + new URLSearchParams(query), {
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
                   setSuppliers(body.content);
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

   function getSuppliesReport(data){
     let query = {};
     query.page = number;
     query.size = size;

     if(data != undefined) query = { ...query, ...data};

     setLoading(true);

     fetch(Constantes.urlBackReports + "report/report_supplie?" + new URLSearchParams(query), {
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
                  setSuppliers(body.content);
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
     let query = {};
     /* query.page = number;
     query.size = size; */
     query.all = true;

     if(data != undefined) query = { ...query, ...data};

     setLoading(true);

     fetch(Constantes.urlBackReports + "report/report_supplie?" + new URLSearchParams(query), {
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
                     setSuppliers(suppliers.map((s,i) =>{
                        if(i == index) s.subData = body.content;
                        return s;
                     }))
                  }else{
                     setSuppliers(body.content);
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

  /*  function getReportSubtitle(title){
     switch(typeReport){
        case "categoria":
          return title + ": " + getValues("categoryName");
        case "tipo_material":
          return title + ": " + getValues("typeProductName");
        case "municipio":
          return title + ": ";
      }
   } */
   
   async function getReportExcel(){
   
        let urlName;
        let query = {name:getValues("name"),
                     doc:getValues("doc"),
                     isPF:getValues("isPF"),
                     status: getValues("active") == "false" ? "NOT_ACTIVE" : 
                             getValues("active") == "true" ? "ACTIVE" : "",
                     ...((typeReport == "categoria" || typeReport == "tipo_material") && {categoryIds: getValues("categoryId").map((a) => {return a.id})}),
                     ...(typeReport == "tipo_material" && {productTypeIds: getValues("typeProductId").map((a) => {return a.id})}),
                     ...(typeReport == "municipio" && {municipalities:  getValues("cities").map((a) => {return a.id})})};
   
   
        switch(typeReport){
          case "categoria":
            urlName =  Constantes.urlBackReports + "supplier/repot/category?" + new URLSearchParams(query);
            break;
          case "tipo_material":
            urlName =  Constantes.urlBackReports + "supplier/repot/product_type?" + new URLSearchParams(query);
            break;
          case "municipio":
            urlName =  Constantes.urlBackReports + "supplier/repot/municipality?" + new URLSearchParams(query);
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
           let reportTitle = index != -1 ? reportOptions[index].name + ".xlsx" : "Relatório de Fornecedores.xlsx";
           link.setAttribute("download", reportTitle);
           document.body.appendChild(link);
           link.click();
           link.remove();
          } catch (error) {
           console.error("Erro ao baixar Excel:", error);
           showAlert("warning", "Erro ao gerar Excel.");
          }
   }

   function generateTypeReportList(){
       let columns = ["Nome"];

       switch(typeReport){
          case "categoria":
            if(getValues("categoryId") == undefined || (getValues("categoryId") && getValues("categoryId").length == 0)){
                return showAlert("warning","Selecione uma categoria");
            }
            setSuppliers(getValues("categoryId"));
            break;
          case "tipo_material":
            if(getValues("typeProductId") == undefined || (getValues("typeProductId") && getValues("typeProductId").length == 0)){
                return showAlert("warning","Selecione um tipo de produto");
            }
            setSuppliers(getValues("typeProductId"));
            break;
          case "municipio":
            if(getValues("cities") == undefined || (getValues("cities") && getValues("cities").length == 0)){
               return showAlert("warning","Selecione um municipio");
            }
            setSuppliers(getValues("cities"));
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
     if(!generateReport){getSuppliers();}
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
      if(!generateReport){ reset();getSuppliers();setColumns(["Nome","CPF / CNPJ","Email","Telefone","Status","Ações"])}
   },[generateReport]);

   return (<>

        { loading && <LoadingGif/>}
    
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Fornecedores</h1>
         { checkPermission("Supplier_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/fornecedores/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getSuppliers)}>
            <Row className="d-flex mt-3">
               <Col sm="3">
                  <InputForm
                    id="name"
                    name="name"
                    label="Nome"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
                </Col>
                <Col sm="3">
                  <InputForm
                    id="doc"
                    name="doc"
                    label="CPF / CNPJ"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
                </Col>
                <Col sm="3">
                  <InputForm
                    id="isPF"
                    name="isPF"
                    label="Tipo"
                    placeholder="--Digite--"
                    register={register}
                    type="select"
                    options={typeOptions}
                  />
                </Col>
                { showAsync[0] == true && !generateReport &&
                <Col sm="3">
                  <AsyncSelectForm
                     id={"categories"}
                     name={"categories"}
                     label="Categorias"
                     register={register}
                     isMulti={true}
                     onChange={(e) => {setValue(`categories`, e.map((p) => {return p.value}))}}
                     options={categoryOptions}
                   />
                </Col>}
               <Col sm="3">
                  <InputForm
                    id="active"
                    name="active"
                    label="Status"
                    placeholder="--Selecione--"
                    register={register}
                    type="select"
                    options={statusOptions}
                  />
               </Col>
            </Row>

            {checkPermission("Report_View") && <Col sm="12" style={{paddingLeft:"10px",fontSize:"20px",
                                      display:"flex", gap:"12px"}}>
                    <Input name="check" 
                           type="checkbox"
                           checked={generateReport}
                           onChange={() => {if(!generateReport){ setSuppliers([]);setTypeReport("")}
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
                                      setSuppliers([]);
                    }}
                  />
               </Col>

              {(typeReport == "categoria" || typeReport == "tipo_material") && 
                showAsync[0] &&
              <Col sm="3">
                <AsyncSelectForm
                   id={"categoryId"}
                   name={"categoryId"}
                   label="Categorias"
                   register={register}
                   isMulti={true}
                   onChange={(e) => {setValue('categoryId',e.map((e) => {return {id: e.value,
                                                                                     name: e.label,
                                                                                     subData:[]}})); 
                                     setShowAsync([true,false]);
                                     setSuppliers([]);
                   }}
                   options={categoryOptions}
                 />
              </Col>}
            
              {typeReport == "tipo_material" &&
               showAsync[1] &&
                <Col sm="3">
                  <AsyncSelectForm
                     id={"typeProductId"}
                     name={"typeProductId"}
                     label="Tipo de Produto"
                     register={register}
                     isMulti={true}
                     onChange={(e) => {/* setValue(`typeProductId`,e ? e.value : "");
                                       setValue(`typeProductName`,e ? e.label : "") */
                                       setValue('typeProductId',e.map((e) => {return {id: e.value,
                                                                                      name: e.label,
                                                                                      subData:[]}}));
                                       setSuppliers([]);}}
                     options={typeProductsOptions}
                   />
                </Col>}

              {typeReport == "municipio" &&
                <Col sm="3">
                   {/* <InputForm
                     id="city"
                     name="city"
                     label="Município"
                     placeholder="--Digite--"
                     register={register}
                     onChange={() => {if(suppliers.length > 0) setSuppliers([])}}
                     type="text"
                   /> */}

                   <AsyncSelectForm
                     id={"cities"}
                     name={"cities"}
                     label="Município"
                     register={register}
                     isMulti={true}
                     onChange={(e) => {setValue('cities',e.map((e) => {return {id: e.value,
                                                                              name: e.label,
                                                                              subData:[]}}));
                                       setSuppliers([]);}}
                     options={cityOptions}
                   />
                </Col>}
            </Row>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">

            {generateReport ? 
              <>
               {suppliers.length > 0 && 
                 <Button onClick={() => { getReportExcel()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                   Exportar <FaFileExport />
                 </Button>}
                <Button onClick={() => {/*  generateTypeReport("exhibition") */generateTypeReportList()}} 
                        style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                  Gerar Relatório <FiBarChart2 />
                </Button> 
                <Button onClick={() => {setGenerateReport(false);reset()}} 
                        style={{ backgroundColor: "#c00", width:"130px"}}>
                  Cancelar
                </Button>
              
              </> :  
              <>
                <Button onClick={() => {clearFilter()}} style={{ backgroundColor: "#009E8B", width:"130px"}}>
                  Limpar <FaEraser />
                </Button>
  
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px", marginRight:"10px"}}>
                  Filtrar <FaFilter />
                </Button> </>}
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%"}}>
            {windowWidth > 795 && suppliers.length > 0 &&
              <TableStyle columnNames={columns} /* data={generateReport  ? dataForTableReport(suppliers) : dataForTable(suppliers)} */
                          noStriped={generateReport && typeReport != ""} 
                          data={generateReport && typeReport == "" ? dataForTableReport(suppliers) : 
                                generateReport && typeReport != "" ? dataForTableList(suppliers) : dataForTable(suppliers)} />}
            {windowWidth <= 795 && suppliers.length > 0 && 
              <IndexCardsStyle names={columns} data={generateReport ? dataForTableReport(suppliers) : dataForTable(suppliers)}/>}  
            {generateReport && suppliers.length == 0 && 
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

        {!generateReport && suppliers.length > 0 && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={suppliers.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

        <ModalStyle  open={openModal} title="Remover Fornecedor" onClick={() => {deleteSupplier()}} toggle={() => setOpenModal(!openModal)}>
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