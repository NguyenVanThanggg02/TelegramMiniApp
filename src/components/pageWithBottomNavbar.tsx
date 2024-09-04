import React from 'react';
import BottomNavBar from './bottom-navbar';

interface PageWithBottomNavBarProps {
  children: React.ReactNode;
}

const PageWithBottomNavBar: React.FC<PageWithBottomNavBarProps> = ({ children }) => {
  return (
    <>
      {children}
      <BottomNavBar />
    </>
  );
};

export default PageWithBottomNavBar;
