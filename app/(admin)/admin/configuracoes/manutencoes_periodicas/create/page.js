"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { UncontrolledAccordion, AccordionBody, AccordionHeader, AccordionItem, 
         Row, Col, Form, Card, Button,CardHeader,CardBody, Input } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import AlertMessage from "../../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../manutencao.module.css";
import InputForm from "../../../../../../src/Components/ElementsUI/InputForm";

export default function Create() {

   const { "token2": token2 } = parseCookies();
  
   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

   const router = useRouter();
   const [loading, setLoading] = useState(false);

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

   const [data, setData] = useState({});
   const [alertaInputs, setAlertaInputs] = useState([]);

   const {
      register,
      handleSubmit,
      setError,
      clearErrors,
      control,
      setValue,
      getValues,
      formState: { errors },
    } = useForm({ defaultValues: data });

   /* const [errors, setErrors] = useState({}); */

   function addAlerta(){
     setAlertaInputs([...alertaInputs,{phone:false,email:false}]);
   }

   function changeAlerta(index,type){
     setAlertaInputs(alertaInputs.map((alerta,i) => {
           if(index == i){
              alerta[type] = !alerta[type];  
           }
       return alerta;
     }));
   }

   function removeAlerta(index){
      
      let alerts = getValues("patrimonyAlerts");
      setValue("patrimonyAlerts",alerts.filter((_,i) => i != index)); 
      setAlertaInputs(alertaInputs.filter((_,i) => i != index));
   }

   function submit(data){

      if(data.patrimonyAlerts){
          data.patrimonyAlerts =  data.patrimonyAlerts.map((alerta,i) => {
                alerta.email = alertaInputs[i].email;
                alerta.phone = alertaInputs[i].phone;
            return alerta;
          })
      }else{
         data.patrimonyAlerts = [];
      }

      setLoading(true);
      
      let url = "periodic_maintenance";
      fetch(Constantes.urlBackAdmin + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Module": "ADMINISTRATION",
                "Authorization": token2
            },
            body: JSON.stringify(data)
      })
      .then((response) => 
           response.status == 201 ? {status: response.status, body:  null} :
           response.json().then(data => ({
                          status: response.status, 
                          body: data }))
      ) 
      .then(({status, body}) => {

           setLoading(false);

           switch(status){
               case 201:
                 showAlert("success", "Tipo de documento cadastrado com sucesso!");
                 router.push("/admin/configuracoes/manutencoes_periodicas");
               break;
               case 400:
                 setErrors(body);
                 showAlert("danger", "Preencha os dados obrigatórios!");
               break;
               case 404:
                 console.log("erro:",body);
                 showAlert("danger",body.message);
               break;
           }
      })
      .catch((error) => {
         console.log(error);
      }) 
    }

    useEffect(() => {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    });
    
   return (<>

        { loading && <LoadingGif/>}
        
        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro de Manutenção Periódica</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
            <Form onSubmit={handleSubmit(submit)}>
            <UncontrolledAccordion defaultOpen={["configuracao"]} stayOpen style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader /* targetId="configuracao" */><span className={styles.accordionTitle}>Dados da Manutenção</span></AccordionHeader>
                  <AccordionBody accordionId="configuracao" style={{padding:"15px"}}>
                   
                      <Row className="d-flex mt-3">
                        <Col sm="6">
                          <InputForm
                           id="name"
                           name="name"
                           label="Nome*"
                           placeholder="--Digite--"
                           register={register}
                           required={true}
                           type="text"
                           errors={errors}
                          />
                        </Col>
                        <Col sm="3">
                          <InputForm
                           id="mileageInterval"
                           name="mileageInterval"
                           label="Intervalo de Quilometragem*"
                           placeholder="--Digite--"
                           register={register}
                           required={true}
                           type="text"
                           errors={errors}
                          />
                        </Col>
                        <Col sm="3">
                          <InputForm
                           id="dayInterval"
                           name="dayInterval"
                           label="Intervalo de Dias*"
                           placeholder="--Digite--"
                           register={register}
                           required={true}
                           type="text"
                           errors={errors}
                          />
                        </Col>
                      </Row>

                      <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Alertas</div>

                      <Row className="d-flex mt-3 mb-3 justify-content-end">
                           <Button style={{ backgroundColor: "#009E8B", width:"150px"}}
                                   onClick={() => addAlerta()}>
                             Adicionar <FaPlus/>
                           </Button>
                      </Row>

                      { alertaInputs.map((alerta,index) => 
                        <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px",
                                                 ...(windowWidth <= 575 && {flexDirection:"column"})}}>
                         <Card style={{ flex:"1", padding: "15px"}}>

                           <Row className="d-flex mt-3">
                             <Col sm="6">
                               <InputForm
                                id={`patrimonyAlerts[${index}].name`}
                                name={`patrimonyAlerts[${index}].name`}
                                label="Nome do Alerta*"
                                placeholder="--Digite--"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                               />
                             </Col>
                             <Col sm="3">
                               <InputForm
                                id={`patrimonyAlerts[${index}].mileageLimit`}
                                name={`patrimonyAlerts[${index}].mileageLimit`}
                                label="Número Limite de Km*"
                                placeholder="--Digite--"
                                register={register}
                                required={true}
                                type="number"
                                errors={errors}
                               />
                             </Col>
                             <Col sm="3">
                               <InputForm
                                id={`patrimonyAlerts[${index}].numberLimitDay`}
                                name={`patrimonyAlerts[${index}].numberLimitDay`}
                                label="Número Limite de Dias*"
                                placeholder="--Digite--"
                                register={register}
                                required={true}
                                type="number"
                                errors={errors}
                               />
                             </Col>
                           </Row>

                           <Row className="d-flex flex-wrap justify-content-end gap-3 mt-3"
                                style={{paddingRight:"12px",fontSize:"18px",
                                        ...(windowWidth <= 575 && {marginLeft:"13px"})}}>
                                <Input name="check" 
                                       type="checkbox"
                                       checked={alerta.phone}
                                       onChange={() => changeAlerta(index,"phone")}
                                       className={styles.radioButton}>
                                </Input>
                                Whatsapp

                                <Input name="check" 
                                       type="checkbox"
                                       checked={alerta.email}
                                       onChange={() => changeAlerta(index,"email")}
                                       className={styles.radioButton}>
                                </Input>
                                Email
                           </Row>

                         </Card>
                         {/* {alertaInputs.length > 1 &&  */}
                           <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px",
                                            ...(windowWidth <= 575 && {width:"100%",color:"red"})}}
                                   onClick={() => removeAlerta(index)}>
                           {windowWidth <= 575 && "Remover"} <FaTrash style={{color:"red"}}/>
                         </Button>{/* } */}
                        </div>
                       )}


                   
                  </AccordionBody>
               </AccordionItem>
            </UncontrolledAccordion>    
             
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit"
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