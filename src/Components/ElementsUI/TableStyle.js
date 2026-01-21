import {Table} from "reactstrap";

export default function TableStyle({columnNames,data,noStriped,
                                    radius = "rounded"}){

    return (
        <Table striped={noStriped ? false : true}>
            <thead>
               <tr style={{fontSize:"1.2rem"}}>
                { columnNames.map((name,index) =>  
                   <th key={index} style={{backgroundColor:"#009e8b",color:"#fff", 
                               ...(radius == "rounded" && index == 0 && {borderTopLeftRadius: "15px"}),
                               ...(radius == "rounded" && index == columnNames.length - 1  && {borderTopRightRadius: "15px"})}}>{name}</th>)}
               </tr>
            </thead>
            <tbody>
                { data.map((e,index)  => 
                  <tr key={index}>
                    {Object.keys(e).map((prop,index2) =>  
                       <td key={index2} style={{backgroundColor:"#ddffff", borderBottomWidth:0,
                                    ...((radius == "rounded" && index == data.length - 1 && index2 == 0) && { borderBottomLeftRadius: "15px"}),
                                    ...((radius == "rounded" && index == data.length - 1 && index2 == Object.keys(e).length -1 ) && { borderBottomRightRadius: "15px"}),
                                  }}>
                            {e[prop]}
                       </td>
                    )}
                  </tr>
                )}
            </tbody>
       </Table>
    );
}