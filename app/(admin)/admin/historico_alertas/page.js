"use client"
import { useState, useEffect, useContext } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare, BsCheckSquare } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import styles from "./historico.module.css";
import { Row, Col, Form, Button, Card, CardHeader,CardBody,CardFooter } from "reactstrap";
import AlertMessage from "../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../src/Components/ElementsUI/AsyncSelectForm";
import ModalStyle from "../../../../src/Components/ElementsUI/ModalStyle"; 
import FormatarData from "../../../../src/Utils/FormatarData";

export default function Page() {

   const { "token2": token2 } = parseCookies();

   const [loading, setLoading] = useState(false);

   const [typeOptions, setTypeOptions] = useState([{id:"DOCUMENTS",name:"Documentos Pessoais"},
                                                   {id:"COURSES",name:"Cursos"},
                                                   {id:"DOCUMENT_VEHICLE",name:"Documentos do Veículo"},
                                                   {id:"ACQUISITIVE",name:"Aquisitivo"},
                                                   {id:"VACATION",name:"Férias"},
                                                   {id:"BIRTHDAY",name:"Aniversário"},
                                                   {id:"MOVEMENT",name:"Movimentação de Localização"},
                                                   {id:"MAINTENANCE_PERIODIC",name:"Manutenção Periódica"},
   ]);

   const [statusOptions, setStatusOptions] = useState([{id:"READ",name:"Lido"},
                                                       {id:"NOT_READ",name:"Não Lido"}]);

   const [platformOptions, setPlatformOptions] = useState([{id:"EMAIL",name:"Email"},
                                                           {id:"WHATSAPP",name:"Whatsapp"}]);

   const [columns, setColumns] = useState(["Mensagem","Tipo","Data","Plataforma","Usuário","Status","Ações"]);

   const [alerts, setAlerts] = useState([]);
   const [message,setMessage] = useState("");

   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);

   const [openModal, setOpenModal] = useState(false);

   const [showAsync, setShowAsync] = useState(true);

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
    } = useForm({ defaultValues: {
                    employeeId: "",
                    vehicleId:"",
                    userId:"",

                }});


    const userOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.username = teste;
  
      url = "admin?" + new URLSearchParams(query);
      
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
                "label": dado.username,
               }));
      
                return dadosTratados;
         });
    };

    const employeeOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.fullName = teste;
  
      url = "employee?" + new URLSearchParams(query);
      
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
                "label": dado.fullName,
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
         query.locationNotNull = true;
         url =   "vehicle/available?" + new URLSearchParams(query);
         
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

    function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "d.name": d.name,
            "type": typeOptions.filter((type) => type.id == d.type)[0].name,
            "date": d.data ? FormatarData(d.data,"dd/MM/yyyy") : "-",
            "platform": d.email == true ? "E-mail" : 
                        d.whatsapp == true ? "Whatsapp" : "-",
            "user": d.responsibleName,
            "status": "LIDO",
            "actions": actionButtons(d.message)
          })
      );

      return tableData;
   }

  
   function clearFilter(){
       setValue("type","");
       setValue("userId","");
       setValue("employeeId","");
       setValue("vehicleId","");
       setValue("active","");
       setValue("startDate","");
       setValue("endDate","");
       setValue("platform","");
       setShowAsync(false);
       getAlerts();
    }

   function actionButtons(message){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {setMessage(message/* .replace(/(<([^>]+)>)/gi,"") */);
                                                                 setOpenModal(true)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
           </div>;
   }
                                                    

   function getAlerts(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "alert?" + new URLSearchParams(query), {
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
                   setAlerts(body.content);
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
      getAlerts();
   },[number,size]);

   useEffect(() => {
    if(!showAsync) setShowAsync(true);
   },[showAsync]);

   return (<>

        { loading && <LoadingGif/>}


        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Histórico de Alertas</h1>
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getAlerts)}>
            <Row className="d-flex mt-3">
                 <Col sm="3">
                   <InputForm
                    id="type"
                    name="type"
                    label="Tipo"
                    placeholder="--Digite--"
                    type="select"
                    register={register}
                    options={typeOptions}
                   />
                 </Col>
                 
                 {showAsync && <> 
                 <Col sm="3">
                   <AsyncSelectForm
                     id="userId"
                     name="userId"
                     label="Usuário"
                     register={register}
                     onChange={(e) => {setValue(`userId`,e ? e.value : "")}}
                     options={userOptions}
                   />
                 </Col>

                 <Col sm="3">
                   <AsyncSelectForm
                     id="employeeId"
                     name="employeeId"
                     label="Funcionário"
                     register={register}
                     onChange={(e) => {setValue(`employeeId`,e ? e.value : "")}}
                     options={employeeOptions}
                   />
                 </Col>
                 
                 <Col sm="3">
                   <AsyncSelectForm
                     id="vehicleId"
                     name="vehicleId"
                     label="Veículo"
                     register={register}
                     onChange={(e) => {setValue(`profileId`,e ? e.value : "")}}
                     options={vehicleOptions}
                   />
                 </Col></>}

                 <Col sm="2">
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

                  <Col sm="3">
                    <InputForm
                      id="platform" 
                      name="platform"
                      label="Plataforma"
                      placeholder="--Selecione a plataforma--"
                      register={register}
                      type="select"
                      options={platformOptions}
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

        <CardBody style={{width:"90%"}}>
            {windowWidth > 795 && 
              <TableStyle columnNames={columns} data={dataForTable(alerts)} />}
            {windowWidth <= 795 &&  
              <IndexCardsStyle names={columns} data={dataForTable(alerts)}/>}               
        </CardBody>

        <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>
              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={alerts.length} totalElements={totalElements} totalPages={totalPages}/>
        </CardFooter> 

        <ModalStyle  open={openModal} title="Mensagem"
                     noButtons={true}
                     toggle={() => setOpenModal(!openModal)}>
          {/* {message} */}
          <div dangerouslySetInnerHTML={{__html: message}}/>
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