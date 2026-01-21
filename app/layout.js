"use client"
import {useRouter ,usePathname} from "next/navigation";
import {useEffect} from "react";
import {parseCookies} from "nookies";
import { AuthProvider } from "../src/Context/AuthContext";
import styles from "./layout.module.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';

export default function RootLayout({ children }) {

    return (
      <html suppressHydrationWarning>
         <body  className={styles.root}>
           <AuthProvider>
              {children}      
           </AuthProvider>
         </body>
      </html>
    )
  }