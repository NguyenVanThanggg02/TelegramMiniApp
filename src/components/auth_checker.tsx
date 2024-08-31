import React, { useEffect, useState } from "react";
// import { sendPostLogin } from "../api/api";
// import { useCloudStorage, useLaunchParams, type User } from '@telegram-apps/sdk-react';

import { retrieveLaunchParams } from '@telegram-apps/sdk';

import { loadingState, userState } from "../state";
import { useRecoilState } from "recoil";
// import appConfig from "../../app-config.json";
// import { MOCK_ACCESS_TOKEN } from "../constants";
import { useTranslation } from "react-i18next";
import LoadingComponent from "./loading_component";
import SpinnerComponent from "./spinner";
import { initCloudStorage } from "@telegram-apps/sdk-react";
import { useSnackbar } from "zmp-ui";
// import { values } from "lodash";

interface AuthCheckerProps {
  children: React.ReactNode;
}

interface PostLoginResponse {
  zalo_id: string;
  avatar: string;
  name: string;
  uuid: string;
  store_uuid: string;
  company_uuid: string;
  role: string;
  auth_token: string;
  access_token: string;
  has_phone: boolean;
  is_oa_follow: boolean;
  error?: string; 
}
const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
  const { t, i18n } = useTranslation("global");
  const snackbar = useSnackbar();

  const cloudStorage = initCloudStorage();
  const { initDataRaw } = retrieveLaunchParams();

  const [user, setUserState] = useRecoilState(userState);

  const [errorLogin, setErrorLogin] = useState<boolean | null>(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [loading, setLoading] = useRecoilState(loadingState);

  // useEffect(() => {
  //   snackbarRef.current = snackbar;
  // }, [snackbar]);

  useEffect(() => {
    setLanguage();
  }, []);

  const postLogin = async (initData: any): Promise<PostLoginResponse> => {
    const urlParams = new URLSearchParams(initData);
    // hash
    const hash = urlParams.get("hash");
    urlParams.delete("hash");
    // // sort a->z
    urlParams.sort();
    let dataCheckString = "";
    for(const [key, value] of urlParams.entries()){
      dataCheckString += key+'='+value+'\n';
    }

    dataCheckString = dataCheckString.slice(0, -1);
    let dataUrl = [dataCheckString, hash];

    const response = await fetch('https://endpoint.hatkeo.com/api/v1/auth/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataUrl }),
    });

    const data = await response.json();
    console.log(data);
    
    cloudStorage.set('auth_token', data.auth_token);
    console.log(await cloudStorage.get('auth_token'));

    return data;
  };

  const setLanguage = async () => {
    const language = await cloudStorage.get("language")
    if (language) {
      i18n.changeLanguage(language);
    } else {
      cloudStorage.set("language", "vi");
    }
  };

  const checkAuthAndFetchData = async () => {
    try {
      console.log("user.login:", user.login);
      if (user.login) {
        setLoading({ ...loading, isLoading: false });
      } else {
        setLoading({
          ...loading,
          completedText: "start get access token",
          completedPercent: 60,
        });
        console.log(`user is not login. login...`);

        setLoading({
          ...loading,
          completedText: "start login...",
          completedPercent: 70,
        });

        const data = await postLogin(initDataRaw);
        console.log(data);

        if (!data?.error) {
          setUserState({
            zalo_id: data.zalo_id,
            avatar: data.avatar,
            name: data.name,
            uuid: data.uuid,
            store_uuid: data.store_uuid,
            company_uuid: data.company_uuid,
            role: data.role,
            login: true,
            authToken: data.auth_token ,
            accessToken: data.access_token,
            has_phone: data.has_phone,
            is_oa_follow: data.is_oa_follow,
          });

          cloudStorage.set('auth_token', data.auth_token );

          setLoading({
            ...loading,
            completedText: "done",
            completedPercent: 100,
          });
          setLoading({ ...loading, isLoading: false });
        } else {
          console.error("Error:", data.error);
          setLoading({ ...loading, isLoading: false });
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setErrorLogin(true);
    }
  };

  useEffect(() => {
    setLoading({ ...loading, isLoading: true });
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    checkAuthAndFetchData();

    return () => {
      // Hàm cleanup nếu cần
    };
  }, [isInitialMount]); // Sử dụng dependency để trigger effect khi user thay đổi
  useEffect(() => {
    if (errorLogin) {
      snackbar.openSnackbar({
        duration: 10000,
        text: t("snackbarMessage.loginFail"),
        type: "countdown",
      });
    }
  }, [errorLogin, snackbar]);
  if (errorLogin || !user.login) return null;

  return (
    <>
      <LoadingComponent />
      <SpinnerComponent />
      {children}
    </>
  );
};

export default AuthChecker;
