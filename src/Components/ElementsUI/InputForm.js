import {FormGroup, Label, Input} from "reactstrap";

export default function InputForm({id, name, label, register, required, placeholder,disabled, onChange, type, min, options,errors, props}){

    const  { ref, ...registerField } =  register(`${name}`,
                                         { required: required || false,
                                           onChange: onChange || null})

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

          {label != "" &&
          <Label style={{height:"25px",fontSize:"18px"}}
                 for={id}>
            {label}
          </Label>}
          <Input style={{height: type == "textarea" ? "130px": "50px"}}
            {...props}
            id={id}
            name={name}
            placeholder={placeholder}
            innerRef = {ref}
            { ...disabled ? disabled={disabled} : null }
            { ...registerField}
            { ...min ? min={min} : null}
            { ...onChange ? onChange={onChange} : null}
            type={type}>
            
            { type == "select" ? <>
              <option value="">{placeholder}</option>
              {options.map((option) => {return (
               <option key={option.id} value={option.id}>{option.name}</option>
              )})}
             </>
             : null}
          </Input>

          { name.includes(".") || (name.includes("[") && name.includes("]")) ?
            checkSubErrors() :
            errors?.[name] && <div style={{color:"red",fontWeight: "300"}}>{errors[name].message || "Campo Obrigatório"}</div>}
      </FormGroup>
    )
}