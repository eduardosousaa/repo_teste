"use client"
import Constantes from "../../Constantes";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../Context/AuthContext";
import { FaBell, FaUserAlt, FaRoute, FaCar, FaHandHoldingUsd, FaChartBar } from 'react-icons/fa';
import styles from './Navbar.module.css';
import { parseCookies, destroyCookie} from "nookies";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { FcFolder } from "react-icons/fc";
import { TbBuildingWarehouse } from "react-icons/tb";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem , Input, Row, Button } from 'reactstrap';
import LoadingGif from "../ElementsUI/LoadingGif";
import ModalStyle from "../ElementsUI/ModalStyle";
import PaginationStyle from "../ElementsUI/PaginationStyle";
import FormTrocarSenha from "../Forms/FormTrocarSenha";

//Logos
/* import logo1 from "../../../public/logo-teste1.png";
import logo2 from "../../../public/logo-teste2.png";
import logo3 from "../../../public/logo-teste3.png"; */

const Navbar = ({showSidebar,setShowSidebar}) => {

  const router = useRouter();
  const { username, userId, profileName, getInfo} = useContext(AuthContext);
  const { "token1": token1 } = parseCookies();
  const { "token2": token2 } = parseCookies();
  const { "contas": contas } = parseCookies();
  const [contasArray, setContasArray] = useState([]);

  const [loading ,setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [sizeModal4, setSizeModal4] = useState("md");

  const [alerts, setAlerts] = useState([]);

  const [number, setNumber] = useState(0);
  const [size, setSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [open, setOpen] = useState();
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };
  
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  function changeModule(type){
     let url;
     let redirect; 
     switch(type){
        case "admin":
          url = Constantes.urlFrontAdmin;
          redirect =  Constantes.urlFrontAdmin + "admin";
        break;
        case "routes":
          url = Constantes.urlFrontRoutes;
          redirect = Constantes.urlFrontRoutes + "rotas";
        break;
        case "stock":
          url = Constantes.urlFrontStock;
          redirect = Constantes.urlFrontStock + "estoque";
        break;
        case "patrimony":
          url = Constantes.urlFrontPatrimony;
          redirect = Constantes.urlFrontPatrimony + "patrimonio";
        break;
        case "costs":
          url = Constantes.urlFrontCosts;
          redirect = Constantes.urlFrontCosts + "custos";
        break;
        case "reports":
          url = Constantes.urlFrontReports;
          redirect = Constantes.urlFrontReports + "relatorios";
        break;
     }

     fetch(url + "api/module", {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token1,
          },
        })
        .then(/* (response) => response.status */
              (response) => 
                 response.json().then(data => ({status: response.status, 
                                                body: data }))) 
        .then(({status, body}) => {
             switch(status){
                 case 200:
                   /* const dataForModule = {
                         token1: token1,
                         token2: token2,
                         contas: contas
                   }
                   localStorage.setItem("dataForModule", JSON.stringify(dataForModule)); */
                   window.open(redirect, "_self");
                 break;
                 case 500:
                   console.log("Erro de Autenticação")
                 break;
             }
        })
        .catch((error) => {
           console.log(error);
        }) 
  }
  
  function logout(){
    destroyCookie(undefined,"token1",{path:"/"});
    destroyCookie(undefined,"token2",{path:"/"});
    destroyCookie(undefined,"contas",{path:"/"});
    router.push("/login");
  }

  /* async function changeAccount(id) {
     await getInfo(token1,id);
     window.location.reload();
  } */

  function getAlerts(){
     let query = {};
     
     query.page = number;
     query.size = size;
     query.userId = userId;

     fetch(Constantes.urlBackAdmin + "alert?" + new URLSearchParams(query), {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2,
          },
        })
        .then(/* (response) => response.status */
              (response) => 
                 response.json().then(data => ({status: response.status, 
                                                body: data }))) 
        .then(({status, body}) => {
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
        })
        .catch((error) => {
           console.log(error);
        }) 
  }

  function setReadMessage(id){
     setLoading(true)
     fetch(Constantes.urlBackAdmin + `alert/${id}/read`, {method: "PATCH",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": "ADMINISTRATION",
             "Authorization": token2
         },})
         .then((response) => response.status) 
         .then((status) => {
              setLoading(false);
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
             getAlerts();
         })
         .catch((error) => {
            console.log(error);
         }) 
  }

  useEffect(() => {
    if(userId != undefined && token2 != undefined) getAlerts();

  },[userId,token2,number,size])

  useEffect(() => {
    if(contas != undefined){
      let contasParse = JSON.parse(contas);
      setContasArray(contasParse);
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },[]);

  return (<>
      {loading && <LoadingGif/>}
      <div className={`${styles.navbar} ${showSidebar ? styles.expanded : ''}`}>
          <div className={styles.navbarSideButton} onClick={() =>{setShowSidebar(!showSidebar)}}>
              <div className={styles.imageLogo}></div>
          </div>
          <ul className={styles.navbarList}>
              {/* <li style={{display:"flex"}}>
                <div style={{transform:"skewX(-10deg)",width:"55px",backgroundColor:"#5445ddff"}}>
                    <div style={{transform:"skewX(10deg)",marginLeft:"-15px"}}>
                      <div style={{backgroundImage: `url(${logo1.src})`,
                                   backgroundSize: "100% 100%",
                                   backgroundRepeat: "no-repeat",
                                   marginTop: "8px",
                                   marginLeft: "5px",
                                   width: '60px',
                                   height: '50px'}}></div>
                    </div>
                </div>
                <div style={{transform:"skewX(-10deg)",width:"55px",backgroundColor:"rgba(255, 201, 40, 0.7)"}}>
                    <div style={{transform:"skewX(10deg)",marginTop:"5px",marginLeft:"-5px"}}><FcFolder size={50}/></div>
                </div>
              </li> */}
              <li className={styles.navbarItem} onClick={() => { setShowModal4(!showModal4)}}>
                  <FaBell size={15}/>
                  <div className={styles.alert_number}>
                    <div className={styles.alert_number_position}> {alerts.filter((a) => a.read == false).length}</div>
                  </div>
              </li>
              <li className={styles.navbarItem} onClick={() => { setShowModal2(!showModal2)}}>
                  <BsGrid3X3GapFill/>
              </li>
              <li className={styles.navbarItem1} onClick={() => { setShowModal(!showModal)}}>
                  <div className={styles.letter}>
                      <h3>{username}</h3>
                      <p>{profileName} / {contasArray.length > 0 && contasArray[0].name}</p> 
                  </div>
                  <FaUserAlt size={25} />
              </li>
          </ul>

          {showModal && <div className={styles.modalContainer}/* {`${styles.modalContainer} ${showAccount ? styles.containerExpanded : ''}`} */>
             {windowWidth < 575 && 
             <div className={styles.letter2}>
                      <h3>{username}</h3>
                      <p>{profileName} / {contasArray.length > 0 && contasArray[0].name}</p> 
             </div>}
            {/*  <div className={styles.modalText} onClick={() => { setShowAccount(!showAccount)}}>Trocar Conta</div>
             {showAccount && contasArray.map((conta,index) => 
                <a className={styles.modalText2} key={index} onClick={() => changeAccount(conta.id)}>{conta.name}</a>
             )} */}
             <div className={styles.modalText} onClick={() => { setShowModal3(true)}}>Trocar Senha</div>
             <div className={styles.modalText} onClick={() => { logout()}}>Sair</div>       
          </div>}

          {showModal2 && <div className={styles.modalContainer2}>
              <Button outline style={{width:"150px"}} onClick={() => changeModule("admin")}><FcFolder size={40}/><br/>Administração</Button>
              <Button outline disabled={Constantes.urlFrontRoutes == ""} style={{width:"150px"}} onClick={() => Constantes.urlFrontRoutes != "" ? changeModule("routes") : null}>
                                           <FaRoute size={40} color={Constantes.urlFrontRoutes != "" ? "#d41400" : null}/><br/>Rotas</Button>
              <Button outline disabled={Constantes.urlFrontStock == ""}  style={{width:"150px"}} onClick={() => Constantes.urlFrontStock != "" ? changeModule("stock") : null}>
                               <TbBuildingWarehouse size={40} color={Constantes.urlFrontStock != "" ? "#1400D4" : null}/><br/>Estoque</Button>
              <Button outline disabled={Constantes.urlFrontPatrimony == ""} style={{width:"150px"}} onClick={() => Constantes.urlFrontPatrimony != "" ? changeModule("patrimony") : null}>
                                             <FaCar size={40} color={Constantes.urlFrontPatrimony != "" ? "#d45f00" : null}/><br/>Patrimônio</Button>
              <Button outline disabled={Constantes.urlFrontCosts == ""} style={{width:"150px"}} onClick={() => Constantes.urlFrontCosts != "" ? changeModule("costs") : null}>
                                  <FaHandHoldingUsd size={40} color={Constantes.urlFrontCosts != "" ? "#00d41d" : "grey"}/><br/>Custos</Button>
              <Button outline disabled={Constantes.urlFrontReports == ""} style={{width:"150px"}} onClick={() => Constantes.urlFrontReports != "" ? changeModule("reports") : null}>
                                        <FaChartBar size={40} color={Constantes.urlFrontReports != "" ? "#1705bbff" : "grey"}/><br/>Relatórios</Button>
          </div>}


          <ModalStyle  open={showModal3} title="Trocar Senha" onClick={() => {}} toggle={() => setShowModal3(!showModal3)} noButtons={true}>
             <FormTrocarSenha userId={userId} externalAction={() => setShowModal3(false)}/>
          </ModalStyle>

          <ModalStyle size={sizeModal4} 
                      open={showModal4} 
                      title="Alertas" 
                      toggle={() => {setShowModal4(!showModal4);setSizeModal4("md");setOpen("");}} 
                      noButtons={true}>
             {alerts.length > 0 && <Row className="d-flex justify-content-between">
                <div style={{flex:"1",fontSize: "1.25rem", marginBottom:"20px"}}>Ultimos Alertas</div> 
                 <Button onClick={() => {setSizeModal4( sizeModal4 == "md" ? "xl" : "md")}} style={{backgroundColor: "#009E8B", width:"160px",height:"40px"}}>
                   { sizeModal4 == "md" ? "Ver todas" : "Voltar"}
                </Button>
             </Row>}
             { alerts.length > 0 ? 
             
                <Accordion  open={open} toggle={toggle}>
                   { alerts.map((alert,index) =>  
                    <AccordionItem key={index}>
                     <AccordionHeader targetId={`alert_${index}`}>{alert.name}</AccordionHeader>
                     <AccordionBody accordionId={`alert_${index}`}>
                      {/* {alert.message.replace(/(<([^>]+)>)/gi,"")} */}
                      <div dangerouslySetInnerHTML={{__html: alert.message}}/>
                      <Row className="d-flex mt-3 justify-content-end gap-2">
                        <Input name="checkbox" 
                               type="checkbox"
                               defaultChecked={alert.read}
                               onClick={() => setReadMessage(alert.id)}
                               className={styles.checkButton}>
                        </Input>  Marcar como lida
                     </Row>
                     </AccordionBody>
                  </AccordionItem>)} 
                </Accordion> : 
                
                <div style={{ backgroundColor: "#f8f9fa",textAlign: "center", padding: "4rem 2rem", color:"#999" }}>
                  <p style={{ marginTop: "16px", marginBottom: "8px", color: "#666" }}>
                    Não houve alertas enviados.
                  </p>
                </div>}

             { alerts.length > 0 && sizeModal4 == "xl" &&
                <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={0} totalElements={totalElements} totalPages={totalPages}/>}
             
          </ModalStyle> 
          
      </div>
   </>);
};

export default Navbar;