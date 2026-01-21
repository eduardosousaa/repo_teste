"use client"
import styles from './login.module.css';

export default function RootLayout({ children }) {
    return (
      <>
            <div className={styles.backgroundImage}></div>
    
            <div className={styles.imageContainer}></div>
            
            <div className={styles.logincontainer}>
              {children}
            </div>
      </>
    )
  }