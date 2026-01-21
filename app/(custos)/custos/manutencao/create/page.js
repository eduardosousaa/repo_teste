"use client"
import { useState, useEffect } from "react";
import Constantes from "../../../../../src/Constantes";
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem ,
        Col, Form, FormGroup, Label, Row, Button, Table,
        Card,CardHeader,CardBody } from 'reactstrap';
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { BiTrash } from "react-icons/bi";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { SlArrowDown } from "react-icons/sl";
import { MdDriveFolderUpload, MdOutlinePhotoCamera} from "react-icons/md";
import { RiDownloadFill } from "react-icons/ri";
import { TiDelete } from "react-icons/ti";
import AlertMessage from "../../../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from  "../../../../../src/Components/ElementsUI/LoadingGif";
import styles from "../manutencao.module.css";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import AsyncSelectForm from "../../../../../src/Components/ElementsUI/AsyncSelectForm";
import TableStyle from  "../../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../../src/Components/ElementsUI/IndexCardsStyle";
import ModalStyle from "../../../../../src/Components/ElementsUI/ModalStyle"; 
import FormatarData from "../../../../../src/Utils/FormatarData";
import FormatarReal from "../../../../../src/Utils/FormatarReal";
import MaskTime from "../../../../../src/Utils/MaskTime";
import MaskReal from "../../../../../src/Utils/MaskReal";

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
	} = useForm({ defaultValues: {
                  part:{
                     productId: "",
                     locationId: "",
                     quantity: "0"
                  },
                }});

   const [open, setOpen] = useState(["register","address","vehicles"]);
   const [loading, setLoading] = useState(false);

   const router = useRouter();

   const [openModal, setOpenModal] = useState(false);
   const [typeModal, setTypeModal] = useState("");
   const [sizeModal, setSizeModal] = useState("lg");
   const [previewImage, setPreviewImage] = useState(null);

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

   const [photos, setPhotos] = useState([]);

   const [documents, setDocuments] = useState([/* {arquivo: null,
                                                arquivoBlob: null,
                                                descricao: "arquivo.pdf"} */]);

   const [invoiceDocBlob, setInvoiceDocBlob] = useState(null);

   const [vehicles, setVehicles] = useState([]);
   const [vehicleIndex, setVehicleIndex] = useState();
   
   const [parts, setParts] = useState([]);

   const [changedMileages, setChangedMileages] = useState([/*{vehicleId:"",mileage:0}*/]);

   const [alert, setAlert] = useState({});
   const [activeAlert, setActiveAlert] = useState(false);
   const [isOpen, setIsOpen] = useState(true);
   const onDismiss = () => setIsOpen(false);

   const [showAsync, setShowAsync] = useState(true);

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
                 "label": dado.name,
                 "address" : dado.address
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


    const productOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       url =  "product?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackStock + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "STOCK",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
       
             let dadosTratados = [];
       
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": dado.description
                }));
       
                 return dadosTratados;
          });
    };

    const perMaintenancesOptions = (teste) => {
           let url; 
           let query = {};
           query.size = 100;
           query.name = teste;

           let vehicleId = getValues("new_vehicle.vehicleId");
           if(vehicleId == "" || vehicleId == null || vehicleId == undefined) return []; 

           url = `vehicle/${vehicleId}/periodic_maintenance?` + new URLSearchParams(query);
           
           return fetch(Constantes.urlBackPatrimony + url, {
               method: "GET",
               headers: {
                   "Accept": "application/json",
                   "Content-Type": "application/json",
                   "Module": "PATRIMONY",
                   "Authorization": token2
               },
           })
           .then((response) => response.json())
           .then((data) => {
            
             let dadosTratados = [];
       
             data["content"].forEach(dado =>
                dadosTratados.push({
                 "value":  dado.id,
                 "label": dado.name,
                }));
             
             return dadosTratados;
           });
    }


    const locationOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       query.typeLocation = "LOCATION";
       url =  "stock?" + new URLSearchParams(query);
       
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

    const inputProductOptions = (teste) => {
       let url;
       let query = {};
       query.size = 100;
       query.name = teste;
       query.productId = getValues("part.productId");
       query.locationId = getValues("part.locationId");
       url =  "product_registration/input_product?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackStock + url, {method: "GET",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "STOCK",
              "Authorization": token2
          },})
          .then((response) => response.json())
          .then((data) => {
       
             let dadosTratados = [];
       
             data["content"].forEach(dado => {

                let index = parts.findIndex((part) => part.inputProductId == dado.id);
          
               
                dadosTratados.push({
                 "value":  dado.id,
                 "label": /* dado.description +  */"Qtd: " + (index != -1 ? (parts[index].quantityStock - parts[index].quantity)  : dado.quantityStock) 
                                                  + " Vld: " + FormatarData(dado.expirationDate,"dd/MM/yyyy") 
                                                  + " Prc: R$" + String(FormatarReal(dado.price.toFixed(2))),
                 "description": dado.description,
                 "quantityStock": dado.quantityStock,
                 "expirationDate": dado.expirationDate,
                 "price": dado.price
                })
            });
       
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

   function addVehicle(changeMileage){
      let newVehicle = getValues("new_vehicle");
     
      for(const [key,value] of Object.entries(newVehicle)){
         if((key != "vehicleMileage" || key != "mileage") && value == "") {return showAlert("warning", "Preencha todos os dados do veículo!");}
      }

      if(changeMileage == "not_confirmed" && newVehicle.mileage > newVehicle.vehicleMileage){
         setTypeModal("Atualizar Quilometragem");
         setSizeModal("md");
         setOpenModal(true);
         return;
      }
      
      if(changeMileage == "confirmed"){
         setChangedMileages([...changedMileages,{vehicleId: newVehicle.vehicleId,
                                                 mileage: newVehicle.mileage}]);
         setOpenModal(false);
      }

      setVehicles([...vehicles,{vehicleId:  newVehicle.vehicleId,
                                plate:  newVehicle.plate,
                                value: newVehicle.value,
                                mileage: newVehicle.mileage + " km",
                                date: newVehicle.date,
                                /* hour: newVehicle.hour, */
                                periodicMaintenanceToVehicleIds: newVehicle.periodicMaintenanceToVehicleIds || [],
                                description: newVehicle.description,
                                outputProductRegistration: []}]);
   }

   function removeVehicle(index){
      setChangedMileages(changedMileages.filter((a) => { a.vehicleId != vehicles[index].vehicleId}));
      setVehicles(vehicles.filter((_,i) => i != index));
   }

   function dataForTable(data){
      let tableData = [];
      //"Veiculo","Quilometragem","Valor","Descrição","","Ações"
      data.forEach((d,index) => 
          tableData.push({
            "plate": d.plate,
            "mileage": d.mileage,
            "value": d.value,
            "date_hour": FormatarData(d.date,"dd/MM/yyyy")/*  + " | " + d.hour */,
            "description": d.description,
            "insert_parts": <span style={{color:"#1fcec9",borderBottom:"1px solid #1fcec9",cursor:"pointer"}} onClick={() => {checkPartsVehicle(index);setVehicleIndex(index)}}>Adicionar peças&nbsp;&nbsp;&nbsp;<SlArrowDown/></span>,
            "actions": actionButtons(index)
          })
      );

      return tableData;
   }

   function checkPartsVehicle(index){
      if(vehicles[index].outputProductRegistration.length > 0) setParts(vehicles[index].outputProductRegistration);
      setTypeModal("Adicionar Peças");
      setSizeModal("lg");
      setOpenModal(true);
   }

   function addPart(){
      let part = getValues("part");
      console.log(part);
      if(typeof part.inputProduct !== 'object' ||  (typeof part.inputProduct === 'object' && Object.keys(part.inputProduct).length === 0)) return showAlert("warning", "Selecione a entrada!");
      if(part.quantity == "0" || part.quantity == "") return showAlert("warning", "Selecione a quantidade!");
      
      let index = parts.findIndex((p) => p.inputProductId == part.inputProduct.value);

      if( (index == -1 && parseInt(part.quantity) >  part.inputProduct.quantityStock) 
       || (index != -1 && parseInt(parts[index].quantity) + parseInt(part.quantity)) >  part.inputProduct.quantityStock) return showAlert("warning", "Quantidade maior que a disponível!");

      if(index != -1){
         setParts(parts.map((p,i) =>{
              if(index == i) p.quantity = String(parseInt(parts[index].quantity) + parseInt(part.quantity)); 
               return p;
              }));
      }else{
         setParts([...parts, {inputProductId: part.inputProduct.value, 
                              description: part.inputProduct.description,
                              quantityStock: part.inputProduct.quantityStock,
                              quantity: part.quantity,
                              expirationDate: part.inputProduct.expirationDate,
                              price: part.inputProduct.price,
                           }]);
      }
      setValue("part.inputProduct","");
      setShowAsync(false);
   }

   function removePart(index){
      setParts(parts.filter((_,i) => i != index));
      setShowAsync(false);
   }

   function clearPartForm(){
      setValue("part.productId","");
      setValue("part.locationId","");
      setValue("part.inputProduct",null);
      setValue("part.quantity","");
      setParts([]);
   }

   function addPartsToVehicle(){
      console.log(parts);
      setVehicles(vehicles.map((vehicle,index) => {
           if(index == vehicleIndex) vehicle.outputProductRegistration = parts;
           return vehicle;
      }));

      clearPartForm();
      setOpenModal(!openModal);
   }

   function actionButtons(index){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap"}}>
             <div className={styles.balloon_div}>
               <Button className={styles.button}
                       onClick={() => {removeVehicle(index)}}><BiTrash/></Button>
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

   function updateMileages(){
      let data = changedMileages.map((a) => {return {id:a.vehicleId, 
                                                     mileage: a.mileage}});
      setLoading(true);
      
      let url = "vehicle/mileage";
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
                 setChangedMileages(["changed"]);
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
     
      setLoading(true);
 
      const formData = new FormData();
      let post = { ...data, maintenanceCosts: vehicles};
      delete post.new_vehicle;
      delete post.part;
      
      if(post.invoiceValue != ""){
         post.invoiceValue = post.invoiceValue.replaceAll(".","");
         post.invoiceValue = parseFloat(post.invoiceValue.replace(",","."));
      }

      if(post.invoiceDoc) formData.append("invoiceDoc",post.invoiceDoc,"nota_fiscal.pdf");      

      if(post.maintenanceCosts.length > 0){
         post.maintenanceCosts.map((vehicle) => {

             if(typeof vehicle.value === "string"){
                vehicle.value = vehicle.value.replaceAll(".","");
                vehicle.value = parseFloat(vehicle.value.replace(",","."));
             }

             if(typeof vehicle.mileage === "string"){
                vehicle.mileage = vehicle.mileage.replaceAll(" km","");
                vehicle.mileage = parseFloat(vehicle.mileage);
             }
             
             return vehicle;
         })

         if(changedMileages.length > 0 && !changedMileages.includes("changed")) return updateMileages();
      }

      if(photos.length > 0) photos.forEach((photo) => { formData.append("images",photo.arquivo,photo.descricao)});

      if(documents.length > 0) documents.forEach((document) => { formData.append("files",document.arquivo,document.descricao)});


      const jsonString = JSON.stringify(post);
      const jsonBlob = new Blob([jsonString], { type: "application/json"});
      formData.append("maintenance",jsonBlob,"maintenance.json");
      let url = "manitenance";
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
                 showAlert("success", "Serviço cadastro com sucesso!");
                 router.push("/custos/manutencao");
               break;
               case 400:
                 setErrors(apiErrors);
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
     if(!showAsync) setShowAsync(true);
   },[showAsync]);

   useEffect(() => {
     if(changedMileages.includes("changed")) submit(getValues());
   },[changedMileages]);

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header} style={{justifyContent:"flex-start", alignItems: "center"}}>
           <IoArrowBackCircleSharp style={{width:"45px",height:"70px",color:"#009E8B",cursor:"pointer"}}
                                   onClick={() => {router.back()}}/>
           <h1 className={styles.header_h1}>Cadastro Serviços de Manutenção</h1>
        </CardHeader>
        
        <CardBody style={{width:"90%"}}>
           <Form onSubmit={handleSubmit(submit)}>
            <Accordion open={open} toggle={toggle} style={{flex:"1"}}>
               <AccordionItem>
                  <AccordionHeader targetId="register">
                     <span className={styles.accordionTitle}>Registro do serviço</span></AccordionHeader>
                  <AccordionBody accordionId="register" style={{padding:"15px"}}>
                   <Row className="d-flex mt-3">
                     <Col sm="6">
                         <InputForm
                          id="place"
                          name="place"
                          label="Local Responsável*"
                          placeholder="--Digite--"
                          register={register}
                          required={true}
                          type="text"
                          errors={errors}
                         />
                     </Col>
                     <Col sm="6">
                        <AsyncSelectForm
                          id="supplierId"
                          name="supplierId"
                          label="Fornecedor*"
                          register={register}
                          required={true}
                          onChange={(e) => {setValue(`supplierId`,e ? e.value : "");
                                            if(e){ setValue('address',e.address);
                                            }else{
                                              setValue('address.zip',"")
                                              setValue('address.address',"")
                                              setValue('address.neighborhood',"")
                                              setValue('address.number',"")
                                              setValue('address.complement',"")
                                              setValue('address.city',"")
                                              setValue('address.state',"")
                                            }}}
                          errors={errors}
                          options={supplierOptions}
                        />
                     </Col>
                   </Row>
                   <Row className="d-flex mt-3">
                      <Col sm="2">
                         <InputForm
                          id="address.zip"
                          name="address.zip"
                          label="CEP"
                          placeholder="--Digite--"
                          register={register}
                          required={false}
                          disabled={true}
                          type="text"
                          errors={errors}
                         />
                       </Col>
                      <Col sm="8">
                         <InputForm
                           id="address.address"
                           name="address.address"
                           label="Logradouro"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           disabled={true}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                       <Col sm="2">
                         <InputForm
                           id="address.neighborhood"
                           name="address.neighborhood"
                           label="Bairro"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           disabled={true}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                   </Row>
        
                   <Row className="d-flex mt-3">
                      <Col sm="2">
                         <InputForm
                          id="address.number"
                          name="address.number"
                          label="Número"
                          placeholder="--Digite--"
                          register={register}
                          required={false}
                          disabled={true}
                          type="text"
                          errors={errors}
                         />
                       </Col>
                      <Col sm="5">
                         <InputForm
                           id="address.complement"
                           name="address.complement"
                           label="Complemento"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           disabled={true}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                       <Col sm="4">
                         <InputForm
                           id="address.city"
                           name="address.city"
                           label="Cidade"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           disabled={true}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                       <Col sm="1">
                         <InputForm
                           id="address.state"
                           name="address.state"
                           label="Estado*"
                           placeholder="--Digite--"
                           register={register}
                           required={false}
                           disabled={true}
                           type="text"
                           errors={errors}
                         />
                       </Col>
                   </Row>

                   <Row className="d-flex mt-3">
                     <Col sm="6">
                         <InputForm
                          id="responsible"
                          name="responsible"
                          label="Profissional Responsável"
                          placeholder="--Digite--"
                          register={register}
                          required={false}
                          type="text"
                          errors={errors}
                         />
                     </Col>
                   </Row>
                   
                   <Row className="d-flex mt-3">
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

                                     <TiDelete size={40} color="#e32c2c" style={{position:"absolute",top:"5px",right:"5px",cursor:"pointer"}} onClick={() => setPhotos(photos.filter((_,i) => i != index))}/>
                                     {/* <div style={{backgroundColor:"#FFFFFF",
                                                  border:"2px dashed #D1D5DB",
                                                  padding:"16px",
                                                  display:"flex",
                                                  flexDirection:"column",
                                                  alignItems:"center",
                                                  justifyContent:"center",
                                                  width:"200px",height:"118px"}}> */}

                                      <img /* style={{width:"200px",maxHeight:"118px"}} */
                                           style={{ cursor:"pointer", width: "100%", height: "auto", maxHeight: "120px", objectFit: "cover"}} src={photo.arquivoBlob}
                                           onClick={() => {setPreviewImage(photo.arquivoBlob);setTypeModal("Imagem");setSizeModal("lg");setOpenModal(true)}}/>
                                      <p style={{ cursor:"pointer", fontSize: "12px", textAlign: "center", marginTop: "5px", overflowWrap: "break-word" }}
                                         onClick={() => {setPreviewImage(photo.arquivoBlob);setTypeModal("Imagem");setSizeModal("lg");setOpenModal(true)}}>{photo.descricao}</p>
                                                
                                     {/* </div> */}
                                 </div>
                             </Col>
                           )}
                       </Row>
                     </Col>}
                   </Row>
                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="address">
                     <span className={styles.accordionTitle}>Distribuição de custos</span></AccordionHeader>
                  <AccordionBody accordionId="address" style={{padding:"15px"}}>
                    <Row className="d-flex mt-3">
                       <Col sm="4">
                          <InputForm
                            id="invoiceNumber"
                            name="invoiceNumber"
                            label="N° Nota Fiscal*"
                            placeholder="--Digite--"
                            register={register}
                            required={true}
                            type="text"
                            errors={errors}
                           />
                       </Col>
                       <Col sm="4">
                          <InputForm
                            id="invoiceData"
                            name="invoiceData"
                            label="Data de Emissão*"
                            placeholder="dd/mm/aaaa"
                            register={register}
                            required={true}
                            type="date"
                            errors={errors}
                          />
                       </Col>
                       <Col sm="4">
                          <InputForm
                            id="invoiceValue"
                            name="invoiceValue"
                            label="Valor Total*"
                            placeholder="--Digite--"
                            register={register}
                            required={true}
                            onChange={(e) => MaskReal(e)}
                            type="text"
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

                  </AccordionBody>
               </AccordionItem>
               <AccordionItem>
                  <AccordionHeader targetId="vehicles">
                    <span className={styles.accordionTitle}>Selecionar veículos</span></AccordionHeader>
                  <AccordionBody accordionId="vehicles" style={{padding:"15px"}}>
                     <Row className="d-flex mt-3">
                      <Col sm="6">
                          <AsyncSelectForm
                            id="new_vehicle.vehicleId"
                            name="new_vehicle.vehicleId"
                            label="Veículo"
                            register={register}
                            required={false}
                            onChange={(e) => {setValue('new_vehicle.vehicleId',e ? e.value : "");
                                              setValue('new_vehicle.plate',e ? e.label : "");
                                              setValue('new_vehicle.vehicleMileage',e ? e.mileage : 0);
                                              setShowAsync(false);}}
                            options={vehicleOptions}
                            errors={errors}
                          />
                       </Col>
                       <Col sm="3">
                          <InputForm
                             id="new_vehicle.value"
                             name="new_vehicle.value"
                             label="Valor"
                             placeholder="--Digite--"
                             register={register}
                             required={false}
                             onChange={(e) => MaskReal(e)}
                             type="text"
                             errors={errors}
                           />
                       </Col>
                       <Col sm="3">
                          <InputForm
                             id="new_vehicle.mileage"
                             name="new_vehicle.mileage"
                             label="Quilometragem"
                             placeholder="--Digite--"
                             register={register}
                             required={false}
                             type="text"
                             errors={errors}
                           />
                       </Col>
                     </Row>
                     <Row className="d-flex mt-3">
                     <Col sm="3">
                       <InputForm
                          id="new_vehicle.date"
                          name="new_vehicle.date"
                          label="Data"
                          placeholder="dd/mm/aaaa"
                          register={register}
                          required={false}
                          type="date"
                          errors={errors}
                        />
                     </Col>
                     {showAsync && <Col sm="3">
                       <AsyncSelectForm
				           	  id="new_vehicle.periodicMaintenanceToVehicleIds"
				           	  name="new_vehicle.periodicMaintenanceToVehicleIds"
				           	  label="Manutenção Periódica"
				           	  placeholder="--Selecione--"
				           	  options={perMaintenancesOptions}
				           	  required={false}
                          isMulti={true}
                          onChange={(p) => {setValue('new_vehicle.periodicMaintenanceToVehicleIds',p.map((p1) => {return p1.value}));}}
				           	  errors={errors}
				           />
                     </Col>}
                   </Row>
                     <Row className="d-flex mt-3">
                       <Col sm="12">
                         <InputForm
                             id="new_vehicle.description"
                             name="new_vehicle.description"
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
                         <Col sm="auto">
                             <Button onClick={() => {addVehicle("not_confirmed")}}
                                     style={{ backgroundColor: "#009E8B",/*  width: "25%", */ height: "50px" }}>
                              Adicionar <FaPlus/>
                             </Button>
                         </Col>
                     </Row>
                     <Row className="d-flex mt-3">
                       <Col sm="12">
                         { vehicles.length > 0 ? <>
                              {windowWidth > 795 && 
                                <TableStyle columnNames={["Veículo","Quilometragem","Valor","Data"/*  | Hora" */,"Descrição","","Ações"]} data={dataForTable(vehicles)}/>}
                              {windowWidth <= 795 &&  
                                <IndexCardsStyle names={["Veículo","Quilometragem","Valor","Data"/*  | Hora" */,"Descrição","","Ações"]} data={dataForTable(vehicles)}/>}
                              
                            </> 
                           :   
                            <Card style={{padding:"10px",marginBottom:"20px"}}>Não há veículos</Card>
                         }
                       </Col>
                     </Row>
                  </AccordionBody>
               </AccordionItem>
            </Accordion>    
             
          
            <Row className="d-flex mt-3 justify-content-end">
                <Button onClick={handleSubmit(submit)}
                        style={{ backgroundColor: "#009E8B", width:"100px", height:"60px"}}>
                  Salvar
                </Button>
             </Row> 
          </Form>
        </CardBody>

        <ModalStyle  open={openModal} title={typeModal} 
                     onClick={() => {if(typeModal == "Adicionar Peças") addPartsToVehicle();
                                     if(typeModal == "Atualizar Quilometragem") addVehicle("confirmed");}} 
                     onCancel={() => {if(typeModal == "Adicionar Peças") clearPartForm()
                                      if(typeModal == "Atualizar Quilometragem") addVehicle()
                                      setOpenModal(!openModal);}}
                     toggle={() => {setOpenModal(!openModal);}}            
                     size={sizeModal}
                     noButtons={typeModal == "Imagem"}
                     textButtons={["Confirmar",typeModal == "Atualizar Quilometragem" ?"Não Confirmar e Adicionar Veículo" : "Cancelar"]}>
               {typeModal == "Adicionar Peças" && <Row className="d-flex mt-3">
                  <Col sm="6">
                     <Row className="d-flex mt-3">
                       <Col sm="12">
                         <AsyncSelectForm
                             id="part.productId"
                             name="part.productId"
                             label="Selecione o produto"
                             placeholder="--Selecione--"
                             register={register}
                             onChange={(e) => {setValue('part.productId',e ? e.value : "");
                                               setShowAsync(false);}}
                             required={false}
                             type="select"
                             errors={errors}
                             options={productOptions}
                         />
                       </Col>
                        <Col sm="12">
                         <AsyncSelectForm
                             id="part.locationId"
                             name="part.locationId"
                             label="Selecione a localização"
                             placeholder="--Selecione--"
                             register={register}
                             onChange={(e) => {setValue('part.locationId',e ? e.value : "");
                                               setShowAsync(false);}}
                             required={false}
                             type="select"
                             errors={errors}
                             options={locationOptions}
                         />
                       </Col>
                       { showAsync && <Col sm="12">
                         <AsyncSelectForm
                             id="part.inputProduct"
                             name="part.inputProduct"
                             label="Selecione a entrada"
                             placeholder="--Selecione--"
                             register={register}
                             onChange={(e) => {setValue('part.inputProduct',e ? e : "")}}
                             required={false}
                             type="select"
                             isDisabled={getValues("part.productId") == "" && getValues("part.locationId") == ""}
                             errors={errors}
                             options={inputProductOptions}
                         />
                       </Col>}
                       <Col sm="12">
                          <InputForm
                             id="part.quantity"
                             name="part.quantity"
                             label="Quantidade"
                             placeholder="0"
                             register={register}
                             required={false}
                             type="number"
                             errors={errors}
                           />
                       </Col>
                     </Row>
                     <Row className="d-flex mt-3 justify-content-start">
                         <Col sm="auto">
                             <Button onClick={() =>  addPart()}
                                     style={{ backgroundColor: "#009E8B",/*  width: "25%", */ height: "40px" }}>
                              Adicionar <FaPlus/>
                             </Button>
                         </Col>
                     </Row>
                  </Col>
                  <Col sm="6">
                    <div style={{fontSize: "1.25rem", marginBottom:"20px"}}>Peças Adicionadas</div>
                    <Table>
                      <thead>
                        <tr style={{fontSize:"1.2rem"}}>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Qtd</th>
                         <th style={{backgroundColor:"#fff",borderWidth:2}}>Preço</th>
                         <th style={{backgroundColor:"#fff",width:"120px",borderWidth:2}}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parts.map((part,index) => 
                         <tr key={index}>
                            <td style={{backgroundColor: "#ddffff", ...( index == parts.length - 1 && { borderBottomWidth:0})}}>{part.description}</td>
                            <td style={{backgroundColor: "#ddffff", ...( index == parts.length - 1 && { borderBottomWidth:0})}}>{part.quantity}</td>
                            <td style={{backgroundColor: "#ddffff", ...( index == parts.length - 1 && { borderBottomWidth:0})}}>{"R$" + FormatarReal(part.price.toFixed(2))}</td>
                            <td style={{backgroundColor: "#ddffff", ...( index == parts.length - 1 && { borderBottomWidth:0})}}><BiTrash size={20} style={{cursor:"pointer"}} onClick={() => removePart(index)}/></td>
                         </tr> 
                        )}
                      </tbody>
                    </Table>
                  </Col>
               </Row>}

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