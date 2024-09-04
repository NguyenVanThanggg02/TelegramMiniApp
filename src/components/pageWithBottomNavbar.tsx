import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./bottom-navbar";

const PageWithBottomNavBar: React.FC = () => {
  return (
    <>
      <Outlet />
      <BottomNavBar />
    </>
  );
}
export default PageWithBottomNavBar