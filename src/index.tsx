import ReactDOM from 'react-dom/client';
import { useEffect } from 'react';
import { Root } from '@/components/Root';
import { useLaunchParams } from '@telegram-apps/sdk-react'; // Sử dụng launch params từ SDK

import './mockEnv.ts';
import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

const App = () => {
  const launchParams = useLaunchParams();

  useEffect(() => {
    const rootId = launchParams ? 'root' : 'root1';
    const rootElement = document.getElementById(rootId);

    if (rootElement) {
      ReactDOM.createRoot(rootElement).render(<Root />);
    } else {
      console.error(`Không tìm thấy phần tử có id là ${rootId}`);
    }
  }, [launchParams]);

  return null;
};

export default App;
