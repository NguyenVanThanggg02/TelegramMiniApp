import { useInitData, useLaunchParams } from '@telegram-apps/sdk-react';
import { List } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

export const LaunchParamsPage: FC = () => {
  const lp = useLaunchParams();
  const initDataRaw = useLaunchParams().initDataRaw;
  const initData = useInitData();
console.log(initData);
console.log(initDataRaw);
const platform = lp.platform
console.log(platform);

const userAgent = navigator.userAgent.toLowerCase();
if (userAgent.includes("chrome") || 
    userAgent.includes("firefox") || 
    userAgent.includes("safari") || 
    userAgent.includes("edge") || 
    userAgent.includes("opr") || 
    userAgent.includes("opera")) {
  console.log('ngoai tele');
}
  return (
    <List>
      <DisplayData
        rows={[
          { title: 'tgWebAppPlatform', value: lp.platform },
          { title: 'tgWebAppShowSettings', value: lp.showSettings },
          { title: 'tgWebAppVersion', value: lp.version },
          { title: 'tgWebAppBotInline', value: lp.botInline },
          { title: 'tgWebAppStartParam', value: lp.startParam },
          { title: 'tgWebAppData', type: 'link', value: '/init-data' },
          { title: 'tgWebAppThemeParams', type: 'link', value: '/theme-params' },
        ]}
      />
    </List>
  );
};
