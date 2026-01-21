
import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Table } from "reactstrap";
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import InputForm from '../ElementsUI/InputForm';
import AsyncSelectForm from '../ElementsUI/AsyncSelectForm'; 
import { FaPlus } from "react-icons/fa6";

export default function FormSetor({ 
    register, 
    control,
    errors,
    options,      
    onChange,   
    getValues,
    setValue,
    OnAtualizarSetor,
    onCadastrarSetor
    /* initialViewValue */
     }) {

    const { "token2": token2 } = parseCookies();
    const [initialOption, setInitialOption] = useState([]);
/* 
    useEffect(() => {
        if (defaultValue && defaultValue.value) {

            setInitialOption([defaultValue]);
        }
    }, [defaultValue]); */

    const [responsible, setResponsible] = useState([]);
    const [showAsync, setShowAsync] = useState(true);

    const employeeOptions = (teste) => {
 
       let url;
       let query = {};
       query.size = 100;
       query.fullName = teste;
       query.active = true;
       url =  "employee?" + new URLSearchParams(query);
       
       return fetch(Constantes.urlBackAdmin + url, {
           method: "GET",
           headers: {
               "Accept": "application/json",
               "Content-Type": "application/json",
               "Module": "ADMINISTRATION",
               "Authorization": token2
           },
       })
       .then((response) => response.json())
       .then((data) => {
 
         let dadosTratados = [];
        
         data["content"].forEach(dado =>
            dadosTratados.push({
             "value":  dado.id,
             "label": dado.fullName
            }));
         
         return dadosTratados;
       });
    }

    const statusOptions= [{id:"ACTIVE",name:"Ativo"},{id:"INACTIVE",name:"Inativo"}];

    function arrayForSelect(array){
        return array.map((a) => {
                   return { value: a.id,
                            label: a.name
                           }});
    } 
    
    useEffect(() => {
        if(!showAsync) setShowAsync(true);
    }, [showAsync]);
        

    useEffect(() => {
        if(getValues("responsible").length > 0){
            setResponsible(getValues("responsible"));
            setShowAsync(false);
        }
    }, [getValues]);

    return (
        <>
            <Row className="d-flex mt-3">
                <Col sm="6">
                    <AsyncSelectForm
                        id="localizacaoSetor"
                        name="localizacaoSetor"
                        label="Localização Associada (Obrigatório)*"
                        placeholder="--Selecione uma Localização--"
                        register={register}
                        defaultValue={ getValues("localizacaoSetorId") != null ? {value:getValues("localizacaoSetorId"), label:getValues("localizacaoSetorName")} : null}
                        options={options}
                        onChange={(e) => {setValue('localizacaoSetor', e ? e.value : "")}}
                        required={true}
                        errors={errors}
                    />
                </Col>
                <Col sm="6">
                    <InputForm
                      id="setorNome"
                      name="setorNome"
                      label="Nome do Setor (Obrigatório)*"
                      placeholder="Nome do Setor"
                      register={register}
                      required={true}
                      type="text"
                      errors={errors}
                    />
                </Col>
            </Row>
            <Row className="d-flex mt-3">
                <Col sm="12">
                    <InputForm
                        id="setorDescricao"
                        name="setorDescricao"
                        label="Descrição do Setor"
                        placeholder="Breve descrição do setor"
                        register={register}
                        required={false}
                        type="textarea"
                        rows={3}
                        errors={errors}
                    />
                </Col>
                <Col sm="6"> 
                     <InputForm
                        label={"Status (Obrigatório) * "}
                        id="status"
                        name="status"
                        type="select"
                        options={statusOptions}
                        register={register}
                        required={true}
                        errors={errors}
                    />
                </Col>
            </Row>

            <div style={{fontSize: "1.25rem",marginTop:"30px", marginBottom:"20px"}}>Alerta</div>

            <Table>
               <thead>
                 <tr style={{fontSize:"1.2rem"}}>
                  <th style={{backgroundColor:"#fff",borderWidth:2}}>Nome</th>
                  <th style={{backgroundColor:"#fff",borderWidth:2}}>Funcionários</th>
                 </tr>
               </thead>
               <tbody>
                  <tr>
                   <td style={{backgroundColor: "#ddffff"}}>Alerta de Movimentação</td>
                   <td style={{backgroundColor: "#ddffff"}}>
                        {showAsync && <AsyncSelectForm
                          id={`responsible`}
                          name={`responsible`}
                          label=""
                          placeholder="--Selecione--"
                          register={register}
                          isMulti={true}
                          defaultValue={responsible.length > 0 ? arrayForSelect(responsible) : []}
                          onChange={(e) => {setValue(`responsible`, e.map((p) => {return p.value}))}}
                          required={false}
                          options={employeeOptions}
                          errors={errors}
                         />}
                   </td>
                  </tr>
               </tbody>
            </Table>

            <Row className="d-flex mt-3 justify-content-end">
                <Col sm="auto">
                    <Button
                        type="submit" 
                        onClick={onCadastrarSetor || OnAtualizarSetor}
                        style={{ backgroundColor: "#009E8B", width: "120px", height: "60px" }}
                    >
                        Salvar
                    </Button>
                </Col>
            </Row>
        </>
    );
}