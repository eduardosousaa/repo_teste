"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem ,
        Col, Form, FormGroup, Label, Row, Button, Table,
        Card,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../../maodeobra.module.css";
import InputForm from "../../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../../src/Components/ElementsUI/AsyncSelectForm";
import TableStyle from  "../../../../../../src/Components/ElementsUI/TableStyle";
import MaskReal from "../../../../../../src/Utils/MaskReal";
import FormatarReal from "../../../../../../src/Utils/FormatarReal";

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
	} = useForm({ /* defaultValues: {} */});

   const [loading, setLoading] = useState(false);

   const router = useRouter();
   const params = useParams();

   const [vehicleRoute, setVehicleRoute] = useState([/* {vehicle: "PREFIX/TBO-9999", route: " Teresina GRE Leste - 3"} */]);

   const typeOptions = [
        { id: '', name: '--Selecione a Categoria--' },
        { id: 'RESCISSION', name: 'Rescisão' },
        { id: 'VACATION', name: 'Férias' },
        { id: 'SALARY', name: '13º Salário' },
        { id: 'SALARY_13TH', name: 'Salário' },
   ];
   
   const [alert, setAlert] = useState({});
   const [activeAlert, setActiveAlert] = useState(false);
   const [isOpen, setIsOpen] = useState(true);
   const onDismiss = () => setIsOpen(false);

   const [showAsync, setShowAsync] = useState(false);

   function showAlert(type, text) {
      setIsOpen(false);

      setAlert({
          type: type,
          text: text
      })
      setIsOpen(true)
      setActiveAlert(true)
   }

   const employeeOptions = (teste) => {
      let url;
      let query = {};
      query.size = 100;
      query.name = teste;
      url =  "employee?" + new URLSearchParams(query);
      
      return fetch(Constantes.urlBackAdmin + url, {method: "GET",
         headers: {
             "Accept": "application/json",
             "Content-Type": "application/json",
             "Module": "ADMINISTRATION",
             "Authorization": token2
         },})
         .then((response) => response.json())
         .then((data) => {
      
            let dadosTratados = [];
      
            data["content"].forEach(dado =>
               dadosTratados.push({
                "value":  dado.id,
                "label": dado.fullName 
               }));
      
                return dadosTratados;
         });
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
                   for (const [key, value] of Object.entries(body)) {

                    if(key == "value"){
                      setValue(key,FormatarReal(String(value.toFixed(2))));
                    }else{
                      setValue(key,value);
                    }
                   }
                   setShowAsync(true);
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

   function getRouteVehicle(id){
     
     setLoading(true);
     fetch(Constantes.urlBackCosts + `labor/vehicles-routes/${id}`, {method: "GET",
           headers: {
               "Accept": "application/json",
               "Content-Type": "application/json",
               "Module": "COSTS",
               "Authorization": token2
           },})
           .then((response) => 
                response.json().then(data => ({
                          status: response.status, 
                          body: data }))
           ) 
           .then(({ status, body}) => {
                console.log(body);
                switch(status){
                    case 200:
                      console.log(body);
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

   function submit(data){
      if(data.value != ""){
         data.value = data.value.replaceAll(".","");
         data.value = parseFloat(data.value.replace(",","."));
      }
      
      setLoading(true);
 
      let url = `labor/${params.id}`;
      fetch(Constantes.urlBackCosts + url, {
            method: "PUT",
            headers: {
                "Module": "COSTS",
                "Authorization": token2,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
      })
      .then((response) => 
           response.status == 200 ? {status: response.status, body:  null} :
           response.json().then(data => ({
                          status: response.status, 
                          body: data }))
      ) 
      .then(({status, body}) => {
           switch(status){
               case 200:
                 showAlert("success", "Mão de obra editado com sucesso!");
                 router.push("/custos/mao_de_obra");
               break;
               case 400:
                 showAlert("danger", "Preencha os dados obrigatórios!");
               break;
               case 404:
                 console.log("erro:",body);
                 showAlert("danger",body.message);
               break;
               
           }
           setLoading(false);
      })
      .catch((error) => {
         console.log(error);
      }) 
    }


  useEffect(() => {
      getLabor(params.id);
   },[params]);

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Edição Custo de Mão de Obra</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>
      
            <Row className="d-flex mt-3">
              <Col sm="6">
                {showAsync && <AsyncSelectForm
                   id="employeeId"
                   name="employeeId"
                   label="Funcionário*"
                   register={register}
                   required={true}
                   defaultValue={{value:getValues("employeeId"),label:getValues("employeeName")}}
                   onChange={(e) => {setValue(`employeeId`,e ? e.value : "");
                                     if(e) getRouteVehicle(e.value)}}
                   options={employeeOptions}
                 />}
              </Col>
               <Col sm="3">
                 <InputForm
                   id="referenceMonth"
                   name="referenceMonth"
                   label="Mês de Referência*"
                   placeholder="mm/aaaa"
                   register={register}
                   required={true}
                   type="month"
                   errors={errors}
                 />
              </Col>
              <Col sm="3">
                <InputForm
                   id="paymentDate"
                   name="paymentDate"
                   label="Data de Pagamento*"
                   placeholder="dd/mm/aaaa"
                   register={register}
                   required={true}
                   type="date"
                   errors={errors}
                 />
              </Col>
            </Row>

           {vehicleRoute.length > 0 &&
            <Row className="d-flex mt-3">
              <Col sm="12">
               <TableStyle columnNames={["Veículo","Rota"]} data={vehicleRoute}/> 
              </Col>
            </Row>}

            <Row className="d-flex mt-3">
               <Col sm="4">
                  <InputForm
                    id="value"
                    name="value"
                    label="Valor do Pagamento*"
                    placeholder="--Digite--"
                    register={register}
                    required={true}
                    onChange={(e) => MaskReal(e)}
                    type="text"
                    errors={errors}
                   />
               </Col>
               <Col sm="4">
                   <InputForm
                       id="typeCost"
                       name="typeCost"
                       label="Tipo*"
                       placeholder="--Selecione--"
                       register={register}
                       required={true}
                       type="select"
                       options={typeOptions}
                       onChange={(e) => setValue('typeCost', e.target.value)}
                       errors={errors}
                   />
               </Col>
            </Row>

            <Row className="d-flex mt-3">
              <Col sm="12">
                <InputForm
                    id="description"
                    name="description"
                    label="Descrição detalhada"
                    placeholder="Digite aqui"
                    register={register}
                    required={false}
                    type="textarea"
                    errors={errors}
                />
              </Col>
            </Row>
               
            <Row className="d-flex mt-3 justify-content-end">
                <Button onClick={handleSubmit(submit)}
                        style={{ backgroundColor: "#009E8B", width:"100px", height:"60px"}}>
                  Salvar
                </Button>
             </Row> 
          </Form>
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