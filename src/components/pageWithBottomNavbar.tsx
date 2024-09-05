import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./bottom-navbar";

interface PageWithBottomNavBarProps {
  children: ReactNode; // Đảm bảo rằng component này nhận props children
}

const PageWithBottomNavBar: React.FC<PageWithBottomNavBarProps> = ({ children }) => {
  return (
    <>
      <Outlet />
      <BottomNavBar>{children}</BottomNavBar> 
    </>
  );
}
export default PageWithBottomNavBar