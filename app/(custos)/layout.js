'use client';
import { useState } from 'react';
import styles from './custos.module.css';
import Sidebar from '../../src/Components/Layout/Sidebar';
import Navbar from '../../src/Components/Layout/Navbar';
import { Card } from 'reactstrap';

export default function Layout({ children }) {

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Navbar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className={`${styles.contentArea} ${showSidebar ? styles.expanded : ''}`}>
        <Card className={styles.container}>
          {children}
        </Card>
      </div>
    </>
  );
}
