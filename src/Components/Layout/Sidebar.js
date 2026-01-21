"use client"
import { useState, useContext } from 'react';
import {useRouter} from "next/navigation";
import styles from "./Sidebar.module.css";
import { AuthContext } from '../../Context/AuthContext';
import { BsArrowBarRight } from "react-icons/bs";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { FaBuildingUser,FaUsersGear,FaClipboardUser,FaBuildingCircleArrowRight,FaGear, FaGears, FaClock } from "react-icons/fa6";
import { BiSolidUserAccount, BiSolidBuildingHouse } from "react-icons/bi";
import { FaUser,FaPlus,FaMapMarkedAlt, FaBell, FaBox, FaCar, FaCarAlt } from 'react-icons/fa';
import { SiEbox } from 'react-icons/si';
import { BsArrowBarLeft } from "react-icons/bs";
import { HiArrowLongRight, HiOutlineArrowTurnRightDown, HiDocumentDuplicate, HiOutlineWrenchScrewdriver } from "react-icons/hi2";

const SideBar = ({showSidebar,setShowSidebar}) => {
    
    const router = useRouter();
    const { permissions } = useContext(AuthContext);
   
    /* const [showSidebar, setShowSidebar] = useState(false); */
    const [showConfigMenu, setShowConfigMenu] = useState(false);

    function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name.includes(name)) != -1 : false;
    }

    return (
     <div className={`${styles.sidebar} ${showSidebar ? styles.expanded : ''}`}>
        {/* <img src={"logo.svg"} className={styles.images} alt="" /> */}
        <div className={styles.images}></div>
        {showSidebar && <span className={styles.menuText}> Sistema de Frota</span>}
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem} onClick={() => {setShowSidebar(!showSidebar)}}>
            {showSidebar ? <BsArrowBarLeft size={30} alt="Recolher" /> : <BsArrowBarRight size={30} alt="Expandir" />}
            {showSidebar && <span></span>}
          </li>
          { checkPermission("User") &&
           <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/admin/usuarios");/* setShowSidebar(false); */}}>
            <FaUser size={30}  />
            {showSidebar && <span className={styles.menuText}> Usuários </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Usuários
                   </div>
                 </div>
              </div>}
          </div>}
          
          { checkPermission("Profile") &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarItem} onClick={() => { router.push("/admin/perfis");/* setShowSidebar(false); */}}>
            <FaUsersGear size={30} alt="" />
            {showSidebar && <span className={styles.menuText}> Perfis</span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Perfis
                   </div>
                 </div>
              </div>}
          </div>} 
          { checkPermission("Employee") &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarItem} onClick={() => { router.push("/admin/funcionarios");/* setShowSidebar(false); */}}>
            <FaClipboardUser size={30} alt="" />
            {showSidebar && <span className={styles.menuText}> Funcionários</span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Funcionários
                   </div>
                 </div>
              </div>}
          </div>}
          { checkPermission("Company") &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarItem} onClick={() => { router.push("/admin/empresas");/* setShowSidebar(false); */}}>
            <BiSolidBuildingHouse size={30}  />
            {showSidebar && <span className={styles.menuText}> Minhas Empresas </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Minha Empresa
                   </div>
                 </div>
              </div>}
          </div>}
          { checkPermission("Supplier") &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarItem}  onClick={() => { router.push("/admin/fornecedores");/* setShowSidebar(false); */}}>
            <FaBuildingCircleArrowRight size={30}  />
            {showSidebar && <span className={styles.menuText}> Fornecedores </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Fornecedores
                   </div>
                 </div>
              </div>}
          </div>}
          { (checkPermission("Position") || checkPermission("Documentation") || checkPermission("Category") || 
             checkPermission("Product_Type_View") || checkPermission("Category") || checkPermission("Location")) &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarItem} onClick={() => {setShowConfigMenu(!showConfigMenu)}}>
            <FaGears size={30}  />
            {showSidebar && <span className={styles.menuText}> Configurações  { showConfigMenu ? <HiOutlineArrowTurnRightDown/> : <HiArrowLongRight/>}</span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Configurações
                   </div>
                 </div>
              </div>}
          </div>}
          <ul style={{paddingLeft: showSidebar ? "40px" : "0px"}} className={styles.sidebarList}>
              {checkPermission("Position") && showConfigMenu && 
                <div className={styles.balloon_div}>
                  <li className={styles.sidebarplus} onClick={() => { router.push("/admin/configuracoes/cargos")}}>
                      <BiSolidUserAccount size={30}/>
                        {showSidebar && showConfigMenu && <span className={styles.menuText}>Cargos</span>}</li>
                        {!showSidebar &&<div className={styles.balloon_aviso_div}>
                           <div className={styles.balloon_aviso_border}>
                             <div className={styles.balloon_aviso_text}>
                                Cargos
                             </div>
                           </div>
                         </div>}
                </div>}
              {checkPermission("Documentation") && showConfigMenu && 
                 <div className={styles.balloon_div}>
                    <li className={styles.sidebarplus} onClick={() => { router.push("/admin/configuracoes/documentos")}}>
                       <HiDocumentDuplicate size={30}/>
                        {showSidebar && showConfigMenu && <span className={styles.menuText}>Documentos</span>}</li>
                        {!showSidebar &&<div className={styles.balloon_aviso_div}>
                           <div className={styles.balloon_aviso_border}>
                             <div className={styles.balloon_aviso_text}>
                                Documentos
                             </div>
                           </div>
                         </div>}
                 </div>}
              {(checkPermission("Category") || checkPermission("Product_Type_View")) && showConfigMenu && 
                  <div className={styles.balloon_div}>
                    <li className={styles.sidebarplus} onClick={() => { router.push("/admin/configuracoes/materiais")}}>
                        <MdOutlineLibraryAdd size={30}/>
                         {showSidebar && showConfigMenu &&<span className={styles.menuText}>Materiais</span>}</li>
                         {!showSidebar &&<div className={styles.balloon_aviso_div}>
                              <div className={styles.balloon_aviso_border}>
                                  <div className={styles.balloon_aviso_text}>
                                    Materiais
                                  </div>
                                </div>
                              </div>}
                  </div>}
              {checkPermission("Category") && showConfigMenu && 
                  <div className={styles.balloon_div}>
                    <li className={styles.sidebarplus} onClick={() => { router.push("/admin/configuracoes/servicos")}}>
                        <FaGear size={27}/>
                        {showSidebar && showConfigMenu && <span className={styles.menuText}>Serviços</span>}</li>
                        {!showSidebar &&<div className={styles.balloon_aviso_div}>
                              <div className={styles.balloon_aviso_border}>
                                  <div className={styles.balloon_aviso_text}>
                                    Serviços
                                  </div>
                                </div>
                              </div>}
                  </div>}
                  {checkPermission("Location") && showConfigMenu && 
                  <div className={styles.balloon_div}>
                    <li className={styles.sidebarplus} onClick={() => { router.push("/admin/configuracoes/localizacoes")}}>
                        <FaMapMarkedAlt size={27}/>
                        {showSidebar && showConfigMenu && <span className={styles.menuText}>Localizações</span>}</li>
                        {!showSidebar &&<div className={styles.balloon_aviso_div}>
                              <div className={styles.balloon_aviso_border}>
                                  <div className={styles.balloon_aviso_text}>
                                    Localizações
                                  </div>
                                </div>
                              </div>}
                  </div>}
                  {showConfigMenu && 
                  <div className={styles.balloon_div}>
                    <li className={styles.sidebarplus2} onClick={() => { router.push("/admin/configuracoes/manutencoes_periodicas")}}>
                        <HiOutlineWrenchScrewdriver size={30}/>
                        <div className={styles.mini_icon}>
                           <FaClock size={15} color='white' className={styles.mini_icon_position}/>
                        </div>
                        {showSidebar && showConfigMenu && <span className={styles.menuText}>Manutenções <br/> Periódicas</span>}</li>
                        {!showSidebar &&<div className={styles.balloon_aviso_div}>
                              <div className={styles.balloon_aviso_border}>
                                  <div className={styles.balloon_aviso_text}>
                                    Manu. Periódicas
                                  </div>
                                </div>
                              </div>}
                  </div>}
          </ul>

          { checkPermission("Alert") &&
          <div className={styles.balloon_div}>
          <li className={styles.sidebarplus}  onClick={() => { router.push("/admin/historico_alertas");}}>
            <FaBell size={30}/>
            <div className={styles.mini_icon}>
               <FaClock size={15} color='white' className={styles.mini_icon_position}/>
            </div>
            {showSidebar && <span className={styles.menuText}> Histórico de Alertas </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Histórico de Alertas
                   </div>
                 </div>
              </div>}
          </div>}
        </ul>
      </div>

    );
};

export default SideBar;