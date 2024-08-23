// import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./bottom-navbar";

export default function PageWithBottomNavBar() {
  return (
    <>
      <Outlet />
      <BottomNavBar />
    </>
  );
}
