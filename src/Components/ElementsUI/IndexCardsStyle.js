import { Fragment } from "react";
import {Card, CardHeader, CardBody, Label} from 'reactstrap';

export default function CardItemStyle({names, data}){

     return (<>
           { data.map((e,index)  => 
            <Card key={index} style={{borderRadius: "15px",marginTop:"20px"}}>
               <CardHeader style={{backgroundColor:"#009e8b", color:"#fff", fontSize: "1.2rem", fontWeight:"bold",
                                   borderTopLeftRadius: "15px", borderTopRightRadius: "15px"}}>
                {/* {names[0]}:  */}{e[Object.keys(e)[0]]}
               </CardHeader>
               <CardBody style={{backgroundColor: index%2 == 0 ? "#ddffff": "#d2f2f2",
                                 borderBottomLeftRadius: "15px",
                                 borderBottomRightRadius: "15px"}}>

                 {Object.keys(e).map((prop,index2) => 
                    index2 != 0 &&
                     <Fragment key={index2}>
                      { names[index2] != "Ações" ? 
                         <><Label style={{ fontWeight: "bold", fontSize: "16px" }}>{names[index2]}:</Label> {e[prop]}<br/></> : e[prop]}
                     </Fragment>
                 )}
               </CardBody>
            </Card>
          )}
      </>)
}