import { Spinner } from 'reactstrap';

export default function LoadingGif(){

    return(
     <div style={{display:"flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "black",
                  opacity: "0.5",
                  position: "fixed",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  zIndex: "5"
     }}>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.51s"}}></Spinner>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.52s"}}></Spinner>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.53s"}}></Spinner>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.54s"}}></Spinner>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.55s"}}></Spinner>
         <Spinner type="grow" style={{color:"#009E8B",animationDuration:"0.56s"}}></Spinner>
    </div>);
}