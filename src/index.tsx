import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

import { useInitData } from '@telegram-apps/sdk-react';

const initData = useInitData();

const rootElementId = initData ? 'root' : 'root1';

const rootElement = document.getElementById(rootElementId);
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Root />);
} else {
  console.error(`Không tìm thấy element có id là ${rootElementId}`);
}