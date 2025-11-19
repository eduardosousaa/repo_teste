import React from "react";
import { Container } from "reactstrap";
import Header from "./header/Header";
import Sidebar from "./sidebars/vertical/Sidebar";

const FullLayout = ({ children }) => {
  const [open, setOpen] = React.useState(true);
  const toggleSidebar = () => setOpen((s) => !s);
  const closeSidebar = () => setOpen(false);

  return (
    <div className="pageWrapper d-md-block d-lg-flex">
      <Sidebar isOpen={open} onToggle={toggleSidebar} />

      <div
        className={`sidebar-backdrop ${open ? "show" : ""}`}
        onClick={closeSidebar}
      />

      <div className="contentArea fixedTopBar">
        <Header onToggleSidebar={toggleSidebar} />
        <Container className="p-4 wrapper" fluid>
          <div>{children}</div>
        </Container>
      </div>
    </div>
  );
};

export default FullLayout;
