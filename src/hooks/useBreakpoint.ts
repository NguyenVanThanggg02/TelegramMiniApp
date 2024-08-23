import { useEffect, useState } from "react";

const useBreakpoint = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  const handleResize = () => {
    if (window.matchMedia("(max-width: 480px)").matches) {
      setIsMobile(true);
      setIsTablet(false);
    } else if (window.matchMedia("(max-width: 1024px)").matches) { 
      setIsMobile(false);
      setIsTablet(true);
    } else {
      setIsMobile(false);
      setIsTablet(false);
    }
  };

  useEffect(() => {
    handleResize(); 

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { isMobile, isTablet };
};

export default useBreakpoint;
