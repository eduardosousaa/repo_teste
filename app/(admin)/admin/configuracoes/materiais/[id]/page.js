"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../materiais.module.css";

export default function Page() {


   const { "token2": token2 } = parseCookies();

   const [type, setType] = useState("categoria");

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({
                            name:"",
                            category:{},
                            ncms:[],
                            catMats:[]
   });

   function getCategory(id){

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `category/${id}`, {
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

   function getTypeProduct(id){

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `product_type/${id}`, {
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
                    setData({name: body.name,
                             category: body.category,
                             ncms: body.ncm,
                             catMats: body.catMat,
                             quantityStock: body.quantityStock,
                             maxStock: body.maxStock,
                             minStock: body.minStock,
                    });
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
      if(urlParams.get('type')) {
         setType(urlParams.get('type'));
         if(urlParams.get('type') == "categoria") getCategory(params.id);
         if(urlParams.get('type') == "tipo_produto") getTypeProduct(params.id);
      }
     
   },[params]);

   return (<>

       { loading && <LoadingGif/>}

       <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados { type == "categoria" && "da Categoria"}
                                                  { type == "tipo_produto" && "do Tipo de Produto"}</h1>
       </CardHeader>

       <CardBody style={{width:"90%"}}>
          <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.name}</Label> 
               </Col>
          </Row>

          {type == "tipo_produto" && <Row className="d-flex mt-3">
              <Col sm="12">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome da Categoria</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.category.name}</Label> 
               </Col>
          </Row>}


             <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>NCMS</div>
            { data.ncms.map((ncm,index) => 
             <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="12">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{ncm.code + " - " + ncm.description}</Label> 
                   </Col>
                </Row>
               </Card>
            )}

            <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>CatMats</div>
            { data.catMats.map((cat,index) => 
             <Card key={index} style={{ flex:"1", padding: "15px"}}>
                <Row className="d-flex mt-3">
                   <Col sm="12">    
                     <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome</Label><br/>
                     <Label style={{height:"25px",fontSize:"16px"}}>{cat.code + " - " + cat.description}</Label> 
                   </Col>
                </Row>
               </Card>
            )}

           {type == "tipo_produto" && <Row className="d-flex mt-3">
              {/* <Col sm="4">    
               <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Quantidade em Estoque</Label><br/>
               <Label style={{height:"25px",fontSize:"16px"}}>{data.quantityStock}</Label> 
              </Col> */}
              <Col sm="4">    
               <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Estoque Mínimo</Label><br/>
               <Label style={{height:"25px",fontSize:"16px"}}>{data.maxStock}</Label> 
              </Col>
              <Col sm="4">    
               <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Estoque Máximo</Label><br/>
               <Label style={{height:"25px",fontSize:"16px"}}>{data.minStock}</Label> 
              </Col>
            </Row>}

       </CardBody>
        
       
    </>)
  }