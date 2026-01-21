import {FormGroup, Label, Control} from "reactstrap";
import AsyncSelect from 'react-select/async';

export default function AsyncSelectForm({
  id, 
  name, 
  label, 
  register, 
  required, 
  defaultValue, 
  onChange, 
  isMulti, 
  options, 
  errors,
  control,
  isDisabled, 
  cacheOptions}){

    /* const  { ref, ...registerField } =  register(`${name}`,
                                         { required: required || false,
                                           onChange: onChange || null}) */

    const styles = {
      control: styles => ({ ...styles, minHeight: '50px' }),
    };

    function checkSubErrors(){
      if(errors){
         if(name.includes(".") && !name.includes("[") && !name.includes("]")){
          let splitArray = name.split(".");
          let object = errors;
          for(let x = 0; x < splitArray.length; x++){
               for(const [key,value] of Object.entries(object)){
                 if(key == splitArray[x]){
                   object = value;

                   if(x == splitArray.length - 1){
                     return <><div style={{color:"red",fontWeight: "300"}}>{ object.message || "Campo Obrigatório"}</div><br/></>;
                   } 
                   break;
                 }        
             }
          }
         }else if(name.includes("[") && name.includes("]")){
          let name1 = name.split("[")[0];
          let index = (name.split("[")[1]).split("]")[0];
          let name2 = name.split(".")[1];
            
          if(name2 == undefined && errors?.[name1]?.[index]){
              return <><div style={{color:"red",fontWeight: "300"}}>{ errors[name1][index].message || "Campo Obrigatório"}</div><br/></>;
          }
          
          if(errors?.[name1]?.[index]?.[name2]){
              return <><div style={{color:"red",fontWeight: "300"}}>{ errors[name1][index][name2].message || "Campo Obrigatório"}</div><br/></>;
          }

          if(name2 != undefined && name2.includes("[") && name2.includes("]")){
              let name3 = name2.split("[")[0];
              let index2 = (name2.split("[")[1]).split("]")[0];
              let name4 = name2.split(".")[1];

              if(name4 == undefined && errors?.[name1]?.[index]?.[name3]?.[index2]) {
                  return <><div style={{color:"red",fontWeight: "300"}}>{ errors[name1][index][name3][index2].message || "Campo Obrigatório"}</div><br/></>;
              }

              if(errors?.[name1]?.[index]?.[name3]?.[index2]?.[name4]){
                  return <><div style={{color:"red",fontWeight: "300"}}>{ errors[name1][index][name3][index2][name4].message || "Campo Obrigatório"}</div><br/></>;
              }
              
          }
          
        }
      }
    }

    return (
      <FormGroup style={{width:"100%"}}>

        { label != "" &&
          <Label style={{height:"25px",fontSize:"18px"}}
                 for={id}>
            {label}
          </Label>}
        <AsyncSelect styles={styles} 
                     { ...isMulti == true ? isMulti={isMulti} : null}
                     placeholder={'--Selecione--'}
                     { ...register ?  {...register(`${name}`,{required: required})} : null}
                     cacheOptions defaultOptions loadOptions={options}
                     { ...defaultValue ? defaultValue={defaultValue} : null }
                     { ...isDisabled ? isDisabled={isDisabled} : null }
                     isClearable={true}
                     onChange={onChange}
                     />

        { name.includes(".") || (name.includes("[") && name.includes("]")) ?
            checkSubErrors() :
            errors?.[name] && <div style={{color:"red",fontWeight: "300"}}>{errors[name].message || "Campo Obrigatório"}</div>}
      </FormGroup>
    )
}