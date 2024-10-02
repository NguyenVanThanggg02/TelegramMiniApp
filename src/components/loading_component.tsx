import React from "react";
import logo from "../static/icons/app-logo-load.png";
import { loadingState } from "../state";
import { useRecoilValue } from "recoil";
import { Progress, Text } from "@telegram-apps/telegram-ui";

const LoadingComponent: React.FC = () => {
  const loading = useRecoilValue(loadingState);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 10000,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  };

  const spinnerContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "70px",
    height: "70px",
    marginBottom: "20px",
    textAlign:'center',
  };

  const logoStyle: React.CSSProperties = {
    width: "50px",
    height: "50px",
    zIndex: 1,
    borderRadius:'100%',
    margin: "6px"
  };

  const spinnerStyle: React.CSSProperties = {
    position: "absolute",
    top: 2,
    left: 2,
    width: "65px",
    height: "65px",
    border: "3px solid rgba(0, 0, 0, 0.1)",
    borderTop: "3px solid #0098EA",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading.isLoading) {
    return (
      <div className="section-container" style={containerStyle}>
        <div style={spinnerContainerStyle}>
          <div style={spinnerStyle}></div>
          <img src={logo} alt="App Logo" style={logoStyle} />
        </div>
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Text style={{color:'black', fontWeight:'bold'}}>{loading.completedText }</Text>
          <Progress
            value={loading.completedPercent}
            style={{ width: "200px", marginTop: "1rem" }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingComponent;
