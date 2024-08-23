// import React from "react";
import { Page, Box, Spinner } from "zmp-ui";
import { spinnerState } from "../state";
import { useRecoilValue } from "recoil";

const SpinnerComponent = () => {
  const loading = useRecoilValue(spinnerState);
  if (loading) {
    return (
      <Page
        className="section-container"
        style={{
          zIndex: 10000,
          background: "rgba(0, 0, 0, 0.5)",
          position: "fixed",
        }}
      >
        <Box
          style={{
            inset: 0,
            margin: "auto",
            position: "absolute",
            width: "fit-content",
            height: "fit-content",
          }}
        >
          <Spinner visible />
        </Box>
      </Page>
    );
  }

  return null;
};

export default SpinnerComponent;
