import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  // initCloudStorage,
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
  // const cloudStorage = initCloudStorage();
  const [language, setLanguage] = useState<string>('');
  const initData = useInitData();
console.log(language);

  // useEffect(() => {
  //   const fetchLanguage = async () => {
  //     const storedLanguage = await cloudStorage.get('language');
  //     if (storedLanguage) {
  //       setLanguage(storedLanguage);
  //       i18next.changeLanguage(storedLanguage);
  //     }
  //   };
  //   fetchLanguage();
  // }, [cloudStorage]);

  useEffect(() => {
    if(initData?.user?.languageCode){
      const userLanguage = initData?.user?.languageCode
      setLanguage(userLanguage);
      i18next.changeLanguage(userLanguage)
    }else{
      setLanguage('en')
      i18next.changeLanguage('en')
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

  // Create a new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);
  
  if (!language) {
    return null; // Hoặc hiển thị loading trong khi chờ language được set
  }
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
