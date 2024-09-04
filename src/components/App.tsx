import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initCloudStorage,
  initNavigator,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { FC, useEffect, useMemo, useState } from 'react';
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
import PageWithBottomNavBar from './pageWithBottomNavbar';

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const cloudStorage = initCloudStorage();
  const [language, setLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLanguage = await cloudStorage.get('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18next.changeLanguage(storedLanguage);
      }
    };
    fetchLanguage();
  }, [cloudStorage]);

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

  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

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
                {/* Routes that need BottomNavBar */}
                <Route element={<PageWithBottomNavBar />}>
                  {routes
                    .filter(route => ['/user/order/:store_uuid', "/menu/:store_uuid/:table_uuid", '/user/profile'].includes(route.path))
                    .map(route => (
                      <Route key={route.path} path={route.path} element={<route.Component />} />
                    ))}
                </Route>

                {/* Other Routes */}
                {routes
                  .filter(route => !['/user/order/:store_uuid', "/menu/:store_uuid/:table_uuid", '/user/profile'].includes(route.path))
                  .map(route => (
                    <Route key={route.path} path={route.path} element={<route.Component />} />
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
