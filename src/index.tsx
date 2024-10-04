import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';
import { useInitData } from '@telegram-apps/sdk-react';
const initData = useInitData();
if (initData) {
    console.log("Người dùng đang sử dụng ứng dụng web trong Telegram");
  } else {
    console.log("Người dùng đang sử dụng trình duyệt thông thường");
  }
ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);
