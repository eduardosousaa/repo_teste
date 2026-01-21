"use client"
import { useState, useEffect, useContext, Fragment } from "react";
import Constantes from "../../../../../src/Constantes";
import { AuthContext } from '../../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare  } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import styles from "./materiais.module.css";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import { Row, Col, Form, Button, Card,CardHeader,CardBody,CardFooter,
        Nav, NavItem, NavLink 
 } from "reactstrap";
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";
import ModalStyle from "../../../../../src/Components/ElementsUI/ModalStyle";  

export default function Page() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
      
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
   }

   const router = useRouter();

   const [loading, setLoading] = useState(true);

   const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]);

   const [showAsync, setShowAsync] = useState(true);

   const [subPage, setSubPage] = useState("categoria");
    
   const [columns, setColumns] = useState(["Nome","NCM","CATMAT","Status","Ações"]);

   const [categories, setCategories] = useState([]);
   const [typesProducts, setTypesProducts] = useState([]);
   const [deleteId, setDeleteId] = useState(null);

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
       formState: { errors },
    } = useForm({ defaultValues: {ncmId:[], catMatId:[]}});
  
   function showAlert(type, text) {
     setIsOpen(false);
  
     setAlert({
         type: type,
         text: text
     })
     setIsOpen(true)
     setActiveAlert(true)
   }


   const ncmOptions = (teste) => {
           let url;
           let query = {};
           query.size = 100;
           query.name = teste;
            if(subPage == "tipo_produto") query.type = ["SUB_POSITION","ITEM"];
           url =  "types/ncm?" + new URLSearchParams(query);
           
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
                 "label": dado.code + " - " + dado.description,
                }));
             
             return dadosTratados;
           });
   }

   const catMatOptions = (teste) => {
          let url;
          let query = {};
          query.size = 100;
          query.name = teste;
          if(subPage == "tipo_produto") query.type = ["PDM","ITEM"];
          url =  "types/cat_mat?" + new URLSearchParams(query);
          
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
                "label": dado.code + " - " + dado.description,
               }));
            
            return dadosTratados;
          });
   }


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            ...(subPage == "tipo_produto" && {"categoria" : d.category.name }),
            "name": d.name,
            "ncms": subPage == "categoria" ? d.ncms.map((n,index) => { return <Fragment key={index}><div>{n.description}</div><br/></Fragment>}) : 
                                             d.ncm.map((n,index) => { return <Fragment key={index}><div>{n.description}</div><br/></Fragment>}),
            "catMats": subPage == "categoria" ? d.catMats.map((c,index) => { return <Fragment key={index}><div>{c.description}</div><br/></Fragment>}) :
                                                d.catMat.map((c,index) => { return <Fragment key={index}><div>{c.description}</div><br/></Fragment>}),
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

   function actionButtons(id,status){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
            <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/configuracoes/materiais/${id}?type=${subPage}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission(subPage == "categoria" ? "Category_Read" :"Product_Type_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/configuracoes/materiais/${id}/edit?type=${subPage}`)}}><BsPencilSquare/></Button>
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
               <Button className={styles.button}onClick={() => {setDeleteId(id);setOpenModal(true)}}><BiTrash/></Button>
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
      let url = "";
      if(subPage == "tipo_produto") url = `product_type/${id}`; 
      if(subPage == "categoria") url = `category/${id}`;

      fetch(Constantes.urlBackAdmin + url, {method: "PATCH",
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

              
             if(subPage == "categoria") getCategories();
             if(subPage == "tipo_produto") getProductTypes(); 
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function deleteMaterial(){

     let url = "";
     if(subPage == "tipo_produto") url = `product_type/${deleteId}`; 
     if(subPage == "categoria") url = `category/${deleteId}`;

     fetch(Constantes.urlBackAdmin + url, {method: "DELETE",
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
                    showAlert("danger",subPage == "tipo_produto" ? "Error ao Apagar Tipo de Produto" : "Error ao Apagar Categoria");
                  break;   
              }
             if(subPage == "categoria") getCategories();
             if(subPage == "tipo_produto") getProductTypes();
             setOpenModal(false);
         })
         .catch((error) => {
            console.log(error);
         }) 
   }

   function clearFilter(){
        setValue("name","");
        setValue("categoryName","");
        
        setValue("productName","");
        setValue("ncmId",[]);
        setValue("catMatId",[]);
        setValue("active","");
        setShowAsync(false);
        if(subPage == "categoria") getCategories();
        if(subPage == "tipo_produto") getProductTypes();
   }

   function getCategories(data){

      let query = {};
      query.page = number;
      query.size = size;
      query.service = false;

      if(data != undefined){
        let data2 = {...data};
        delete data2.categoryName; 
        delete data2.productName;
        query = { ...query, ...data2};
      }
      
      setLoading(true);
      
      fetch(Constantes.urlBackAdmin + "category?" + new URLSearchParams(query), {
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
                  setCategories(body.content);
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

   function getProductTypes(data){

    let query = {};
    query.page = number;
    query.size = size;
    query.service = false;

    if(data != undefined){ 
      let data2 = {...data};
      delete data2.name; 
      query = { ...query, ...data2};
   }else{
      query.categoryName = "";
   }
    
    setLoading(true);

    fetch(Constantes.urlBackAdmin + "product_type?" + new URLSearchParams(query), {
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
                setTypesProducts(body.content);
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
     if(subPage == "categoria") getCategories();
     if(subPage == "tipo_produto") getProductTypes();
   },[subPage,number,size]);

   useEffect(() => {
    if(!showAsync) setShowAsync(true);
   },[showAsync]);

   return (<>


   { loading && <LoadingGif/>}
   
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Materiais</h1>
        {checkPermission( subPage == "categoria" ? "Category_Read" :"Product_Type_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push(`/admin/configuracoes/materiais/create?type=${subPage}`);}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>

        <Nav tabs className={styles.navbar}>
           <NavItem  style={{cursor:"pointer"}}>
             <NavLink active={subPage == "categoria"} onClick={() => {setNumber(0);setSubPage("categoria");
                                                                      setColumns(columns.filter((c) => c != "Categoria"));}} 
                      className={styles.navlink}>Categorias</NavLink>
           </NavItem>
           <NavItem  style={{cursor:"pointer"}}>
           <NavLink active={subPage == "tipo_produto"} onClick={() => {setNumber(0);setSubPage("tipo_produto");
                                                                       setColumns(["Categoria", ...columns]);}}
                    className={styles.navlink}>Tipos de Produto</NavLink>
           </NavItem>
        </Nav>

        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
          <Form onSubmit={handleSubmit( subPage == "tipo_produto" ? getProductTypes : getCategories)}>
            <Row className="d-flex mt-3">
                <Col sm="3">
                  <InputForm
                    id={ subPage == "tipo_produto" ? "categoryName" : "name"}
                    name={ subPage == "tipo_produto" ? "categoryName" : "name"}
                    label="Nome da Categoria"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
                </Col>
                {subPage == "tipo_produto" && <Col sm="3">
                  <InputForm
                    id="productName"
                    name="productName"
                    label="Nome do Produto"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
               </Col>}
               { showAsync == true && <>
                <Col sm="3">
                  <AsyncSelectForm
                    id="ncmId"
                    name="ncmId"
                    label="NCM"
                    register={register}
                    isMulti={true}
                    onChange={(ncm) => {setValue("ncmId",ncm.map((e) => e.value))}}
                    options={ncmOptions}
                  />
                </Col> 
                <Col sm="3">
                  <AsyncSelectForm
                    id="catMatId"
                    name="catMatId"
                    label="CAT MAT"
                    isMulti={true}
                    onChange={(cat) => {setValue("catMatId",cat.map((e) => e.value))}}
                    register={register}
                    options={catMatOptions}
                  />
                </Col></>}
                <Col sm="3">
                   <InputForm
                     id="active"
                     name="active"
                     label="Status"
                     placeholder="--Selecione o status--"
                     register={register}
                     type="select"
                     options={statusOptions}
                   />
                </Col>  
            </Row>

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
              <Button onClick={() => {clearFilter()}} style={{ backgroundColor: "#009E8B", width:"130px"}}>
                Limpar <FaEraser />
              </Button>

              <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px", marginRight:"10px"}}>
                Filtrar <FaFilter />
              </Button>
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
            {windowWidth > 795 && 
              <TableStyle columnNames={columns} data={ subPage == "categoria" ? dataForTable(categories) : dataForTable(typesProducts)}/>}
            {windowWidth <= 795 &&  
              <IndexCardsStyle names={columns} data={subPage == "categoria" ? dataForTable(categories) : dataForTable(typesProducts)}/>}           
        </CardBody>

        <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={subPage == "categoria" ? categories.length : typesProducts.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>

        <ModalStyle  open={openModal} title="Remover Categoria" onClick={() => {deleteMaterial()}} toggle={() => setOpenModal(!openModal)}>
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