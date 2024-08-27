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
  useSnackbar,
  // useSnackbar,
} from "zmp-ui";
import { useRecoilValue } from "recoil";
import { userState } from "../../state";
import { initCloudStorage } from "@telegram-apps/sdk";
import { useTranslation } from "react-i18next";
import {
  LANGUAGE,
  APP_VERSION,
  KEEP_SCREEN_ON_DEFAULT,
  KEEP_SCREEN_ON_STORE_KEY,
} from "../../constants";
import usa from "../../static/icons/usa.png";
import vietnam from "../../static/icons/vietnam.png";
import { useNavigate } from "react-router-dom";
import { getLoginToken } from "../../api/api";

const ProfilePage: React.FC = () => {
  // const { version, apiVersion, zaloVersion, platform } = getSystemInfo();
  const user = useRecoilValue(userState);
  const { t, i18n } = useTranslation("global");
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  // const [copied, setCopied] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenLogin, ] = useState("");
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
  };

    const handleCloseToken = () => {
      setShowToken(false);
      if (increment.current) clearInterval(increment.current);
      setTimer(60);
    };

    // const copyToClipboard = (text: string) => {
    //   navigator.clipboard.writeText(text);
    //   setCopied(true);
    //   setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    // };

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
    const data = await getLoginToken();
    if (!data?.error) {
      cloudStorage.get("auth_token");
      setShowToken(true);
      setTimer(60);
    } else {
      snackbar.openSnackbar({
        duration: 3000,
        text: String(data.error),
        type: "error",
      });
    }
  };

  useEffect(() => {
    loadKeepScreenSetting();
  }, [keepScreenOn]);

  return (
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
              <Text style={{ color: "gray", marginTop: "10px" }}>
                {user.uuid}
              </Text>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.role")} </Text>
              <Text style={{ color: "gray",marginTop: "10px" }}>
                {user.role.replace("_", " ")}
              </Text>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>{t("profile.app_version")}</Text>
              <Text style={{ color: "gray" }}>{APP_VERSION}</Text>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>
                {t("profile.zalo_version")}
              </Text>
            </List.Item>

            <List.Item>
              <Text style={{ color: "black" }}>
                {t("profile.zalo_mini_app_version")}
              </Text>
            </List.Item>

            <List.Item>
              <div style={{ display: "flex" }}>
                <div>
                  <Switch checked={keepScreenOn} onChange={toggleKeepScreen} />
                </div>
                <div style={{marginLeft:'10px', marginTop:'-7px'}}>
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
              <Box flex alignItems="center">
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
          style={{ fontSize: "26px", fontWeight: 500, textAlign: "center" }}
        >
          {t("profile.loginToken")}
        </Text>
        <Text
          style={{
            fontSize: "15px",
            textAlign: "center",
            marginTop: "7px",
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
    </Page>
  );
};

export default ProfilePage;
