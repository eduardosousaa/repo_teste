"use client"
import { useState,useEffect } from "react";
import Constantes from "../../Constantes";
import { parseCookies } from "nookies";
import LoadingGif from  "../ElementsUI/LoadingGif";
import { TfiArrowCircleRight,TfiArrowCircleLeft } from "react-icons/tfi";
import styles from "./form.module.css";
import { Row, Col, Button } from "reactstrap";

export default function FormPerfil({data,setData,module,apiErrors}){

    const { "token2": token2 } = parseCookies();
    const [loading, setLoading] = useState(false);

    const [permissions, setPermissions] = useState([]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    function tratarPermissoes(body){
        let permissions = [];
   
        body.map((d) => {
            permissions.push({id:d.id,
                              name:d.name,
                              description: d.description,
                              searched: data.permissions && searchPermission(d) ? [false,true] : [true,false],
                              selected:false,
                              passed: data.permissions && searchPermission(d) ? true : false});
        });

        setPermissions(permissions);
    }

    function searchPermission(permission){
        return data.permissions.findIndex(p => p.id == permission.id) != -1;
    }

    function getModulePermissions(){
         setLoading(true);
         fetch(Constantes.urlBackAdmin + "types/permissions/" + module, {
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
                         tratarPermissoes(body);
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

    function searchPermissions(e,searchType){
        
        setPermissions(permissions.map((permission) => {         
            
            if(permission.name.toUpperCase().includes(e.target.value) || 
               permission.name.toLowerCase().includes(e.target.value) ||
               permission.name.includes(e.target.value)){
              if(permission.passed){
                  permission.searched[0] = false;
                  permission.searched[1] = true;
              }else{
                  permission.searched[0] = true;
                  permission.searched[1] = false;
              }
             
            }else{
              if(searchType == "disponible") permission.searched[0] = false;
              if(searchType == "associated") permission.searched[1] = false;
            }
            return permission;
        }));
    }

    function setPermissionSelected(indexName){

        setPermissions(permissions.map((permission,index) => {

            if(index == indexName) permission.selected =  permission.selected ? false : true; 
                
            return permission;
        }));
        
    }

    function setPermissionSelectedAll(passed){

        setPermissions(permissions.map((permission) => {
        
             if(passed){
                if(permission.passed && permission.searched[1]) permission.selected =  true; 
             }else{
                if(!permission.passed && permission.searched[0]) permission.selected =  true; 
             }

            return permission;
         }));
    }

    function setPermissionUnSelectedAll(passed){
      
        setPermissions(permissions.map((permission) => {
          if(passed){
              if(permission.passed && permission.searched[1]) permission.selected =  false; 
           }else{
             if(!permission.passed  && permission.searched[0]) permission.selected =  false; 
           }
           return permission;
         }));
     
    }

    function addPermission(){
        
        setPermissions(permissions.map((permission) => {         
           
            if(permission.selected){

                permission.passed = true;
                permission.selected = false;
                permission.searched[0] = false;
                permission.searched[1] = true;
    
            };
         
            return permission;
         }));
    }

    function removePermission(){
       
        setPermissions(permissions.map((permission) => {  
                 
            if(permission.selected && permission.passed){
               
                permission.passed = false;
                permission.selected = false;
                permission.searched[0] = true;
                permission.searched[1] = false;
            }
            return permission;
        }));
    }

    function submit(){
        let permissions_passed = [];
        
        permissions.map((permission) => {
            if(permission.passed) permissions_passed.push({id: permission.id,name: permission.name});
            return permission;
        });


        setData({name: data.name,
                modules: data.modules.map((d) => {
                     if(d.name == module){
                        d.permissions = permissions_passed;
                     }
                     return d;
                })});

    }

    useEffect(() => {
        getModulePermissions();
    },[module]);

    useEffect(() => {
       if(permissions.length > 0 && data.permissions){

          let permissions_passed = [];
          
          permissions.map((permission) => {
              if(permission.passed) permissions_passed.push({id: permission.id,name: permission.name});
              return permission;
          });

          setData({...data,modules: data.modules.map((d) => {
                       if(d.name == module){
                          d.permissions = permissions_passed;
                       }
                       return d;
                  }),
                  first_open: true
          });
       }

       const handleResize = () => {
         setWindowWidth(window.innerWidth);
       };
   
       window.addEventListener('resize', handleResize);
   
       return () => {
         window.removeEventListener('resize', handleResize);
       };
    },[permissions]);



    return (
        <>
          { loading && <LoadingGif/>}
           <Row className="d-flex">

            <Col sm="5">
              <div className={styles.permissions_title}>Permissões Disponíveis</div>
              <input className={styles.permissions_search_bar} placeholder="--Buscar--" onChange={(event) => searchPermissions(event,"disponible")}></input>

              <div className={styles.permissions_options}>
                  {
                     permissions.map((permission,index) => {
                       return (
                             !permission.passed && permission.searched[0] ?
                                     <p className={permission.selected ? styles.permissions_options_p_selected 
                                                                  : styles.permissions_options_p}
                                       onClick ={() => setPermissionSelected(index)}
                                       key={index}>
                                     {permission.description}</p> : null
                        )}
                     )
                  }
              </div>
              <Row style={{ display:"flex", justifyContent:"center", gap:"5px", marginTop:"10px"}}>
                   <Button style={{flex:"1", backgroundColor: "#009E8B"}} 
                           onClick ={() => setPermissionSelectedAll(false)}> 
                      Selecionar todos
                   </Button>
     
                   <Button style={{flex:"1", color: "#009E8B", backgroundColor: "#fff", border:"1px solid #009E8B"}}
                           onClick ={() => setPermissionUnSelectedAll(false)}>
                      Desmarcar todos
                   </Button>
               </Row> 
            </Col>

            <Col sm="2">
              <Row className="d-flex flex-column gap-2">
               <Button style={{marginTop: windowWidth > 575 ? "50%" :"10%", backgroundColor: "#009E8B"}} onClick ={() => addPermission()}>
                   Adicionar <TfiArrowCircleRight color="#fff"/> 
               </Button>
               <Button style={{ color: "#009E8B", backgroundColor: "#fff", border:"1px solid #009E8B",
                                ...(windowWidth <= 575  && {marginBottom:"10%"})}} onClick ={() => removePermission()}>
                  <TfiArrowCircleLeft color="#009E8B"/>  Remover 
                </Button>
              </Row>
            </Col>
            
            <Col sm="5">
            <div className={styles.permissions_title}>Permissões Associadas</div>
              <input className={styles.permissions_search_bar} placeholder="--Buscar--" onChange={(event) => searchPermissions(event,"associated")}></input>

              <div className={styles.permissions_options}>
                  {
                     permissions.map((permission,index) => {
                                        return (
                                              permission.passed && permission.searched[1] ?
                                                      <p className={permission.selected ? styles.permissions_options_p_selected 
                                                                                   : styles.permissions_options_p}
                                                        onClick ={() => setPermissionSelected(index)}
                                                        key={index}>
                                                      {permission.description}</p> : null
                                         )}
                      )
                  }
               </div>
               <Row style={{ display:"flex", justifyContent:"center", gap:"5px", marginTop:"10px"}}>
                  <Button style={{flex:"1", backgroundColor: "#009E8B"}}
                          onClick ={() => setPermissionSelectedAll(true)}>
                     Selecionar todos
                  </Button>
     
                  <Button style={{flex:"1", color: "#009E8B", backgroundColor: "#fff", border:"1px solid #009E8B"}}
                          onClick ={() => setPermissionUnSelectedAll(true)}>
                     Desmarcar todos
                  </Button>
               </Row>
            </Col>
           </Row> 

           <Row className="d-flex mt-5 justify-content-end">
                <Button style={{ backgroundColor: "#009E8B", width:"100px"}} onClick ={() => submit()}>
                  Confirmar
                </Button>
           </Row>   
        </>
    )
}