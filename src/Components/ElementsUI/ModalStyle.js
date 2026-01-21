import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export default function ModalStyle({open,toggle,title,size,onClick,onCancel,children,noButtons = false,textButtons}){

    return(
      <Modal {...size ? size={size} : null} isOpen={open} toggle={toggle}>
         <ModalHeader toggle={toggle} style={{color:"#fff",backgroundColor:"#009e8b"}}>{title}</ModalHeader>
         <ModalBody style={{backgroundColor:"#f8ffff"}}>{children}</ModalBody>
         <ModalFooter style={{backgroundColor:"#f8ffff"}}>
            {!noButtons && <>
             <Button style={{backgroundColor:"#009e8b"}} onClick={onClick}>{textButtons && textButtons[0] || "Confirmar"}</Button>
             <Button style={{backgroundColor:"#e5484d"}} onClick={onCancel ? onCancel : toggle}>{textButtons && textButtons[1] || "Cancelar"}</Button>
            </>}
         </ModalFooter>
      </Modal>);
}