"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem ,
        Col, Form, FormGroup, Label, Row, Button, Table, Input,
        Card,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../maodeobra.module.css";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import FormatarData from "../../../../../src/Utils/FormatarData";
import FormatarReal from "../../../../../src/Utils/FormatarReal";

export default function Create() {

   const { "token2": token2 } = parseCookies();

   const {
	  	register,
	  	handleSubmit,
	  	setError,
	  	clearErrors,
	  	control,
	  	setValue,
      getValues,
	  	formState: { errors },
	} = useForm({ /* defaultValues:  */});

   const [open, setOpen] = useState(["register","address","vehicles"]);
   const [loading, setLoading] = useState(false);

   const router = useRouter();
   const params = useParams();

   const [type, setType] = useState("abastecimento");

   const fuelTypes = [ { id: 'GASOLINE_COMMON', name: 'Gasolina comum' },
                       { id: 'GASOLINE_ADDITIVE', name: 'Gasolina aditivada' },
                       { id: 'DIESEL_S10', name: 'Diesel S10' },
                       { id: 'DIESEL_S500', name: 'Diesel S500' },
                       { id: 'DIESEL_ADDITIVE', name: 'Diesel aditivado' }];


   const [data, setData] = useState({}); 

   const [vehicleRoute, setVehicleRoute] = useState([]);

   const [alert, setAlert] = useState({});
   const [activeAlert, setActiveAlert] = useState(false);
   const [isOpen, setIsOpen] = useState(true);
   const onDismiss = () => setIsOpen(false);


   function showAlert(type, text) {
      setIsOpen(false);

      setAlert({
          type: type,
          text: text
      })
      setIsOpen(true)
      setActiveAlert(true)
   }

   const [accordionErrors, setAccordionErrors] = useState([]);

   const toggle = (id) => {
         if(open.includes(id)){
            setOpen(open.filter((e) => e != id)); 
         }else{
            setOpen([...open,id]);
         } 
   };

  
   function getLabor(id){
         fetch(Constantes.urlBackCosts + `labor/${id}`, {
                   method: "GET",
                   headers: {
                       "Module": "COSTS",
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
                    setData(body);
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

 
   function dataForTable(data){
     let tableData = [];
 
     data.forEach(d => 
         tableData.push({
               "vehicle": d.vehicle,
               "kilometer": d.kilometer,
           
         })
     );

     return tableData;
   }

   useEffect(() => {
      getLabor(params.id);
   },[params]);


   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Dados Custo de Mão de Obra </h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>

            <Card style={{padding:"20px"}}> 
              <Row className="d-flex mt-3">
                <Col sm="3">Funcionário<br/> {data.employeeName}</Col>
                <Col sm="3">Mês de Referência<br/>{FormatarData(data.referenceMonth,"MM-yyyy")}</Col>
                <Col sm="3">Data de Pagamento<br/>{FormatarData(data.paymentDate,"dd/MM/yyyy")}</Col>
                <Col sm="3">Valor Total<br/>{ data.value && "R$ " + FormatarReal(data.value.toFixed(2))}</Col>  
              </Row>

              <Row className="d-flex mt-3">
                <Col sm="3">Descrição<br/> {data.description}</Col>
              </Row>
           </Card>

           {vehicleRoute.length > 0 && <Row className="d-flex mt-3">
               <TableStyle columnNames={["Veículo","Rota"]} data={dataForTable(vehicleRoute)} />
           </Row>}
              
        </CardBody>

      
       
        {activeAlert && (
            <AlertMessage type={alert["type"]}
                text={alert["text"]}
                isOpen={isOpen}
                toggle={onDismiss}>
            </AlertMessage>
         )}
       
    </>)
  }