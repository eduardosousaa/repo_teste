import { Fragment } from "react";
import { Row, Col, Input, Pagination, PaginationItem, PaginationLink } from "reactstrap";

export default function PaginationStyle({number,setNumber,size,setSize,pageElements,totalElements,totalPages}){

    return ( 
        <Row className="d-flex mt-3 mb-2">
           <Col sm="4">
             <div className="d-flex bd-highlight"  >
                <div className=" px-2 bd-highlight">
                    <Input type="select" bsSize={"sm"}
                           defaultValue={size}
                        onChange={(e) => {setSize(e.target.value);
                                          setNumber(0)}}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </Input>
                </div>
             </div>
            </Col>

            <Col sm="4">
              <Pagination size={"sm"} style={{gap:"2%",
                                              marginTop: "20px",
                                              display:"flex",
                                              justifyContent:"center",
                                              alignItems:"center",
                                              backgroundColor:"rgba(255,255,255,0.92)",
                                              borderRadius:"30px",
                                              boxShadow:"0px 0px 10px 0px rgba(0, 0, 0, 0.10)"}}>
                <PaginationItem>
                   <PaginationLink onClick={() => {setNumber(0)}} style={{border:"none", color:"#6A6868"}} first/>
                </PaginationItem>
                { number - 1 != -1 && <PaginationItem>
                   <PaginationLink onClick={() => {setNumber(number - 1)}} style={{border:"none", color:"#6A6868"}} previous/>
                </PaginationItem>}
               
                 {/* { [...Array(totalPages)].map((_,index) => (
                <PaginationItem key={index} active={index == number}>
                   <PaginationLink onClick={() => {setNumber(index)}} style={{border:"none", color:"#6A6868",
                                                                              ...(index == number && {backgroundColor:"#009e8b"})}}>{index + 1}</PaginationLink>
                </PaginationItem>))} */}

                { [...Array(totalPages)].map((_,index) => (
                   <Fragment key={index}>
                    
                     {((index < 2 || index >= totalPages - 2) || 
                       (index >= number - 1  && index < number + 2)) && 
                       <PaginationItem active={index == number}>
                          <PaginationLink onClick={() => {setNumber(index)}} style={{border:"none", color:"#6A6868",backgroundColor:"transparent",/* width:"27px", */textAlign:"center",
                                                                                     ...(index == number && {backgroundColor:"#009e8b"})}}>{index + 1}</PaginationLink>
                       </PaginationItem>}
                    {((index == 1 && number > 3) || 
                      (index == number + 1  && index <= totalPages - 4)  && 
                       totalPages > 5) && "..." }   
                    </Fragment>))}
                
                { number + 1 < totalPages && <PaginationItem>
                   <PaginationLink onClick={() => {setNumber(number + 1)}} style={{border:"none", color:"#6A6868"}} next/>
                </PaginationItem>}
                <PaginationItem>
                   <PaginationLink onClick={() => {setNumber(totalPages - 1)}} style={{border:"none", color:"#6A6868"}} last/>
                </PaginationItem>
              </Pagination>
            </Col>

            <Col style={{display:'flex', alignItems:'center', justifyContent:'center', marginTop:'20px'}}>
             <p>
                 Exibindo {pageElements} de {totalElements} linha(s)
             </p>
            </Col>  
       </Row>
    );
}