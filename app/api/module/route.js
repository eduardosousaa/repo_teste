import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

export  async function GET(request){

   /*  const token1 = (await cookies()).get('token1');
 */
    try{
       let token = request.headers.get("authorization");

       if(token){
         //Já autenticado
         /* if(token1){
            if(token1.value === token){
               return NextResponse.json({ message: "Usuário já autenticado" }, { status: 200 });
            }else{
               (await cookies()).delete('token1');
               (await cookies()).set({ domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                                       name: 'token1', 
                                       value: token, 
                                       path: process.env.NEXT_PUBLIC_COOKIE_SUBDOMAIN,
                                       httpOnly:true,
                                       sameSite:"none",
                                       secure:true});
               return NextResponse.json({ message: "Usuário atual autenticado no módulo com sucesso" }, { status: 200 });
            }
         } */
         // Não autenticado
         /* else{
            (await cookies()).set({ domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                                    name: 'token1', 
                                    value: token, 
                                    path: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
                                    httpOnly:true,
                                    sameSite:"none",
                                    secure:true});
            return NextResponse.json({ message: "Usuário autenticado no módulo com sucesso" }, { status: 200 });
         } */
         return NextResponse.json({ message: "Módulo autenticado com sucesso" }, { status: 200 });
       }else{
         return NextResponse.json({ message: "Token não informado" }, { status: 403 });
       }
    } catch(err){
       return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
}