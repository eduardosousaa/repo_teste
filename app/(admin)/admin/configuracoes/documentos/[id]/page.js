"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../documentos.module.css";

export default function Page() {


   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({
                            name:"",
                            link:"",
                            userAlerts:[],
   });

   function getTypeDocument(id){

      setLoading(true);

      fetch(Constantes.urlBackDocuments + `documents-group/${id}`, {
                method: "GET",
                headers: {
                    "Module": "DOCUMENTS",
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
                  if(body.link != "" && !body.link.includes("https://")) body.link = "https://" + body.link; 
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
     getTypeDocument(params.id);
   },[params]);

   return (<>

       { loading && <LoadingGif/>}

       <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados do Tipo de Documento</h1>
       </CardHeader>

       <CardBody style={{width:"90%"}}>
         
           <Row className="d-flex mt-3">
              <Col sm="6">    
                <Label style={{height:"25px",fontSize:"25px",fontWeight:"bold"}}>Tipo de Documento</Label><br/>
                <Label style={{height:"25px",fontSize:"22px"}}>{data.name}</Label> 
              </Col>
           </Row>
 
           <Row className="d-flex mt-3">
              <Col sm="6">    
                <Label style={{height:"25px",fontSize:"20px"}}>Link de Renovação: <a href={data.link} style={{color:"#1FCEC9"}}
                                                                                     target="_blank" rel="noopener noreferrer" passHref>{data.link}</a></Label><br/>
              </Col>
           </Row>


             <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Alertas</div>
            { data.userAlerts.map((alert,index) => 
             <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="8">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome do Alerta</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{alert.name}</Label> 
                   </Col>
                   <Col sm="4">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Número Limite de Dias</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{alert.numberLimitDay}</Label> 
                   </Col>
                </Row>
               </Card>
            )}

       </CardBody>
        
       
    </>)
  }