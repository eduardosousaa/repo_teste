"use client";

import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Table } from 'reactstrap';
import { parseCookies } from "nookies";
import Constantes from "../../Constantes";
import dynamic from 'next/dynamic';
/* import InputForm from '../ElementsUI/InputLabelForm'; */
import InputForm from '../ElementsUI/InputForm';
import AsyncSelectForm from '../ElementsUI/AsyncSelectForm';
import BuscarDadoCEP from '../../Utils/BuscarDadoCEP'; 
import MaskCEP from '../../Utils/MaskCEP'; 
import { setOptions } from 'leaflet';

const DynamicLocationMap = dynamic(() => import('../ElementsUI/LocationMap'), { 
    ssr: false,
    loading: () => <p>Carregando mapa...</p>,
});

export default function FormLocalizacao({ register, control, errors, setValue, getValues, localizacaoInicial, onCadastrarLocalizacao }) {

    const { "token2": token2 } = parseCookies();
    const statusOptions= [{id:"ACTIVE",name:"Ativo"},{id:"NOT_ACTIVE",name:"Inativo"}];

    const [coordenadasEndereco, setCoordenadasEndereco] = useState({
        lat: localizacaoInicial?.latitude  || -5.073721553346983, 
        lng: localizacaoInicial?.longitude || -42.775705946983464
    });

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

    function getDadosLocalizacao(e) {
        let cep = e.target.value;
        cep = MaskCEP(cep); 
        setValue("cep", cep); 

        if (cep.length === 9) { 
            BuscarDadoCEP(cep).then((data) => {
                if (data && !data.erro) {
                    setValue("rua", data.logradouro || "");
                    setValue("bairro", data.bairro || "");
                    setValue("cidade", data.localidade || "");
                    setValue("estado", data.uf || "");
                    setValue("complemento", data.complemento || "");

                    const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
                    buscarCoordenadas(enderecoCompleto).then((coords) => {
                        if (coords) {
                            setCoordenadasEndereco(coords); 
                            setValue('latitude', coords.lat); 
                            setValue('longitude', coords.lng); 
                        }
                    });
                } else {
                    setValue("rua", "");
                    setValue("bairro", "");
                    setValue("cidade", "");
                    setValue("estado", "");
                    setValue("complemento", "");
                    setValue("latitude", null);
                    setValue("longitude", null);
                }
            });
        }
    }

    function getCoordinates(){
        console.log("e e e")
       const enderecoCompleto = `${getValues("rua")}, ${getValues("bairro")}, ${getValues("cidade")}, ${getValues("estado")}`;
       buscarCoordenadas(enderecoCompleto).then((coords) => {
           if (coords) {
               console.log("Aquia")
               setCoordenadasEndereco(coords); 
               setValue('latitude', coords.lat); 
               setValue('longitude', coords.lng); 
           }
       }); 
    }

    async function buscarCoordenadas(endereco) {
        const query = encodeURIComponent(endereco);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                };
            } else {
                return null;
            }
        } catch (err) {
            console.error("Erro ao buscar coordenadas:", err);
            return null;
        }
    }

    async function buscarEnderecoPorCoordenadas(lat, lng) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data?.address || null;
        } catch (err) {
            console.error("Erro ao buscar endereço por coordenadas:", err);
            return null;
        }
    }

    function handleClickMapa(coords) { 
        const { lat, lng } = coords; 

        if (lat === null || lng === null) return;

        setCoordenadasEndereco({ lat, lng }); 
        setValue('latitude', lat); 
        setValue('longitude', lng); 

       /*  const endereco = await buscarEnderecoPorCoordenadas(lat, lng);
        if (endereco) {
            setValue("rua", endereco.road || "");
            setValue("bairro", endereco.suburb || endereco.neighbourhood || endereco.road || "");
            setValue("cidade", endereco.city || endereco.town || endereco.village || "");
            setValue("estado", endereco.state || "");
            setValue("cep", endereco.postcode || "");
            setValue("numero", endereco.house_number || "");
            setValue("complemento", endereco.house_name || "");
        } */
    }

    async function getLocationByCoordinates(){
        const endereco = await buscarEnderecoPorCoordenadas(coordenadasEndereco.lat, coordenadasEndereco.lng);
        if (endereco) {
            setValue("rua", endereco.road || "");
            setValue("bairro", endereco.suburb || endereco.neighbourhood || endereco.road || "");
            setValue("cidade", endereco.city || endereco.town || endereco.village || "");
            setValue("estado", endereco.state || "");
            setValue("cep", endereco.postcode || "");
            setValue("numero", endereco.house_number || "");
            setValue("complemento", endereco.house_name || "");
        } 
    }

    function buscarDadoCEP(e){
          MaskCEP(e);
          const data = BuscarDadoCEP(e.target.value);
      
          if(data != null){
             
             data.then( (response) => {
    
                   if(response.erro != undefined) return;
                   setValue('rua', response.logradouro);
                   setValue('bairro', response.bairro);
                   setValue('cidade', response.localidade);
                   setValue('estado', response.uf);   
              });
          }
    }

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
        /* if (localizacaoInicial?.latitude && localizacaoInicial?.longitude) {
            setCoordenadasEndereco({
                lat: localizacaoInicial.latitude,
                lng: localizacaoInicial.longitude
            });
            setValue('latitude', localizacaoInicial.latitude);
            setValue('longitude', localizacaoInicial.longitude);
        } else  */if (localizacaoInicial?.rua || localizacaoInicial?.cep || localizacaoInicial?.cidade) {
            const enderecoParaBusca = `${localizacaoInicial.rua || ''}, ${localizacaoInicial.bairro || ''}, ${localizacaoInicial.cidade || ''}, ${localizacaoInicial.estado || ''}, ${localizacaoInicial.cep || ''}`;
            if (enderecoParaBusca.trim().length > 10) {
                buscarCoordenadas(enderecoParaBusca).then((coords) => {
                    if (coords) {
                        setCoordenadasEndereco(coords);
                        setValue('latitude', coords.lat);
                        setValue('longitude', coords.lng);
                    }
                });
            }
        }

        if(getValues("responsible").length > 0){
            setResponsible(getValues("responsible"));
            setShowAsync(false);
        }
    }, [localizacaoInicial, setValue, getValues]);


    return (
        <>
            <Row className="d-flex mt-3">
                <Col sm="6">
                    <InputForm
                        id="nomeLocalizacao"
                        name="nomeLocalizacao"
                        label="Nome da Localização (Obrigatório)*"
                        placeholder="Nome da Localização"
                        register={register}
                        required={true}
                        type="text"
                        errors={errors}
                    />
                    <InputForm
                        id="description"
                        name="description"
                        label="Descrição da Localização (Opcional)"
                        placeholder="Descreva a localização"
                        register={register}
                        required={false}
                        errors={errors}
                    />
                    
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
                    <InputForm
                        id="cep"
                        name="cep"
                        label="CEP (Obrigatório)*"
                        placeholder="CEP"
                        register={register}
                        required={true}
                        type="text"
                        errors={errors}
                        maxLength={9}
                        /* onChange={(e) => getDadosLocalizacao(e)} */
                        onChange={(e) => buscarDadoCEP(e)}
                    />
                    <Row>
                        <Col sm="6">
                            <InputForm
                                id="estado"
                                name="estado"
                                label="Estado (Obrigatório)*"
                                placeholder="Estado"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                            />
                        </Col>
                        <Col sm="6">
                            <InputForm
                                id="cidade"
                                name="cidade"
                                label="Cidade (Obrigatório)*"
                                placeholder="Cidade"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="6">
                            <InputForm
                                id="numero"
                                name="numero"
                                label="Número ou S/N*"
                                placeholder="Número ou S/N"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                            />
                        </Col>
                        <Col sm="6">
                            <InputForm
                                id="bairro"
                                name="bairro"
                                label="Bairro (Obrigatório)*"
                                placeholder="Bairro"
                                register={register}
                                required={true}
                                type="text"
                                errors={errors}
                            />
                        </Col>
                    </Row>
                    <InputForm
                        id="rua"
                        name="rua"
                        label="Rua (Obrigatório)*"
                        placeholder="Rua"
                        register={register}
                        required={true}
                        type="text"
                        errors={errors}
                    />
                    <InputForm
                        id="complemento"
                        name="complemento"
                        label="Complemento (Opcional)"
                        placeholder="Complemento"
                        register={register}
                        required={false}
                        type="text"
                        errors={errors}
                    />

                    {errors.latitude && <div className="text-danger" style={{fontSize: '0.875em'}}>Latitude: {errors.latitude.message}</div>}
                    {errors.longitude && <div className="text-danger" style={{fontSize: '0.875em'}}>Longitude: {errors.longitude.message}</div>}
                </Col>

                <Col sm="6">
                    {/* <label className="form-label">Selecione no Mapa</label> */}
                    <DynamicLocationMap
                        position={coordenadasEndereco}
                        onPositionChange={handleClickMapa} 
                    />

                    <Row className="d-flex mt-3 gap-3">
                     <Button onClick={() => getCoordinates()} 
                             style={{ flex:"1",backgroundColor: "#009E8B"}}>
                       Confirmar por endereço
                     </Button>
                     <Button onClick={() => getLocationByCoordinates()} 
                             style={{ flex:"1",backgroundColor: "#009E8B"}}>
                       Confirmar pelo mapa
                     </Button>
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
                </Col>
            </Row>
             <Row className="d-flex mt-3 justify-content-end">
                <Col sm="auto">
                    <Button
                        type="submit" 
                        onClick={onCadastrarLocalizacao} 
                        style={{ backgroundColor: "#009E8B", width: "120px", height: "60px" }}
                    >
                        Salvar
                    </Button>
                </Col>
            </Row>
        </>
    );
}
