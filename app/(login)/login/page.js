"use client"
import { useState, useContext } from 'react';
import {useRouter} from "next/navigation";
import styles from '../login.module.css';
import Constantes from '../../../src/Constantes';
import { AuthContext } from '../../../src/Context/AuthContext';
import AlertMessage from "../../../src/Components/ElementsUI/AlertMessage";
import LoadingGif from '../../../src/Components/ElementsUI/LoadingGif';
import {setCookie} from "nookies";

export default function Page() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState(process.env.NEXT_PUBLIC_ACCOUNT_CODE || "");
    const { signIn } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({});
    const [activeAlert, setActiveAlert] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const onDismiss = () => setIsOpen(false);

    function showAlert(type, text) {
       setIsOpen(false);
    
       setAlert({
           type: type,
           text: text
       })
       setIsOpen(true)
       setActiveAlert(true)
   }

    const router = useRouter();

    const handleSubmit = async (e) => {
      try {
        e.preventDefault();
        setLoading(true);
        await signIn(username,password,code).then(() => {
          setLoading(false);
        });
        /* await fetch(Constantes.urlBackAdmin + 'admin/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
              username, 
              password
          }),
        }).then((response) => 
            response.json().then(data => ({
                 headers: response.headers.get("authorization"),
                 status: response.status, 
                 body: data }))
        ) 
        .then(({headers, status, body}) => {
  
            switch(status){
                case 200:
                  setCookie(undefined,"token1",headers);
                  setCookie(undefined,"contas",body);

                  router.push("/admin")
                break;
                case 400:
                  console.log("erro:",body);
                break;
                
            }
        })
        .catch((error) => {
           console.log(error);
         }); */

      } catch (err) {
        setLoading(false);
        console.error('Erro ao fazer login:', err);
        showAlert("danger",err.message.split("Error:")[1]);
      }
    };
    
    return (
   
        <>
           {loading && <LoadingGif/>}
           <form onSubmit={handleSubmit} className={styles.cabecaLogin}>
              <img src={"logo.svg"} alt="" />
              <h1>{Constantes.title}</h1>
              
              {/* {error && <p className={styles.errorMessage}>Tente Novamente</p>} */}
              <label htmlFor="">
                  <input type="" placeholder='Usuário: ' 
                                  id="username"
                                  name="username"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)} 
                                  required/>
              </label>
              <label htmlFor="">
                  <input  type={/* showPassword ? "text" :  */"password"}
                                  id="password"
                                  name="password"
                                  placeholder="Senha:"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)} 
                                  required/>
              </label>
              {process.env.NEXT_PUBLIC_ACCOUNT_CODE == "" && <label htmlFor="">
                  <input  type={"password"}
                                  id="code"
                                  name="code"
                                  placeholder="Código da Conta:"
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)} 
                                 /*  required *//>
              </label>}
              <button type='submit' >Entrar</button>
  
           </form>
           <img src={"logimage.svg"} alt="" className={styles.chaveiro}/> 


           {activeAlert && (
              <AlertMessage type={alert["type"]}
                  text={alert["text"]}
                  isOpen={isOpen}
                  toggle={onDismiss}>
              </AlertMessage>
           )}      
        </>
    );
  }