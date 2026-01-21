import {FormGroup, Label} from "reactstrap";
import MensagemErrorForm from "./MensagemErrorForm";

export default function InputLabelForm({label,name,id,register, errors, required,type,disableInput,extra, size, min,max,maxLength,minLength,placeholder, maskFunction, validate}){
    const inputRegister = register(name, {
        required: required || false,
        minLength: minLength ? { value: minLength, message: `Deve ter no mínimo ${minLength} caracteres` } : undefined,
        maxLength: maxLength ? { value: maxLength, message: `Deve ter no máximo ${maxLength} caracteres` } : undefined,
        validate: validate,
        onChange: (e) => {
          if (maskFunction) {
            e.target.value = maskFunction(e.target.value);
          }
        }
      });
    return (
        <>
            <FormGroup style={{width:'100%'}}>
            <Label style={{height:'25px', fontFamily:'Roboto, sans-serif', fontSize:'14px'}}>{label}</Label>
                <input
                    {...inputRegister}
                    id={id}
                    name={name}
                    type={type}
                    disabled={disableInput}
                    style={{height:'44px', marginTop:'-11px'}}
                    className={`${errors[name] && "is-invalid"} form-control form-control-${size || ""}`}
                    min={min}
                    max={max}
                    maxLength={maxLength}
                    minLength={minLength}
                    placeholder={placeholder}
                    {...extra}
                />
                {errors[name] && <MensagemErrorForm mensagem={errors[name]?.message}/>}
            </FormGroup>
        </>
    )
}