import { Box, Spinner } from "zmp-ui";
import { spinnerState } from "../state";
import { useRecoilValue } from "recoil";

const SpinnerComponent = () => {
  const loading = useRecoilValue(spinnerState);
  if (loading) {
    return (
      <div
        className="section-container"
        style={{
          zIndex: 10000,
          background: "rgba(0, 0, 0, 0.5)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box>
          <Spinner visible />
        </Box>
      </div>
    );
  }

  return null;
};

export default SpinnerComponent;
