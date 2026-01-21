"use client"
import { useState, useEffect, useContext } from "react";
import Constantes from "../../../../../src/Constantes";
import { AuthContext } from '../../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Col, Form, FormGroup, Label, Row, Button, Table, Input,
         Card,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { SlArrowDown } from "react-icons/sl";
import { MdDriveFolderUpload, MdOutlinePhotoCamera} from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../abastecimento.module.css";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../../src/Components/ElementsUI/IndexCardsStyle";
import ModalStyle from  "../../../../../src/Components/ElementsUI/ModalStyle";
import MaskReal from "../../../../../src/Utils/MaskReal";
import MaskLiter from "../../../../../src/Utils/MaskLiter";
import FormatarData from "../../../../../src/Utils/FormatarData";
import FormatarReal from "../../../../../src/Utils/FormatarReal";

export default function Create() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
      
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name.includes(name)) != -1 : false;
   }
   
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

   const [showAsync, setShowAsync] = useState(true);

   const router = useRouter();
   
   const [type, setType] = useState("abastecimento");

   const fuelTypes = [ { id: 'GASOLINE_COMMON', name: 'Gasolina comum' },
                       { id: 'GASOLINE_ADDITIVE', name: 'Gasolina aditivada' },
                       { id: 'DIESEL_S10', name: 'Diesel S10' },
                       { id: 'DIESEL_S500', name: 'Diesel S500' },
                       { id: 'DIESEL_ADDITIVE', name: 'Diesel aditivado' }];


   const [photos, setPhotos] = useState([]);

   const [documents, setDocuments] = useState([/* {arquivo: (formData),
                                                 arquivoBlob: (blob),
                                                 descricao: (string)} */]);


   const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);
   
   const [createInvoice, setCreateInvoice] = useState([]);


   const [columns, setColumns] = useState(["Veículo","Posto de Combustível","Tipo de Combustível","Data","Valor","Ações"]);

   const [fuelSupplies, setFuelSupplies] = useState([/* {vehicle:"ONIB-2023-0001",kilometer:"342.850 km",gasStation:"Posto BR Sul",fuelType:"Diesel S500",date:"01/01/2025",value:"R$ 220,00"} */]);

   const [mileage, setMileage] = useState(0);
   const [changedMileage, setChangedMileage] = useState("not_confirmed");

   const [openModal, setOpenModal] = useState(false);
   const [typeModal, setTypeModal] = useState("Imagem");
   const [sizeModal, setSizeModal] = useState("lg");
   const [previewImage, setPreviewImage] = useState(null);

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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


   const toggle = (id) => {
         if(open.includes(id)){
            setOpen(open.filter((e) => e != id)); 
         }else{
            setOpen([...open,id]);
         } 
   };

   /* const [data, setData] = useState({}); 

   const [errors, setErrors] = useState({});*/


   const supplierOptions = (teste) => {
           let url;
           let query = {};
           query.size = 100;
           query.name = teste;
           query.isGasStation = true;
           url =  "supplier?" + new URLSearchParams(query);
           
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
                     "label": dado.name 
                    }));
           
                     return dadosTratados;
              });
   };


    const vehicleOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.plate = teste;
       query.prefix = teste;
       /* query.status = "ACTIVE"; */
       query.statusVehicle = ["ACTIVE","UNDER_MAINTENANCE","RESERVE"];
       query.locationNotNull = true;
       url =  "vehicle/available?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackPatrimony + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "PATRIMONY",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
       
             let dadosTratados = [];
       
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": (dado.prefix || "(sem prefixo)") + "/" + dado.plate,
                 "mileage": dado.mileage 
                }));
       
                 return dadosTratados;
          });
    };


     const invoiceOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       query.type = "SUPPLY";
       url =  "supply/invoice?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackCosts + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "COSTS",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
       
             let dadosTratados = [];
       
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": "N°" + dado.number + " - R$" + dado.value,
                 "supplierId": dado.supplierId,
                 "supplierName": dado.supplierName
                }));
       
                 return dadosTratados;
          });
    };

    const fuelSupplyOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       query.isInvoiceNull = true;
       query.supplyId = getValues("supplierId") || "";
       url =  "supply?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackCosts + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "COSTS",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
       
             let dadosTratados = [];
             
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": dado.plate +  " - " + FormatarData(dado.date,"dd/MM/yyyy") + " - R$" + FormatarReal(dado.fuelCost.toFixed(2)),
                 "vehicle": dado.plate,
                 "kilometer": dado.kilometer,
                 "gasStation": dado.supplierName,
                 "fuelType": dado.fuelType,
                 "date": dado.date,
                 "valuePrice": dado.fuelCost,
                }));
                 return dadosTratados;
          });
    };

    
   function changeArquivo(e,type){
      if(e.target.files[0] != undefined){

         let bar;
         if(e.target.value.includes("\\")) bar = "\\"; 
         if(e.target.value.includes("/")) bar = "/";
         let fileName = e.target.value.split(bar)[e.target.value.split(bar).length - 1]; 

         const file = e.target.files[0];
         
         if(((type == "document" || type == "invoice") && file.type != "application/pdf") ||  
            (type == "photo" && file.type != "image/png" && file.type != "image/jpeg")){
             return showAlert("warning","Formato de documento não permitido!");
         }

         const newFile = new File([file],fileName,{
                            type: file.type
                         });
      
         const reader = new FileReader();
   
         reader.onload = function(e) {
           const blob = new Blob([new Uint8Array(e.target.result)], {type: file.type });
           /* console.log(blob); */
           const objectURL = URL.createObjectURL(blob);
           /* console.log(objectURL); */

           if(type == "document"){
              setDocuments([...documents,{arquivo: newFile,
                                         arquivoBlob: objectURL,
                                         descricao: fileName}]);
           }else if(type == "photo"){
               setPhotos([...photos,{arquivo: newFile,
                                    arquivoBlob: objectURL,
                                    descricao: fileName}]);
           }else if(type == "invoice"){
               setValue("invoiceDoc", newFile);
               setInvoiceDocBlob(objectURL);
           }
         };
   
         reader.readAsArrayBuffer(file);
      }
    }  
    
   function calculatePrice(value,type){
      if(value == "") return setValue("fuelCost","");
      let result = 0;
      let price;
      let quantity;
      if(type == "quantityLiters"){
         if(getValues("priceLiter") == "") return setValue("fuelCost","");
         price = getValues("priceLiter").replaceAll(".","");
         price = parseFloat(price.replace(",","."));
         quantity = value.replace(",",".");
         result = quantity*price;
      }else if(type == "priceLiter"){
         if(getValues("quantityLiters") == "") return setValue("fuelCost","");
         price = value.replaceAll(".","");
         price = parseFloat(price.replace(",","."));
         quantity = getValues("quantityLiters");
         result = price*quantity.replace(",",".");
      }
      setValue("fuelCost",FormatarReal(String(result.toFixed(2))));
   }

   function addFuelSupply(){
      let fuelSupply = getValues("fuelSupply");
   
      if(fuelSupply == undefined) return;

      if(fuelSupplies.some(fuel => fuel.value === fuelSupply.value)) return;

      setFuelSupplies([...fuelSupplies,fuelSupply]);
      setShowAsync(false);
   }

   function dataForTable(data){
     let tableData = [];
 
     data.forEach((d,index) => 
         tableData.push({ 
               "vehicle": d.vehicle,
               "gasStation": d.gasStation,
               "fuelType": fuelTypes.filter((fuel) => fuel.id == d.fuelType)[0].name,
               "date": FormatarData(d.date,"dd/MM/yyyy"),
               "value": "R$" + FormatarReal(d.valuePrice.toFixed(2)),
               "actions": actionButtons(index)
         })
     );

     return tableData;
   }

   function actionButtons(index){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap"}}>
            <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => setFuelSupplies(fuelSupplies.filter((_,i) => i != index))}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div>
           </div>;
   }

   function updateMileage(){
   
      let data = {mileage: getValues("mileage")};
      setLoading(true);
      
      let url = `vehicle/mileage/${getValues("vehicleId")}`;
      fetch(Constantes.urlBackPatrimony + url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Module": "PATRIMONY",
                "Authorization": token2
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

           setLoading(false);

           switch(status){
               case 200:
                setMileage(data.mileage);
                submit(getValues());
                setOpenModal(false);
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

   function submit(data){
      console.log("Submit")
      let url;

      const formData = new FormData();
       
      if(type == "abastecimento") {
          console.log("abastecimento");
          let post = { ...data};


          if(post.invoiceValue && post.invoiceValue != ""){
             post.invoiceValue = post.invoiceValue.replaceAll(".","");
             post.invoiceValue = parseFloat(post.invoiceValue.replace(",","."));
          }

          if(post.invoiceDoc){
             formData.append("invoiceDoc",post.invoiceDoc,"nota_fiscal.pdf"); 
          }

          if(post.fuelCost != ""){
             
             post.priceLiter = post.priceLiter.replaceAll(".","");
             post.priceLiter = parseFloat(post.priceLiter.replace(",","."));

             post.fuelCost = post.fuelCost.replaceAll(".","");
             post.fuelCost = parseFloat(post.fuelCost.replace(",","."));

             post.quantityLiters = parseFloat(post.quantityLiters);
          }

          if(photos.length > 0) photos.forEach((photo) => { formData.append("images",photo.arquivo,photo.descricao)});
          
          if(documents.length > 0) documents.forEach((document) => { formData.append("files",document.arquivo,document.descricao)});

          if(changedMileage == "not_confirmed" && post.mileage > mileage){
          
            setTypeModal("Atualizar Quilometragem");
            setSizeModal("md");
            setOpenModal(true);
            return;
          }

          if(post.mileage == "") post.mileage = 0;

          const jsonString = JSON.stringify(post);
          const jsonBlob = new Blob([jsonString], { type: "application/json"});
          formData.append("supply",jsonBlob,"supply.json");
          url = "supply";
      }else if (type == "nota"){
         data.value = data.value.replaceAll(".","");
         data.value = parseFloat(data.value.replace(",","."));
         data.supply = fuelSupplies.map((supply) => {return supply.value});
         
         const jsonString = JSON.stringify(data);
         const jsonBlob = new Blob([jsonString], { type: "application/json"});
         formData.append("invoice",jsonBlob,"invoice.json");
         
         if(data.invoiceDoc){
            formData.append("invoiceDoc",data.invoiceDoc,"nota_fiscal.pdf"); 
         }
         
         url = "supply/invoice";
      }

      setLoading(true);
      
      fetch(Constantes.urlBackCosts + url, {
            method: "POST",
            headers: {
                "Module": "COSTS",
                "Authorization": token2
            },
            body: formData
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
                 showAlert("success",type == "abastecimento" ? "Abastecimento cadastro com sucesso!" :
                                                               "Nota cadastrada com sucesso!");
                 router.push("/custos/abastecimento");
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

   useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.get('type')) {
         setType(urlParams.get('type'));
      }   

   },[]);

   useEffect(() => {
    if(!showAsync) setShowAsync(true);
   },[showAsync]);

   useEffect(() => {
     if(checkPermission("Invoice_Read")){
      if(!createInvoice){
         setValue("invoiceDate","");
         setValue("invoiceNumber","");
         setValue("invoiceValue","");
      }else{
        setValue("invoiceId","");
      }
     }
   },[createInvoice]);

   useEffect(() => {
    if(changedMileage == "confirmed" && type == "abastecimento") updateMileage();
    else if(changedMileage == "not_change" && type == "abastecimento") submit(getValues());
   },[changedMileage]);

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro de {type == "abastecimento" && "Abastecimento"}
                                                        {type == "nota" && "Nota Fiscal"}</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>


            { type == "abastecimento" && <>
            
             {checkPermission("Invoice_Read") && <Card style={{padding:"20px",marginBottom:"20px"}}>

              <Row className="d-flex mt-3">
                 <FormGroup style={{fontSize:"20px",marginLeft:"15px"}} switch>
                   <Input
                     type="switch"
                     checked={createInvoice}
                     onChange={() => {
                       setCreateInvoice(!createInvoice);
                     }}
                   />
                   <Label check>Cadastrar Nota Fiscal</Label>
                 </FormGroup>

                 {createInvoice ? <>
                      <Col sm="4">
                         <InputForm
                           id="invoiceNumber"
                           name="invoiceNumber"
                           label="N° da Nota Fiscal"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           type="text"
                           errors={errors}
                         />
                      </Col>
                      <Col sm="4">
                         <InputForm
                           id="invoiceDate"
                           name="invoiceDate"
                           label="Data de Emissão"
                           placeholder="dd/mm/aaaa"
                           register={register}
                           required={false}
                           type="date"
                         />
                      </Col>
                      <Col sm="4">
                         <InputForm
                           id="invoiceValue"
                           name="invoiceValue"
                           label="Valor Total"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           onChange={(e) => MaskReal(e)}
                           type="text"
                           errors={errors}
                          />
                      </Col>
                    </>
                   :
                 <Col sm="4">
                    <AsyncSelectForm
                      id="invoiceId"
                      name="invoiceId"
                      label="Nota Fiscal"
                      register={register}
                      required={false}
                      onChange={(e) => {if(e){
                                         setValue('invoiceId',e.value);
                                         setValue('supplierId',e.supplierId);
                                         setValue('supplierName',e.supplierName);
                                       }else{
                                         setValue('invoiceId',"");
                                       }             
                                       setShowAsync(false);}}
                      options={invoiceOptions}
                    />
                 </Col>}
              </Row>

              {createInvoice && 
              <div className={styles.archiveFormGroup}>
                  <div className={styles.archiveFormLink}>
                    <a href={invoiceDocBlob} target="_blank" rel="noreferrer">{invoiceDocBlob == null ? "Arquivo não enviado" : "nota_fiscal.pdf"}</a>
                    { errors?.["invoiceDoc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["invoiceDoc"]?.message || "Campo Obrigatório"}</div>}  
                  </div>

                  <div className={styles.archiveFormButtons}>
                   <div>
                      <label className={styles.archiveFormButtonGreen} htmlFor={"invoiceDoc"}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                      <input style={{display:"none"}} {...register("invoiceDoc",{required: false})}></input>
                      <input id={"invoiceDoc"} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,"invoice");clearErrors("invoiceDoc")}}
                                                                                                             onClick={(e) => e.target.value = null}/>
                   </div>
     
                   <div>
                      <a className={styles.archiveFormButtonGreen}  href={invoiceDocBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                   </div>
     
                   <div>
                      <label className={styles.archiveFormButtonRed}  onClick={() => {setInvoiceDocBlob(null)}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                   </div>
                  </div>
              </div>}
              </Card>}

              <Card style={{padding:"20px"}}>

              <Row className="d-flex mt-3">
                 <Col sm="6">
                    <AsyncSelectForm
                      id="vehicleId"
                      name="vehicleId"
                      label="Veículo*"
                      register={register}
                      required={true}
                      onChange={(e) => {setValue('vehicleId',e ? e.value : "");
                                        setValue('plate',e ? e.label : "");
                                        setMileage(e ? e.mileage : 0)}}
                      options={vehicleOptions}
                      errors={errors}
                    />
                 </Col>
                 <Col sm="6">
                   <InputForm
                     id="fuelType"
                     name="fuelType"
                     label="Tipo de Combustível*"
                     placeholder="--Selecione--"
                     register={register}
                     required={true}
                     type="select"
                     options={fuelTypes}
                     errors={errors}
                   />
                 </Col>
              </Row>
              <Row className="d-flex mt-3">
                {showAsync &&<Col sm="4">
                    <AsyncSelectForm
                      id={"supplierId"}
                      name={"supplierId"}
                      label="Posto de Combustível*"
                      register={register}
                      required={true}
                      /* defaultValue={{value:getValues("supplierId"),label:getValues("supplierName")}} */
                      onChange={(e) => {setValue(`supplierId`,e ? e.value : "")}}
                      isDisabled={!createInvoice && getValues("invoiceId") != ""}
                      options={supplierOptions}
                      errors={errors}
                    />
                </Col>}
                <Col sm="4">
                    <InputForm
                       id="mileage"
                       name="mileage"
                       label="Quilometragem"
                       placeholder="--Digite--"
                       register={register}
                       required={false}
                       type="text"
                       errors={errors}
                     />
                 </Col>
                <Col sm="4">
                  <InputForm
                     id="date"
                     name="date"
                     label="Data do Abastecimento*"
                     placeholder="dd/mm/aaaa"
                     register={register}
                     required={true}
                     type="date"
                     errors={errors}
                   />
                </Col>
               {/*  <Col sm="3">
                    <InputForm
                       id="value"
                       name="value"
                       label="Valor total"
                       placeholder="--Digite--"
                       register={register}
                       required={true}
                       onChange={(e) => MaskReal(e)}
                       type="text"
                       errors={errors}
                     />
                 </Col> */}
              </Row>
              <Row className="d-flex mt-3">
                <Col sm="3">
                    <InputForm
                       id="quantityLiters"
                       name="quantityLiters"
                       label="Qtd Litros*"
                       placeholder="--Digite--"
                       register={register}
                       required={true}
                       onChange={(e) => {MaskLiter(e);calculatePrice(e.target.value,"quantityLiters")}}
                       type="text"
                       errors={errors}
                     />
                 </Col> 
                 <Col sm="3">
                    <InputForm
                       id="priceLiter"
                       name="priceLiter"
                       label="Preço p/ Litro*"
                       placeholder="--Digite--"
                       register={register}
                       required={true}
                       onChange={(e) => {MaskReal(e);calculatePrice(e.target.value,"priceLiter")}}
                       type="text"
                       errors={errors}
                     />
                 </Col>
                 <Col sm="3">
                    <InputForm
                       id="fuelCost"
                       name="fuelCost"
                       label="Valor do Abastecimento"
                       placeholder="--Digite--"
                       register={register}
                       required={true}
                       disabled={true}
                       onChange={(e) => MaskReal(e)}
                       type="text"
                     />
                 </Col>
                 <Col sm="3">
                    <InputForm
                       id="couponNumber"
                       name="couponNumber"
                       label="N° do Cupom de Abastecimento"
                       placeholder="--Digite--"
                       register={register}
                       required={false}
                       type="text"
                     />
                 </Col>    
              </Row>
             </Card>
             <Row className="d-flex mt-3 mb-3">
               <Col sm="2">
                  <Label style={{height:"25px",fontSize:"18px"}}>Anexos</Label>
               </Col>
               <Col sm="6" style={{display:"flex",gap:"40px"}}>
                  <label className={styles.archiveFormButtonGreen} htmlFor={`doc_fileBtn`} style={{flex:"1"}}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                  <input id={`doc_fileBtn`} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,"document");}}
                                                                                                          onClick={(e) => e.target.value = null}/>

                  <label className={styles.archiveFormButtonGreen} htmlFor={`doc_imageBtn`} style={{flex:"1"}}>Anexar Foto<MdOutlinePhotoCamera style={{color:"teal"}}/></label>
                  <input id={`doc_imageBtn`} type="file" style={{display:"none"}} accept="image/png, image/jpeg" onChange={(e) => {changeArquivo(e,"photo");}}
                                                                                                                 onClick={(e) => e.target.value = null}/>
               </Col>
             </Row>
             {(documents.length > 0 || photos.length > 0) && <Card style={{padding:"20px"}}>
                <Row className="d-flex mt-3">
                  {documents.length > 0 && <Col sm="6">
                     {documents.map((document,index) =>  
                        <Card key={index} className={styles.archiveFormLink}>
                            <a href={document.arquivoBlob} target="_blank" rel="noreferrer">{document.descricao}</a>
                            <Button color="danger" onClick={() => setDocuments(documents.filter((_,i) => i != index))}
                                    className="p-2" style={{ backgroundColor: '#fff', borderColor: '#dc3545', width: '40px'}}>
                                <FaTrash style={{color:"#e32c2c",height: "25px"}}/>
                            </Button>
                        </Card>
                      )}
                  </Col>}
                  {photos.length > 0 && <Col sm="6">
                    <Row>
                       {photos.map((photo,index) =>  
                          <Col key={index} sm="4" style={{marginBottom:"8px"}}>
                              <div style={{position:"relative",backgroundColor:"#E5E7EB", padding:"16px", borderRadius: "8px",/* width:"232px",height:"160px" */}}>
   
                                  <TiDelete size={40} color="#e32c2c" style={{position:"absolute",top:"5px",right:"5px",cursor:"pointer"}} onClick={() => {setOpenModal(false);setPhotos(photos.filter((_,i) => i != index))}}/>
                                  {/* <div style={{backgroundColor:"#FFFFFF",
                                               border:"2px dashed #D1D5DB",
                                               padding:"16px",
                                               display:"flex",
                                               flexDirection:"column",
                                               alignItems:"center",
                                               justifyContent:"center",
                                               width:"200px",height:"118px"}}> */}
   
                                   <img /* style={{width:"200px",maxHeight:"118px"}} */
                                        style={{ cursor:"pointer",width: "100%", height: "auto", maxHeight: "120px", objectFit: "cover"}} src={photo.arquivoBlob}
                                        onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true);setTypeModal("Imagem");setSizeModal("lg");}}/>
                                   <p style={{ cursor:"pointer", fontSize: "12px", textAlign: "center", marginTop: "5px", overflowWrap: "break-word" }}
                                        onClick={() => {setPreviewImage(photo.arquivoBlob);setOpenModal(true);setTypeModal("Imagem");setSizeModal("lg");}}>{photo.descricao}</p>          
                                  {/* </div> */}
                              </div>
                          </Col>
                        )}
                    </Row>
                  </Col>}
                </Row>

             </Card>}
            </>}


            { type == "nota" && <>

              <Row className="d-flex mt-3">
                 <Col sm="2">
                    <InputForm
                      id="number"
                      name="number"
                      label="N° da Nota Fiscal"
                      placeholder="--Digite--"
                      register={register}
                      required={true}
                      type="text"
                      errors={errors}
                    />
                 </Col>
                 <Col sm="3">
                    <InputForm
                      id="date"
                      name="date"
                      label="Data de Emissão"
                      placeholder="dd/mm/aaaa"
                      register={register}
                      required={true}
                      type="date"
                      errors={errors}
                    />
                 </Col>
                 <Col sm="3">
                    <InputForm
                       id="value"
                       name="value"
                       label="Valor total"
                       placeholder="--Digite--"
                       register={register}
                       required={true}
                       onChange={(e) => MaskReal(e)}
                       type="text"
                       errors={errors}
                     />
                 </Col>
                 <Col sm="4">
                    <AsyncSelectForm
                      id={"supplierId"}
                      name={"supplierId"}
                      label="Posto de Combustível"
                      register={register}
                      required={true}
                      onChange={(e) => {setValue(`supplierId`,e ? e.value : "");
                                        setShowAsync(false)}}
                      options={supplierOptions}
                      errors={errors}
                    />
                </Col>
              </Row>

              <div className={styles.archiveFormGroup}>
                  <div className={styles.archiveFormLink}>
                    <a href={invoiceDocBlob} target="_blank" rel="noreferrer">{invoiceDocBlob == null ? "Arquivo não enviado" : "nota_fiscal.pdf"}</a>
                    { errors?.["invoiceDoc"] && <div style={{color:"red",fontWeight: "300"}}>{ errors?.["invoiceDoc"]?.message || "Campo Obrigatório"}</div>}  
                  </div>

                  <div className={styles.archiveFormButtons}>
                   <div>
                      <label className={styles.archiveFormButtonGreen} htmlFor={"invoiceDoc"}>Anexar Arquivo<MdDriveFolderUpload style={{color:"teal"}}/></label>
                      <input style={{display:"none"}} {...register("invoiceDoc",{required: false})}></input>
                      <input id={"invoiceDoc"} type="file" style={{display:"none"}} accept="application/pdf" onChange={(e) => {changeArquivo(e,"invoice");clearErrors("invoiceDoc")}}
                                                                                                             onClick={(e) => e.target.value = null}/>
                   </div>
     
                   <div>
                      <a className={styles.archiveFormButtonGreen}  href={invoiceDocBlob}  download>Baixar Arquivo<RiDownloadFill style={{color:"teal"}}/></a>
                   </div>
     
                   <div>
                      <label className={styles.archiveFormButtonRed}  onClick={() => {setInvoiceDocBlob(null)}} >Excluir Arquivo<FaTrash style={{color:"#e32c2c"}}/></label>
                   </div>
                  </div>
              </div>


              <Row className="d-flex mt-3">
                {showAsync && <Col sm="4">
                   <AsyncSelectForm
                      id="fuelSupply"
                      name="fuelSupply"
                      label="Abastecimento"
                      register={register}
                      onChange={(e) => {setValue('fuelSupply',e ? e : "")}}
                      isDisabled={getValues(`supplierId`) == null}
                      options={fuelSupplyOptions}
                    />
                </Col>}
                <Col sm="4">
                   <Button onClick={() => addFuelSupply()}
                           style={{ backgroundColor: "#009E8B",marginTop:"32px", height:"50px"}}>
                      <FaPlus/> Adicionar
                   </Button>
                </Col>
              </Row>
               <Row className="d-flex mt-3">
                  { fuelSupplies.length > 0 ? <>
                          {windowWidth > 795 && 
                            <TableStyle columnNames={columns} data={dataForTable(fuelSupplies)} />}

                          {windowWidth <= 795 &&  
                            <IndexCardsStyle names={columns} data={dataForTable(fuelSupplies)}/>}
                                                 
                       </>
                       :
                      <Card style={{padding:"10px"}}>Não há abastecimentos alocados a nota</Card>
                  }

               </Row>
            </>}
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button type="submit"
                        style={{ backgroundColor: "#009E8B", width:"100px", height:"60px"}}>
                   Salvar
                </Button>
             </Row> 
          </Form>
        </CardBody>

        <ModalStyle size={sizeModal} open={openModal} title={typeModal} 
                    onClick={() => {if(typeModal == "Atualizar Quilometragem") setChangedMileage("confirmed");}}
                    onCancel={() => {if(typeModal == "Atualizar Quilometragem") setChangedMileage("not_change");
                                      setOpenModal(!openModal);}}
                    toggle={() => {setOpenModal(!openModal);}}
                    noButtons={typeModal == "Imagem"}
                    textButtons={["Confirmar",typeModal == "Atualizar Quilometragem" ?"Não Confirmar e Salvar Abastecimento" : "Cancelar"]}>
            {typeModal == "Imagem" && previewImage && (
               <img
                   src={previewImage}
                   alt="Preview"
                   style={{ maxWidth: "100%", maxHeight: "80vh" }}
               />
            )}
            {typeModal == "Atualizar Quilometragem" && 
              <div>
                A quilometragem digitada é maior que a atual do veículo, deseja confirmar a atualização?
              </div>}
        </ModalStyle>

      
       
        {activeAlert && (
            <AlertMessage type={alert["type"]}
                text={alert["text"]}
                isOpen={isOpen}
                toggle={onDismiss}>
            </AlertMessage>
         )}
       
    </>)
  }