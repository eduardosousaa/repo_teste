"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../cargos.module.css";

export default function Page() {


   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({
                            name:"",
                            documents:[],
                            vacancy:""
   });

   function getPosition(id){

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `position/${id}`, {
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
     getPosition(params.id);
   },[params]);

   return (<>

       { loading && <LoadingGif/>}

       <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados do Cargo</h1>
       </CardHeader>

       <CardBody style={{width:"90%"}}>
          <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.name}</Label> 
               </Col>
          </Row>

           <div style={{fontSize: "1.5rem",marginTop:"10px",marginBottom:"20px"}}>Documentos</div>

           <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Documentos Pessoais</div>
            { data.documents.filter((doc) => doc.documentType == "DOCUMENTS").map((doc,index) => 
              <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="12">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Tipo de Documento</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{doc.name}</Label> 
                   </Col>
                </Row>
               </Card>
            )}

            <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Exames Obrigatórios</div>
            { data.documents.filter((doc) => doc.documentType == "EXAMES").map((doc,index) => 
              <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="12">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Tipo de Documento</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{doc.name}</Label> 
                   </Col>
                </Row>
               </Card>
            )}

             <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Cursos Obrigatórios</div>
            { data.documents.filter((doc) => doc.documentType == "COURSES").map((doc,index) => 
              <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="12">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Tipo de Documento</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{doc.name}</Label> 
                   </Col>
                </Row>
               </Card>
            )}


            <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Quantidade dias de férias</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.vacancy}</Label> 
               </Col>
            </Row>


       </CardBody>
        
       
    </>)
  }