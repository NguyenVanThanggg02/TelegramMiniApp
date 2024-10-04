import { useInitData, useThemeParams } from '@telegram-apps/sdk-react';
import { useEffect, type FC } from 'react';
import { List } from '@telegram-apps/telegram-ui';

import { DisplayData } from '@/components/DisplayData/DisplayData.tsx';

export const ThemeParamsPage: FC = () => {
  const themeParams = useThemeParams();
  const initData = useInitData();

  useEffect(() => {
    if (initData) {
      console.log("trong");
    } else {
      console.log("ngoai");
    }
  }, [initData]);
  return (
    <List>
      <DisplayData
        rows={
          Object
            .entries(themeParams.getState())
            .map(([title, value]) => ({
              title: title
                .replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)
                .replace(/background/, 'bg'),
              value,
            }))
        }
      />
    </List>
  );
};
