import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Page, Box, Text } from "zmp-ui";
import UserCard from "../../../components/user-card";
import { useRecoilValue } from "recoil";
import { userState } from "../../../state";
import "./styles.scss";
import storeIcon from "../../../static/icons/store.png";
import userIcon from "../../../static/icons/user.png";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useNavigate } from "react-router-dom";

const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useRecoilValue(userState);
  const { t } = useTranslation("global");

  useEffect(() => {
    if (user.store_uuid) {
      navigate("/admin/store/index");
    }
  }, [user.store_uuid, navigate]);

  return (
    <Page className="page">
      <div className="section-container">
        <UserCard isAdmin  />
      </div>
      <div className="section-container">
        {user.store_uuid ? (
          <Box
            className="item-card-container"
            onClick={() => navigate("/admin/store/index")}
          >
            <img className="item-img" src={storeIcon} alt="Store Icon" />
            <Box>
              <Box flex flexDirection="column">
                <Text size="large" bold style={{ marginLeft: "10px" }}>
                  {t("main.storeManage")}
                </Text>
              </Box>
            </Box>
            <KeyboardArrowRightIcon className="arrow-icon" />
          </Box>
        ) : (
          <Box
            className="item-card-container"
            onClick={() => navigate("/admin/store/form")}
          >
            <img className="item-img" src={storeIcon} alt="Store Icon" />
            <Box>
              <Box flex flexDirection="column">
                <Text size="large" bold style={{ marginLeft: "10px" }}>
                  {t("main.regStore")}
                </Text>
              </Box>
            </Box>
            <KeyboardArrowRightIcon className="arrow-icon" />
          </Box>
        )}
        <Box
          className="item-card-container"
          onClick={() => navigate("/admin/profile")}
        >
          <img className="item-img" src={userIcon} alt="User Icon" />
          <Box>
            <Box flex flexDirection="column">
              <Text size="large" bold style={{ marginLeft: "10px" }}>
                {t("main.user")}
              </Text>
            </Box>
          </Box>
          <KeyboardArrowRightIcon className="arrow-icon" />
        </Box>
      </div>
    </Page>
  );
};

export default AdminHomePage;
