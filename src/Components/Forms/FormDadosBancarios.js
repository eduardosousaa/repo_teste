"use client"
import { useState,useEffect } from "react";
import Constantes from "../../Constantes";
import { parseCookies } from "nookies";
import { Row, Col, Form, Button, Input,Card } from "reactstrap";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import InputForm from "../ElementsUI/InputForm";
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm";
import BuscarDadoBancos from "../../Utils/BuscarDadoBancos";
import MaskCPF from "../../Utils/MaskCPF";
import MaskCnpj from "../../Utils/MaskCnpj";
import MaskTelefone from "../../Utils/MaskTelefone";
import styles from "./form.module.css";

export default function FormDadosBancarios({data,setData,apiErrors}) {

    const { "token2": token2 } = parseCookies();

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const [showAsyncForm, setShowAsyncForm] = useState(true);  

    const {
	  	register,
	  	handleSubmit,
	  	setError,
	  	clearErrors,
	  	control,
      getValues,
	  	setValue,
	  	formState: { errors },
	  } = useForm({ defaultValues: {accountBanks: data.accountBanks }});

     function array_move(arr, old_index, new_index) {
       if (new_index >= arr.length) {
           var k = new_index - arr.length + 1;
           while (k--) {
               arr.push(undefined);
           }
       }
       arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
       return arr;
     };

    const bancoOptions = (teste) => {
       let url;
       let query = {};
       query.size = 500;
       query.name = teste;
       url =  "types/bank?" + new URLSearchParams(query);
       
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
             
             let order = 0;
             Array("Banco Bradesco S.A.","Banco do Brasil S.A." ,"Banco BTG Pactual S.A." ,
                   "BANCO COOPERATIVO SICOOB S.A. - BANCO SICOOB"  ,"Banco Inter S.A." ,
                   "BANCO SANTANDER (BRASIL) S.A." ,"CAIXA ECONOMICA FEDERAL" ,"ITAÚ UNIBANCO S.A.",
                   "NU PAGAMENTOS S.A. - INSTITUIÇÃO DE PAGAMENTO").forEach((x) => {
               let index = data["content"].findIndex(a => a.name == x);
            
               if(index != -1){
                  data["content"]= array_move(data["content"],index,order);
                  order++;
               }  
             })

             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": dado.name 
                }));
       
                 return dadosTratados;
          });
    };

    const pixOptions =  [{id:"CPF",name:"CPF"},
                         {id:"CNPJ",name:"CNPJ"},
                         {id:"PHONE",name:"Celular"},
                         {id:"EMAIL",name:"E-mail"},
                         {id:"RANDOM",name:"Aleatória"}];

    const [dadosBancosInputs, setDadosBancosInputs] = useState([true]);
 
    function addDadoBanco(){
      setDadosBancosInputs([...dadosBancosInputs,false]);
      /* setChavePixReadOnly([...chavePixReadOnly,true]); */
    }

    function removeDadoBanco(index){
       
       setDadosBancosInputs(dadosBancosInputs.filter((_,i) => i != index));
       /* setChavePixReadOnly(chavePixReadOnly.filter((_,i) => i != index)); */
       let accountBanks = getValues("accountBanks");
       setValue("accountBanks",accountBanks.filter((_,i) => i != index)); 
    }

    function selectMaskChavePix(e,index){
       switch(getValues(`accountBanks[${index}].pixKeyType`)){
          case 'CPF':
            MaskCPF(e)
            break;
          case 'CNPJ':
            MaskCnpj(e)
            break;
          case 'PHONE':
            MaskTelefone(e)
            break;
       }
    }

    function setPreferencial(index){
       setDadosBancosInputs(dadosBancosInputs.map((input,i) =>{
         input =  i == index ? true : false;
         return input;
       }));
    }

    function submit(formData){
   
      formData.accountBanks = formData.accountBanks.map((dadoBancario,index) => {
                 dadoBancario.preferencialStatus = dadosBancosInputs[index] == true ? true : false;
                 dadoBancario.pixKeyType = dadoBancario.pixKeyType == ""  ? null : dadoBancario.pixKeyType; 
                 return dadoBancario;
      });
      data.confirmed.push("accountBanks");
      setData({...data, accountBanks: formData.accountBanks, confirmed: data.confirmed});
     
    }

    useEffect(() => {
            
       if(Object.keys(apiErrors).length !== 0 && apiErrors.constructor === Object){
    
          Object.keys(apiErrors).forEach((key) => {
            setError(key, {type: "custom", message: apiErrors[key]});
          });
       }
    
    },[apiErrors]);

    useEffect(() => {
      if(data.accountBanks.length > 0){
        let inputs = [];
        data.accountBanks.forEach((account) => {
          inputs.push(account.preferencialStatus);
        });
        setDadosBancosInputs(inputs);
      }

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };

    },[]);
    
    useEffect(() => {
        let formValues = getValues();
        if(JSON.stringify(data.accountBanks) !== JSON.stringify(formValues.accountBanks) && !data.confirmed.includes("accountBanks")){
            setValue("accountBanks",data.accountBanks);
            setShowAsyncForm(false);
        }

    },[data]);

    useEffect(() => {
      if(!showAsyncForm) setShowAsyncForm(true);
    },[showAsyncForm])

    return (
        <>
         <Form onSubmit={handleSubmit(submit)}>

           <Row className="d-flex mt-3 mb-3 justify-content-end">
                <Button style={{ backgroundColor: "#009E8B", width:"120px"}}
                        onClick={() => addDadoBanco()}>
                  Adicionar <FaPlus/>
                </Button>
           </Row>


          { dadosBancosInputs.map((input,index) => 
             <div key={index} style={{display:"flex",gap:"40px",marginBottom:"20px",
                                      ...(windowWidth <= 575 && {flexDirection:"column"})}}>
              <Card style={{ flex:"1", padding: "15px"}}>
                 <Row className="d-flex mt-3">
                    <Col sm="8">
                    {showAsyncForm == true &&
                      <AsyncSelectForm
                        id={`accountBanks[${index}].bankName`}
                        name={`accountBanks[${index}].bankName`}
                        label="Banco*"
                        register={register}
                        required={true}
                        defaultValue={data.accountBanks[index] ? {value: data.accountBanks[index].bankName.id , label: data.accountBanks[index].bankName.name} : null}
                        onChange={(e) => {setValue(`accountBanks[${index}].bankName`, e ? {id: e.value, name: e.label} : null);}}
                        options={bancoOptions}
                        errors={errors}
                      /> }
                    </Col> 
                   <Col sm="2">
                      <InputForm
                        id={`accountBanks[${index}].agency`}
                        name={`accountBanks[${index}].agency`}
                        label="Agencia*"
                        placeholder="--Digite--"
                        register={register}
                        required={true}
                        type="text"
                        errors={errors}
                      />
                    </Col>
                    <Col sm="2">
                      <InputForm
                        id={`accountBanks[${index}].account`}
                        name={`accountBanks[${index}].account`}
                        label="Conta*"
                        placeholder="--Digite--"
                        register={register}
                        required={true}
                        type="text"
                        errors={errors}
                      />
                    </Col>
                 </Row>
   
                 <Row className="d-flex mt-3">
                      <Col sm="4">
                         <InputForm
                          id={`accountBanks[${index}].pixKeyType`}
                          name={`accountBanks[${index}].pixKeyType`}
                          label="Tipo de Chave Pix"
                          placeholder="--Digite--"
                          register={register}
                          required={false}
                          onChange={() => setValue(`accountBanks[${index}].pixKey`,"")}
                          type="select"
                          options={pixOptions}
                          errors={errors}
                         />
                       </Col>
                      <Col sm="4">
                         <InputForm
                           id={`accountBanks[${index}].pixKey`}
                           name={`accountBanks[${index}].pixKey`}
                           label="Chave Pix"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           onChange={(e) => selectMaskChavePix(e,index)}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                       <Col sm="4" style={{paddingLeft:"50px",paddingTop:"35px",fontSize:"20px",
                                           display:"flex", gap:"12px"}}>
                         <Input name="radio" 
                                type="radio"
                                defaultChecked={input}
                                onClick={() => setPreferencial(index)}
                                className={styles.radioButton}>
                         </Input>  Conta Preferencial
                       </Col>

                 </Row>
              </Card>
              { dadosBancosInputs.length > 1 && 
                <Button style={{ borderColor:"red", backgroundColor: "white", width:"60px", height:"60px",
                                 ...(windowWidth <= 575 && {width:"100%",color:"red"})}}
                      onClick={() => removeDadoBanco(index)}>
                {windowWidth <= 575 && "Remover"} <FaTrash style={{color:"red"}}/>
              </Button>}
              </div>
          )}
           <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit" style={{ backgroundColor: "#009E8B", width:"100px"}}>
                  Confirmar
                </Button>
           </Row>

         </Form>
        </>
    );


}