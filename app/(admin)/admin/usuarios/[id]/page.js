"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../usuarios.module.css";

export default function Page() {

   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({});
  
   function getUser(id){

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `admin/${id}`, {
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

               setLoading(false);
               
               switch(status){
                   case 200:
                    setData(body);
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

   useEffect(() => {
     getUser(params.id);
   },[params]);
  

   return (<>

       { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados de Usuário</h1>
        </CardHeader>

        <CardBody style={{width:"90%"}}>


         <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Dados Pessoais</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="4">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome Completo</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.fullName}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CPF</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.cpf}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Email</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.email}</Label> 
              </Col>
           </Row>
         </Card>

         <div style={{fontSize: "1.25rem",marginTop:"10px", marginBottom:"20px"}}>Dados de Usuário</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome de Usuário</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.username}</Label> 
              </Col>
           </Row>

           <div style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Perfil</div>
           <Row className="d-flex mt-3">
               <Col sm="6">    
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.profiles && data.profiles.name}</Label> 
               </Col>
            </Row>
         </Card>
         
        </CardBody>
       
    </>)
  }