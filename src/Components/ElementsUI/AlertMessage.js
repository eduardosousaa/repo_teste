import { Alert } from "reactstrap";

export default function AlertMessage({text, type, isOpen, toggle}){

    setTimeout(function () {
        toggle();
    }, 5000)

    return (
        <div className="fixed-top mt-5 mt d-inline-flex flex-row-reverse"
             style={{paddingRight:"15px", zIndex:"99999"}}>
            <Alert color={type} isOpen={isOpen} toggle={toggle}>
                {text}
            </Alert>
        </div>
    )

}