"use client"
import { useState, useContext } from 'react';
import {useRouter} from "next/navigation";
import styles from "./Sidebar.module.css";
import { AuthContext } from '../../Context/AuthContext';
import { BsArrowBarRight,BsArrowBarLeft } from "react-icons/bs";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import { FaGasPump, FaListUl, FaClipboardUser } from "react-icons/fa6";
import { FaHandHoldingUsd, FaChartBar } from "react-icons/fa";

const SideBar = ({showSidebar,setShowSidebar}) => {
    
    const router = useRouter();
    const { permissions } = useContext(AuthContext);
   
    /* const [showSidebar, setShowSidebar] = useState(false); */

    function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name.includes(name)) != -1 : false;
    }

    return (
     <div className={`${styles.sidebar} ${showSidebar ? styles.expanded : ''}`}>
        {/* <img src={"logo.svg"} className={styles.images} alt="" /> */}
        <div className={styles.images}></div>
        {showSidebar && <span className={styles.menuText}> Sistema de Custos</span>}
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem} onClick={() => {setShowSidebar(!showSidebar)}}>
            {showSidebar ? <BsArrowBarLeft size={30} alt="Recolher" /> : <BsArrowBarRight size={30} alt="Expandir" />}
            {showSidebar && <span></span>}
          </li>
         { checkPermission("Maintenance") &&
          <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/manutencao");/* setShowSidebar(false); */}}>
            <HiWrenchScrewdriver size={30}  />
            {showSidebar && <span className={styles.menuText}> Manutenção </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Manutenção
                   </div>
                 </div>
              </div>}
          </div>}
         { checkPermission("Supply") &&
          <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/abastecimento");/* setShowSidebar(false); */}}>
            <FaGasPump size={30}  />
            {showSidebar && <span className={styles.menuText}> Abastecimento </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Abastecimento
                   </div>
                 </div>
              </div>}
          </div>}
         { checkPermission("Other_Costs") && 
          <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/outros");/* setShowSidebar(false); */}}>
            <FaHandHoldingUsd size={30}  />
            {showSidebar && <span className={styles.menuText}> Outros Custos </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Outros Custos
                   </div>
                 </div>
              </div>}
          </div>}
         { checkPermission("Type_Costs") && 
          <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/tipos");/* setShowSidebar(false); */}}>
            <FaListUl size={30}  />
            {showSidebar && <span className={styles.menuText}> Tipos de Custo </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Tipos de Custo
                   </div>
                 </div>
              </div>}
          </div>}
        { checkPermission("Labor") && 
          <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/mao_de_obra");/* setShowSidebar(false); */}}>
            <FaClipboardUser size={30}  />
            {showSidebar && <span className={styles.menuText}> Mão de Obra </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Mão de Obra
                   </div>
                 </div>
              </div>}
          </div>}
        { checkPermission("Report_View") && <div className={styles.balloon_div}>
            <li className={styles.sidebarItem} onClick={() => { router.push("/custos/relatorio_geral");/* setShowSidebar(false); */}}>
            <FaChartBar size={30}  />
            {showSidebar && <span className={styles.menuText}> Relatório Geral </span>}</li>
            {!showSidebar &&<div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Rel. Geral
                   </div>
                 </div>
              </div>}
          </div>}
        </ul>
      </div>

    );
};

export default SideBar;