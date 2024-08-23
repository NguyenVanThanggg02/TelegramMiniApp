import React from "react";
import { Page, Box, Spinner, Text, Progress } from "zmp-ui";
import logo from "../static/icons/app-logo.png";
import { loadingState } from "../state";
import { useRecoilValue } from "recoil";

const LoadingComponent: React.FC = () => {
  const loading = useRecoilValue(loadingState);
  if (loading.isLoading) {
    return (
      <Page
        className="section-container"
        style={{ 
          // position: "fixed", 
          zIndex: 10000 }}
      >
        <Box
          flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          style={{ marginTop: "70px" }}
        >
          <Spinner visible logo={logo} />
          <Box mt={6}>
            <Text.Title>{loading.completedText}</Text.Title>
            <Progress
              completed={loading.completedPercent}
              maxCompleted={100}
              showLabel
            />
          </Box>
        </Box>
      </Page>
    );
  }

  return null;
};

export default LoadingComponent;
