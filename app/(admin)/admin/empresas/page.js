"use client"
import { useState, useEffect, useContext } from "react";
import Constantes from "../../../../src/Constantes";
import { AuthContext } from '../../../../src/Context/AuthContext';
import { parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import MaskCnpj from "../../../../src/Utils/MaskCnpj";
import { FaPlus, FaFilter, FaEraser } from "react-icons/fa6";
import { BiInfoCircle,BiTrash } from "react-icons/bi";
import { BsPencilSquare } from "react-icons/bs";
import { FaFileExport } from "react-icons/fa";
import styles from "./empresas.module.css";
import { Row, Col, Form, Button, Input, CardHeader,CardBody,CardFooter} from "reactstrap";
import LoadingGif from "../../../../src/Components/ElementsUI/LoadingGif";
import TableStyle from  "../../../../src/Components/ElementsUI/TableStyle";
import IndexCardsStyle from  "../../../../src/Components/ElementsUI/IndexCardsStyle";
import PaginationStyle from "../../../../src/Components/ElementsUI/PaginationStyle";
import InputForm from "../../../../src/Components/ElementsUI/InputForm";
import ModalStyle from "../../../../src/Components/ElementsUI/ModalStyle";  

export default function Page() {

   const { "token2": token2 } = parseCookies();
   const { permissions } = useContext(AuthContext);
   
   function checkPermission(name){
      return permissions ? permissions.findIndex((permission) => permission.name == name) != -1 : false;
   }

   const router = useRouter();

   const [loading, setLoading] = useState(true);
  
   const [statusOptions, setStatusOptions] = useState([{id:"ACTIVE",name:"Ativo"},
                                                       {id:"INACTIVE",name:"Inativo"}]);

   const [columns, setColumns] = useState(["Nome","CNPJ","Ações"]);
   const [companies, setCompanies] = useState([]);

   const [number, setNumber] = useState(0);
   const [size, setSize] = useState(5);
   const [totalElements, setTotalElements] = useState(0);
   const [totalPages, setTotalPages] = useState(0);

   /* ---------------------------------------------------------------- */

   const [columnsDoc, setColumnsDoc] = useState(["Nome","Data de Expedição", "Data de Validade"/* ,"Status" */,"Ações"]);

   const [documents, setDocuments] = useState([]);
   const [documentId, setDocumentId] = useState(null);

   const [numberDoc, setNumberDoc] = useState(0);
   const [sizeDoc, setSizeDoc] = useState(5);
   const [totalElementsDoc, setTotalElementsDoc] = useState(0);
   const [totalPagesDoc, setTotalPagesDoc] = useState(0);

   const [generateReport, setGenerateReport] = useState(false);

    /* ---------------------------------------------------------------- */

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
            "cnpj": d.cnpj,
            "actions": d.myCompany ? actionButtons(d.id) : "-"
          })
      );

      return tableData;
   }

   function actionButtons(id){
      return <div style={{display:"flex",gap:"2%",flexWrap:"wrap",
                          ...(windowWidth <= 795  && {justifyContent:"flex-end"})}}>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/empresas/${id}`)}}><BiInfoCircle/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Visualizar
                   </div>
                 </div>
               </div>
             </div>
            { checkPermission("Company_Read") && <>
             <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push(`/admin/empresas/${id}/edit`)}}><BsPencilSquare/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Editar
                   </div>
                 </div>
               </div>
             </div>
            {/* <div className={styles.balloon_div}>
               <Button className={styles.button} onClick={() => {router.push("/admin/empresas/documentos")}}><HiDocument/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Documentos
                   </div>
                 </div>
               </div>
             </div>
             <div className={styles.balloon_div}>
               <Button className={styles.button}onClick={() => {setCompanyId(id);setOpenModal(true)}}><BiTrash/></Button>
               <div className={styles.balloon_aviso_div}>
                 <div className={styles.balloon_aviso_border}>
                   <div className={styles.balloon_aviso_text}>
                      Remover
                   </div>
                 </div>
               </div>
             </div> */}</>}
             </div>;
   }

   /* function clearFilter(){
      setValue("name","");
      setValue("cnpj","");
      setValue("status",null);
      getCompanies();
   } */
                                                    
   function getCompanies(data){

      let query = {};
      query.page = number;
      query.size = size;

      if(data != undefined) query = { ...query, ...data};

      setLoading(true);

      fetch(Constantes.urlBackAdmin + "company?" + new URLSearchParams(query), {
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
                   setCompanies(body.content.filter(a => a.myCompany == true));
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

  /* ---------------------------------------------------------------- */

   function clearFilterDoc(){
      setValue("name","");
      getDocuments();
   }

   function getDocuments(data){
 
      let query = {};
      query.page = numberDoc;
      query.size = sizeDoc;
 
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
                   setNumberDoc(body.page.number);
                   setSizeDoc(body.page.size);
                   setTotalElementsDoc(body.page.totalElements);
                   setTotalPagesDoc(body.page.totalPages);
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
   
   /* ---------------------------------------------------------------- */

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
      getCompanies();
   },[number,size]);

   useEffect(() => {
      getDocuments();
   },[numberDoc,sizeDoc]);

   return (<>

        { loading && <LoadingGif/>}

        <CardHeader className={styles.header}>
         <h1 className={styles.header_h1}>Minha Empresa</h1>
        {/*  { checkPermission("Company_Read") && 
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/empresas/create");}}>
             Cadastrar <FaPlus />
          </Button>} */}
        </CardHeader>
        {/* <CardBody style={{width:"90%"}}>
          <Form onSubmit={handleSubmit(getCompanies)}>
            <Row className="d-flex mt-3">
               <Col sm="4">
                  <InputForm
                    id="name"
                    name="name"
                    label="Nome"
                    placeholder="--Digite--"
                    register={register}
                    type="text"
                  />
               </Col>
               <Col sm="4">
                  <InputForm
                    id="cnpj"
                    name="cnpj"
                    label="Cnpj"
                    placeholder="--Digite--"
                    register={register}
                    onChange={(e) => MaskCnpj(e)}
                    type="text"
                  />
               </Col>
            </Row> */}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
           {/*  <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
              <Button onClick={() => {clearFilter()}} style={{ backgroundColor: "#009E8B", width:"130px"}}>
                Limpar <FaEraser />
              </Button>

              <Button type="submit" style={{ backgroundColor: "#009E8B", width:"130px", marginRight:"10px"}}>
                Filtrar <FaFilter />
              </Button>
            </Row> 
          </Form>
        </CardBody> */}

        <CardBody style={{marginTop:"110px",width:"90%"}}>
             {windowWidth > 795 && 
              <TableStyle columnNames={columns} data={dataForTable(companies)} />}
             {windowWidth <= 795 &&  
              <IndexCardsStyle names={columns} data={dataForTable(companies)}/>} 
        </CardBody>

        {/* <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>

            <PaginationStyle number={number} setNumber={setNumber} size={size} setSize={setSize} pageElements={companies.length} totalElements={totalElements} totalPages={totalPages}/>

        </CardFooter> */}

        <div style={{fontSize: "1.5rem",marginTop:"20px", marginBottom:"20px", width:"90%",
                     paddingTop:"20px",borderTop: "1px solid rgb(222, 226, 230)"}}>
        </div>

        <CardHeader className={styles.header}>
          <div style={{display:"flex",alignItems: "center"}}>
            <h1 className={styles.header_h1}>Documentos da Empresa</h1>
          </div>
         
         <Button className={styles.header_button}
                 onClick={() => { router.push("/admin/empresas/documentos/create");}}>
             Cadastrar <FaPlus />
          </Button>
        </CardHeader>

        <CardBody style={{width:"90%"}}>
          <Form /* onSubmit={handleSubmit(getDocuments)} */>
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
                           onChange={() => {if(generateReport) setColumnsDoc(["Nome","Data de Expedição", "Data de Validade","Ações"]);
                                            else setColumnsDoc(["Nome","Data de Expedição", "Data de Validade"]);
                                            setSizeDoc(generateReport ? 5 : 100);
                                            setGenerateReport(!generateReport)}}
                           className={styles.radioButton}>
                    </Input>
                    Gerar Relatório
            </Col>}

            {/* <Row style={{ display:"flex", justifyContent:"flex-end", gap:"10px"}}> */}
            <Row className="d-flex flex-wrap justify-content-end gap-4 mt-3">
              
             {generateReport && documents.length > 0 && <Button onClick={() => { generateCSV()}} style={{ backgroundColor: "#009E8B", width:"160px",marginRight:"10px"}}>
                Exportar <FaFileExport />
              </Button>}

              <Button onClick={() => clearFilterDoc()} style={{ backgroundColor: "#009E8B", width:"130px"}}>
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
                <TableStyle columnNames={columnsDoc} data={dataForTable(documents)} />}
              {windowWidth <= 795 &&  
                <IndexCardsStyle names={columnsDoc} data={dataForTable(documents)}/>}
         </CardBody>

         {!generateReport && <CardFooter style={{width:"90%",backgroundColor:"transparent"}}>
 
               <PaginationStyle number={numberDoc} setNumber={setNumberDoc} size={sizeDoc} setSize={setSizeDoc} pageElements={documents.length} totalElements={totalElementsDoc} totalPages={totalPagesDoc}/>
             
         </CardFooter>}

        <ModalStyle  open={openModal} title="Remover Empresa" toggle={() => setOpenModal(!openModal)}>
          Cuidado essa ação poderá ser desfeita!
        </ModalStyle>       
    </>)
  }