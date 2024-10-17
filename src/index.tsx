declare global {
    interface Window {
      Telegram?: any;
    }
  }
  
import ReactDOM from 'react-dom/client';

import { Root } from '@/components/Root';

// Uncomment this import in case, you would like to develop the application even outside
// the Telegram application, just in your browser.
import './mockEnv.ts';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

// ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);


const isRunningInTelegram = window.Telegram !== undefined;

if (isRunningInTelegram) {
  // Chạy trong Telegram, render vào 'root'
  ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
} else {
  // Chạy ngoài trình duyệt thông thường, render vào 'root1'
  ReactDOM.createRoot(document.getElementById('root1')!).render(<Root />);
}