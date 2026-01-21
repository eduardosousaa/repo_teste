"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from '../localizacoes.module.css';

export default function Page() {


   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);
   
   const params = useParams();
   const [data, setData] = useState({});

   const [typeLocation, setTypeLocation] = useState('');

   function getLocalizacao(id){

        setLoading(false);

           let url;
           let query = {};
           query.id = id;
           query.size = 100;
           url =  `stock/${id}`

        fetch(Constantes.urlBackAdmin + url, {
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
     const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.get('typeLocation')) {     
         getLocalizacao(params.id);
         setTypeLocation(urlParams.get('typeLocation'));
      }
     
   },[params]);


   return (<>

       { loading && <LoadingGif/>}
       
       <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados {typeLocation == "LOCATION" && "da Localização"}
                                                  {typeLocation == "SECTOR" && "do Setor"}
                                                  {typeLocation == "SUBSECTOR" && "do Subsetor"}
           </h1>
       </CardHeader>

       <CardBody style={{width:"90%"}}>
        {/*  <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Localização</div> */}
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome </Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.name}</Label> 
               </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="12">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Descrição</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.description}</Label> 
              </Col>
           </Row>
            <Row className="d-flex mt-3">
              <Col sm="2">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Número</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.number}</Label> 
               </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Complemento</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.complement}</Label> 
               </Col>
              <Col sm="3">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Cidade</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.city}</Label> 
              </Col>
              <Col sm="2">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Estado</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.state}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="2">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Endereço</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address}</Label> 
               </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CEP</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.zip}</Label> 
               </Col>
              <Col sm="3">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Status</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.status}</Label> 
              </Col>
           </Row>
         </Card>

         { (data.typeLocation == "SECTOR" || data.typeLocation == "SUBSECTOR") && data.father &&
            <>
               <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}> {data.typeLocation == "SECTOR" && "Localização"}
                                                                                        {data.typeLocation == "SUBSECTOR" && "Setor"}
               </div>
               <Card style={{width:"80%",padding:"15px"}}>
                <Row className="d-flex mt-3">
                  <Col sm="12">    
                    <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome </Label><br/>
                    <Label style={{height:"25px",fontSize:"16px"}}>{data.father.name}</Label> 
                   </Col>    
                </Row>
                <Row className="d-flex mt-3">
                  <Col sm="12">    
                    <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Descrição</Label><br/>
                    <Label style={{height:"25px",fontSize:"16px"}}>{data.father.description}</Label> 
                  </Col>
                </Row>   
               </Card>
          </>
         }

         { data.typeLocation == "SUBSECTOR" && data.father.father &&
            <>
               <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Localização</div>
               <Card style={{width:"80%",padding:"15px"}}>
                <Row className="d-flex mt-3">
                  <Col sm="12">    
                    <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome </Label><br/>
                    <Label style={{height:"25px",fontSize:"16px"}}>{data.father.father.name}</Label> 
                   </Col>    
                </Row>
                <Row className="d-flex mt-3">
                  <Col sm="12">    
                    <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Descrição</Label><br/>
                    <Label style={{height:"25px",fontSize:"16px"}}>{data.father.father.description}</Label> 
                  </Col>
                </Row>   
               </Card>
          </>
         }
         
       </CardBody>
    </>)
  }