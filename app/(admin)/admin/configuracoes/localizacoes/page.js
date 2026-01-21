"use client"

import styles from './localizacoes.module.css';
import { Row, Col, Form, Button, Card, CardHeader,CardBody,CardFooter,
        Nav, NavItem, NavLink 
 } from "reactstrap";
 import { useState, useEffect, useContext, Fragment } from "react";
import { AuthContext } from '../../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare  } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import AlertMessage from '../../../../../src/Components/ElementsUI/AlertMessage';
import LoadingGif from '../../../../../src/Components/ElementsUI/LoadingGif';
import TableStyle from '../../../../../src/Components/ElementsUI/TableStyle';
import IndexCardsStyle from  "../../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from '../../../../../src/Components/ElementsUI/PaginationStyle';
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";
import ModalStyle from "../../../../../src/Components/ElementsUI/ModalStyle"; 
import Constantes from '../../../../../src/Constantes';

export default function Page(){

    const { "token2": token2 } = parseCookies();
       const { permissions } = useContext(AuthContext);
          
       function checkPermission(name){
          return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
       }
    
       const router = useRouter();    
       const [loading, setLoading] = useState(true);
       const [statusOptions, setStatusOptions] = useState([{id:"ACTIVE",name:"Ativo"},
                                                           {id:"NOT_ACTIVE",name:"Inativo"}]); 
       const [showAsync, setShowAsync] = useState([true,true,true]);

       const [subPage, setSubPage] = useState("localização");
        
       const [columns, setColumns] = useState(["Nome","Cidade","Bairro","CEP","Status", "Ações"]);
       const [localization, setLocalization] = useState([]);
       const [serviceId, setServiceId] = useState(null);
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
       formState: { errors },
    } = useForm({ defaultValues: { 
                                    locationId:null, sectorId: null, subsectorId: null
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


   const localizationOptions = (teste, type) => {
           let url;
           let query = {};
           query.size = 100;
           query.name = teste;
           query.typeLocation = type;

          /*  switch(subPage){
             case "setor":
               if(type == "SECTOR"){
                  query.fatherId = getValues("locationId");
              }
               break;
             case "subsetor": */
               if(type == "SECTOR"){
                  query.fatherId = getValues("locationId") || "";
               }

               if(type == "SUBSECTOR"){
                  query.fatherId = getValues("sectorId") || "";
               }
               /* break;
           } */

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
  }

   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "name": d.name,
            "cidade": /* d.catSers.map((catSer,index) => { return <Fragment key={index}><div>{catSer.description}</div><br/></Fragment>}) */
            d.city,
            "bairro": d.neighborhood,
            "CEP":d.zip,
            "status": <Card style={{/* alignItems:"center", */
                                    ...(windowWidth <= 795  && {display:"inline-block"}),
                                    width:"fit-content",
                                    padding:"4px 12px",
                                    color: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    backgroundColor: d.status == "ACTIVE" ? "#58eb25" : "#eb2558",
                                    borderColor: d.status == "ACTIVE" ? "#348d16" : "#8d1634",
                                    borderRadius:"10px"}}>{d.status == "ACTIVE" ? "Ativo" : "Inativo"}</Card>,
            "actions": actionButtons(d.id,d.status, d.typeLocation)
          })
      );

      return tableData;
   }

   function actionButtons(id,status, typeLocation){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
        
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/configuracoes/localizacoes/${id}?typeLocation=${typeLocation}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Location_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/configuracoes/localizacoes/${id}/edit?typeLocation=${typeLocation}`)}}><BsPencilSquare/></Button>
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
               <Button className={styles.button}onClick={() => {setServiceId(id);setOpenModal(true)}}><BiTrash/></Button>
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
        fetch(Constantes.urlBackAdmin + `stock/${id}`, {method: "PATCH",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION",
                "Authorization": token2
            },})
            .then((response) => response.status) 
            .then((status) => {
                 switch(status){
                     case 200:
                       showAlert("success", " Status alterado com sucesso!");
                     break;
                     case 401:
                       showAlert("danger","Erro de autorização");
                     break;
                     case 404:
                       showAlert("danger","Erro ao Alterar o Status");
                     break;
                     
                 }
                 getLocalization();
            })
            .catch((error) => {
               console.log(error);
             }) 
    }

    function deleteService(){
       fetch(Constantes.urlBackAdmin + `category/${serviceId}`, {method: "DELETE",
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
                      showAlert("danger","Error ao Apagar Serviço");
                    break;   
                }
               getServices();
               setOpenModal(false);
           })
           .catch((error) => {
              console.log(error);
           }) 
    }

   function clearFilter(){
      setValue("name","");
      setValue("locationId",null);
      setValue("sectorId",null);
      setValue("subsectorId",null);
      setValue("status","");
      setShowAsync([false,false,false]);
      getLocalization();
   }
                                                    
   function getLocalization(data){
   
      let query = {};
      query.page = number;
      query.size = size;
      query.service = true;

      query.typeLocation = "LOCATION";

      switch(subPage){
        case "localização":
          query.typeLocation = "LOCATION";
          if(data != undefined && data.locationId !== null) data.id = data.locationId;
          break;
        case "setor":
          query.typeLocation = "SECTOR";
          if(data != undefined && data.sectorId !== null) data.id = data.sectorId;
          break;
        case "subsetor":
          query.typeLocation = "SUBSECTOR";
          if(data != undefined && data.subsectorId !== null) data.id = data.subsectorId;
          break;
      }

      if(data != undefined){

         console.log(data);
         let fatherId = '';
         
         
        if (data.locationId !== null && subPage != "localização"){
         fatherId = data.locationId;
        }
        if ( data.sectorId !== null && subPage == "subsetor") {
         fatherId = data.sectorId;
        } /* else if (data.subsectorId !== null && subPage != "subsetor") {
          fatherId = data.subsectorId;   
        }*/

        data.fatherId = fatherId;
       /*  delete data.locationId; */
        query = { ...query, ...data};

      } 
      setLoading(true);
      fetch(Constantes.urlBackAdmin + "stock?" + new URLSearchParams(query), {
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
                   setLocalization(body.content);
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
      getLocalization();
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
      setValue("locationId",null);
      setValue("sectorId",null);
      setValue("subsectorId",null);
      setShowAsync([false,false,false])
      getLocalization();
   },[subPage]);

    return (
        <>
        { loading && <LoadingGif/>}
        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Localizações</h1>
         { checkPermission("Location_Read") && 
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/configuracoes/localizacoes/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>

        <Nav tabs className={styles.navbar}>
           <NavItem  style={{cursor:"pointer"}}>
             <NavLink active={subPage == "localização"} onClick={() => {setNumber(0);setSubPage("localização");}} 
                    className={styles.navlink}>Localização</NavLink>
           </NavItem>
           <NavItem  style={{cursor:"pointer"}}>
           <NavLink active={subPage == "setor"} onClick={() => {setNumber(0);setSubPage("setor")}}
                    className={styles.navlink}>Setor</NavLink>
           </NavItem>
           <NavItem  style={{cursor:"pointer"}}>
           <NavLink active={subPage == "subsetor"} onClick={() => {setNumber(0);setSubPage("subsetor");}}
                    className={styles.navlink}>Subsetor</NavLink>
           </NavItem>
        </Nav>

        <CardBody style={{width:"90%", backgroundColor:"#fff"}}>
          <Form onSubmit={handleSubmit(getLocalization)}>
            <Row className="d-flex mt-3">
                { showAsync[0] && <Col sm="3">
                  <AsyncSelectForm
                    id="locationId"
                    name="locationId"
                    label="Localização"
                    onChange={(cat) => {setValue("locationId",cat ? cat.value: "");
                                        setShowAsync([true,false,false])}}
                    register={register}
                    options={(value) => localizationOptions(value, 'LOCATION') }
                  />
                </Col>}

                { showAsync[1] && subPage != "localização" && <Col sm="3">
                  <AsyncSelectForm
                    id="sectorId"
                    name="sectorId"
                    label="Setor"
                    onChange={(cat) => {setValue("sectorId",cat ? cat.value: "");
                                        setShowAsync([true,true,false])}}
                    register={register}
                    options={(value) =>  localizationOptions(value, 'SECTOR')}
                  />
                </Col>}

                { showAsync[2] && subPage == "subsetor" && <Col sm="3">
                  <AsyncSelectForm
                    id="subsectorId"
                    name="subsectorId"
                    label="Subsetor"
                    onChange={(cat) => {setValue("subsectorId",cat ? cat.value: "");
                                        setShowAsync([true,true,true])}}
                    register={register}
                    options={(value) => localizationOptions(value, 'SUBSECTOR')}
                  />
                </Col>}
    
                <Col sm="3">
                   <InputForm
                     id="status"
                     name="status"
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
              <TableStyle columnNames={columns} data={dataForTable(localization)} />}
            {windowWidth <= 795 &&  
              <IndexCardsStyle names={columns} data={dataForTable(localization)}/>}        
        </CardBody>

        <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={localization.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>

        <ModalStyle  open={openModal} title="Remover Serviço"  onClick={() => {deleteService()}} toggle={() => setOpenModal(!openModal)}>
          Cuidado essa ação poderá ser desfeita!
        </ModalStyle>

        {activeAlert && (
           <AlertMessage type={alert["type"]}
               text={alert["text"]}
               isOpen={isOpen}
               toggle={onDismiss}>
           </AlertMessage>
        )}               
    </>
    )
}