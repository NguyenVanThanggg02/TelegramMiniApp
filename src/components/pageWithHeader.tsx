import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box, Header } from "zmp-ui";
import { HEADER_TITLE } from "../constants";
import { useTranslation } from "react-i18next";

// Define a more specific type for HEADER_TITLE
type HeaderTitleKeys = keyof typeof HEADER_TITLE;

export default function PageWithHeader() {
  const location = useLocation();
  const { t } = useTranslation("global");

  const titleKey: HeaderTitleKeys | undefined = Object.keys(HEADER_TITLE).find((key) =>
    location.pathname.includes(key)
  ) as HeaderTitleKeys | undefined;

  const title = titleKey ? HEADER_TITLE[titleKey] : "";

  return (
    <>
      <Header title={t(title)} />
      <Box style={{ marginTop: "45px" }}>
        <Outlet />
      </Box>
    </>
  );
}
