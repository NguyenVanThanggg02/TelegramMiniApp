import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator, useInitData, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Route,
  Router,
  Routes,
} from 'react-router-dom';

import { routes } from '@/navigation/routes.tsx';
import { RecoilRoot } from "recoil";
import { I18nextProvider } from 'react-i18next';
import i18next from "i18next";
import global_en from "@/locales/en/global.json";
import global_vi from "@/locales/vi/global.json";
import AuthChecker from './auth_checker';

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [language, setLanguage] = useState<string>('en');
  const initData = useInitData();
  
  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);
  // Hàm kiểm tra nếu đang sử dụng Telegram Web App
  const isTelegramWebApp = () => {
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    return /Telegram/i.test(userAgent);
  };

  // useEffect để kiểm tra ngay khi ứng dụng được khởi động
  useEffect(() => {
    if (isTelegramWebApp()) {
      console.log("Người dùng đang sử dụng Telegram Web App");
    } else {
      console.log("Người dùng sử dụng trình duyệt thông thường");
    }
  }, []); // Chỉ chạy một lần khi component được mount

  useEffect(() => {
    const userLanguage = initData?.user?.languageCode;
    console.log(userLanguage);
    if (userLanguage && (userLanguage === 'en' || userLanguage === 'vi')) {
      setLanguage(userLanguage);
      i18next.changeLanguage(userLanguage);
    } else {
      setLanguage('en'); 
      i18next.changeLanguage('en');
    }
  }, [initData]);

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  i18next.init({
    interpolation: { escapeValue: false },
    lng: language,
    fallbackLng: "en",
    resources: {
      en: {
        global: global_en,
      },
      vi: {
        global: global_vi,
      },
    },
  });
  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);



  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  return (
    <RecoilRoot>
      <I18nextProvider i18n={i18next}>
        <AppRoot
          appearance={miniApp.isDark ? "dark" : "light"}
          platform={["macos", "ios"].includes(lp.platform) ? "ios" : "base"}
        >
           <AuthChecker> 
            <Router location={location} navigator={reactNavigator}>
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} {...route} />
                ))}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
           </AuthChecker> 
        </AppRoot>
      </I18nextProvider>
    </RecoilRoot>
  );
};
