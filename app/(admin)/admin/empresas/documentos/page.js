"use client"
import { useState, useEffect, useContext } from "react";
import Constantes from "../../../../../src/Constantes";
import { AuthContext } from '../../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsCheckSquare  } from "react-icons/bs";
import { CgCloseR } from "react-icons/cg";
import { FaFileExport, FaFileDownload } from "react-icons/fa";
import styles from "../empresas.module.css";
import { Row, Col, Form, Button, Input, Card, CardHeader,CardBody,CardFooter,
         Table
 } from "reactstrap";
import LoadingGif from "../../../../../src/Components/ElementsUI/LoadingGif";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import TableStyle from "../../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../../src/Components/ElementsUI/InputForm";
import ModalStyle from "../../../../../src/Components/ElementsUI/ModalStyle";
import FormatarData from "../../../../../src/Utils/FormatarData";

export default function Page() {

   const { "token2": token2 } = parseCookies();

   const router = useRouter();
   const { permissions } = useContext(AuthContext);
      
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
   }

   const [loading, setLoading] = useState(true);

   const [columns, setColumns] = useState(["Nome","Data de Expedição", "Data de Validade"/* ,"Status" */,"Ações"]);

   const [documents, setDocuments] = useState([]);
   const [documentId, setDocumentId] = useState(null);

   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);

   const [generateReport, setGenerateReport] = useState(false);

   const [openModal, setOpenModal] = useState(false);

   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
   
   const {
       register,
       handleSubmit,
       setError,
       clearErrors,
       control,
       setValue,
       formState: { errors },
    } = useForm({ /* defaultValues: pessoa */ });


   function dataForTable(data){
      let tableData = [];

      data.forEach(d => 
          tableData.push({
            "name": d.name,
            "emissionDate": FormatarData(d.emissionDate,"dd/MM/yyyy"),
            "expirationDate": FormatarData(d.expirationDate,"dd/MM/yyyy"),
            /* "status": <Card style={{alignItems:"center",
                                    width:"fit-content",
                                    padding:"4px 12px",
                                    color:"#348d16",
                                    backgroundColor:"#58eb25",
                                    borderColor:"#348d16",
                                    borderRadius:"10px"}}>Ativo</Card>, */
            ...(!generateReport && {"actions": actionButtons(d.id)})
          })
      );

      return tableData;
   }

   function actionButtons(id){
    return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                        ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}> 
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/empresas/documentos/${id}`);}}><FaFileDownload/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Novo Upload
                   </div>
                 </div>
               </div>
             </div>
             {/* <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {setStatus(id)}}>{ status == "ACTIVE" ? <CgCloseR size={"1.5em"}/> : <BsCheckSquare/> }</Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                     { status == "ACTIVE" ? "Desativar" : "Ativar" }
                   </div>
                 </div>
               </div>
             </div> */}
             {/* <div className={styles.balloon_div}>
               <Button className={styles.button}onClick={() => {setUserId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div> */}
           </div>;
   }
                                                    

   function getDocuments(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackDocuments + "company/documents?" + new URLSearchParams(query), {
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
             
             switch(status){
                 case 200:
                   setDocuments(body.content);
                   setNumber(body.page.number);
                   setSize(body.page.size);
                   setTotalElements(body.page.totalElements);
                   setTotalPages(body.page.totalPages);
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

   function deleteDocument(){
      fetch(Constantes.urlBackAdmin + `company/documents/${documentId}`, {method: "DELETE",
          headers: {
              "Accept": "application/json",
              "Content-Type": "application/json",
              "Module": "ADMINISTRATION",
              "Authorization": token2
          },})
          .then((response) => response.status) 
          .then((status) => {
               switch(status){
                   case 201:
                     showAlert("success", "Excluído com sucesso!");
                   break;
                   case 401:
                     showAlert("danger","Erro de autorização");
                   break;
                   case 404:
                     showAlert("danger","Error ao Apagar Documento da Empresa");
                   break;   
               }
              getDocuments();
              setOpenModal(false);
          })
          .catch((error) => {
             console.log(error);
          }) 
   }

   function generateCSV(){
      let reportTitle = "Relatório de Documentos a Vencer";
      const csvData = [];

      csvData.push(['Sistema de Administração da Frota']);
      csvData.push([reportTitle]);
      csvData.push([]);

      const headers = columns.filter((c) =>  c != "Ações");
      csvData.push(headers.map(h => String(h).replace(/<[^>]+>/g, '')));
      const displayData = dataForTable(documents);

      displayData.forEach(row => {
       
        const rowValues = [];
        for(const [key,value] of Object.entries(row)){      
          if(key != "actions") rowValues.push(value);
        }

        csvData.push(rowValues);
      });
      

      let csvString = '';
      csvData.forEach(row => {
        csvString += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
      });

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Seu navegador não suporta download automático de CSV. Salve o conteúdo manualmente.');
      }

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
      getDocuments();
   },[number,size]);

   return (<>

       { loading && <LoadingGif/>}


        <CardHeader className={styles.header}>
          <div style={{display:"flex",alignItems: "center"}}>
            <IoArrowBackCircleSharp style={{width:"9%",height:"70px",color:"#009E8B"}}
                                     onClick={() => {router.back()}}/>
            <h1 className={styles.header_h1}>Documentos da Empresa</h1>
          </div>
         
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/empresas/documentos/create");}}>
             Cadastrar <FaPlus />
          </Button>
        </CardHeader>

       
        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
          <Form onSubmit={handleSubmit(getDocuments)}>
            <Row className="d-flex mt-3">
                <Col sm="3">
                  <InputForm
                    id="name"
                    name="name"
                    label="Nome"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
                </Col>  
            </Row>

            {checkPermission("Report_View") && <Col sm="12" style={{paddingLeft:"10px",fontSize:"20px",
                                      display:"flex", gap:"12px"}}>
                    <Input name="check" 
                           type="checkbox"
                           checked={generateReport}
                           onChange={() => {if(generateReport) setColumns(["Nome","Data de Expedição", "Data de Validade","Ações"]);
                                            else setColumns(["Nome","Data de Expedição", "Data de Validade"]);
                                            setSize(generateReport ? 5 : 100);
                                            setGenerateReport(!generateReport)}}
                           className={styles.radioButton}>
                    </Input>
                    Gerar Relatório
            </Col>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
              
             {generateReport && <Button onClick={() => { generateCSV()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                Exportar <FaFileExport />
              </Button>}

              <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px"}}>
                Limpar <FaEraser />
              </Button>

              <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px", marginRight:"10px"}}>
                Filtrar <FaFilter />
              </Button>
            </Row> 
          </Form>
        </CardBody>

        <CardBody style={{width:"90%",backgroundColor:"#fff"}}>
             {windowWidth > 795 && 
               <TableStyle columnNames={columns} data={dataForTable(documents)} />}
             {windowWidth <= 795 &&  
               <IndexCardsStyle names={columns} data={dataForTable(documents)}/>}
        </CardBody>

        {!generateReport && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

              <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={documents.length} totalElements={totalElements} totalPages={totalPages}/>
            
        </CardFooter>}

        <ModalStyle  open={openModal} title={"Remover Empresa"} onClick={() => {deleteDocument()}} toggle={() => setOpenModal(!openModal)}>
            Cuidado essa ação poderá ser desfeita!
        </ModalStyle>       
    </>)
  }