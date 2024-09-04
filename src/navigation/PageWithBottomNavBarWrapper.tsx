import PageWithBottomNavBar from '@/components/pageWithBottomNavbar';
import React from 'react';

interface PageWithBottomNavBarWrapperProps {
  component: React.ComponentType;
}

const PageWithBottomNavBarWrapper: React.FC<PageWithBottomNavBarWrapperProps> = ({ component: Component }) => {
  return (
    <PageWithBottomNavBar>
      <Component />
    </PageWithBottomNavBar>
  );
};

export default PageWithBottomNavBarWrapper;
