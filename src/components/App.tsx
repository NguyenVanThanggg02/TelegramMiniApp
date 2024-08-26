import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo } from 'react';
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
// import { useInitData } from '@telegram-apps/sdk-react';
import AuthChecker from './auth_checker';

export const App: FC = () => {
  // const initData = useInitData();
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  // const languageCode = useMemo(() => {
  //   return initData?.user?.languageCode;
  // }, [initData]);
  i18next.init({
    interpolation: { escapeValue: false },
    lng: "en",
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
