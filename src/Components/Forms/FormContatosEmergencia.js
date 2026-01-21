"use client"
import { useState,useEffect, Fragment } from "react";
import { Row, Col, Form, Button, Input, Card } from "reactstrap";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import MaskTelefone from "../../Utils/MaskTelefone";
import InputForm from "../ElementsUI/InputForm";
import styles from "./form.module.css";

export default function FormContatosEmergencia({data,setData,apiErrors}) {

    const {
	  	register,
	  	handleSubmit,
	  	setError,
	  	clearErrors,
	  	control,
      getValues,
	  	setValue,
	  	formState: { errors },
	  } = useForm({ defaultValues: { kinship: data.kinship }});

    const [kinship, setKinship] = useState([{phones:[true]}]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    function addKinship(){
       setKinship([...kinship,{phones:[true]}]);
    }

    function removeKinship(index){
       
       setKinship(kinship.filter((_,i) => i != index));
       let kinshipInputs = getValues("kinship");
       setValue("kinship",kinshipInputs.filter((_,i) => i != index)); 
    }
 
    function addPhone(index){
       /* setPhones([...phones,false]); */
       setKinship(kinship.map((input,i) => {
          if(i == index){
            input.phones.push(false);
          }
          return input;
       }));
    }

    function removePhone(index,index2){
       
       /* setPhones(phones.filter((_,i) => i != index)); */

       setKinship(kinship.map((input,i) => {
           if(i == index){
             input.phones = input.phones.filter((_,i2) => i2 != index2);
           }
           return input;
        }));
       let phonesInputs = getValues(`kinship[${index}].phones`);
       setValue(`kinship[${index}].phones`,phonesInputs.filter((_,i2) => i2 != index2)); 
    }

    function setPreferencial(index,index2){
     /*  setPhones(phones.map((input,i) =>{
        input =  i == index ? true : false;
        return input;
      })); */

      setKinship(kinship.map((input,i) => {
           if(i == index){
            input.phones = input.phones.map((input2,i2) =>{
                             input2 = i2 == index2 ? true : false;
                             return input2;
                           })
           }
           return input;
        }));
    }

    function submit(formData){

      formData.kinship.forEach((input,index) => {
         input.phones = input.phones.map((phone,index2) => {
                                            phone.preferential = kinship[index].phones[index2];
                                            return phone;
                                         });
      });
      data.confirmed.push("kinship");
      setData({...data, kinship: formData.kinship, confirmed: data.confirmed});
     
    }

    useEffect(() => {
  
       if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){
    
          Object.keys(apiErrors).forEach((key) => {
            setError(key, {type: "custom", message: apiErrors[key]});
          });
       }
    
    },[apiErrors]);

    useEffect(() => {
        if(data.kinship.length > 0){
          let inputs = [];
          data.kinship.forEach((kin) => {
            let inputs2 = [];
            kin.phones.forEach((phone) => {
               inputs2.push(phone.preferential)
            }); 
            inputs.push({phones:inputs2});
          });
          setKinship(inputs);
        }

        const handleResize = () => {
          setWindowWidth(window.innerWidth);
          };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    },[]);

    return (
        <>
         <Form onSubmit={handleSubmit(submit)}>
           <Row className="d-flex mt-1 mb-3 justify-content-end">
                  <Button style={{ backgroundColor: "#009E8B", width:"120px"}}
                          onClick={() => addKinship()}>
                    Adicionar <FaPlus/>
                  </Button>
           </Row>
           {kinship.map((input,index) => <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px",
                                                                  ...(windowWidth <= 575 && {flexDirection:"column"})}}>
            <Card style={{flex:"1", padding:"15px"}}>
              <Row className="d-flex mt-3">
                 <Col sm="8">
                   <InputForm
                     id={`kinship[${index}].name`}
                     name={`kinship[${index}].name`}
                     label="Nome"
                     placeholder="--Digite--"
                     register={register}
                     required={true}
                     type="text"
                     errors={errors}
                   />
                 </Col> 
                 <Col sm="4">
                   <InputForm
                     id={`kinship[${index}].kinship`}
                     name={`kinship[${index}].kinship`}
                     label="Parentesco"
                     placeholder="--Digite--"
                     register={register}
                     required={true}
                     type="text"
                     errors={errors}
                   />
                 </Col> 
              </Row>

              <div style={{fontSize: "18px", marginBottom:"10px"}}>Telefone(s)</div>
  
              <Row className="d-flex mt-1 mb-3 justify-content-end">
                  <Button style={{ backgroundColor: "#009E8B", width:"120px", marginRight:"15px"}}
                          onClick={() => addPhone(index)}>
                    Adicionar <FaPlus/>
                  </Button>
              </Row>

              {input.phones.map((input2,index2) => 
                <div key={index2} style={{display:"flex",gap:"40px",marginBottom:"20px",
                                          ...(windowWidth <= 575 && {flexDirection:"column"})}}>
                  <Card key={index2} style={{flex:"1", padding:"20px"}}>
                    <Row className="d-flex mt-3">
                       <Col sm="4">
                         <InputForm
                           id={`kinship[${index}].phones[${index2}].phone`}
                           name={`kinship[${index}].phones[${index2}].phone`}
                           label=""
                           placeholder="--Digite--"
                           register={register}
                           onChange={(e) => MaskTelefone(e)}
                           required={true}
                           type="text"
                           errors={errors}
                         />
                       </Col> 
                       <Col sm="2" style={{paddingLeft:"40px",paddingTop:"10px",fontSize:"20px",
                                        display:"flex", gap:"12px"}}>
                         <Input name={`radio_${index}`} 
                                type="radio"
                                defaultChecked={input2}
                                onClick={() => setPreferencial(index,index2)}
                                className={styles.radioButton}>
                         </Input> Preferencial
                       </Col>
                    </Row>
                  </Card>
                {input.phones.length > 1 && 
                  <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px",
                                   ...(windowWidth <= 575 && {width:"100%",color:"red"})}}
                        onClick={() => removePhone(index,index2)}>
                   {windowWidth <= 575 && "Remover"} <FaTrash style={{color:"red"}}/>
                </Button>}
                </div>)}
            </Card>
            { kinship.length > 1 && 
               <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px",
                                ...(windowWidth <= 575 && {width:"100%",color:"red"})}}
                        onClick={() => removeKinship(index)}>
                    {windowWidth <= 575 && "Remover"} <FaTrash style={{color:"red"}}/>
               </Button>}
            </div>)}
      
         <Row className="d-flex mt-3 justify-content-end">
              <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                Confirmar
              </Button>
         </Row>

         </Form>
        </>
    );


}