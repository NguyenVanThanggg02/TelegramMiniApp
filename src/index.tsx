import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';
import { isTMA } from '@telegram-apps/sdk';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);

isTMA()
  .then((result) => {
    if (result) {
      console.log("Đang chạy trong Telegram Mini App.");
    } else {
      console.log("Không chạy trong Telegram Mini App.");
    }
  })
  .catch((error) => {
    console.error("Lỗi khi kiểm tra môi trường Telegram Mini App:", error);
  });
