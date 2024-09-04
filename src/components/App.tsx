// import type { ComponentType, JSX } from 'react';
// import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initCloudStorage,
  initNavigator, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo, useState } from 'react';
import {
  Navigate,
  Route,
  // Router,
  Routes,
} from 'react-router-dom';

// import { routes } from '@/navigation/routes.tsx';
import { RecoilRoot } from "recoil";
import { I18nextProvider } from 'react-i18next';
import i18next from "i18next";
import global_en from "@/locales/en/global.json";
import global_vi from "@/locales/vi/global.json";
import AuthChecker from './auth_checker';
import PageWithBottomNavBar from './pageWithBottomNavbar';
import OrderPage from '@/pages/user/order';
import ProfilePage from '@/pages/profile';
// import PromotionPage from '@/pages/user/promotion';
import MenuCommonPage from './menu';
import Index from '@/pages';
import FormPage from '@/pages/user/form';
import AboutPage from '@/pages/about';
import OrderHistory from '@/pages/order-history';
import RecentScans from './qr/RecentScans';
import { TONConnectPage } from '@/pages/TONConnectPage/TONConnectPage';
import OrderManagement from '@/pages/admin/order-management';
import OrderManagementDetails from '@/pages/admin/order-management/order-details';
import StoreFormPage from '@/pages/admin/store/form';
import StorePage from '@/pages/admin/store';
import UserPage from '@/pages/admin/user';
import ProductPage from '@/pages/admin/product';
import ProductFormPage from '@/pages/admin/product/form';
import ScaneMenuPage from '@/pages/admin/product/scanmenu';
import CategoryFormPage from '@/pages/admin/category/form';
import CategoryPage from '@/pages/admin/category';
import TablePage from '@/pages/admin/table';
import TableFormPage from '@/pages/admin/table/form';
import SaleReportPage from '@/pages/admin/sale-report';
import StoreEditPage from '@/pages/admin/store/storeEdit';
import VoucherFormPage from '@/pages/admin/voucher/form';
import VoucherPage from '@/pages/admin/voucher';

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
  // const [location, reactNavigator] = useIntegration(navigator);

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
            <Routes>
              <Route element={<PageWithBottomNavBar />}>
                <Route path="/" element={<Index />} />
                <Route path="/user/form" element={<FormPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/order-history" element={<OrderHistory />} />
                <Route path="/user/order/:store_uuid" element={<OrderPage />} />
                <Route path="/user/profile" element={<ProfilePage />} />
                <Route path="/menu/:store_uuid/:table_uuid" element={<MenuCommonPage />} />
                <Route path="/recent-scan" element={<RecentScans />} />
                <Route path="/ton-connect" element={<TONConnectPage />} />
              </Route>
              <Route path="/admin/order-management/index/:store_uuid" element={<OrderManagement />} />
              <Route path="/admin/order-management/create/index/:store_uuid" element={<MenuCommonPage />} />
              <Route path="/admin/order-management/details/index/:order_uuid/:store_uuid" element={<OrderManagementDetails />} />
              <Route path="/admin/store/form" element={<StoreFormPage />} />
              <Route path="/admin/store/index" element={<StorePage />} />
              <Route path="/admin/user/index/:store_uuid" element={<UserPage />} />
              <Route path="/admin/product/index/:store_uuid" element={<ProductPage />} />
              <Route path="/admin/product/form/:store_uuid" element={<ProductFormPage />} />
              <Route path="/admin/product/update/:store_uuid/:product_uuid" element={<ProductFormPage />} />
              <Route path="/admin/product/scanmenu/:store_uuid" element={<ScaneMenuPage />} />
              <Route path="/admin/category/form/:store_uuid/:category_uuid" element={<CategoryFormPage />} />
              <Route path="/admin/category/index/:store_uuid" element={<CategoryPage />} />
              <Route path="/admin/table/index/:store_uuid" element={<TablePage />} />
              <Route path="/admin/table/form/:store_uuid/:table_uuid" element={<TableFormPage />} />
              <Route path="/admin/sale-report/:store_uuid" element={<SaleReportPage />} />
              <Route path="/admin/store/edit/:store_uuid" element={<StoreEditPage />} />
              <Route path="/admin/voucher/index/:store_uuid" element={<VoucherPage />} />
              <Route path="/admin/voucher/form/:store_uuid" element={<VoucherFormPage />} />
              <Route path="/admin/voucher/update/:store_uuid/:voucher_uuid" element={<VoucherFormPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AuthChecker>
        </AppRoot>
      </I18nextProvider>
    </RecoilRoot>
  );
};
