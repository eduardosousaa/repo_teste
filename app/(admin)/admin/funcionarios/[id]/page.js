"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../pessoas.module.css";
import FormatarReal from "../../../../../src/Utils/FormatarReal";
import FormatarData from "../../../../../src/Utils/FormatarData";

export default function Page() {

   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({});
  
   function getEmployee(id){
        
        setLoading(true);

        fetch(Constantes.urlBackAdmin + `employee/${id}`, {
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
     getEmployee(params.id);
   },[params]);
  

   return (<>

        { loading && <LoadingGif/>}
        
        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados de Funcionário</h1>
        </CardHeader>

        <CardBody style={{width:"90%"}}>


         <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Dados Pessoais</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="8">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome Completo</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.fullName}</Label> 
               </Col>
              <Col sm="2">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CPF</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.cpf}</Label> 
               </Col>
               <Col sm="2">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>RG</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.rg}</Label> 
               </Col>
           </Row>
           
           <Row className="d-flex mt-3">
              <Col sm="6">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Email Principal</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.emailPrimary}</Label> 
              </Col>
              <Col sm="6">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Email Secundário</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.emailSecondary}</Label> 
              </Col>
           </Row>
  
           <Row className="d-flex mt-3">
              <Col sm="3"> 
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Telefone Principal</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.phonePrimary}</Label> 
              </Col>
              <Col sm="3">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Telefone Secundário</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.person?.phoneSecondary}</Label>   
              </Col>
           </Row>
         </Card>

         <div style={{fontSize: "1.25rem",marginTop:"10px", marginBottom:"20px"}}>Endereço</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="2">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CEP</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.zip}</Label> 
              </Col>
              <Col sm="8">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Logradouro</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.address}</Label> 
              </Col>
              <Col sm="2">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Bairro</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.neighborhood}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="2">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Número</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.number}</Label> 
               </Col>
              <Col sm="5">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Complemento</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.complement}</Label> 
               </Col>
              <Col sm="4">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Cidade</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.city}</Label> 
              </Col>
              <Col sm="1">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Estado</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.address?.state}</Label> 
              </Col>
           </Row>
         </Card>
         {data.accountBanks?.length > 0 && <>
           <div style={{fontSize: "1.25rem",marginTop:"10px",marginBottom:"20px"}}>Dados Bancários</div>
           
           
           { data.accountBanks.map((accountBank) => 
             <Card style={{width:"80%",padding:"15px"}}>
               <Row className="d-flex mt-3">
                 <Col sm="8">    
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Banco</Label><br/>
                   <Label style={{height:"25px",fontSize:"16px"}}>{accountBank.bankName.name}</Label> 
                 </Col>
                 <Col sm="2">
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Agência</Label><br/>
                   <Label style={{height:"25px",fontSize:"16px"}}>{accountBank.agency}</Label> 
                 </Col>
                 <Col sm="2">
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Conta</Label><br/>
                   <Label style={{height:"25px",fontSize:"16px"}}>{accountBank.account}</Label> 
                 </Col>
               </Row>
               <Row className="d-flex mt-3">
                 <Col sm="4">    
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Banco</Label><br/>
                   <Label style={{height:"25px",fontSize:"16px"}}>{accountBank.pixKey}</Label> 
                 </Col>
                 <Col sm="4">
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Agência</Label><br/>
                   <Label style={{height:"25px",fontSize:"16px"}}>{accountBank.pixKeyType}</Label> 
                 </Col>
                 <Col sm="4">
                   <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Preferencial</Label>
                 </Col>

               </Row>

             </Card>
           )} 
           </>}

         <div style={{fontSize: "1.25rem",marginTop:"10px", marginBottom:"20px"}}>Vínculo</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="6">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Empresa</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.companyName}</Label> 
              </Col>
              <Col sm="2">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Setor</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.sector}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Cargo</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.positionName}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="6">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Tipo de Vínculo</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.typeLink}</Label> 
              </Col>
              <Col sm="2">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Matrícula</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.registration}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Data de Contratação</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{FormatarData(data.employee?.contractDate,"dd/MM/yyyy")}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="6">    
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Carga Horária</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.employee?.workload}</Label> 
              </Col>
              <Col sm="2">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Salário</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{"R$ " + FormatarReal(String(data.employee?.salary.toFixed(2)))}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Benefícios</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{"R$ " + FormatarReal(String(data.employee?.benefits.toFixed(2)))}</Label> 
              </Col>
           </Row>


           {data.documents?.length > 0 && <>

           <div style={{fontSize: "1.25rem",marginTop:"10px",
                        marginBottom:"20px",borderBottom: "1px solid #727272"}}>Documentos do Cargo</div>

              { data.documents.map((document,index) => 
                   <div key={index}>Documento {index + 1}: <a style={{color:"#1FCEC9"}} href={Constantes.urlImages + document.url} target="_blank" rel="noreferrer">
                      {document.doc}</a></div>)} 
          
           </>}

         </Card>
         
        </CardBody>
       
    </>)
  }