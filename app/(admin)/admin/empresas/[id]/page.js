"use client"
import { useState, useEffect } from "react";
import { useRouter, useParams } from 'next/navigation';
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { Col, Row, Label, Button, Card,CardHeader,CardBody } from 'reactstrap';
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import styles from "../empresas.module.css";

export default function Page() {

   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const [loading, setLoading] = useState(true);

   const params = useParams();
   const [data, setData] = useState({});
  
   function getCompany(id){

        setLoading(true);

        fetch(Constantes.urlBackAdmin + `company/${id}`, {
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
     getCompany(params.id);
   },[params]);
  

   return (<>

        { loading && <LoadingGif/>}
        
        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados da Empresa</h1>
        </CardHeader>

        <CardBody style={{width:"90%"}}>


         <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Dados Gerais</div>
         <Card style={{width:"80%",padding:"15px"}}>
           <Row className="d-flex mt-3">
              <Col sm="12">    
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Razão Social</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.corporateReason}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="6">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Nome Fantasia</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.name}</Label> 
               </Col>
               <Col sm="6">
                 <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>CNPJ</Label><br/>
                 <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.cnpj}</Label> 
               </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Email</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.email}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Telefone</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.phone}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Site</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.site}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Data de Constituição</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.constitutionDate}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>NIRE</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.nire}</Label> 
              </Col>
              <Col sm="4">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Atividade Econômica Principal</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.mainEconomicActivity}</Label> 
              </Col>
           </Row>
           <Row className="d-flex mt-3">
              <Col sm="3">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Natureza Jurídica</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.legalNature}</Label> 
              </Col>
              <Col sm="3">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>Controle Acionário</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.shareHoldingControl}</Label> 
              </Col>
              <Col sm="3">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>País da Constituição</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.countryConstitution}</Label> 
              </Col>
              <Col sm="3">
                <Label style={{height:"25px",fontSize:"16px",fontWeight:"bold"}}>País de Residência Fiscal</Label><br/>
                <Label style={{height:"25px",fontSize:"16px"}}>{data.company?.countryTaxResidence}</Label> 
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
           
           
           { data.accountBanks.map((accountBank,index) => 
             <Card key={index} style={{width:"80%",padding:"15px"}}>
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

        </CardBody>
       
    </>)
  }