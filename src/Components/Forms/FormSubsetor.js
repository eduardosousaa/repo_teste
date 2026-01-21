"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Button, FormGroup, Form, Label, Table } from "reactstrap"; 
import InputForm from "../ElementsUI/InputForm"; 
import AsyncSelectForm from "../ElementsUI/AsyncSelectForm"; 
import Constantes from "../../Constantes"; 
import { parseCookies } from "nookies"; 
import { FaPlus } from "react-icons/fa6"; 

export default function FormSubsetor({ 
    control, 
    errors, 
    setValue, 
    getValues, 
    onCadastrarSubsetor,
    onAtualizarSubsetor,
    options, 
    register }) {

    const { "token2": token2 } = parseCookies();

    const statusOptions= [{id:"ACTIVE",name:"Ativo"},{id:"INACTIVE",name:"Inativo"}];
    const [showAsync, setShowAsync] = useState([true,true,true]);

    const [responsible, setResponsible] = useState([]);

     const localizationOptions = (teste, type) => {
               let url;
               let query = {};
               query.size = 100;
               query.name = teste;
               query.typeLocation = type;
    
               if(type == "SECTOR"){
                  query.fatherId = getValues("locationId") || "";
               }
    
               url =  "stock?" + new URLSearchParams(query);
               
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
                     "label": dado.name,
                    }));
                 
                 return dadosTratados;
               });
      }

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

    /* useEffect(() => {
        if (subsetorInicial) {
            setValue('subsetorNome', subsetorInicial.nome || '');
            setValue('subsetorDescricao', subsetorInicial.descricao || '');
        }
    }, [subsetorInicial, setValue]);
 */

   function arrayForSelect(array){
       return array.map((a) => {
                  return { value: a.id,
                           label: a.name
                          }});
   } 

   useEffect(() => {
    /* if(!showAsync) setShowAsync(true); */
    if(showAsync.includes(false)){
       setShowAsync(showAsync.map((s) => {
            return true;
       }));
    }
   },[showAsync]);

   useEffect(() => {
       if(getValues("responsible").length > 0){
           setResponsible(getValues("responsible"));
           setShowAsync([true,true,false]);
       }
   }, [getValues]);

    return (
        <>


            <Row className="d-flex mt-3">
               {showAsync[0] && <Col sm="6">               
                    <AsyncSelectForm
                        id="locationId" 
                        name="locationId"
                        label="Localização*"
                        placeholder="--Selecione o Setor--"
                        register={register}
                        defaultValue={ getValues("locationId") != null ? {value:getValues("locationId"), label:getValues("locationName")} : null}
                        options={(value) =>  localizationOptions(value, 'LOCATION')}
                        onChange={(e) => {setValue('locationId', e ? e.value : "");
                                          setValue('locationName', e ? e.name : "");
                                          setValue('setorSubsetorId',null)
                                          setValue('setorSubsetorName',null)
                                          setShowAsync([true,false,true])}}
                        required={true}
                        errors={errors}
                    />
                </Col>}
                { showAsync[1] && <Col sm="6">
                    <AsyncSelectForm
                        id="setorSubsetorId" 
                        name="setorSubsetorId"
                        label="Setor*"
                        placeholder="--Selecione o Setor--"
                        register={register}
                        defaultValue={ getValues("setorSubsetorId") != null ? {value:getValues("setorSubsetorId"), label:getValues("setorSubsetorName")} : null}
                        options={(value) =>  localizationOptions(value, 'SECTOR')}
                        onChange={(e) => {setValue('setorSubsetorId', e ? e.value : "")}}
                        required={true}
                        errors={errors}
                    />
                </Col>}
            </Row> 

            <Row className="d-flex mt-3">
                <Col sm="6">
                    <InputForm
                        id="subsetorNome" 
                        name="subsetorNome"
                        label="Nome do Subsetor (Obrigatório)*"
                        placeholder="Nome do Subsetor"
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
                        id="subsetorDescricao" 
                        name="subsetorDescricao"
                        label="Descrição do Subsetor"
                        placeholder="Breve descrição do subsetor"
                        register={register}
                        required={false}
                        type="textarea"
                        rows={3}
                        errors={errors}
                    />
                </Col>
            </Row>
            <Row className="d-flex mt-3">
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
                      { showAsync[2] && <AsyncSelectForm
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
                        onClick={onCadastrarSubsetor || onAtualizarSubsetor} 
                        style={{ backgroundColor: "#009E8B", width: "120px", height: "60px" }}
                    >
                        Salvar
                    </Button>
                </Col>
            </Row>
        </>
    );
}