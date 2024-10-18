import ReactDOM from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Root } from '@/components/Root';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

import { useInitData } from '@telegram-apps/sdk-react';

const AppLoader = () => {
  const [rootId, setRootId] = useState<string | null>(null);
  const initData = useInitData();

  useEffect(() => {
    if (initData) {
      setRootId('root'); // Nếu có initData, render vào root
    } else {
      setRootId('root1'); // Nếu không có initData, render vào root1
    }
  }, [initData]);

  useEffect(() => {
    if (rootId) {
      const rootElement = document.getElementById(rootId);
      if (rootElement) {
        ReactDOM.createRoot(rootElement).render(<Root />);
      } else {
        console.error(`Không tìm thấy element có id là ${rootId}`);
      }
    }
  }, [rootId]);

  return null;
};

AppLoader();
