import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  List,
  Text,
  Box,
  Page,
  Select,
  Button,
  Switch,
  Modal,
} from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../../state";
import { initCloudStorage } from "@telegram-apps/sdk";
import { useTranslation } from "react-i18next";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import {
  LANGUAGE,
  APP_VERSION,
  KEEP_SCREEN_ON_DEFAULT,
  KEEP_SCREEN_ON_STORE_KEY,
} from "../../constants";
import usa from "../../static/icons/usa.png";
import vietnam from "../../static/icons/vietnam.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getLoginToken } from "../../api/api";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { Snackbar } from "@telegram-apps/telegram-ui";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
const ProfilePageBottomNavBar: React.FC = () => {
  // const { version, apiVersion, zaloVersion, platform } = getSystemInfo();
  const user = useRecoilValue(userState);
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const {  table_uuid } = useParams<{ store_uuid: string; table_uuid?: string }>();
  const location = useLocation();
  const { store_uuid } = location.state || {};
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");

  // const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenLogin, setTokenLogin] = useState("");
  const [keepScreenOn, setKeepScreenOn] = useState(KEEP_SCREEN_ON_DEFAULT);
  const cloudStorage = initCloudStorage();

  const [timer, setTimer] = useState(60);
  const increment = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showToken) {
      increment.current = setInterval(() => {
        setTimer((timer) => {
          if (timer > 0) return timer - 1;
          else {
            if (increment.current) clearInterval(increment.current);
            return timer;
          }
        });
      }, 1000);
    }
  }, [showToken, tokenLogin]);

  const onChangeLanguage = (value: string) => {
    i18n.changeLanguage(value);
    cloudStorage.set('language', value);
    console.log(value);
  };

    const handleCloseToken = () => {
      setShowToken(false);
      if (increment.current) clearInterval(increment.current);
      setTimer(60);
    };

    const copyUserIdToClipboard = (userId: string) => {
      navigator.clipboard.writeText(userId);
      setSnackbarMessage(t("snackbarMessage.copiedUserId"));
      setSnackbarType("success");
      setSnackbarOpen(true);
    };

    const copyTokenToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    };

    const loadKeepScreenSetting = async () => {
      try {
        const storageData = await cloudStorage.get([KEEP_SCREEN_ON_STORE_KEY]);
        const storedKeepScreenOn = storageData[KEEP_SCREEN_ON_STORE_KEY];
  
        if (storedKeepScreenOn !== undefined) {
          setKeepScreenOn(JSON.parse(storedKeepScreenOn));
        }
      } catch (error) {
        console.log("Error loading keepScreenOn setting:", error);
      }
    };

  const toggleKeepScreen = () => {
    const newValue = !keepScreenOn;
    setKeepScreenOn(newValue);
    // Lưu cài đặt vào cache
    saveKeepScreenSetting(newValue);
    // Gọi API để bật/tắt keepScreenOn
    // keepScreen({
    //   keepScreenOn: newValue,
    //   success: () => {
    //     console.log(`keepScreenOn to ${newValue}`);
    //   },
    //   fail: (error) => {
    //     // Xử lý khi gọi API thất bại
    //     console.log("Error setting keepScreenOn:", error);
    //   },
    // });
  };

  const saveKeepScreenSetting = async (value: boolean) => {
    try {
      let data: { [key: string]: string } = {};
      data[KEEP_SCREEN_ON_STORE_KEY] = JSON.stringify(value);
      await cloudStorage.set(KEEP_SCREEN_ON_STORE_KEY, data[KEEP_SCREEN_ON_STORE_KEY]);
    } catch (error) {
      console.log("Error saving keepScreenOn setting:", error);
    }
  };

  const handleGetToken = async () => {
    const respone = await getLoginToken();
    const data = respone.data
    if (!data?.error) {
      setTokenLogin(data.token);
      setShowToken(true);
      setTimer(60);
    } else {
      setSnackbarMessage(String(data.error));
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    loadKeepScreenSetting();
  }, [keepScreenOn]);

  return (
    <>
    <Page style={{ minHeight: "unset", paddingBottom: 30 }}>
      <Box
        flex
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        style={{ marginTop: 20 }}
      >
        <Box>
          <Avatar
            story="default"
            size={96}
            online={true}
            src={user.avatar.startsWith("http") ? user.avatar : undefined}
          >
            {user.avatar}
          </Avatar>
        </Box>
        <Box flex flexDirection="row" alignItems="center" mt={3}>
          <Box>
            <Text.Title style={{ color: "black" }}>{user.name}</Text.Title>
          </Box>
        </Box>
      </Box>
      <Box m={0} p={0} mt={4}>
        <div className="section-container">
          <List>
            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.username")}</Text>
              <Text style={{ color: "gray", marginTop: "10px" }}>
                {user.name}
              </Text>
            </List.Item>
            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.userId")}</Text>
              <Box
                className="total-bill"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onClick={() => copyUserIdToClipboard(user.uuid)}
              >
                <Box>
                  <Text
                    style={{
                      color: "gray",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {user.uuid}
                  </Text>
                </Box>
                <Box style={{paddingTop:'5px'}}>
                  <ContentCopyIcon
                    style={{ color: "gray", fontSize: "20px" }}
                  />
                </Box>
              </Box>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.role")} </Text>
              <Text style={{ color: "gray", marginTop: "10px" }}>
                {user.role.replace("_", " ")}
              </Text>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.app_version")}</Text>
              <Text style={{ color: "gray" }}>{APP_VERSION}</Text>
            </List.Item>

            <List.Item>
              <div style={{ display: "flex" }}>
                <div>
                  <Switch checked={keepScreenOn} onChange={toggleKeepScreen} />
                </div>
                <div style={{ marginLeft: "10px", marginTop: "-7px" }}>
                  <Text style={{ color: "black" }}>
                    {t("profile.keepScreen")}
                  </Text>
                </div>
              </div>
            </List.Item>

            <List.Item
              title={t("profile.language")}
              style={{ marginBottom: "36px" }}
            >
              <Box flex alignItems="center" style={{color:'black'}}>
                <img
                  src={i18n.language === "en" ? usa : vietnam}
                  style={{ width: "48px", marginRight: "8px" }}
                />
                <Select
                  id="langSelect"
                  closeOnSelect={true}
                  value={i18n.language}
                  onChange={(value) => {
                    if (typeof value === "string") {
                      onChangeLanguage(value);
                    } else {
                      console.warn(
                        "Received value is not a string or is undefined."
                      );
                    }
                  }}
                >
                  {LANGUAGE.map((item) => (
                    <option
                      title={item.title}
                      key={item.value}
                      value={item.value}
                    >
                      {item.title}
                    </option>
                  ))}
                </Select>
              </Box>
            </List.Item>
          </List>
        </div>
      </Box>
      <Box style={{ width: "100%" }} px={3} pb={3}>
        <Button fullWidth onClick={() => navigate("/order-history")}>
          {t("userOrder.orderHistory")}
        </Button>
      </Box>
      <Box style={{ width: "100%" }} px={3} pb={5}>
        <Button fullWidth onClick={() => handleGetToken()}>
          {t("profile.getLoginToken")}
        </Button>
      </Box>

      <Modal
        visible={showToken}
        mask
        onClose={() => handleCloseToken()}
        className="confirm-modal"
      >
        <Text
          style={{ fontSize: "26px", fontWeight: 500, textAlign: "center",color:'black' }}
        >
          {t("profile.loginToken")}
        </Text>
        <Text
          style={{
            fontSize: "15px",
            textAlign: "center",
            marginTop: "7px",
            color:'black',
            fontStyle: "italic",
          }}
        >
          {t("profile.valid1Minute")} ({timer}s)
        </Text>
        <Text
          style={{
            fontSize: "26px",
            textAlign: "center",
            marginTop: "30px",
            color:'black',
            textDecoration: timer === 0 ? "line-through" : "unset",
          }}
        >
          {tokenLogin}
        </Text>
        <Box style={{ width: "100%" }} mt={9}>
          {timer === 0 ? (
            <Button fullWidth onClick={() => handleGetToken()}>
              {t("profile.genLoginTokenAgain")}
            </Button>
          ) : (
            <Button fullWidth onClick={() => copyTokenToClipboard(tokenLogin)}>
              {copiedToken ? t("button.copied") : t("button.copy")}
            </Button>
          )}
        </Box>
      </Modal>
      <div style={{ borderRadius: "10px" }}>
        {snackbarOpen && (
          <Snackbar onClose={() => setSnackbarOpen(false)} duration={3000}>
            <div
              className={`snackbar ${snackbarType === "success" ? "snackbar-success" : "snackbar-error"}`}
            >
              <div style={{ display: "flex" }}>
                {snackbarType === "success" && (
                  <CheckCircleIcon style={{ marginRight: 8, color: "green" }} />
                )}
                {snackbarType === "error" && (
                  <ErrorIcon style={{ marginRight: 8, color: "red" }} />
                )}
                {snackbarMessage}
              </div>
            </div>
          </Snackbar>
        )}
      </div>
    </Page>
    <Box
        flex
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          borderTop: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          position: "sticky",
          bottom: 0, 
          left: 0, 
          right: 0, 
        }}
      >
        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/menuu/${store_uuid}/${table_uuid}`,{ state: { store_uuid } })}
        >
          <RestaurantMenuOutlinedIcon
            style={{ color: "#757575", fontSize: "24px" }}
          />
          <span>{t("navbar.menu")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#757575",
            fontSize: "12px",
          }}
          onClick={() => navigate(`/user/order/${store_uuid}`)}
        >
          <AssignmentOutlinedIcon
            style={{ color: "#757575", fontSize: "24px" }}
          />
          <span>{t("navbar.order")}</span>
        </Box>

        <Box
          flex
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#f44336",
            fontSize: "12px",
          }}
          onClick={() => navigate('/user/profile/bottomnavbar')}
        >
          <PersonOutlinedIcon style={{ color: "#f44336", fontSize: "24px" }} />
          <span>{t("navbar.user")}</span>
        </Box>
      </Box>
    </>
  );
};

export default ProfilePageBottomNavBar;
