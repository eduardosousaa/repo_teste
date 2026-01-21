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
import styles from "./usuarios.module.css";
import { Row, Col, Form, Button, Card, CardHeader,CardBody,CardFooter } from "reactstrap";
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

   const [showAsync, setShowAsync] = useState(true);

   const [statusOptions, setStatusOptions] = useState([{id:true,name:"Ativo"},
                                                       {id:false,name:"Inativo"}]);

   const [columns, setColumns] = useState(["Nome","Usuário","Perfis","E-mail","Status","Ações"]);

   const [users, setUsers] = useState([]);
   const [userId, setUserId] = useState(null);

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
    } = useForm({ defaultValues: {
                    profileId: ""
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

    const profileOptions = (teste) => {
          let url;
          let query = {};
          query.size = 100;
          query.name = teste;
          url =  "profile?" + new URLSearchParams(query);
          
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

    function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "fullName": d.fullName,
            "userName": d.username,
            "profile": d.profiles ? d.profiles.name : null,
            "email": d.email,
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

   function setStatus(id){
      fetch(Constantes.urlBackAdmin + `admin/${id}`, {method: "PATCH",
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
              getUsers();
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function deleteUser(){
      fetch(Constantes.urlBackAdmin + `admin/${userId}`, {method: "DELETE",
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
                     showAlert("danger","Error ao Apagar Usuário");
                   break;   
               }
              getUsers();
              setOpenModal(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function clearFilter(){
       setValue("profileId","");
       setShowAsync(false);
       setValue("username","");
       setValue("active","");
       getUsers();
    }

   function actionButtons(id,status){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/usuarios/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("User_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/usuarios/${id}/edit`)}}><BsPencilSquare/></Button>
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
               <Button className={styles.button}onClick={() => {setUserId(id);setOpenModal(true)}}><BiTrash/></Button>
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
                                                    

   function getUsers(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "admin?" + new URLSearchParams(query), {
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
                   setUsers(body.content);
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
      getUsers();
   },[number,size]);

   useEffect(() => {
    if(!showAsync) setShowAsync(true);
   },[showAsync]);

   return (<>

        { loading && <LoadingGif/>}


        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Usuários</h1>
         { checkPermission("User_Read") &&
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/usuarios/create");}}>
             Cadastrar <FaPlus />
          </Button>}
        </CardHeader>
        <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getUsers)}>
            <Row className="d-flex mt-3">
               { showAsync == true && 
                 <Col sm="3">
                   <AsyncSelectForm
                     id="profileId"
                     name="profileId"
                     label="Perfil"
                     register={register}
                     onChange={(e) => {setValue(`profileId`,e ? e.value : "")}}
                     options={profileOptions}
                   />
                 </Col>}
                  <Col sm="3">
                   <InputForm
                    id="fullName"
                    name="fullName"
                    label="Nome"
                    placeholder="--Digite--"
                    type="text"
                    register={register}
                   />
                 </Col>
                 <Col sm="3">
                   <InputForm
                    id="username"
                    name="username"
                    label="Usuário"
                    placeholder="--Digite--"
                    type="text"
                    register={register}
                   />
                 </Col>
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

        <CardBody style={{width:"90%"}}>
            {windowWidth > 795 && 
              <TableStyle columnNames={columns} data={dataForTable(users)} />}
            {windowWidth <= 795 &&  
              <IndexCardsStyle names={columns} data={dataForTable(users)}/>}               
        </CardBody>

        <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>
              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={users.length} totalElements={totalElements} totalPages={totalPages}/>
        </CardFooter> 

        <ModalStyle  open={openModal} title="Remover Usuário" onClick={() => {deleteUser()}} toggle={() => setOpenModal(!openModal)}>
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